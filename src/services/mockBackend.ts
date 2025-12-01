// Mock Backend Service to replace Supabase functionality
import { weatherService } from './weatherService';

// Types for our mock backend
export interface Farmer {
  id: string;
  name: string;
  phone_number: string;
  state?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  state: string;
  district: string;
  is_active: boolean;
  created_at: string;
}

export interface MarketPrice {
  id: string;
  crop_name: string;
  price_per_kg: number;
  state: string;
  district: string;
  price_date: string;
  market_name: string;
}

export interface CropJournalEntry {
  id: string;
  farmer_id: string;
  crop_name: string;
  activity_type: string;
  activity_date: string;
  cost?: number;
  quantity?: string;
  notes?: string;
  created_at: string;
}

export interface SatelliteAnalysis {
  id: string;
  farmer_id: string;
  latitude: number;
  longitude: number;
  ndvi_value: number;
  analysis_date: string;
  crop_health_status: string;
  recommendations: string;
}

export interface SoilAnalysis {
  id: string;
  farmer_id: string;
  ph_level: number;
  nitrogen_level: string;
  phosphorus_level: string;
  potassium_level: string;
  organic_matter: string;
  recommendations: string;
  analysis_date: string;
}

class MockBackendService {
  private farmers: Map<string, Farmer> = new Map();
  private currentUser: Farmer | null = null;
  private weatherAlerts: WeatherAlert[] = [];
  private marketPrices: MarketPrice[] = [];
  private cropJournal: Map<string, CropJournalEntry[]> = new Map();
  private satelliteAnalyses: Map<string, SatelliteAnalysis[]> = new Map();
  private soilAnalyses: Map<string, SoilAnalysis[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create sample farmer
    const sampleFarmer: Farmer = {
      id: 'farmer_123',
      name: 'Rajesh Kumar',
      phone_number: '+91-9876543210',
      state: 'Karnataka',
      district: 'Bangalore Rural',
      latitude: 12.9716,
      longitude: 77.5946,
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.farmers.set(sampleFarmer.id, sampleFarmer);
    this.currentUser = sampleFarmer;

    // Initialize sample market prices
    this.marketPrices = [
      {
        id: '1',
        crop_name: 'Rice',
        price_per_kg: 25.50,
        state: 'Karnataka',
        district: 'Bangalore Rural',
        price_date: new Date().toISOString().split('T')[0],
        market_name: 'Bangalore Mandi'
      },
      {
        id: '2',
        crop_name: 'Wheat',
        price_per_kg: 22.75,
        state: 'Karnataka',
        district: 'Bangalore Rural',
        price_date: new Date().toISOString().split('T')[0],
        market_name: 'Bangalore Mandi'
      },
      {
        id: '3',
        crop_name: 'Tomato',
        price_per_kg: 35.00,
        state: 'Karnataka',
        district: 'Bangalore Rural',
        price_date: new Date().toISOString().split('T')[0],
        market_name: 'Bangalore Mandi'
      }
    ];

    // Initialize sample crop journal entries
    this.cropJournal.set('farmer_123', [
      {
        id: '1',
        farmer_id: 'farmer_123',
        crop_name: 'Tomato',
        activity_type: 'Planting',
        activity_date: '2024-11-15',
        cost: 5000,
        quantity: '100 plants',
        notes: 'Planted in southern field',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        farmer_id: 'farmer_123',
        crop_name: 'Rice',
        activity_type: 'Fertilizer',
        activity_date: '2024-11-20',
        cost: 2500,
        quantity: '50 kg',
        notes: 'Applied organic fertilizer',
        created_at: new Date().toISOString()
      }
    ]);
  }

  // Auth methods
  async signIn(email: string, password: string) {
    // Mock authentication - in real app, validate credentials
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    // For demo purposes, accept any email/password combination
    // In production, you would validate against a user database
    const farmer = Array.from(this.farmers.values()).find(f => f.phone_number === email) || this.currentUser;
    
    if (farmer) {
      this.currentUser = farmer;
      // Trigger auth state update
      window.dispatchEvent(new CustomEvent('auth-state-change', { 
        detail: { user: farmer, type: 'sign-in' } 
      }));
    }
    
    return {
      data: { user: farmer },
      error: null
    };
  }

  async signUp(email: string, password: string, metadata?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newFarmer: Farmer = {
      id: 'farmer_' + Date.now(),
      name: metadata?.name || 'New Farmer',
      phone_number: metadata?.phone || email,
      state: metadata?.state || '',
      district: metadata?.district || '',
      village: metadata?.village || '',
      farm_size_acres: metadata?.farm_size_acres,
      primary_crops: metadata?.primary_crops || [],
      preferred_language: metadata?.preferred_language || 'english',
      language: metadata?.preferred_language || 'english',
      latitude: metadata?.latitude,
      longitude: metadata?.longitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.farmers.set(newFarmer.id, newFarmer);
    this.currentUser = newFarmer;
    
    // Initialize empty collections for the new farmer
    this.cropJournal.set(newFarmer.id, []);
    this.satelliteAnalyses.set(newFarmer.id, []);
    this.soilAnalyses.set(newFarmer.id, []);
    
    // Trigger auth state update
    window.dispatchEvent(new CustomEvent('auth-state-change', { 
      detail: { user: newFarmer, type: 'sign-up' } 
    }));
    
    return {
      data: { user: newFarmer },
      error: null
    };
  }

  async signOut() {
    this.currentUser = null;
    // Trigger auth state update
    window.dispatchEvent(new CustomEvent('auth-state-change', { 
      detail: { user: null, type: 'sign-out' } 
    }));
    return { error: null };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Farmer profile methods
  async getFarmerProfile(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const farmer = this.farmers.get(userId);
    return {
      data: farmer || null,
      error: farmer ? null : { message: 'Farmer not found' }
    };
  }

  async updateFarmerProfile(userId: string, updates: Partial<Farmer>) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const farmer = this.farmers.get(userId);
    if (farmer) {
      const updatedFarmer = { ...farmer, ...updates, updated_at: new Date().toISOString() };
      this.farmers.set(userId, updatedFarmer);
      this.currentUser = updatedFarmer;
      return {
        data: updatedFarmer,
        error: null
      };
    }
    return {
      data: null,
      error: { message: 'Farmer not found' }
    };
  }

  // Weather alerts
  async getWeatherAlerts(state: string, district: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get real weather alerts if possible, otherwise return mock data
    try {
      if (this.currentUser?.latitude && this.currentUser?.longitude) {
        const realAlerts = await weatherService.getWeatherAlerts(
          this.currentUser.latitude, 
          this.currentUser.longitude
        );
        
        // Convert to our format
        const convertedAlerts: WeatherAlert[] = realAlerts.map(alert => ({
          id: alert.id,
          title: alert.title,
          description: alert.description,
          alert_type: alert.type,
          state,
          district,
          is_active: true,
          created_at: alert.startTime
        }));
        
        return {
          data: convertedAlerts,
          error: null
        };
      }
    } catch (error) {
      console.error('Error fetching real weather alerts:', error);
    }

    return {
      data: this.weatherAlerts.filter(alert => 
        alert.state === state && alert.district === district && alert.is_active
      ),
      error: null
    };
  }

  // Market prices
  async getMarketPrices(state: string, district: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: this.marketPrices.filter(price => 
        price.state === state && price.district === district
      ),
      error: null
    };
  }

  // Crop journal
  async getCropJournalEntries(farmerId: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: this.cropJournal.get(farmerId) || [],
      error: null
    };
  }

