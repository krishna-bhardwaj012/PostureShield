export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseData {
  landmarks: PoseLandmark[];
  timestamp: number;
}

export interface PostureAnalysisResult {
  analysisMode: 'squat' | 'desk';
  overallScore: number;
  violations: PostureViolation[];
  metrics: PostureMetrics;
}

export interface PostureViolation {
  type: string;
  severity: 'warning' | 'error';
  message: string;
  jointIndices: number[];
}

export interface PostureMetrics {
  backAngle?: number;
  kneeAngle?: number;
  neckAngle?: number;
  kneeToeToeDistance?: number;
  spineAlignment?: number;
}

// MediaPipe pose landmark indices
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

export class PostureAnalyzer {
  analyzeSquatPosture(poseData: PoseData): PostureAnalysisResult {
    const { landmarks } = poseData;
    const violations: PostureViolation[] = [];
    const metrics: PostureMetrics = {};
    
    // Check if we have valid landmarks
    if (!landmarks || landmarks.length < 33) {
      return {
        analysisMode: 'squat',
        overallScore: 0,
        violations: [{ type: 'pose_detection_failed', severity: 'error', message: 'Unable to detect pose', jointIndices: [] }],
        metrics: {},
      };
    }
    
    // Calculate back angle (hip to shoulder alignment)
    const backAngle = this.calculateBackAngle(landmarks);
    metrics.backAngle = backAngle;
    
    if (backAngle < 150) {
      violations.push({
        type: 'back_angle',
        severity: backAngle < 130 ? 'error' : 'warning',
        message: `Back angle too low: ${backAngle.toFixed(1)}°`,
        jointIndices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      });
    }
    
    // Check knee position relative to toe
    const kneeToeToeViolation = this.checkKneeToeToePosition(landmarks);
    if (kneeToeToeViolation) {
      violations.push(kneeToeToeViolation);
    }
    
    // Calculate knee angle
    const leftKneeAngle = this.calculateKneeAngle(landmarks, 'left');
    const rightKneeAngle = this.calculateKneeAngle(landmarks, 'right');
    metrics.kneeAngle = Math.min(leftKneeAngle, rightKneeAngle);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(violations, metrics);
    
    return {
      analysisMode: 'squat',
      overallScore,
      violations,
      metrics,
    };
  }
  
  analyzeDeskSittingPosture(poseData: PoseData): PostureAnalysisResult {
    const { landmarks } = poseData;
    const violations: PostureViolation[] = [];
    const metrics: PostureMetrics = {};
    
    if (!landmarks || landmarks.length < 33) {
      return {
        analysisMode: 'desk',
        overallScore: 0,
        violations: [{ type: 'pose_detection_failed', severity: 'error', message: 'Unable to detect pose', jointIndices: [] }],
        metrics: {},
      };
    }
    
    // Check neck bend angle
    const neckAngle = this.calculateNeckAngle(landmarks);
    metrics.neckAngle = neckAngle;
    
    if (neckAngle > 30) {
      violations.push({
        type: 'neck_bend',
        severity: neckAngle > 45 ? 'error' : 'warning',
        message: `Neck bent forward: ${neckAngle.toFixed(1)}°`,
        jointIndices: [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      });
    }
    
    // Check spine alignment
    const spineAlignment = this.calculateSpineAlignment(landmarks);
    metrics.spineAlignment = spineAlignment;
    
    if (spineAlignment < 0.8) {
      violations.push({
        type: 'spine_alignment',
        severity: spineAlignment < 0.6 ? 'error' : 'warning',
        message: 'Poor spine alignment detected',
        jointIndices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      });
    }
    
    const overallScore = this.calculateOverallScore(violations, metrics);
    
    return {
      analysisMode: 'desk',
      overallScore,
      violations,
      metrics,
    };
  }
  
  private calculateBackAngle(landmarks: PoseLandmark[]): number {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };
    
    const angle = Math.atan2(shoulderMidpoint.y - hipMidpoint.y, shoulderMidpoint.x - hipMidpoint.x);
    return Math.abs(angle * 180 / Math.PI);
  }
  
  private checkKneeToeToePosition(landmarks: PoseLandmark[]): PostureViolation | null {
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const leftFootIndex = landmarks[POSE_LANDMARKS.LEFT_FOOT_INDEX];
    const rightFootIndex = landmarks[POSE_LANDMARKS.RIGHT_FOOT_INDEX];
    
    const leftKneeOverToe = leftKnee.x > leftFootIndex.x;
    const rightKneeOverToe = rightKnee.x > rightFootIndex.x;
    
    if (leftKneeOverToe || rightKneeOverToe) {
      const distance = Math.max(
        leftKneeOverToe ? Math.abs(leftKnee.x - leftFootIndex.x) : 0,
        rightKneeOverToe ? Math.abs(rightKnee.x - rightFootIndex.x) : 0
      );
      
      return {
        type: 'knee_beyond_toe',
        severity: distance > 0.1 ? 'error' : 'warning',
        message: `Knee extends beyond toe`,
        jointIndices: [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.LEFT_FOOT_INDEX, POSE_LANDMARKS.RIGHT_FOOT_INDEX],
      };
    }
    
    return null;
  }
  
  private calculateKneeAngle(landmarks: PoseLandmark[], side: 'left' | 'right'): number {
    const hipIndex = side === 'left' ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP;
    const kneeIndex = side === 'left' ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE;
    const ankleIndex = side === 'left' ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE;
    
    const hip = landmarks[hipIndex];
    const knee = landmarks[kneeIndex];
    const ankle = landmarks[ankleIndex];
    
    const vector1 = { x: hip.x - knee.x, y: hip.y - knee.y };
    const vector2 = { x: ankle.x - knee.x, y: ankle.y - knee.y };
    
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    
    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
  }
  
  private calculateNeckAngle(landmarks: PoseLandmark[]): number {
    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    
    const neckVector = { x: nose.x - shoulderMidpoint.x, y: nose.y - shoulderMidpoint.y };
    const verticalVector = { x: 0, y: -1 };
    
    const dotProduct = neckVector.x * verticalVector.x + neckVector.y * verticalVector.y;
    const magnitude = Math.sqrt(neckVector.x * neckVector.x + neckVector.y * neckVector.y);
    
    const cosAngle = dotProduct / magnitude;
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
  }
  
  private calculateSpineAlignment(landmarks: PoseLandmark[]): number {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };
    
    const spineVector = { x: shoulderMidpoint.x - hipMidpoint.x, y: shoulderMidpoint.y - hipMidpoint.y };
    const verticalVector = { x: 0, y: 1 };
    
    const dotProduct = Math.abs(spineVector.x * verticalVector.x + spineVector.y * verticalVector.y);
    const magnitude = Math.sqrt(spineVector.x * spineVector.x + spineVector.y * spineVector.y);
    
    return dotProduct / magnitude;
  }
  
  private calculateOverallScore(violations: PostureViolation[], metrics: PostureMetrics): number {
    let score = 100;
    
    for (const violation of violations) {
      if (violation.severity === 'error') {
        score -= 20;
      } else if (violation.severity === 'warning') {
        score -= 10;
      }
    }
    
    return Math.max(0, score);
  }
}

export const postureAnalyzer = new PostureAnalyzer();
