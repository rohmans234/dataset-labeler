'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

// Gunakan default value [] untuk data agar tidak undefined
export default function ActivityChart({ data = [] }: { data?: any[] }) {
  // Pengecekan keamanan: Jika data bukan array atau kosong
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground italic text-sm">
        Belum ada data aktivitas tersedia.
      </div>
    );
  }

  // Identifikasi user secara dinamis dari keys di dalam object pertama
  const users = Object.keys(data[0]).filter(key => key !== 'date');

  const dynamicConfig: any = {};
  users.forEach((user, index) => {
    dynamicConfig[user] = {
      label: user,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
  });

  return (
    <ChartContainer config={dynamicConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tickFormatter={(value) => {
                const parts = value.split('/');
                return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : value;
            }}
          />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          
          {users.map((user) => (
            <Line
              key={user}
              type="monotone"
              dataKey={user}
              stroke={dynamicConfig[user].color}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}