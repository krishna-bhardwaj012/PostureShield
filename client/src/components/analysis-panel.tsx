import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download, Dumbbell, ChartLine, CheckCircle, XCircle,
  AlertTriangle, ChevronRight, Smile
} from "lucide-react";
import { PostureAnalysisResult, AnalysisFrame } from "../types/pose";

interface AnalysisPanelProps {
  analysisMode: 'squat' | 'desk';
  feedbackType: 'realtime' | 'frame';
  onAnalysisModeChange: (mode: 'squat' | 'desk') => void;
  onFeedbackTypeChange: (type: 'realtime' | 'frame') => void;
  currentResult?: PostureAnalysisResult | null;
  analysisFrames: AnalysisFrame[];
  onExportReport: () => void;
}

export function AnalysisPanel({
  analysisMode,
  feedbackType,
  onAnalysisModeChange,
  onFeedbackTypeChange,
  currentResult,
  analysisFrames,
  onExportReport,
}: AnalysisPanelProps) {
  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getViolationIcon = (severity: 'warning' | 'error' | 'good') => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'good': return <Smile className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getViolationColor = (severity: 'warning' | 'error' | 'good') => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'good': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const goodPostureCount = currentResult?.violations?.filter(v => v.severity === 'good')?.length || 0;
  const warningCount = currentResult?.violations?.filter(v => v.severity === 'warning')?.length || 0;
  const errorCount = currentResult?.violations?.filter(v => v.severity === 'error')?.length || 0;
  const totalFrames = goodPostureCount + warningCount + errorCount;
  const goodPosturePercentage = totalFrames > 0 ? Math.round((goodPostureCount / totalFrames) * 100) : 0;
  const consistency = currentResult?.metrics?.consistency ?? goodPosturePercentage;
  const formQuality = currentResult?.metrics?.formQuality ?? 70;

  return (
    <div className="space-y-6">
      {/* Analysis Mode and Feedback Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Analysis Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={analysisMode} onValueChange={onAnalysisModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="squat" id="squat" />
              <Label htmlFor="squat" className="font-medium">Squat Analysis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="desk" id="desk" />
              <Label htmlFor="desk" className="font-medium">Desk Sitting</Label>
            </div>
          </RadioGroup>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback Type</h4>
            <RadioGroup value={feedbackType} onValueChange={onFeedbackTypeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="realtime" id="realtime" />
                <Label htmlFor="realtime" className="text-sm">Real-time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="frame" id="frame" />
                <Label htmlFor="frame" className="text-sm">Frame-by-frame</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Real-time Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback Messages */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <Dumbbell className="w-4 h-4 mr-2 text-blue-600" />
                {analysisMode === 'squat' ? 'Squat Analysis' : 'Desk Posture Analysis'}
              </h4>

              {currentResult ? (
                <div className="space-y-3">
                  {currentResult.violations.map((violation, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 ${getViolationColor(violation.severity)} border rounded-lg`}
                    >
                      <div className="flex items-center space-x-2">
                        {getViolationIcon(violation.severity)}
                        <span className={`text-sm font-medium ${
                          violation.severity === 'error'
                            ? 'text-red-800'
                            : violation.severity === 'warning'
                            ? 'text-amber-800'
                            : 'text-green-800'
                        }`}>
                          {violation.message}
                        </span>
                      </div>
                      <Badge variant="secondary" className={
                        violation.severity === 'error'
                          ? 'bg-red-100 text-red-800'
                          : violation.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }>
                        {violation.severity.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Start analysis to see real-time feedback</p>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                <ChartLine className="w-4 h-4 mr-2 text-blue-600" />
                Posture Metrics
              </h4>

              {currentResult ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={currentResult.overallScore} className="w-16 h-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(currentResult.overallScore)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Form Quality</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={formQuality} className="w-16 h-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(formQuality)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Good Posture</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {goodPosturePercentage}%
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consistency</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {consistency}%
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Violations</span>
                    <Badge variant="secondary" className={
                      currentResult.violations.length > 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }>
                      {currentResult.violations.length}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <Progress value={0} className="w-16 h-2" />
                    <span className="text-sm font-medium text-gray-900">--</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frame-by-frame Feedback */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">Frame Analysis</CardTitle>
          <Button variant="outline" size="sm" onClick={onExportReport}>
            <Download className="w-4 h-4 mr-1" />
            Export Report
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {analysisFrames.length > 0 ? (
              <div className="space-y-3">
                {analysisFrames.map((frame, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 ${getViolationColor(frame.severity || 'warning')} rounded-lg`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-medium text-gray-500">
                        {formatTimestamp(frame.timestamp)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        frame.severity === 'error'
                          ? 'bg-red-500'
                          : frame.severity === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`} />
                      <span className="text-sm text-gray-700">{frame.message}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No analysis frames recorded yet</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
