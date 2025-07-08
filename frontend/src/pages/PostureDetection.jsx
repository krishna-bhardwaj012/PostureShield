import React, { useState, useEffect } from 'react';
import VideoInput from '../components/VideoInput';
import AnalysisPanel from '../components/AnalysisPanel';
import SessionStats from '../components/SessionStats';

const PostureDetection = () => {
  const [analysisMode, setAnalysisMode] = useState('squat');
  const [feedbackType, setFeedbackType] = useState('realtime');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    goodPosturePercentage: 0,
    warningCount: 0,
    violationCount: 0,
    overallScore: 0,
    consistency: 0,
    formQuality: 0,
  });
  const [analysisFrames, setAnalysisFrames] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [ws, setWs] = useState(null);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'session_started':
          setSessionId(data.sessionId);
          break;
          
        case 'analysis_result':
          setCurrentResult(data.result);
          updateSessionStats(data.result, data.timestamp);
          
          if (feedbackType === 'frame') {
            addAnalysisFrame(data.result, data.timestamp);
          }
          break;
          
        case 'session_ended':
          setIsAnalyzing(false);
          setSessionStats(prev => ({
            ...prev,
            ...data.stats,
          }));
          break;
          
        case 'error':
          console.error('WebSocket error:', data.message);
          break;
      }
    };
    
    websocket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, [feedbackType]);

  const startAnalysis = async () => {
    if (!isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    try {
      // Create new session
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisMode,
          feedbackType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();
      
      // Start WebSocket session
      ws.send(JSON.stringify({
        type: 'start_session',
        sessionId: session.id,
        analysisMode,
        feedbackType,
      }));

      setIsAnalyzing(true);
      setCurrentResult(null);
      setAnalysisFrames([]);
      
      // Reset session stats
      setSessionStats({
        duration: 0,
        goodPosturePercentage: 0,
        warningCount: 0,
        violationCount: 0,
        overallScore: 0,
        consistency: 0,
        formQuality: 0,
      });
      
    } catch (error) {
      console.error('Failed to start analysis:', error);
    }
  };

  const stopAnalysis = () => {
    if (sessionId && ws) {
      ws.send(JSON.stringify({
        type: 'end_session',
        sessionId,
      }));
    }
    setIsAnalyzing(false);
  };

  const sendPoseData = (poseData) => {
    if (isAnalyzing && isConnected && ws) {
      ws.send(JSON.stringify({
        type: 'pose_data',
        poseData,
      }));
    }
  };

  const updateSessionStats = (result, timestamp) => {
    // Update session statistics based on analysis result
    setSessionStats(prev => {
      const newStats = { ...prev };
      newStats.overallScore = result.overallScore;
      
      if (result.violations.length === 0) {
        newStats.goodPosturePercentage = Math.min(100, newStats.goodPosturePercentage + 1);
      } else {
        const hasError = result.violations.some(v => v.severity === 'error');
        const hasWarning = result.violations.some(v => v.severity === 'warning');
        
        if (hasError) {
          newStats.violationCount = newStats.violationCount + 1;
        } else if (hasWarning) {
          newStats.warningCount = newStats.warningCount + 1;
        }
      }
      
      newStats.consistency = Math.max(0, 100 - (newStats.warningCount + newStats.violationCount * 2));
      newStats.formQuality = result.overallScore;
      
      return newStats;
    });
  };

  const addAnalysisFrame = (result, timestamp) => {
    if (result.violations.length > 0) {
      const violation = result.violations[0];
      const frame = {
        timestamp: timestamp,
        violationType: violation.type,
        severity: violation.severity,
        message: violation.message,
      };
      
      setAnalysisFrames(prev => [...prev, frame].slice(-50)); // Keep last 50 frames
    }
  };

  const handleExportReport = () => {
    const report = {
      sessionStats,
      analysisFrames,
      analysisMode,
      feedbackType,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posture-analysis-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-container">
      <div className="header">
        <h1>PostureCheck - Real-time Posture Analysis</h1>
        <p>AI-powered posture detection for squats and desk sitting</p>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className={`status-dot ${isConnected ? 'pulse' : ''}`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="content-grid">
        <div>
          <VideoInput
            onPoseData={sendPoseData}
            analysisResult={currentResult}
            isAnalyzing={isAnalyzing}
          />
        </div>

        <div>
          <div className="control-panel">
            <h3>Analysis Control</h3>
            {!isAnalyzing ? (
              <button 
                onClick={startAnalysis}
                disabled={!isConnected}
                className="btn btn-success"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                ▶ Start Analysis
              </button>
            ) : (
              <button 
                onClick={stopAnalysis}
                className="btn btn-danger"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                ⏹ Stop Analysis
              </button>
            )}

            {!isConnected && (
              <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px', marginTop: '10px' }}>
                <small style={{ color: '#856404' }}>
                  Connecting to analysis server...
                </small>
              </div>
            )}
          </div>

          <SessionStats stats={sessionStats} />

          <AnalysisPanel
            analysisMode={analysisMode}
            feedbackType={feedbackType}
            onAnalysisModeChange={setAnalysisMode}
            onFeedbackTypeChange={setFeedbackType}
            currentResult={currentResult}
            analysisFrames={analysisFrames}
            onExportReport={handleExportReport}
          />
        </div>
      </div>
    </div>
  );
};

export default PostureDetection;