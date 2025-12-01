// Backend service that handles both Supabase and Mock backend
import { supabase } from '@/integrations/supabase/client';
import { mockBackend, Farmer, WeatherAlert, MarketPrice, CropJournalEntry, SatelliteAnalysis, SoilAnalysis } from './mockBackend';

type BackendResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

class BackendService {
  private useSupabase: boolean = false;

  constructor() {
    // Try to determine if Supabase is available
    this.checkSupabaseConnection();
  }

  private async checkSupabaseConnection() {
    try {
      // Try a simple query to test Supabase connection
      const { error } = await supabase.from('farmers').select('count').limit(1);
      this.useSupabase = !error;
      console.log('Backend mode:', this.useSupabase ? 'Supabase' : 'Mock Backend');
    } catch (error) {
      console.log('Supabase not available, using mock backend');
      this.useSupabase = false;
    }
  }

  // Auth methods
  async signIn(email: string, password: string): Promise<BackendResponse<Farmer>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Get farmer profile
        if (data.user) {
          const { data: farmerData, error: farmerError } = await supabase
            .from('farmers')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          return {
            data: farmerData,
            error: farmerError ? { message: farmerError.message } : null
          };
        }
        return { data: null, error: { message: 'User not found' } };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    } else {
      return await mockBackend.signIn(email, password);
    }
  }

  async signUp(email: string, password: string, metadata?: any): Promise<BackendResponse<Farmer>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: metadata }
        });
        if (error) throw error;
        
        if (data.user) {
          // Create farmer profile
          const farmerData = {
            id: data.user.id,
            name: metadata?.name || '',
            phone_number: metadata?.phone || '',
            state: metadata?.state || '',
            district: metadata?.district || '',
            language: 'en'
          };
          
          const { data: newFarmer, error: farmerError } = await supabase
            .from('farmers')
            .insert([farmerData])
            .select()
            .single();
          
          return {
            data: newFarmer,
            error: farmerError ? { message: farmerError.message } : null
          };
        }
        return { data: null, error: { message: 'User creation failed' } };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    } else {
      return await mockBackend.signUp(email, password, metadata);
    }
  }

  async signOut() {
    if (this.useSupabase) {
      const { error } = await supabase.auth.signOut();
      return { error: error ? { message: error.message } : null };
    } else {
      return await mockBackend.signOut();
    }
  }

  getCurrentUser(): Farmer | null {
    if (this.useSupabase) {
      // For Supabase, you'd typically get this from auth state
      return null; // Implement based on your auth state management
    } else {
      return mockBackend.getCurrentUser();
    }
  }

  // Farmer profile methods
  async getFarmerProfile(userId: string): Promise<BackendResponse<Farmer>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('id', userId)
          .single();
        
        return {
          data,
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    } else {
      return await mockBackend.getFarmerProfile(userId);
    }
  }

  async updateFarmerProfile(userId: string, updates: Partial<Farmer>): Promise<BackendResponse<Farmer>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('farmers')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        
        return {
          data,
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    } else {
      return await mockBackend.updateFarmerProfile(userId, updates);
    }
  }

  // Weather alerts
  async getWeatherAlerts(state: string, district: string): Promise<BackendResponse<WeatherAlert[]>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('weather_alerts')
          .select('*')
          .eq('state', state)
          .eq('district', district)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        return {
          data: data || [],
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: [], error: { message: error.message } };
      }
    } else {
      return await mockBackend.getWeatherAlerts(state, district);
    }
  }

  // Market prices
  async getMarketPrices(state: string, district: string): Promise<BackendResponse<MarketPrice[]>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('market_prices')
          .select('*')
          .eq('state', state)
          .eq('district', district)
          .order('price_date', { ascending: false })
          .limit(10);
        
        return {
          data: data || [],
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: [], error: { message: error.message } };
      }
    } else {
      return await mockBackend.getMarketPrices(state, district);
    }
  }

  // Crop journal
  async getCropJournalEntries(farmerId: string): Promise<BackendResponse<CropJournalEntry[]>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('crop_journal')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('activity_date', { ascending: false });
        
        return {
          data: data || [],
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: [], error: { message: error.message } };
      }
    } else {
      return await mockBackend.getCropJournalEntries(farmerId);
    }
  }

  async addCropJournalEntry(farmerId: string, entry: Omit<CropJournalEntry, 'id' | 'created_at'>): Promise<BackendResponse<CropJournalEntry>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('crop_journal')
          .insert([{ ...entry, farmer_id: farmerId }])
          .select()
          .single();
        
        return {
          data,
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: null, error: { message: error.message } };
      }
    } else {
      return await mockBackend.addCropJournalEntry(farmerId, entry);
    }
  }

  // Satellite analysis
  async performSatelliteAnalysis(farmerId: string, latitude: number, longitude: number): Promise<BackendResponse<SatelliteAnalysis>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.functions.invoke('satellite-analysis', {
          body: { farmer_id: farmerId, latitude, longitude }
        });
        
        if (error) throw error;
        return { data, error: null };
      } catch (error: any) {
        // Fallback to mock if function fails
        return await mockBackend.performSatelliteAnalysis(farmerId, latitude, longitude);
      }
    } else {
      return await mockBackend.performSatelliteAnalysis(farmerId, latitude, longitude);
    }
  }

  // Soil analysis
  async performSoilAnalysis(farmerId: string, imageData?: string): Promise<BackendResponse<SoilAnalysis>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase.functions.invoke('soil-analysis', {
          body: { farmer_id: farmerId, image_data: imageData }
        });
        
        if (error) throw error;
        return { data, error: null };
      } catch (error: any) {
        // Fallback to mock if function fails
        return await mockBackend.performSoilAnalysis(farmerId, imageData);
      }
    } else {
      return await mockBackend.performSoilAnalysis(farmerId, imageData);
    }
  }

  // Get analyses
  async getSatelliteAnalyses(farmerId: string): Promise<BackendResponse<SatelliteAnalysis[]>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('satellite_analyses')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('analysis_date', { ascending: false });
        
        return {
          data: data || [],
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: [], error: { message: error.message } };
      }
    } else {
      return await mockBackend.getSatelliteAnalyses(farmerId);
    }
  }

  async getSoilAnalyses(farmerId: string): Promise<BackendResponse<SoilAnalysis[]>> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('soil_analyses')
          .select('*')
          .eq('farmer_id', farmerId)
          .order('analysis_date', { ascending: false });
        
        return {
          data: data || [],
          error: error ? { message: error.message } : null
        };
      } catch (error: any) {
        return { data: [], error: { message: error.message } };
      }
    } else {
      return await mockBackend.getSoilAnalyses(farmerId);
    }
  }
}

// Create singleton instance
export const backendService = new BackendService();