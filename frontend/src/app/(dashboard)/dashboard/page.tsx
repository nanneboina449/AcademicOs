'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { analyticsApi, researchersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatHours, formatPercentage } from '@/lib/utils';
import { TimeAllocationChart } from '@/components/charts/time-allocation-chart';
import { BottlenecksChart } from '@/components/charts/bottlenecks-chart';
import {
  Users,
  FileText,
  Clock,
  TrendingDown,
} from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.institutionId],
    queryFn: () => analyticsApi.getDashboard(user?.institutionId),
    enabled: !!user,
  });

  const { data: bottlenecks, isLoading: bottlenecksLoading } = useQuery({
    queryKey: ['bottlenecks', user?.institutionId],
    queryFn: () =>
      analyticsApi.getBottlenecks({
        institutionId: user?.institutionId,
        limit: 5,
      }),
    enabled: !!user,
  });

  const { data: myTimeAllocation } = useQuery({
    queryKey: ['my-time-allocation'],
    queryFn: async () => {
      const profile = await researchersApi.getMyProfile();
      return researchersApi.getTimeAllocation(profile.data.id);
    },
    enabled: !!user,
  });

  const dashboardStats = stats?.data;
  const bottleneckData = bottlenecks?.data;
  const timeData = myTimeAllocation?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName}! Here's your research analytics overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Researchers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : dashboardStats?.researcherCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active researchers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grants</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : dashboardStats?.activeGrants || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active of {dashboardStats?.grantCount || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? '...'
                : formatHours(dashboardStats?.totalTimeLogged || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total hours tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin Burden</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? '...'
                : formatPercentage(dashboardStats?.adminTimePercentage || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Of total time on admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Time Allocation</CardTitle>
            <CardDescription>
              Breakdown of how you spend your time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeData ? (
              <TimeAllocationChart data={timeData.byCategory} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Loading time data...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Admin Bottlenecks</CardTitle>
            <CardDescription>
              Activities consuming the most administrative time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bottleneckData ? (
              <BottlenecksChart data={bottleneckData} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Loading bottleneck data...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/time-tracking"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Log Time</div>
                <div className="text-sm text-muted-foreground">
                  Record your activities
                </div>
              </div>
            </a>
            <a
              href="/grants"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">View Grants</div>
                <div className="text-sm text-muted-foreground">
                  Manage applications
                </div>
              </div>
            </a>
            <a
              href="/analytics"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <TrendingDown className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-muted-foreground">
                  View detailed reports
                </div>
              </div>
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="font-medium">Profile</div>
                <div className="text-sm text-muted-foreground">
                  Update your details
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
