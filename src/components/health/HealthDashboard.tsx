import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Activity, Moon, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthEntryForm } from './HealthEntryForm';
import { HealthStats } from './HealthStats';
import { HealthCharts } from './HealthCharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HealthEntry {
  id: string;
  user_id: string;
  entry_date: string;
  calories_consumed: number;
  calories_burned: number;
  sleep_hours: number;
  sleep_quality: number;
  workout_minutes: number;
  workout_type: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutType {
  id: string;
  name: string;
  category: string;
  calories_per_minute: number;
}

const HealthDashboard = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-entry'>('dashboard');
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([]);
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HealthEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load health entries
      const { data: entries, error: entriesError } = await supabase
        .from('health_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (entriesError) throw entriesError;
      
      // Load workout types
      const { data: workouts, error: workoutsError } = await supabase
        .from('workout_types')
        .select('*')
        .order('name');

      if (workoutsError) throw workoutsError;

      setHealthEntries(entries || []);
      setWorkoutTypes(workouts || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load health data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (entryData: Partial<HealthEntry>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save health entries.",
          variant: "destructive",
        });
        return;
      }

      const dataWithUserId = { ...entryData, user_id: user.id };

      if (selectedEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('health_entries')
          .update(dataWithUserId)
          .eq('id', selectedEntry.id)
          .select()
          .single();

        if (error) throw error;

        setHealthEntries(prev => 
          prev.map(entry => entry.id === selectedEntry.id ? data : entry)
        );

        toast({
          title: "Entry Updated",
          description: "Your health entry has been updated successfully.",
        });
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('health_entries')
          .insert([dataWithUserId])
          .select()
          .single();

        if (error) throw error;

        setHealthEntries(prev => [data, ...prev]);

        toast({
          title: "Entry Created",
          description: "Your health entry has been created successfully.",
        });
      }

      setCurrentView('dashboard');
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save health entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHealthEntries(prev => prev.filter(entry => entry.id !== id));

      toast({
        title: "Entry Deleted",
        description: "Your health entry has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete health entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = (entry: HealthEntry) => {
    setSelectedEntry(entry);
    setCurrentView('add-entry');
  };

  const handleAddNew = () => {
    setSelectedEntry(null);
    setCurrentView('add-entry');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedEntry(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading your health data...</div>
      </div>
    );
  }

  if (currentView === 'add-entry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={handleBackToDashboard}
            variant="outline"
            className="mb-6"
          >
            ← Back to Dashboard
          </Button>
          <HealthEntryForm
            entry={selectedEntry}
            workoutTypes={workoutTypes}
            onSave={handleSaveEntry}
            onCancel={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Health Tracker</h1>
            <p className="text-muted-foreground">Monitor your daily health and wellness</p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>

        {/* Quick Stats */}
        <HealthStats entries={healthEntries} />

        {/* Charts */}
        <HealthCharts entries={healthEntries} />

        {/* Recent Entries */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Entries
            </CardTitle>
            <CardDescription>
              Your latest health tracking entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No health entries yet</p>
                <Button onClick={handleAddNew} variant="outline">
                  Create your first entry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {healthEntries.slice(0, 7).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {entry.calories_consumed || 0} cal
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          {entry.workout_minutes || 0} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Moon className="h-4 w-4" />
                          {entry.sleep_hours || 0}h
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthDashboard;