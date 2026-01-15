'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

export default function ActivityChart({ data = [] }: { data?: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground italic text-sm">
        Belum ada data aktivitas tersedia.
      </div>
    );
  }

  const users = Object.keys(data[0]).filter(key => key !== 'date');

  const dynamicConfig: any = {};
  users.forEach((user, index) => {
    dynamicConfig[user] = {
      label: user,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
  });

  return (

    <ChartContainer config={dynamicConfig} className="h-[350px] w-full">
      <LineChart 
        data={data} 
        margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
      >
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
        <YAxis tickLine={false} axisLine={false} width={30} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        
        {users.map((user) => (
          <Line
            key={user}
            type="monotone"
            dataKey={user}
            stroke={dynamicConfig[user].color}
            strokeWidth={2}
            dot={{ r: 4, fill: dynamicConfig[user].color }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}