-- Create enum for supported Indian languages
CREATE TYPE public.indian_language AS ENUM (
  'english', 'hindi', 'kannada', 'tamil', 'telugu', 'marathi', 
  'gujarati', 'bengali', 'punjabi', 'malayalam', 'odia', 'assamese'
);

-- Create enum for farmer roles
CREATE TYPE public.farmer_role AS ENUM ('farmer', 'admin', 'expert');

-- Create enum for alert types
CREATE TYPE public.alert_type AS ENUM ('weather', 'pest', 'disease', 'market', 'harvest');

-- Create farmers table for user profiles
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  village TEXT,
  district TEXT,
  state TEXT,
  farm_size_acres DECIMAL(10,2),
  primary_crops TEXT[],
  preferred_language indian_language DEFAULT 'english',
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  role farmer_role DEFAULT 'farmer',
  sms_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crops table
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  scientific_name TEXT,
  typical_season TEXT,
  growth_days INTEGER,
  water_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop_journal table for farming activities
CREATE TABLE public.crop_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- planting, watering, fertilizing, harvesting, etc.
  activity_date DATE NOT NULL,
  notes TEXT,
  quantity TEXT,
  cost DECIMAL(10,2),
  weather_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create satellite_data table for NDVI monitoring
CREATE TABLE public.satellite_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  ndvi_value DECIMAL(5,3),
  capture_date DATE NOT NULL,
  analysis_result JSONB,
  health_status TEXT, -- healthy, stressed, critical
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create soil_analysis table
CREATE TABLE public.soil_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  image_url TEXT,
  ph_level DECIMAL(3,1),
  nitrogen_level TEXT,
  phosphorus_level TEXT,
  potassium_level TEXT,
  organic_matter DECIMAL(5,2),
  analysis_result JSONB,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_alerts table
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  alert_type alert_type NOT NULL,
  severity TEXT NOT NULL, -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pest_disease_reports table
CREATE TABLE public.pest_disease_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop_affected TEXT NOT NULL,
  pest_disease_name TEXT,
  severity TEXT NOT NULL,
  image_url TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  description TEXT,
  treatment_used TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_prices table
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  modal_price DECIMAL(10,2),
  price_date DATE NOT NULL,
  price_trend TEXT, -- rising, falling, stable
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_interactions table for logging
CREATE TABLE public.voice_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  input_language indian_language NOT NULL,
  original_text TEXT,
  translated_text TEXT,
  response_text TEXT,
  response_language indian_language NOT NULL,
  interaction_type TEXT, -- soil, crop, weather, market, pest
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for farmers
CREATE POLICY "Farmers can view their own profile" ON public.farmers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Farmers can update their own profile" ON public.farmers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create farmer profile" ON public.farmers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for crop_journal
CREATE POLICY "Farmers can manage their own journal" ON public.crop_journal FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);

-- Create RLS policies for satellite_data
CREATE POLICY "Farmers can view their own satellite data" ON public.satellite_data FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);

-- Create RLS policies for soil_analysis
CREATE POLICY "Farmers can manage their own soil analysis" ON public.soil_analysis FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);

-- Weather alerts are public but only admins can create/update
CREATE POLICY "Anyone can view weather alerts" ON public.weather_alerts FOR SELECT USING (true);
CREATE POLICY "Only admins can manage weather alerts" ON public.weather_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farmers WHERE user_id = auth.uid() AND role = 'admin')
);

-- Pest reports - farmers can create, everyone can view in their area
CREATE POLICY "Farmers can create pest reports" ON public.pest_disease_reports FOR INSERT WITH CHECK (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can view pest reports" ON public.pest_disease_reports FOR SELECT USING (true);

-- Market prices are public
CREATE POLICY "Anyone can view market prices" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Only admins can manage market prices" ON public.market_prices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farmers WHERE user_id = auth.uid() AND role = 'admin')
);

-- Voice interactions are private to farmer
CREATE POLICY "Farmers can manage their own voice interactions" ON public.voice_interactions FOR ALL USING (
  farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
);

-- Crops table is public for reading
CREATE POLICY "Anyone can view crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Only admins can manage crops" ON public.crops FOR ALL USING (
  EXISTS (SELECT 1 FROM public.farmers WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON public.farmers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default crops
INSERT INTO public.crops (name, scientific_name, typical_season, growth_days, water_requirements) VALUES
('Rice', 'Oryza sativa', 'Kharif', 120, 'High'),
('Wheat', 'Triticum aestivum', 'Rabi', 110, 'Medium'),
('Cotton', 'Gossypium', 'Kharif', 180, 'Medium'),
('Sugarcane', 'Saccharum officinarum', 'Annual', 365, 'High'),
('Maize', 'Zea mays', 'Kharif', 90, 'Medium'),
('Soybean', 'Glycine max', 'Kharif', 100, 'Medium'),
('Tomato', 'Solanum lycopersicum', 'Year-round', 75, 'Medium'),
('Onion', 'Allium cepa', 'Rabi', 120, 'Low'),
('Potato', 'Solanum tuberosum', 'Rabi', 90, 'Medium'),
('Banana', 'Musa', 'Year-round', 300, 'High');