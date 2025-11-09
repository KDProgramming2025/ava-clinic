import express from 'express';
import prisma from '../prismaClient.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// GET /api/analytics - aggregated counts
router.get('/', authMiddleware(['SUPERADMIN','ADMIN']), async (_req, res) => {
  try {
    const [services, clients, bookingsPending, bookingsConfirmed, bookingsCompleted, articlesPublished, videosPublished, messagesNew, mediaCount] = await Promise.all([
      prisma.service.count(),
      prisma.client.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.video.count({ where: { status: 'PUBLISHED' } }),
      prisma.message.count({ where: { status: 'NEW' } }),
      prisma.media.count(),
    ]);

    res.json({
      services,
      clients,
      bookings: {
        pending: bookingsPending,
        confirmed: bookingsConfirmed,
        completed: bookingsCompleted,
      },
      articles: { published: articlesPublished },
      videos: { published: videosPublished },
      messages: { new: messagesNew },
      media: mediaCount,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: 'analytics_failed' });
  }
});

export default router;
