// Pose landmark structure
export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// Raw pose frame
export interface PoseData {
  landmarks: PoseLandmark[];
  timestamp: number;
}

// Posture rule violation structure
export interface PostureViolation {
  type: string;
  severity: 'warning' | 'error' | 'good'; // ✅ added 'good'
  message: string;
  jointIndices: number[];
}

// Pose metric details
export interface PostureMetrics {
  backAngle?: number;
  kneeAngle?: number;
  neckAngle?: number;
  kneeToeToeDistance?: number;
  spineAlignment?: number;
  overallScore?: number;      // ✅ optional in analysis step
  consistency?: number;       // ✅ added for stats
  formQuality?: number;       // ✅ added for stats
}

// Analysis result per session or video
export interface PostureAnalysisResult {
  analysisMode: 'squat' | 'desk';
  overallScore: number;
  violations: PostureViolation[];
  metrics: PostureMetrics;
}

// Session-wide calculated statistics
export interface SessionStats {
  duration: number;
  goodPosturePercentage: number;
  warningCount: number;
  violationCount: number;
  overallScore: number;
  consistency: number;      // ✅ new stat
  formQuality: number;      // ✅ new stat
}

// Optional: timeline chart
export interface AnalysisFrame {
  timestamp: number;
  violationType?: string;
  severity?: 'warning' | 'error' | 'good';
  message: string;
}

// MediaPipe landmark index mapping
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};
