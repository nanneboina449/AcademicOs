'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const COLORS = ['#1F497D', '#4472C4', '#70AD47', '#FFC000', '#ED7D31'];

interface TimeAllocationChartProps {
  data: Array<{
    category: string;
    hours: number;
    percentage: number;
  }>;
}

export function TimeAllocationChart({ data }: TimeAllocationChartProps) {
  const chartData = data.map((item) => ({
    name: item.category.replace('_', ' '),
    value: item.hours,
    percentage: item.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percentage }) =>
            `${name}: ${percentage.toFixed(1)}%`
          }
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Time']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
