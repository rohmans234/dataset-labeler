import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart } from "lucide-react";
import StatsCards from "@/components/admin/stats-cards";
import LabelDistributionChart from "@/components/admin/label-distribution-chart";
import ActivityChart from "@/components/admin/activity-chart";
import { adminStats } from "@/lib/data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of labeling progress and team activity.
        </p>
      </header>

      <StatsCards stats={adminStats} />

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-muted-foreground" />
              Label Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LabelDistributionChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Labeling Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
