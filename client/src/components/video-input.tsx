import { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Video, Play, Pause, Square } from "lucide-react";
import { PoseOverlay } from './pose-overlay';
import { PostureAnalysisResult } from '../types/pose';

interface VideoInputProps {
  onPoseData?: (poseData: any) => void;
  analysisResult?: PostureAnalysisResult | null;
  isAnalyzing: boolean;
}

type InputMode = 'webcam' | 'upload';

export function VideoInput({ onPoseData, analysisResult, isAnalyzing }: VideoInputProps) {
  const [inputMode, setInputMode] = useState<InputMode>('webcam');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>();

  // MediaPipe pose detection (simplified for demo)
  const detectPose = useCallback((video: HTMLVideoElement) => {
    if (!video || !onPoseData) return;

    // In a real implementation, you would use MediaPipe here
    // For now, we'll simulate pose detection with mock data
    const mockPoseData = {
      landmarks: Array.from({ length: 33 }, (_, i) => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        visibility: 0.8 + Math.random() * 0.2,
      })),
      timestamp: Math.floor(Date.now() / 1000), // Convert to seconds
    };

    onPoseData(mockPoseData);
  }, [onPoseData]);

  // Start webcam
  const startWebcam = async () => {
    try {
      setVideoError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        setIsPlaying(true);
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setVideoError('Failed to access webcam. Please check permissions.');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    setIsPlaying(false);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setUploadedFile(file);
        setVideoError(null);
        
        if (videoRef.current) {
          const url = URL.createObjectURL(file);
          videoRef.current.src = url;
          videoRef.current.load();
        }
      } else {
        setVideoError('Please select a valid video file.');
      }
    }
  };

  // Toggle play/pause for uploaded video
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Pose detection loop
  useEffect(() => {
    if (isAnalyzing && isPlaying && videoRef.current) {
      const detectLoop = () => {
        if (videoRef.current && !videoRef.current.paused) {
          detectPose(videoRef.current);
        }
        animationRef.current = requestAnimationFrame(detectLoop);
      };
      
      animationRef.current = requestAnimationFrame(detectLoop);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isAnalyzing, isPlaying, detectPose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Live Analysis</h2>
          <div className="flex items-center space-x-2">
            {isAnalyzing && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Processing</span>
              </>
            )}
          </div>
        </div>

        {/* Input Mode Toggle */}
        <div className="mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={inputMode === 'webcam' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setInputMode('webcam');
                if (inputMode === 'upload') {
                  setUploadedFile(null);
                  if (videoRef.current) {
                    videoRef.current.src = '';
                  }
                }
              }}
              className="flex-1"
            >
              <Video className="w-4 h-4 mr-2" />
              Webcam
            </Button>
            <Button
              variant={inputMode === 'upload' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setInputMode('upload');
                stopWebcam();
              }}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            onLoadedMetadata={() => {
              if (inputMode === 'upload') {
                setIsPlaying(false);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Pose Overlay */}
          {analysisResult && videoRef.current && (
            <PoseOverlay
              landmarks={analysisResult.violations.length > 0 ? [] : []} // Simplified for demo
              violations={analysisResult.violations}
              videoWidth={videoRef.current.videoWidth || 1280}
              videoHeight={videoRef.current.videoHeight || 720}
            />
          )}

          {/* Feedback Overlays */}
          {analysisResult && analysisResult.violations.length > 0 && (
            <div className="absolute top-4 left-4 space-y-2">
              <Badge variant="destructive" className="text-white px-3 py-2 text-sm font-medium shadow-lg">
                Bad Posture Detected
              </Badge>
              {analysisResult.violations.slice(0, 2).map((violation, index) => (
                <Badge
                  key={index}
                  variant={violation.severity === 'error' ? 'destructive' : 'secondary'}
                  className={`px-3 py-2 text-sm font-medium shadow-lg ${
                    violation.severity === 'error' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {violation.message}
                </Badge>
              ))}
            </div>
          )}

          {/* Video Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2 flex items-center space-x-3">
              {inputMode === 'webcam' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={isWebcamActive ? stopWebcam : startWebcam}
                  className="text-white hover:text-green-400"
                >
                  {isWebcamActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              ) : (
                uploadedFile && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:text-green-400"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <span className="text-white text-xs">Video: {uploadedFile.name}</span>
                  </>
                )
              )}
            </div>
          </div>
        </div>

        {/* Input Controls */}
        {inputMode === 'webcam' ? (
          <div className="space-y-3">
            <Button
              onClick={isWebcamActive ? stopWebcam : startWebcam}
              className={`w-full ${
                isWebcamActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isWebcamActive ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drop video file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, WebM (Max 100MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Error Message */}
        {videoError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{videoError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
