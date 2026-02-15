export function resolveMediaUrl(url?: string | null) {
  if (!url) return '';
  const trimmed = url.trim();
  //console.log("qqqq2: "+trimmed)
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  //console.log("qqqq2 normalizedPath: "+normalizedPath)
  /*const publicBase = import.meta.env.VITE_MEDIA_BASE_URL || '';
  if (publicBase) {
    const base = publicBase.endsWith('/') ? publicBase.slice(0, -1) : publicBase;
    return `${base}${normalizedPath}`;
  }*/
  return normalizedPath;
}
