'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BottlenecksChartProps {
  data: Array<{
    activityType: string;
    totalHours: number;
    percentage: number;
  }>;
}

const formatActivityType = (type: string) => {
  return type
    .replace('ADMIN_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export function BottlenecksChart({ data }: BottlenecksChartProps) {
  const chartData = data.map((item) => ({
    name: formatActivityType(item.activityType),
    hours: item.totalHours,
    percentage: item.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)} hours`,
            'Time Spent',
          ]}
        />
        <Bar dataKey="hours" fill="#1F497D" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
