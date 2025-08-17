import React from 'react';
import { Activity, Flame, Moon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthEntry } from './HealthDashboard';

interface HealthStatsProps {
  entries: HealthEntry[];
}

export const HealthStats: React.FC<HealthStatsProps> = ({ entries }) => {
  const today = new Date().toISOString().split('T')[0];
  const last7Days = entries.filter(entry => {
    const entryDate = new Date(entry.entry_date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return entryDate >= sevenDaysAgo;
  });

  const todayEntry = entries.find(entry => entry.entry_date === today);

  const calculateAverage = (field: keyof HealthEntry, entries: HealthEntry[]) => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((total, entry) => total + (Number(entry[field]) || 0), 0);
    return Math.round((sum / entries.length) * 10) / 10;
  };

  const calculateTotal = (field: keyof HealthEntry, entries: HealthEntry[]) => {
    return entries.reduce((total, entry) => total + (Number(entry[field]) || 0), 0);
  };

  const stats = [
    {
      title: "Today's Calories",
      value: todayEntry?.calories_consumed || 0,
      subtitle: `Burned: ${todayEntry?.calories_burned || 0}`,
      icon: Flame,
      color: "text-orange-500"
    },
    {
      title: "Today's Workout",
      value: `${todayEntry?.workout_minutes || 0} min`,
      subtitle: todayEntry?.workout_type || 'No workout',
      icon: Activity,
      color: "text-blue-500"
    },
    {
      title: "Last Sleep",
      value: `${todayEntry?.sleep_hours || 0}h`,
      subtitle: `Quality: ${todayEntry?.sleep_quality || 0}/5`,
      icon: Moon,
      color: "text-purple-500"
    },
    {
      title: "Weekly Average",
      value: `${calculateAverage('workout_minutes', last7Days)} min`,
      subtitle: `Sleep: ${calculateAverage('sleep_hours', last7Days)}h`,
      icon: TrendingUp,
      color: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};