  async addCropJournalEntry(farmerId: string, entry: Omit<CropJournalEntry, 'id' | 'created_at'>) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newEntry: CropJournalEntry = {
      ...entry,
      id: 'entry_' + Date.now(),
      created_at: new Date().toISOString()
    };
    
    const entries = this.cropJournal.get(farmerId) || [];
    entries.unshift(newEntry);
    this.cropJournal.set(farmerId, entries);
    
    return {
      data: newEntry,
      error: null
    };
  }

  // Satellite analysis
  async performSatelliteAnalysis(farmerId: string, latitude: number, longitude: number) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    
    // Generate mock NDVI analysis
    const ndviValue = 0.3 + Math.random() * 0.6; // Random NDVI between 0.3-0.9
    let healthStatus: string;
    let recommendations: string;
    
    if (ndviValue > 0.7) {
      healthStatus = 'Excellent';
      recommendations = 'Crops are in excellent health. Continue current management practices.';
    } else if (ndviValue > 0.5) {
      healthStatus = 'Good';
      recommendations = 'Crops are healthy. Monitor for any signs of stress and maintain irrigation.';
    } else if (ndviValue > 0.3) {
      healthStatus = 'Fair';
      recommendations = 'Some crop stress detected. Check irrigation, soil nutrients, and pest issues.';
    } else {
      healthStatus = 'Poor';
      recommendations = 'Significant crop stress detected. Immediate attention required for irrigation and nutrition.';
    }

    const analysis: SatelliteAnalysis = {
      id: 'sat_' + Date.now(),
      farmer_id: farmerId,
      latitude,
      longitude,
      ndvi_value: Math.round(ndviValue * 1000) / 1000,
      analysis_date: new Date().toISOString(),
      crop_health_status: healthStatus,
      recommendations
    };
    
    const analyses = this.satelliteAnalyses.get(farmerId) || [];
    analyses.unshift(analysis);
    this.satelliteAnalyses.set(farmerId, analyses);
    
    return {
      data: analysis,
      error: null
    };
  }

  // Soil analysis
  async performSoilAnalysis(farmerId: string, imageData?: string) {
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate AI processing
    
    // Generate mock soil analysis
    const phLevel = 6.0 + Math.random() * 2.5; // pH between 6.0-8.5
    const nutrients = ['Low', 'Medium', 'High'];
    
    const analysis: SoilAnalysis = {
      id: 'soil_' + Date.now(),
      farmer_id: farmerId,
      ph_level: Math.round(phLevel * 10) / 10,
      nitrogen_level: nutrients[Math.floor(Math.random() * nutrients.length)],
      phosphorus_level: nutrients[Math.floor(Math.random() * nutrients.length)],
      potassium_level: nutrients[Math.floor(Math.random() * nutrients.length)],
      organic_matter: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      recommendations: this.generateSoilRecommendations(phLevel),
      analysis_date: new Date().toISOString()
    };
    
    const analyses = this.soilAnalyses.get(farmerId) || [];
    analyses.unshift(analysis);
    this.soilAnalyses.set(farmerId, analyses);
    
    return {
      data: analysis,
      error: null
    };
  }

  private generateSoilRecommendations(phLevel: number): string {
    if (phLevel < 6.5) {
      return 'Soil is acidic. Consider adding lime to raise pH. Ensure adequate drainage and add organic matter.';
    } else if (phLevel > 7.5) {
      return 'Soil is alkaline. Add organic matter like compost. Consider sulfur application to lower pH if needed.';
    } else {
      return 'Soil pH is optimal for most crops. Maintain current soil management practices and regular organic matter addition.';
    }
  }

  // Get farmer's analyses
  async getSatelliteAnalyses(farmerId: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: this.satelliteAnalyses.get(farmerId) || [],
      error: null
    };
  }

  async getSoilAnalyses(farmerId: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: this.soilAnalyses.get(farmerId) || [],
      error: null
    };
  }
}

// Create singleton instance
export const mockBackend = new MockBackendService();

// Export types
export type { WeatherAlert, MarketPrice, CropJournalEntry, SatelliteAnalysis, SoilAnalysis };