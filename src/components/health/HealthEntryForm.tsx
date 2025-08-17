import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import type { HealthEntry, WorkoutType } from './HealthDashboard';

interface HealthEntryFormProps {
  entry?: HealthEntry | null;
  workoutTypes: WorkoutType[];
  onSave: (data: Partial<HealthEntry>) => void;
  onCancel: () => void;
}

export const HealthEntryForm: React.FC<HealthEntryFormProps> = ({
  entry,
  workoutTypes,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    entry_date: entry?.entry_date || new Date().toISOString().split('T')[0],
    calories_consumed: entry?.calories_consumed || 0,
    calories_burned: entry?.calories_burned || 0,
    sleep_hours: entry?.sleep_hours || 0,
    sleep_quality: entry?.sleep_quality || 3,
    workout_minutes: entry?.workout_minutes || 0,
    workout_type: entry?.workout_type || '',
    notes: entry?.notes || ''
  });

  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType | null>(null);

  useEffect(() => {
    if (formData.workout_type) {
      const workoutType = workoutTypes.find(w => w.name === formData.workout_type);
      setSelectedWorkoutType(workoutType || null);
    }
  }, [formData.workout_type, workoutTypes]);

  // Auto-calculate calories burned based on workout
  useEffect(() => {
    if (selectedWorkoutType && formData.workout_minutes > 0) {
      const calculatedCalories = Math.round(
        selectedWorkoutType.calories_per_minute * formData.workout_minutes
      );
      setFormData(prev => ({ ...prev, calories_burned: calculatedCalories }));
    }
  }, [selectedWorkoutType, formData.workout_minutes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSleepQualityLabel = (value: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[value] || '';
  };

  return (
    <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {entry ? 'Edit Health Entry' : 'Add Health Entry'}
        </CardTitle>
        <CardDescription>
          Track your daily health metrics and activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="entry_date">Date</Label>
            <Input
              id="entry_date"
              type="date"
              value={formData.entry_date}
              onChange={(e) => handleInputChange('entry_date', e.target.value)}
              required
            />
          </div>

          {/* Calories */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories_consumed">Calories Consumed</Label>
              <Input
                id="calories_consumed"
                type="number"
                min="0"
                value={formData.calories_consumed}
                onChange={(e) => handleInputChange('calories_consumed', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories_burned">Calories Burned</Label>
              <Input
                id="calories_burned"
                type="number"
                min="0"
                value={formData.calories_burned}
                onChange={(e) => handleInputChange('calories_burned', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Sleep */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sleep_hours">Sleep Hours</Label>
              <Input
                id="sleep_hours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleep_hours}
                onChange={(e) => handleInputChange('sleep_hours', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Sleep Quality: {getSleepQualityLabel(formData.sleep_quality)}</Label>
              <Slider
                value={[formData.sleep_quality]}
                onValueChange={(value) => handleInputChange('sleep_quality', value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          {/* Workout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Workout Type</Label>
              <Select
                value={formData.workout_type}
                onValueChange={(value) => handleInputChange('workout_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((workout) => (
                    <SelectItem key={workout.id} value={workout.name}>
                      {workout.name} ({workout.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workout_minutes">Workout Minutes</Label>
              <Input
                id="workout_minutes"
                type="number"
                min="0"
                value={formData.workout_minutes}
                onChange={(e) => handleInputChange('workout_minutes', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about your day..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {entry ? 'Update Entry' : 'Save Entry'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};