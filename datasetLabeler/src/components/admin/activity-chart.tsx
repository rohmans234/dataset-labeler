'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { activityData, chartConfig } from '@/lib/data';

export default function ActivityChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="Zaid"
            stroke="var(--color-Zaid)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Ali"
            stroke="var(--color-Ali)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
