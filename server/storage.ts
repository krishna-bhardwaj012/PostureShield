import { 
  users, 
  postureAnalysisSessions, 
  poseDetectionFrames,
  type User, 
  type InsertUser,
  type PostureAnalysisSession,
  type InsertPostureAnalysisSession,
  type PoseDetectionFrame,
  type InsertPoseDetectionFrame
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPostureAnalysisSession(session: InsertPostureAnalysisSession): Promise<PostureAnalysisSession>;
  getPostureAnalysisSession(id: number): Promise<PostureAnalysisSession | undefined>;
  updatePostureAnalysisSession(id: number, updates: Partial<PostureAnalysisSession>): Promise<PostureAnalysisSession | undefined>;
  
  createPoseDetectionFrame(frame: InsertPoseDetectionFrame): Promise<PoseDetectionFrame>;
  getPoseDetectionFramesBySession(sessionId: number): Promise<PoseDetectionFrame[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private postureAnalysisSessions: Map<number, PostureAnalysisSession>;
  private poseDetectionFrames: Map<number, PoseDetectionFrame>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentFrameId: number;

  constructor() {
    this.users = new Map();
    this.postureAnalysisSessions = new Map();
    this.poseDetectionFrames = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentFrameId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPostureAnalysisSession(session: InsertPostureAnalysisSession): Promise<PostureAnalysisSession> {
    const id = this.currentSessionId++;
    const newSession: PostureAnalysisSession = {
      ...session,
      id,
      userId: session.userId || null,
      warningCount: session.warningCount || 0,
      violationCount: session.violationCount || 0,
      createdAt: new Date(),
    };
    this.postureAnalysisSessions.set(id, newSession);
    return newSession;
  }

  async getPostureAnalysisSession(id: number): Promise<PostureAnalysisSession | undefined> {
    return this.postureAnalysisSessions.get(id);
  }

  async updatePostureAnalysisSession(id: number, updates: Partial<PostureAnalysisSession>): Promise<PostureAnalysisSession | undefined> {
    const session = this.postureAnalysisSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { 
      ...session, 
      ...updates
    };
    this.postureAnalysisSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createPoseDetectionFrame(frame: InsertPoseDetectionFrame): Promise<PoseDetectionFrame> {
    const id = this.currentFrameId++;
    const newFrame: PoseDetectionFrame = {
      ...frame,
      id,
      violationType: frame.violationType || null,
      violationSeverity: frame.violationSeverity || null,
      createdAt: new Date(),
    };
    this.poseDetectionFrames.set(id, newFrame);
    return newFrame;
  }

  async getPoseDetectionFramesBySession(sessionId: number): Promise<PoseDetectionFrame[]> {
    return Array.from(this.poseDetectionFrames.values())
      .filter(frame => frame.sessionId === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}

export const storage = new MemStorage();
