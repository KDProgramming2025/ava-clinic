import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function importInstagramPost(url) {
  if (!url) throw new Error('instagram_invalid_url');

  // Basic validation
  try {
    const u = new URL(url);
    if (!u.hostname.includes('instagram.com')) {
      throw new Error('instagram_invalid_host');
    }
  } catch (e) {
    throw new Error('instagram_invalid_url');
  }

  const outputDir = path.join(process.cwd(), 'uploads', 'instagram');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`[Instagram Import] Processing ${url}`);

  try {
    // 1. Fetch Metadata using yt-dlp
    // We use --dump-json to get info without downloading first
    // Use absolute path to ensure we use the latest version installed in /usr/local/bin
    const ytDlpPath = '/usr/local/bin/yt-dlp';
    // Use a mobile User-Agent to try to bypass login walls
    const userAgent = 'Instagram 219.0.0.12.117 Android';
    
    const { stdout: jsonOutput } = await execAsync(`${ytDlpPath} --dump-json --user-agent "${userAgent}" --no-warnings "${url}"`, {
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large JSON
    });
    
    const metadata = JSON.parse(jsonOutput);
    const id = metadata.id;
    
    // 2. Download Video and Thumbnail
    // -o defines the output filename format
    // --write-thumbnail downloads the thumbnail
    // --convert-thumbnails jpg converts it to jpg
    // --merge-output-format mp4 ensures the video is mp4
    // -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" tries to get mp4 directly
    
    const filenameBase = id;
    const outputPath = path.join(outputDir, filenameBase);
    
    console.log(`[Instagram Import] Downloading media for ${id}...`);
    
    await execAsync(
      `${ytDlpPath} -o "${outputPath}.%(ext)s" --write-thumbnail --convert-thumbnails jpg --merge-output-format mp4 -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --user-agent "${userAgent}" --no-warnings "${url}"`
    );

    // 3. Construct paths
    // yt-dlp names the thumbnail as [filename].jpg
    // and video as [filename].mp4
    
    const relativeVideoPath = `/uploads/instagram/${filenameBase}.mp4`;
    const relativeThumbnailPath = `/uploads/instagram/${filenameBase}.jpg`;
    
    // Verify files exist
    const absVideoPath = path.join(outputDir, `${filenameBase}.mp4`);
    const absThumbnailPath = path.join(outputDir, `${filenameBase}.jpg`);
    
    if (!fs.existsSync(absVideoPath)) {
        console.warn(`[Instagram Import] Video file not found at ${absVideoPath}`);
        // It might be an image post?
        // If so, we might have only an image.
        // But let's assume video for now as per requirement.
    }

    // 4. Map Metadata
    const description = metadata.description || metadata.caption || '';
    // Use full description as title if available, otherwise fallback to title or default
    const title = description || metadata.title || 'Instagram Video';
    const authorUsername = metadata.uploader || metadata.uploader_id || null;
    const authorFullName = metadata.uploader || null; // yt-dlp might not give full name
    const durationSeconds = metadata.duration || 0;
    const takenAt = metadata.upload_date ? 
        new Date(
            metadata.upload_date.slice(0, 4), 
            parseInt(metadata.upload_date.slice(4, 6)) - 1, 
            metadata.upload_date.slice(6, 8)
        ) : new Date();

    // Construct Media Object
    const media = {
        items: [
            {
                id: id,
                type: 'VIDEO',
                url: relativeVideoPath,
                previewUrl: relativeThumbnailPath,
                width: metadata.width,
                height: metadata.height,
                durationSeconds: durationSeconds
            }
        ]
    };

    return {
        title,
        caption: description,
        thumbnail: relativeThumbnailPath,
        durationSeconds,
        normalizedUrl: metadata.webpage_url || url,
        media,
        takenAt,
        authorUsername,
        authorFullName,
        shortcode: id
    };

  } catch (error) {
    console.error('[Instagram Import] Error:', error);
    if (error.stderr && (error.stderr.includes('login required') || error.stderr.includes('rate-limit'))) {
        throw new Error('instagram_login_required');
    }
    throw new Error('import_failed');
  }
}

export async function deleteVideoMediaFiles(video) {
    // Optional: Implement deletion of local files when video is deleted
    if (video && video.media && video.media.items) {
        for (const item of video.media.items) {
            if (item.url && item.url.startsWith('/uploads/instagram/')) {
                const filePath = path.join(process.cwd(), item.url);
                try {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (e) { console.error('Failed to delete file', filePath); }
            }
            if (item.previewUrl && item.previewUrl.startsWith('/uploads/instagram/')) {
                const filePath = path.join(process.cwd(), item.previewUrl);
                try {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (e) { console.error('Failed to delete file', filePath); }
            }
        }
    }
}
