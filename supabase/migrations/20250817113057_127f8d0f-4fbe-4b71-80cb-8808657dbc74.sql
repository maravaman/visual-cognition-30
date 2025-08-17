-- Create health tracking tables
CREATE TABLE public.health_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories_consumed INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  sleep_hours DECIMAL(3,1) DEFAULT 0,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  workout_minutes INTEGER DEFAULT 0,
  workout_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Create workouts table for predefined workout types
CREATE TABLE public.workout_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  calories_per_minute DECIMAL(4,2) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default workout types
INSERT INTO public.workout_types (name, category, calories_per_minute) VALUES
('Running', 'Cardio', 10.0),
('Walking', 'Cardio', 5.0),
('Cycling', 'Cardio', 8.0),
('Swimming', 'Cardio', 12.0),
('Weight Training', 'Strength', 6.0),
('Yoga', 'Flexibility', 3.0),
('Pilates', 'Flexibility', 4.0),
('HIIT', 'Cardio', 15.0);

-- Enable Row Level Security
ALTER TABLE public.health_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_types ENABLE ROW LEVEL SECURITY;

-- Create policies for health_entries
CREATE POLICY "Users can view their own health entries" 
ON public.health_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health entries" 
ON public.health_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health entries" 
ON public.health_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health entries" 
ON public.health_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for workout_types (public read access)
CREATE POLICY "Workout types are viewable by everyone" 
ON public.workout_types 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_entries_updated_at
  BEFORE UPDATE ON public.health_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();