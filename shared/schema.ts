import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoles = ["student", "admin", "assistant_admin", "mentor", "company"] as const;

// Users table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: userRoles }).default("student").notNull(),
  university: varchar("university"),
  field: varchar("field"),
  yearOfStudy: integer("year_of_study"),
  location: varchar("location"),
  bio: text("bio"),
  skills: jsonb("skills").$type<string[]>().default([]),
  connections: integer("connections").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  status: varchar("status", { enum: ["draft", "active", "completed", "cancelled"] }).default("active"),
  skills: jsonb("skills").$type<string[]>().default([]),
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  imageUrl: varchar("image_url"),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project participants junction table
export const projectParticipants = pgTable("project_participants", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["pending", "accepted", "rejected"] }).default("pending"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Job offers table
export const jobOffers = pgTable("job_offers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  company: varchar("company").notNull(),
  location: varchar("location").notNull(),
  type: varchar("type", { enum: ["internship", "full_time", "part_time", "contract"] }).notNull(),
  duration: varchar("duration"),
  salary: varchar("salary"),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  status: varchar("status", { enum: ["active", "closed", "draft"] }).default("active"),
  posterId: varchar("poster_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications table
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobOffers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["pending", "accepted", "rejected", "withdrawn"] }).default("pending"),
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  price: varchar("price"),
  location: varchar("location"),
  availability: varchar("availability"),
  imageUrl: varchar("image_url"),
  status: varchar("status", { enum: ["active", "inactive", "pending_approval"] }).default("pending_approval"),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service requests table
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status", { enum: ["pending", "approved", "rejected", "completed"] }).default("pending"),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  type: varchar("type", { enum: ["general", "project", "job", "service"] }).default("general"),
  imageUrl: varchar("image_url"),
  authorId: varchar("author_id").notNull().references(() => users.id),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Announcement likes table
export const announcementLikes = pgTable("announcement_likes", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").notNull().references(() => announcements.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").notNull().references(() => announcements.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connections table
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["pending", "accepted", "rejected"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  projectParticipations: many(projectParticipants),
  jobOffers: many(jobOffers),
  jobApplications: many(jobApplications),
  services: many(services),
  serviceRequests: many(serviceRequests),
  announcements: many(announcements),
  announcementLikes: many(announcementLikes),
  comments: many(comments),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  sentConnections: many(connections, { relationName: "requester" }),
  receivedConnections: many(connections, { relationName: "receiver" }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.creatorId],
    references: [users.id],
  }),
  participants: many(projectParticipants),
}));

export const projectParticipantsRelations = relations(projectParticipants, ({ one }) => ({
  project: one(projects, {
    fields: [projectParticipants.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectParticipants.userId],
    references: [users.id],
  }),
}));

export const jobOffersRelations = relations(jobOffers, ({ one, many }) => ({
  poster: one(users, {
    fields: [jobOffers.posterId],
    references: [users.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobOffers, {
    fields: [jobApplications.jobId],
    references: [jobOffers.id],
  }),
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(users, {
    fields: [services.providerId],
    references: [users.id],
  }),
  requests: many(serviceRequests),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  service: one(services, {
    fields: [serviceRequests.serviceId],
    references: [services.id],
  }),
  requester: one(users, {
    fields: [serviceRequests.requesterId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  author: one(users, {
    fields: [announcements.authorId],
    references: [users.id],
  }),
  likes: many(announcementLikes),
  comments: many(comments),
}));

export const announcementLikesRelations = relations(announcementLikes, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementLikes.announcementId],
    references: [announcements.id],
  }),
  user: one(users, {
    fields: [announcementLikes.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  announcement: one(announcements, {
    fields: [comments.announcementId],
    references: [announcements.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  receiver: one(users, {
    fields: [connections.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobOfferSchema = createInsertSchema(jobOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  likes: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type JobOffer = typeof jobOffers.$inferSelect;
export type InsertJobOffer = z.infer<typeof insertJobOfferSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Connection = typeof connections.$inferSelect;
export type ProjectParticipant = typeof projectParticipants.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type AnnouncementLike = typeof announcementLikes.$inferSelect;
