import { useEffect, useRef } from 'react';
import { PoseLandmark, PostureViolation, POSE_LANDMARKS } from '../types/pose';

interface PoseOverlayProps {
  landmarks: PoseLandmark[];
  violations: PostureViolation[];
  videoWidth: number;
  videoHeight: number;
}

export function PoseOverlay({ landmarks, violations, videoWidth, videoHeight }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw pose connections
    drawPoseConnections(ctx, landmarks, violations);

    // Draw pose landmarks
    drawPoseLandmarks(ctx, landmarks, violations);
  }, [landmarks, violations, videoWidth, videoHeight]);

  const drawPoseConnections = (ctx: CanvasRenderingContext2D, landmarks: PoseLandmark[], violations: PostureViolation[]) => {
    const connections = [
      // Face
      [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.RIGHT_EYE],
      [POSE_LANDMARKS.LEFT_EAR, POSE_LANDMARKS.LEFT_EYE],
      [POSE_LANDMARKS.RIGHT_EAR, POSE_LANDMARKS.RIGHT_EYE],
      
      // Upper body
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
      [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
      [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
      
      // Torso
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      
      // Lower body
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
      [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
      [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
      [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
      
      // Feet
      [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_FOOT_INDEX],
      [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_FOOT_INDEX],
    ];

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#10B981';

    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
        // Check if this connection is part of a violation
        const isViolation = violations.some(v => 
          v.jointIndices.includes(startIdx) && v.jointIndices.includes(endIdx)
        );
        
        if (isViolation) {
          const violationSeverity = violations.find(v => 
            v.jointIndices.includes(startIdx) && v.jointIndices.includes(endIdx)
          )?.severity;
          
          ctx.strokeStyle = violationSeverity === 'error' ? '#DC2626' : '#F59E0B';
        } else {
          ctx.strokeStyle = '#10B981';
        }
        
        ctx.beginPath();
        ctx.moveTo(start.x * videoWidth, start.y * videoHeight);
        ctx.lineTo(end.x * videoWidth, end.y * videoHeight);
        ctx.stroke();
      }
    });
  };

  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: PoseLandmark[], violations: PostureViolation[]) => {
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        const x = landmark.x * videoWidth;
        const y = landmark.y * videoHeight;
        
        // Check if this landmark is part of a violation
        const violation = violations.find(v => v.jointIndices.includes(index));
        
        let color = '#10B981'; // Default green
        if (violation) {
          color = violation.severity === 'error' ? '#DC2626' : '#F59E0B';
        }
        
        // Draw joint point
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Draw white border
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}
