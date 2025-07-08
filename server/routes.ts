import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { postureAnalyzer, type PoseData } from "./services/poseAnalysis";
import { insertPostureAnalysisSessionSchema, insertPoseDetectionFrameSchema } from "@shared/schema";
import multer from "multer";

interface WebSocketClient extends WebSocket {
  sessionId?: number;
  analysisMode?: 'squat' | 'desk';
  feedbackType?: 'realtime' | 'frame';
}

export async function registerRoutes(app: Express): Promise<Server> {
  const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'));
      }
    },
  });

  // Create posture analysis session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertPostureAnalysisSessionSchema.parse(req.body);
      const session = await storage.createPostureAnalysisSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Get posture analysis session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getPostureAnalysisSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  // Update posture analysis session
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedSession = await storage.updatePostureAnalysisSession(sessionId, updates);
      
      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(updatedSession);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Get pose detection frames for a session
  app.get("/api/sessions/:id/frames", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const frames = await storage.getPoseDetectionFramesBySession(sessionId);
      res.json(frames);
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  // Upload video file for analysis
  app.post("/api/upload-video", upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      // In a real implementation, you would process the video file here
      // For now, we'll just return the file information
      res.json({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });
    } catch (error) {
      res.status(500).json({ error: "Video upload failed" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time pose analysis
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'start_session':
            ws.sessionId = data.sessionId;
            ws.analysisMode = data.analysisMode;
            ws.feedbackType = data.feedbackType;
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'session_started',
                sessionId: ws.sessionId,
              }));
            }
            break;

          case 'pose_data':
            if (!ws.sessionId) {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'No active session',
                }));
              }
              return;
            }

            const poseData: PoseData = data.poseData;
            
            // Analyze posture based on mode
            let analysisResult;
            if (ws.analysisMode === 'squat') {
              analysisResult = postureAnalyzer.analyzeSquatPosture(poseData);
            } else {
              analysisResult = postureAnalyzer.analyzeDeskSittingPosture(poseData);
            }

            // Store frame data
            const frameData = insertPoseDetectionFrameSchema.parse({
              sessionId: ws.sessionId,
              timestamp: Math.floor(poseData.timestamp / 1000), // Convert to seconds
              poseData: poseData.landmarks,
              analysisResult,
              violationType: analysisResult.violations.length > 0 ? analysisResult.violations[0].type : null,
              violationSeverity: analysisResult.violations.length > 0 ? analysisResult.violations[0].severity : null,
            });

            await storage.createPoseDetectionFrame(frameData);

            // Send real-time feedback
            if (ws.feedbackType === 'realtime' && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'analysis_result',
                result: analysisResult,
                timestamp: poseData.timestamp,
              }));
            }
            break;

          case 'end_session':
            if (ws.sessionId) {
              // Update session with final statistics
              const frames = await storage.getPoseDetectionFramesBySession(ws.sessionId);
              const violationCount = frames.filter(f => f.violationSeverity === 'error').length;
              const warningCount = frames.filter(f => f.violationSeverity === 'warning').length;
              const goodFrames = frames.filter(f => !f.violationType).length;
              const goodPosturePercentage = frames.length > 0 ? (goodFrames / frames.length) * 100 : 0;
              const overallScore = frames.length > 0 
                ? frames.reduce((sum, f) => sum + (f.analysisResult as any).overallScore, 0) / frames.length 
                : 0;

              await storage.updatePostureAnalysisSession(ws.sessionId, {
                violationCount,
                warningCount,
                goodPosturePercentage,
                overallScore,
                duration: frames.length > 0 ? Math.max(...frames.map(f => f.timestamp)) : 0,
              });

              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'session_ended',
                  sessionId: ws.sessionId,
                  stats: {
                    violationCount,
                    warningCount,
                    goodPosturePercentage,
                    overallScore,
                  },
                }));
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
          }));
        }
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
