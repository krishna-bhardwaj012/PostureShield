import { useState } from 'react';
import { VideoInput } from '../components/video-input';
import { AnalysisPanel } from '../components/analysis-panel';
import { SessionStatsComponent } from '../components/session-stats';
import { usePostureAnalysis } from '../hooks/usePostureAnalysis';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Play, Square } from "lucide-react";

export default function PostureDetection() {
  const [analysisMode, setAnalysisMode] = useState<'squat' | 'desk'>('squat');
  const [feedbackType, setFeedbackType] = useState<'realtime' | 'frame'>('realtime');

  const {
    isAnalyzing,
    isConnected,
    currentResult,
    sessionStats,
    analysisFrames,
    startAnalysis,
    stopAnalysis,
    sendPoseData,
  } = usePostureAnalysis({ analysisMode, feedbackType });

  const handleExportReport = () => {
    // Generate and download analysis report
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">PostureCheck</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Real-time Posture Analysis</span>
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Controls and Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Analysis Controls */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Control</h2>
                
                <div className="space-y-4">
                  {!isAnalyzing ? (
                    <Button 
                      onClick={startAnalysis}
                      disabled={!isConnected}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Analysis
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopAnalysis}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Analysis
                    </Button>
                  )}

                  {!isConnected && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        Connecting to analysis server...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Stats */}
            <SessionStatsComponent stats={sessionStats} />

            {/* Analysis Settings */}
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

          {/* Main Content - Video Analysis */}
          <div className="lg:col-span-3">
            <VideoInput
              onPoseData={sendPoseData}
              analysisResult={currentResult}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Posture Rules</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Squat: Knee should not extend beyond toe</li>
                <li>• Squat: Back angle should be ≥150°</li>
                <li>• Desk: Neck bend should be ≤30°</li>
                <li>• Desk: Back should remain straight</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Supported Formats</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Video: MP4, MOV, AVI, WebM</li>
                <li>• Resolution: Up to 1080p</li>
                <li>• Frame Rate: 24-60 FPS</li>
                <li>• Max Size: 100MB</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Technology</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Frontend: React.js</li>
                <li>• Backend: Node.js/Express</li>
                <li>• AI: MediaPipe & OpenCV</li>
                <li>• Real-time processing</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
