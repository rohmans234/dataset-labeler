import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CheckCircle, FileStack, ThumbsUp } from "lucide-react";

type StatsCardsProps = {
  stats: {
    totalLabeled: number;
    filesRemaining: number;
    labelCounts: { label: string; count: number }[];
  };
};

export default function StatsCards({ stats }: StatsCardsProps) {
  const topLabel = [...stats.labelCounts].sort((a, b) => b.count - a.count)[0];
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Labeled</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLabeled.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">files processed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Files Remaining</CardTitle>
          <FileStack className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.filesRemaining.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">in the "ALL" folder</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Label</CardTitle>
          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topLabel.label}</div>
          <p className="text-xs text-muted-foreground">{topLabel.count.toLocaleString()} occurrences</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {((stats.totalLabeled / (stats.totalLabeled + stats.filesRemaining)) * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">of total dataset labeled</p>
        </CardContent>
      </Card>
    </div>
  );
}
