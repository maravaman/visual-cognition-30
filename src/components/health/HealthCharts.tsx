import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Legend } from 'recharts';
import type { HealthEntry } from './HealthDashboard';

interface HealthChartsProps {
  entries: HealthEntry[];
}

export const HealthCharts: React.FC<HealthChartsProps> = ({ entries }) => {
  // Prepare data for charts - last 7 days
  const last7Days = entries
    .filter(entry => {
      const entryDate = new Date(entry.entry_date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return entryDate >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
    .map(entry => ({
      date: new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'short' }),
      calories_consumed: entry.calories_consumed || 0,
      calories_burned: entry.calories_burned || 0,
      sleep_hours: entry.sleep_hours || 0,
      sleep_quality: entry.sleep_quality || 0,
      workout_minutes: entry.workout_minutes || 0,
      net_calories: (entry.calories_consumed || 0) - (entry.calories_burned || 0)
    }));

  // Sleep quality data for radial chart
  const sleepQualityData = last7Days.map(day => ({
    name: day.date,
    quality: (day.sleep_quality / 5) * 100,
    hours: day.sleep_hours
  }));

  const chartConfig = {
    calories_consumed: {
      label: "Calories Consumed",
      color: "hsl(var(--chart-1))",
    },
    calories_burned: {
      label: "Calories Burned",
      color: "hsl(var(--chart-2))",
    },
    sleep_hours: {
      label: "Sleep Hours",
      color: "hsl(var(--chart-3))",
    },
    workout_minutes: {
      label: "Workout Minutes",
      color: "hsl(var(--chart-4))",
    },
  };

  if (last7Days.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>No data available for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            Start tracking your health to see charts here
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Calories Chart */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <CardHeader>
          <CardTitle>Calories Tracking</CardTitle>
          <CardDescription>Daily calorie consumption vs calories burned</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="calories_consumed" 
                  stroke="var(--color-calories_consumed)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories_burned" 
                  stroke="var(--color-calories_burned)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Workout Chart */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <CardHeader>
          <CardTitle>Workout Activity</CardTitle>
          <CardDescription>Daily workout minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="workout_minutes" 
                  fill="var(--color-workout_minutes)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sleep Chart */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <CardHeader>
          <CardTitle>Sleep Tracking</CardTitle>
          <CardDescription>Sleep hours and quality over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="sleep_hours" 
                  stroke="var(--color-sleep_hours)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Net Calories Chart */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <CardHeader>
          <CardTitle>Net Calories</CardTitle>
          <CardDescription>Calories consumed minus calories burned</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="net_calories" 
                  fill="hsl(var(--chart-5))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};