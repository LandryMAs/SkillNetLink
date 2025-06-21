import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertJobOfferSchema, insertServiceSchema, insertAnnouncementSchema, insertCommentSchema, insertMessageSchema } from "@shared/schema";
import { db } from "./db";
import { users, projects, jobOffers, services, announcements } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    const { email, password, role } = req.body;
    
    // Simple authentication check for test accounts
    const testAccounts = {
      'student@skilllink.td': { password: 'Student123!', role: 'student', id: '1' },
      'admin@skilllink.td': { password: 'Admin123!', role: 'admin', id: '2' },
      'mentor@skilllink.td': { password: 'Mentor123!', role: 'mentor', id: '3' },
      'company@skilllink.td': { password: 'Company123!', role: 'company', id: '4' },
    };

    const account = testAccounts[email as keyof typeof testAccounts];
    if (account && account.password === password && account.role === role) {
      // Set session
      (req.session as any).userId = account.id;
      (req.session as any).userRole = account.role;
      res.json({ success: true, user: { id: account.id, email, role } });
    } else {
      res.status(401).json({ message: 'Email, mot de passe ou rôle incorrect' });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // User profile routes
  app.put('/api/users/profile', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const updatedUser = await storage.updateUserProfile(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const projectData = insertProjectSchema.parse({ ...req.body, creatorId: userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects/:id/join', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const projectId = parseInt(req.params.id);
      await storage.joinProject(projectId, userId);
      res.json({ message: "Successfully joined project" });
    } catch (error) {
      console.error("Error joining project:", error);
      res.status(500).json({ message: "Failed to join project" });
    }
  });

  app.get('/api/projects/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      const projects = await storage.searchProjects(query);
      res.json(projects);
    } catch (error) {
      console.error("Error searching projects:", error);
      res.status(500).json({ message: "Failed to search projects" });
    }
  });

  // Job routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const jobs = await storage.getJobOffers();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/jobs', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const jobData = insertJobOfferSchema.parse({ ...req.body, posterId: userId });
      const job = await storage.createJobOffer(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await storage.getJobOffer(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs/:id/apply', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const { coverLetter } = req.body;
      await storage.applyToJob(jobId, userId, coverLetter);
      res.json({ message: "Application submitted successfully" });
    } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ message: "Failed to apply to job" });
    }
  });

  app.get('/api/jobs/applications', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const applications = await storage.getUserJobApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Service routes
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post('/api/services', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const serviceData = insertServiceSchema.parse({ ...req.body, providerId: userId });
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.post('/api/services/:id/request', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const serviceId = parseInt(req.params.id);
      const { message } = req.body;
      await storage.requestService(serviceId, userId, message);
      res.json({ message: "Demande de service envoyée aux administrateurs pour approbation" });
    } catch (error) {
      console.error("Error requesting service:", error);
      res.status(500).json({ message: "Failed to request service" });
    }
  });

  app.post('/api/services/:id/approve', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const userRole = (req.session as any)?.userRole;
      if (!userId || (userRole !== 'admin' && userRole !== 'assistant_admin')) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const serviceId = parseInt(req.params.id);
      await storage.approveService(serviceId);
      res.json({ message: "Service approved successfully" });
    } catch (error) {
      console.error("Error approving service:", error);
      res.status(500).json({ message: "Failed to approve service" });
    }
  });

  app.get('/api/services/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      const services = await storage.searchServices(query);
      res.json(services);
    } catch (error) {
      console.error("Error searching services:", error);
      res.status(500).json({ message: "Failed to search services" });
    }
  });

  // Announcement routes
  app.get('/api/announcements', async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const announcementData = insertAnnouncementSchema.parse({ ...req.body, authorId: userId });
      const announcement = await storage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.post('/api/announcements/:id/like', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const announcementId = parseInt(req.params.id);
      await storage.likeAnnouncement(announcementId, userId);
      res.json({ message: "Announcement liked successfully" });
    } catch (error) {
      console.error("Error liking announcement:", error);
      res.status(500).json({ message: "Failed to like announcement" });
    }
  });

  app.delete('/api/announcements/:id/like', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const announcementId = parseInt(req.params.id);
      await storage.unlikeAnnouncement(announcementId, userId);
      res.json({ message: "Announcement unliked successfully" });
    } catch (error) {
      console.error("Error unliking announcement:", error);
      res.status(500).json({ message: "Failed to unlike announcement" });
    }
  });

  // Comment routes
  app.get('/api/announcements/:id/comments', async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      const comments = await storage.getAnnouncementComments(announcementId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/announcements/:id/comments', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const announcementId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        announcementId,
        authorId: userId,
      });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Message routes
  app.get('/api/messages', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const messages = await storage.getUserMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const messageData = insertMessageSchema.parse({ ...req.body, senderId: userId });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/conversations/:userId', async (req, res) => {
    try {
      const currentUserId = (req.session as any)?.userId;
      if (!currentUserId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const otherUserId = req.params.userId;
      const messages = await storage.getConversation(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Connection routes
  app.get('/api/connections', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const connections = await storage.getUserConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post('/api/connections', async (req, res) => {
    try {
      const requesterId = (req.session as any)?.userId;
      if (!requesterId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { receiverId } = req.body;
      await storage.sendConnectionRequest(requesterId, receiverId);
      res.json({ message: "Connection request sent successfully" });
    } catch (error) {
      console.error("Error sending connection request:", error);
      res.status(500).json({ message: "Failed to send connection request" });
    }
  });

  app.put('/api/connections/:id/accept', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const connectionId = parseInt(req.params.id);
      await storage.acceptConnectionRequest(connectionId);
      res.json({ message: "Connection request accepted" });
    } catch (error) {
      console.error("Error accepting connection:", error);
      res.status(500).json({ message: "Failed to accept connection" });
    }
  });

  // Admin routes for database export/import
  app.get('/api/admin/export', async (req, res) => {
    try {
      const userRole = (req.session as any)?.userRole;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }
      
      const exportData = {
        users: await db.select().from(users),
        projects: await db.select().from(projects),
        jobOffers: await db.select().from(jobOffers),
        services: await db.select().from(services),
        announcements: await db.select().from(announcements),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=skilllink-export.json');
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ message: 'Failed to export database' });
    }
  });

  app.post('/api/admin/import', async (req, res) => {
    try {
      const userRole = (req.session as any)?.userRole;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }
      
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ message: 'No data provided for import' });
      }
      
      // This is a simplified import - in production you'd want more validation
      let imported = 0;
      
      if (data.users && Array.isArray(data.users)) {
        for (const user of data.users) {
          try {
            await db.insert(users).values(user).onConflictDoNothing();
            imported++;
          } catch (e) {
            console.warn('Failed to import user:', user.id);
          }
        }
      }
      
      res.json({ 
        message: `Successfully imported ${imported} records`,
        imported 
      });
    } catch (error) {
      console.error('Error importing data:', error);
      res.status(500).json({ message: 'Failed to import database' });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      const userRole = (req.session as any)?.userRole;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied - Admin only' });
      }
      
      const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
      const [projectCount] = await db.select({ count: sql`count(*)` }).from(projects);
      const [jobCount] = await db.select({ count: sql`count(*)` }).from(jobOffers);
      const [serviceCount] = await db.select({ count: sql`count(*)` }).from(services);
      
      res.json({
        users: userCount.count,
        projects: projectCount.count,
        jobs: jobCount.count,
        services: serviceCount.count
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received:', data);

        // Broadcast to all connected clients (in real app, you'd filter by user/room)
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
