import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PostureAnalysisResult } from "../types/pose";

interface SessionStatsComponentProps {
  analysisResult: PostureAnalysisResult | null;
  startTime: number | null;
}

export function SessionStatsComponent({ analysisResult, startTime }: SessionStatsComponentProps) {
  const [duration, setDuration] = useState("00:00");

  // ⏱ Update duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setDuration(
          `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const goodPostureCount =
    analysisResult?.violations?.filter((v) => v.severity === "good").length || 0;
  const warningCount =
    analysisResult?.violations?.filter((v) => v.severity === "warning").length || 0;
  const errorCount =
    analysisResult?.violations?.filter((v) => v.severity === "error").length || 0;

  const totalFrames = goodPostureCount + warningCount + errorCount;
  const goodPosturePercentage =
    totalFrames > 0 ? Math.round((goodPostureCount / totalFrames) * 100) : 0;
  const consistency = totalFrames > 0 ? Math.round((goodPostureCount / totalFrames) * 100) : 0;

  const overallScore = analysisResult?.overallScore || 0;
  const formQuality = analysisResult?.metrics?.formQuality || 70;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Session Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Duration</span>
          <span className="text-sm font-medium text-gray-900">{duration}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Good Posture</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {goodPosturePercentage}%
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Warnings</span>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {warningCount}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Violations</span>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {errorCount}
          </Badge>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overall Score</span>
            <div className="flex items-center space-x-2">
              <Progress value={overallScore} className="w-16 h-2" />
              <span className="text-sm font-medium text-gray-900">{overallScore}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Consistency</span>
            <div className="flex items-center space-x-2">
              <Progress value={consistency} className="w-16 h-2" />
              <span className="text-sm font-medium text-gray-900">{consistency}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Form Quality</span>
            <div className="flex items-center space-x-2">
              <Progress value={formQuality} className="w-16 h-2" />
              <span className="text-sm font-medium text-gray-900">{formQuality}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
