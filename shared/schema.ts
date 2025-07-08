import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const postureAnalysisSessions = pgTable("posture_analysis_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  analysisMode: text("analysis_mode").notNull(), // 'squat' | 'desk'
  feedbackType: text("feedback_type").notNull(), // 'realtime' | 'frame'
  duration: integer("duration").notNull(), // in seconds
  goodPosturePercentage: real("good_posture_percentage").notNull(),
  warningCount: integer("warning_count").notNull().default(0),
  violationCount: integer("violation_count").notNull().default(0),
  overallScore: real("overall_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const poseDetectionFrames = pgTable("pose_detection_frames", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  timestamp: real("timestamp").notNull(), // in seconds
  poseData: jsonb("pose_data").notNull(), // MediaPipe pose landmarks
  analysisResult: jsonb("analysis_result").notNull(), // posture analysis results
  violationType: text("violation_type"), // 'knee_beyond_toe', 'back_angle', 'neck_bend', etc.
  violationSeverity: text("violation_severity"), // 'warning' | 'error'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPostureAnalysisSessionSchema = createInsertSchema(postureAnalysisSessions).omit({
  id: true,
  createdAt: true,
});

export const insertPoseDetectionFrameSchema = createInsertSchema(poseDetectionFrames).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PostureAnalysisSession = typeof postureAnalysisSessions.$inferSelect;
export type InsertPostureAnalysisSession = z.infer<typeof insertPostureAnalysisSessionSchema>;
export type PoseDetectionFrame = typeof poseDetectionFrames.$inferSelect;
export type InsertPoseDetectionFrame = z.infer<typeof insertPoseDetectionFrameSchema>;
