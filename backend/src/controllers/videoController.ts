import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { mockDataService } from '../utils/mockData';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const useMock = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder');

export const getVideos = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.query.role as string; // or req.user?.role
    
    if (useMock) {
      const allVideos = mockDataService.getVideos();
      // Admins see all videos (including pending for approval), others see only APPROVED
      if (userRole === 'ADMIN') {
        return res.json(allVideos);
      }
      return res.json(allVideos.filter(v => v.status === 'APPROVED'));
    }

    try {
      const whereClause: any = {};
      if (userRole !== 'ADMIN') {
        whereClause.status = 'APPROVED';
      }

      const dbVideos = await prisma.video.findMany({
        where: whereClause,
        include: {
          submittedBy: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Map DB schema to UI format
      const formatted = dbVideos.map(v => ({
        id: v.id,
        title: v.title,
        url: v.url,
        description: v.description || '',
        category: v.category,
        status: v.status,
        likes: v.likes,
        submittedBy: v.submittedBy.name,
        createdAt: v.createdAt
      }));

      res.json(formatted);
    } catch (dbErr) {
      console.warn('Prisma getVideos failed, falling back to mock data:', dbErr);
      const allVideos = mockDataService.getVideos();
      if (userRole === 'ADMIN') {
        return res.json(allVideos);
      }
      res.json(allVideos.filter(v => v.status === 'APPROVED'));
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const submitVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, url, description, category } = req.body;
    const userName = req.user?.name || 'Anonymous User';
    const userId = req.user?.id;

    if (!title || !url || !category) {
      return res.status(400).json({ error: 'Title, URL, and category are required' });
    }

    if (useMock) {
      const newVideo = mockDataService.addVideo({
        title,
        url,
        description,
        category,
        submittedBy: userName
      });
      return res.status(201).json(newVideo);
    }

    try {
      // Setup embed URL if youtube.com link
      let cleanUrl = url;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        cleanUrl = `https://www.youtube.com/embed/${match[2]}`;
      }

      // Associate with user
      let authorId = userId;
      if (!authorId) {
        const adminUser = await prisma.user.findFirst();
        authorId = adminUser?.id;
      }

      if (!authorId) {
        throw new Error('No user found to associate video with');
      }

      const video = await prisma.video.create({
        data: {
          title,
          url: cleanUrl,
          description: description || '',
          category,
          status: 'PENDING',
          submittedById: authorId
        },
        include: {
          submittedBy: true
        }
      });

      res.status(201).json({
        id: video.id,
        title: video.title,
        url: video.url,
        description: video.description || '',
        category: video.category,
        status: video.status,
        likes: video.likes,
        submittedBy: video.submittedBy.name,
        createdAt: video.createdAt
      });
    } catch (dbErr) {
      console.warn('Prisma submitVideo failed, saving in memory:', dbErr);
      const newVideo = mockDataService.addVideo({
        title,
        url,
        description,
        category,
        submittedBy: userName
      });
      res.status(201).json(newVideo);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const likeVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (useMock) {
      const video = mockDataService.likeVideo(id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      return res.json(video);
    }

    try {
      const video = await prisma.video.update({
        where: { id },
        data: {
          likes: { increment: 1 }
        },
        include: {
          submittedBy: true
        }
      });

      res.json({
        id: video.id,
        title: video.title,
        url: video.url,
        description: video.description || '',
        category: video.category,
        status: video.status,
        likes: video.likes,
        submittedBy: video.submittedBy.name,
        createdAt: video.createdAt
      });
    } catch (dbErr) {
      console.warn('Prisma likeVideo failed, liking in memory:', dbErr);
      const video = mockDataService.likeVideo(id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      res.json(video);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const approveVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    if (useMock) {
      const video = mockDataService.approveVideo(id, status);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      return res.json(video);
    }

    try {
      const video = await prisma.video.update({
        where: { id },
        data: { status },
        include: {
          submittedBy: true
        }
      });

      res.json({
        id: video.id,
        title: video.title,
        url: video.url,
        description: video.description || '',
        category: video.category,
        status: video.status,
        likes: video.likes,
        submittedBy: video.submittedBy.name,
        createdAt: video.createdAt
      });
    } catch (dbErr) {
      console.warn('Prisma approveVideo failed, status updating in memory:', dbErr);
      const video = mockDataService.approveVideo(id, status);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      res.json(video);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
