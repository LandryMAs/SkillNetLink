import {
  users,
  projects,
  jobOffers,
  services,
  announcements,
  comments,
  messages,
  connections,
  projectParticipants,
  jobApplications,
  serviceRequests,
  announcementLikes,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type JobOffer,
  type InsertJobOffer,
  type Service,
  type InsertService,
  type Announcement,
  type InsertAnnouncement,
  type Comment,
  type InsertComment,
  type Message,
  type InsertMessage,
  type Connection,
  type ProjectParticipant,
  type JobApplication,
  type ServiceRequest,
  type AnnouncementLike,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  joinProject(projectId: number, userId: string): Promise<void>;
  getProjectParticipants(projectId: number): Promise<ProjectParticipant[]>;
  
  // Job operations
  createJobOffer(job: InsertJobOffer): Promise<JobOffer>;
  getJobOffers(): Promise<JobOffer[]>;
  getJobOffer(id: number): Promise<JobOffer | undefined>;
  applyToJob(jobId: number, userId: string, coverLetter?: string): Promise<void>;
  getUserJobApplications(userId: string): Promise<JobApplication[]>;
  
  // Service operations
  createService(service: InsertService): Promise<Service>;
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getUserServices(userId: string): Promise<Service[]>;
  requestService(serviceId: number, requesterId: string, message?: string): Promise<void>;
  approveService(serviceId: number): Promise<void>;
  
  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  likeAnnouncement(announcementId: number, userId: string): Promise<void>;
  unlikeAnnouncement(announcementId: number, userId: string): Promise<void>;
  getAnnouncementLikes(announcementId: number): Promise<AnnouncementLike[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getAnnouncementComments(announcementId: number): Promise<Comment[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: string): Promise<Message[]>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Connection operations
  sendConnectionRequest(requesterId: string, receiverId: string): Promise<void>;
  acceptConnectionRequest(connectionId: number): Promise<void>;
  getUserConnections(userId: string): Promise<Connection[]>;
  
  // Search operations
  searchUsers(query: string): Promise<User[]>;
  searchProjects(query: string): Promise<Project[]>;
  searchServices(query: string): Promise<Service[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project as any).returning();
    return newProject;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.creatorId, userId));
  }

  async joinProject(projectId: number, userId: string): Promise<void> {
    await db.insert(projectParticipants).values({
      projectId,
      userId,
    });
    
    // Update participant count
    await db
      .update(projects)
      .set({
        currentParticipants: sql`${projects.currentParticipants} + 1`,
      })
      .where(eq(projects.id, projectId));
  }

  async getProjectParticipants(projectId: number): Promise<ProjectParticipant[]> {
    return await db.select().from(projectParticipants).where(eq(projectParticipants.projectId, projectId));
  }

  // Job operations
  async createJobOffer(job: InsertJobOffer): Promise<JobOffer> {
    const [newJob] = await db.insert(jobOffers).values(job as any).returning();
    return newJob;
  }

  async getJobOffers(): Promise<JobOffer[]> {
    return await db.select().from(jobOffers).orderBy(desc(jobOffers.createdAt));
  }

  async getJobOffer(id: number): Promise<JobOffer | undefined> {
    const [job] = await db.select().from(jobOffers).where(eq(jobOffers.id, id));
    return job;
  }

  async applyToJob(jobId: number, userId: string, coverLetter?: string): Promise<void> {
    await db.insert(jobApplications).values({
      jobId,
      userId,
      coverLetter,
    });
  }

  async getUserJobApplications(userId: string): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.userId, userId));
  }

  // Service operations
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.status, "active")).orderBy(desc(services.createdAt));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getUserServices(userId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.providerId, userId));
  }

  async requestService(serviceId: number, requesterId: string, message?: string): Promise<void> {
    await db.insert(serviceRequests).values({
      serviceId,
      requesterId,
      message,
    });
  }

  async approveService(serviceId: number): Promise<void> {
    await db
      .update(services)
      .set({ status: "active" })
      .where(eq(services.id, serviceId));
  }

  // Announcement operations
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async likeAnnouncement(announcementId: number, userId: string): Promise<void> {
    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(announcementLikes)
      .where(and(eq(announcementLikes.announcementId, announcementId), eq(announcementLikes.userId, userId)));

    if (existingLike) return;

    await db.insert(announcementLikes).values({
      announcementId,
      userId,
    });

    // Update like count
    await db
      .update(announcements)
      .set({
        likes: sql`${announcements.likes} + 1`,
      })
      .where(eq(announcements.id, announcementId));
  }

  async unlikeAnnouncement(announcementId: number, userId: string): Promise<void> {
    await db
      .delete(announcementLikes)
      .where(and(eq(announcementLikes.announcementId, announcementId), eq(announcementLikes.userId, userId)));

    // Update like count
    await db
      .update(announcements)
      .set({
        likes: sql`${announcements.likes} - 1`,
      })
      .where(eq(announcements.id, announcementId));
  }

  async getAnnouncementLikes(announcementId: number): Promise<AnnouncementLike[]> {
    return await db.select().from(announcementLikes).where(eq(announcementLikes.announcementId, announcementId));
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Update comment count
    await db
      .update(announcements)
      .set({
        commentsCount: sql`${announcements.commentsCount} + 1`,
      })
      .where(eq(announcements.id, comment.announcementId));

    return newComment;
  }

  async getAnnouncementComments(announcementId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.announcementId, announcementId)).orderBy(desc(comments.createdAt));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getUserMessages(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, messageId));
  }

  // Connection operations
  async sendConnectionRequest(requesterId: string, receiverId: string): Promise<void> {
    await db.insert(connections).values({
      requesterId,
      receiverId,
    });
  }

  async acceptConnectionRequest(connectionId: number): Promise<void> {
    await db
      .update(connections)
      .set({ 
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(connections.id, connectionId));
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    return await db
      .select()
      .from(connections)
      .where(
        and(
          or(eq(connections.requesterId, userId), eq(connections.receiverId, userId)),
          eq(connections.status, "accepted")
        )
      );
  }

  // Search operations
  async searchUsers(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          sql`${users.firstName} ILIKE ${`%${query}%`}`,
          sql`${users.lastName} ILIKE ${`%${query}%`}`,
          sql`${users.field} ILIKE ${`%${query}%`}`,
          sql`${users.university} ILIKE ${`%${query}%`}`
        )
      );
  }

  async searchProjects(query: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(
        or(
          sql`${projects.title} ILIKE ${`%${query}%`}`,
          sql`${projects.description} ILIKE ${`%${query}%`}`,
          sql`${projects.category} ILIKE ${`%${query}%`}`
        )
      );
  }

  async searchServices(query: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.status, "active"),
          or(
            sql`${services.title} ILIKE ${`%${query}%`}`,
            sql`${services.description} ILIKE ${`%${query}%`}`,
            sql`${services.category} ILIKE ${`%${query}%`}`
          )
        )
      );
  }
}

export const storage = new DatabaseStorage();
