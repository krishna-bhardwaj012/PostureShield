const WebSocket = require('ws');
const { analyzeSquatPosture, analyzeDeskPosture } = require('../poseUtils/postureAnalyzer');

// In-memory storage (same as postureRoutes.js)
let sessions = [];
let frames = [];
let frameCounter = 1;

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.sessionId = null;
    ws.analysisMode = null;
    ws.feedbackType = null;

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

            const poseData = data.poseData;
            
            // Analyze posture based on mode
            let analysisResult;
            if (ws.analysisMode === 'squat') {
              analysisResult = analyzeSquatPosture(poseData);
            } else {
              analysisResult = analyzeDeskPosture(poseData);
            }

            // Store frame data
            const frameData = {
              id: frameCounter++,
              sessionId: ws.sessionId,
              timestamp: poseData.timestamp,
              poseData: poseData.landmarks,
              analysisResult,
              violationType: analysisResult.violations.length > 0 ? analysisResult.violations[0].type : null,
              violationSeverity: analysisResult.violations.length > 0 ? analysisResult.violations[0].severity : null,
              createdAt: new Date()
            };

            frames.push(frameData);

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
              const sessionFrames = frames.filter(f => f.sessionId === ws.sessionId);
              const violationCount = sessionFrames.filter(f => f.violationSeverity === 'error').length;
              const warningCount = sessionFrames.filter(f => f.violationSeverity === 'warning').length;
              const goodFrames = sessionFrames.filter(f => !f.violationType).length;
              const goodPosturePercentage = sessionFrames.length > 0 ? (goodFrames / sessionFrames.length) * 100 : 0;
              const overallScore = sessionFrames.length > 0 
                ? sessionFrames.reduce((sum, f) => sum + f.analysisResult.overallScore, 0) / sessionFrames.length 
                : 0;

              const sessionIndex = sessions.findIndex(s => s.id === ws.sessionId);
              if (sessionIndex !== -1) {
                sessions[sessionIndex] = {
                  ...sessions[sessionIndex],
                  violationCount,
                  warningCount,
                  goodPosturePercentage,
                  overallScore,
                  duration: sessionFrames.length > 0 ? Math.max(...sessionFrames.map(f => f.timestamp)) : 0,
                };
              }

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
}

module.exports = { setupWebSocket };