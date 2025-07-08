import { useState, useRef, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { PostureAnalysisResult, SessionStats, AnalysisFrame } from '../types/pose';

interface UsePostureAnalysisOptions {
  analysisMode: 'squat' | 'desk';
  feedbackType: 'realtime' | 'frame';
}

export function usePostureAnalysis(options: UsePostureAnalysisOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<PostureAnalysisResult | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    duration: 0,
    goodPosturePercentage: 0,
    warningCount: 0,
    violationCount: 0,
    overallScore: 0,
    consistency: 0,
    formQuality: 0,
  });
  const [analysisFrames, setAnalysisFrames] = useState<AnalysisFrame[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const goodFrameCountRef = useRef(0);
  const warningCountRef = useRef(0);
  const violationCountRef = useRef(0);

  const { isConnected, sendMessage } = useWebSocket({
    onMessage: (data) => {
      switch (data.type) {
        case 'session_started':
          setSessionId(data.sessionId);
          break;
          
        case 'analysis_result':
          setCurrentResult(data.result);
          updateSessionStats(data.result, data.timestamp);
          
          if (options.feedbackType === 'frame') {
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
    },
    onError: (error) => {
      console.error('WebSocket connection error:', error);
    },
  });

  const startAnalysis = useCallback(async () => {
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
          userId: null,
          analysisMode: options.analysisMode,
          feedbackType: options.feedbackType,
          duration: 0,
          goodPosturePercentage: 0,
          warningCount: 0,
          violationCount: 0,
          overallScore: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();
      
      // Start WebSocket session
      sendMessage({
        type: 'start_session',
        sessionId: session.id,
        analysisMode: options.analysisMode,
        feedbackType: options.feedbackType,
      });

      setIsAnalyzing(true);
      setCurrentResult(null);
      setAnalysisFrames([]);
      startTimeRef.current = Date.now();
      frameCountRef.current = 0;
      goodFrameCountRef.current = 0;
      warningCountRef.current = 0;
      violationCountRef.current = 0;
      
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
  }, [isConnected, options.analysisMode, options.feedbackType, sendMessage]);

  const stopAnalysis = useCallback(() => {
    if (sessionId) {
      sendMessage({
        type: 'end_session',
        sessionId,
      });
    }
    setIsAnalyzing(false);
  }, [sessionId, sendMessage]);

  const sendPoseData = useCallback((poseData: any) => {
    if (isAnalyzing && isConnected) {
      sendMessage({
        type: 'pose_data',
        poseData,
      });
    }
  }, [isAnalyzing, isConnected, sendMessage]);

  const updateSessionStats = useCallback((result: PostureAnalysisResult, timestamp: number) => {
    frameCountRef.current++;
    
    if (result.violations.length === 0) {
      goodFrameCountRef.current++;
    } else {
      const hasError = result.violations.some(v => v.severity === 'error');
      const hasWarning = result.violations.some(v => v.severity === 'warning');
      
      if (hasError) {
        violationCountRef.current++;
      } else if (hasWarning) {
        warningCountRef.current++;
      }
    }

    const duration = startTimeRef.current ? (timestamp - startTimeRef.current) / 1000 : 0;
    const goodPosturePercentage = frameCountRef.current > 0 
      ? (goodFrameCountRef.current / frameCountRef.current) * 100 
      : 0;
    
    // Calculate consistency (how stable the posture is)
    const consistency = Math.max(0, 100 - (warningCountRef.current + violationCountRef.current * 2));
    
    setSessionStats({
      duration,
      goodPosturePercentage,
      warningCount: warningCountRef.current,
      violationCount: violationCountRef.current,
      overallScore: result.overallScore,
      consistency,
      formQuality: result.overallScore,
    });
  }, []);

  const addAnalysisFrame = useCallback((result: PostureAnalysisResult, timestamp: number) => {
    if (result.violations.length > 0) {
      const violation = result.violations[0];
      const frame: AnalysisFrame = {
        timestamp: startTimeRef.current ? (timestamp - startTimeRef.current) / 1000 : 0,
        violationType: violation.type,
        severity: violation.severity,
        message: violation.message,
      };
      
      setAnalysisFrames(prev => [...prev, frame].slice(-50)); // Keep last 50 frames
    }
  }, []);

  return {
    isAnalyzing,
    isConnected,
    currentResult,
    sessionStats,
    analysisFrames,
    startAnalysis,
    stopAnalysis,
    sendPoseData,
  };
}
