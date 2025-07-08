const express = require('express');
const router = express.Router();
const { analyzeSquatPosture, analyzeDeskPosture } = require('../poseUtils/postureAnalyzer');

// In-memory storage for sessions and frames (replace with database in production)
let sessions = [];
let frames = [];
let sessionCounter = 1;
let frameCounter = 1;

// Create new analysis session
router.post('/sessions', (req, res) => {
  try {
    const { analysisMode, feedbackType } = req.body;
    
    if (!analysisMode || !feedbackType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = {
      id: sessionCounter++,
      analysisMode,
      feedbackType,
      duration: 0,
      goodPosturePercentage: 0,
      warningCount: 0,
      violationCount: 0,
      overallScore: 0,
      createdAt: new Date()
    };

    sessions.push(session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get session by ID
router.get('/sessions/:id', (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Update session
router.patch('/sessions/:id', (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    sessions[sessionIndex] = { ...sessions[sessionIndex], ...req.body };
    res.json(sessions[sessionIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Get frames for a session
router.get('/sessions/:id/frames', (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const sessionFrames = frames.filter(f => f.sessionId === sessionId);
    res.json(sessionFrames);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch frames' });
  }
});

// Analyze single frame
router.post('/analyze', (req, res) => {
  try {
    const { poseData, analysisMode } = req.body;
    
    if (!poseData || !analysisMode) {
      return res.status(400).json({ error: 'Missing pose data or analysis mode' });
    }

    let result;
    if (analysisMode === 'squat') {
      result = analyzeSquatPosture(poseData);
    } else if (analysisMode === 'desk') {
      result = analyzeDeskPosture(poseData);
    } else {
      return res.status(400).json({ error: 'Invalid analysis mode' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;