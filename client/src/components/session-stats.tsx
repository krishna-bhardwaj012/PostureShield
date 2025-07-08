import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SessionStats } from "../types/pose";

interface SessionStatsProps {
  stats: SessionStats;
}

export function SessionStatsComponent({ stats }: SessionStatsProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Session Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Duration</span>
          <span className="text-sm font-medium text-gray-900">{formatDuration(stats.duration)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Good Posture</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {Math.round(stats.goodPosturePercentage)}%
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Warnings</span>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {stats.warningCount}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Violations</span>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {stats.violationCount}
          </Badge>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overall Score</span>
            <div className="flex items-center space-x-2">
              <Progress value={stats.overallScore} className="w-16 h-2" />
              <span className="text-sm font-medium text-gray-900">{Math.round(stats.overallScore)}%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Consistency</span>
            <div className="flex items-center space-x-2">
              <Progress value={stats.consistency} className="w-16 h-2" />
              <span className="text-sm font-medium text-gray-900">{Math.round(stats.consistency)}%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Form Quality</span>
            <div className="flex items-center space-x-2">
              <Progress value={stats.formQuality} className="w-16 h-2" />
              <span className="text-sm font-medium text-gray-900">{Math.round(stats.formQuality)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
