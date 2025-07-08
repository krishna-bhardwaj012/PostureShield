import React, { useRef, useState, useCallback, useEffect } from 'react';

const VideoInput = ({ onPoseData, analysisResult, isAnalyzing }) => {
  const [inputMode, setInputMode] = useState('webcam');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [videoError, setVideoError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationRef = useRef();

  // MediaPipe pose detection (simplified for demo)
  const detectPose = useCallback((video) => {
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
  const handleFileUpload = (event) => {
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
    <div className="control-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Live Analysis</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAnalyzing && (
            <>
              <div style={{ width: '8px', height: '8px', background: '#28a745', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontSize: '14px', color: '#666' }}>Processing</span>
            </>
          )}
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '6px', padding: '4px' }}>
          <button
            className={`btn ${inputMode === 'webcam' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, margin: '2px' }}
            onClick={() => {
              setInputMode('webcam');
              if (inputMode === 'upload') {
                setUploadedFile(null);
                if (videoRef.current) {
                  videoRef.current.src = '';
                }
              }
            }}
          >
            📹 Webcam
          </button>
          <button
            className={`btn ${inputMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, margin: '2px' }}
            onClick={() => {
              setInputMode('upload');
              stopWebcam();
            }}
          >
            📁 Upload
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="video-container" style={{ marginBottom: '20px' }}>
        <video
          ref={videoRef}
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

        {/* Feedback Overlays */}
        {analysisResult && analysisResult.violations.length > 0 && (
          <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
            <div className="feedback-badge error">
              Bad Posture Detected
            </div>
            {analysisResult.violations.slice(0, 2).map((violation, index) => (
              <div
                key={index}
                className={`feedback-badge ${violation.severity}`}
                style={{ marginTop: '10px' }}
              >
                {violation.message}
              </div>
            ))}
          </div>
        )}

        {/* Video Controls */}
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '25px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {inputMode === 'webcam' ? (
            <button
              onClick={isWebcamActive ? stopWebcam : startWebcam}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              {isWebcamActive ? '⏹' : '▶'}
            </button>
          ) : (
            uploadedFile && (
              <>
                <button
                  onClick={togglePlayPause}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <span style={{ color: 'white', fontSize: '12px' }}>
                  Video: {uploadedFile.name}
                </span>
              </>
            )
          )}
        </div>
      </div>

      {/* Input Controls */}
      {inputMode === 'webcam' ? (
        <div>
          <button
            onClick={isWebcamActive ? stopWebcam : startWebcam}
            className={`btn ${isWebcamActive ? 'btn-danger' : 'btn-success'}`}
            style={{ width: '100%' }}
          >
            {isWebcamActive ? '⏹ Stop Camera' : '▶ Start Camera'}
          </button>
        </div>
      ) : (
        <div>
          <div
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
            <p>Drop video file here or click to browse</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
              MP4, MOV, AVI, WebM (Max 100MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Error Message */}
      {videoError && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px',
          color: '#721c24'
        }}>
          {videoError}
        </div>
      )}
    </div>
  );
};

export default VideoInput;