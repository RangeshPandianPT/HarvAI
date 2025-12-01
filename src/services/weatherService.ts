interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  alerts?: WeatherAlert[];
  forecast?: DailyForecast[];
}

interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  areas: string[];
}

interface DailyForecast {
  date: string;
  high: number;
  low: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

interface FarmingRecommendation {
  id: string;
  type: 'irrigation' | 'planting' | 'harvesting' | 'pesticide' | 'fertilizer';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  weatherReason: string;
  actionBy?: string;
}

class WeatherService {
  private readonly API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '94fe827a564c3da532df9f1596a9819a';
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly ONECALL_URL = 'https://api.openweathermap.org/data/2.5/onecall';

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      // Fetch both current weather and UV index
      const [weatherResponse, uvResponse] = await Promise.all([
        fetch(`${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`),
        fetch(`${this.BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${this.API_KEY}`)
      ]);
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();
      const uvData = uvResponse.ok ? await uvResponse.json() : { value: 0 };
      
      return {
        location: `${weatherData.name}, ${weatherData.sys.country}`,
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 10) / 10,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility ? Math.round(weatherData.visibility / 100) / 10 : 10,
        uvIndex: Math.round((uvData.value || 0) * 10) / 10,
        feelsLike: Math.round(weatherData.main.feels_like)
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return this.getFallbackWeatherData();
    }
  }

  async getWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    try {
      const response = await fetch(
        `${this.ONECALL_URL}?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&exclude=minutely,hourly,daily`
      );
      
      if (!response.ok) {
        // If One Call API fails, return generated alerts based on current conditions
        return this.generateWeatherAlerts(lat, lon);
      }

      const data = await response.json();
      
      if (data.alerts && data.alerts.length > 0) {
        return data.alerts.map((alert: any) => ({
          id: (alert.sender_name || 'system') + alert.start,
          type: this.mapAlertType(alert.event),
          severity: this.mapSeverity(alert.tags || []),
          title: alert.event,
          description: alert.description,
          startTime: new Date(alert.start * 1000).toISOString(),
          endTime: new Date(alert.end * 1000).toISOString(),
          areas: alert.areas || []
        }));
      }
      
      // Generate alerts based on current conditions
      return this.generateWeatherAlerts(lat, lon);
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return this.getFallbackAlerts();
    }
  }

  async getWeatherForecast(lat: number, lon: number): Promise<DailyForecast[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Group forecast by day and take one forecast per day
      const dailyForecasts: DailyForecast[] = [];
      const processedDates = new Set<string>();
      
      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toDateString();
        
        if (!processedDates.has(date)) {
          processedDates.add(date);
          dailyForecasts.push({
            date: new Date(item.dt * 1000).toISOString().split('T')[0],
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            precipitation: item.pop * 100 // Probability of precipitation as percentage
          });
        }
        
        if (dailyForecasts.length >= 5) break;
      }
      
      return dailyForecasts;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return this.getFallbackForecast();
    }
  }

  private async generateWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    try {
      const weather = await this.getCurrentWeather(lat, lon);
      const alerts: WeatherAlert[] = [];

      // High temperature alert
      if (weather.temperature > 35) {
        alerts.push({
          id: 'high_temp_' + Date.now(),
          type: 'warning',
          severity: weather.temperature > 40 ? 'severe' : 'moderate',
          title: 'High Temperature Warning',
          description: `Temperature is ${weather.temperature}°C. Take precautions to protect crops and increase irrigation.`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          areas: ['Your Area']
        });
      }

      // High humidity alert
      if (weather.humidity > 85) {
        alerts.push({
          id: 'high_humidity_' + Date.now(),
          type: 'advisory',
          severity: 'moderate',
          title: 'High Humidity Advisory',
          description: `Humidity is ${weather.humidity}%. Monitor crops for fungal diseases and ensure proper ventilation.`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          areas: ['Your Area']
        });
      }

      // Strong wind alert
      if (weather.windSpeed > 8) {
        alerts.push({
          id: 'strong_wind_' + Date.now(),
          type: 'warning',
          severity: weather.windSpeed > 12 ? 'severe' : 'moderate',
          title: 'Strong Wind Alert',
          description: `Wind speed is ${weather.windSpeed} m/s. Secure tall crops and avoid spraying pesticides.`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          areas: ['Your Area']
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error generating weather alerts:', error);
      return [];
    }
  }

  generateFarmingRecommendations(weather: WeatherData, forecast: DailyForecast[]): FarmingRecommendation[] {
    const recommendations: FarmingRecommendation[] = [];
    
    // Temperature-based recommendations
    if (weather.temperature > 35) {
      recommendations.push({
        id: 'high_temp_irrigation',
        type: 'irrigation',
        title: 'Increase Irrigation Frequency',
        description: 'High temperatures detected. Water crops early morning (5-7 AM) or late evening (6-8 PM) to minimize evaporation. Consider drip irrigation for water efficiency.',
        urgency: weather.temperature > 40 ? 'high' : 'medium',
        weatherReason: `Current temperature: ${weather.temperature}°C (Feels like ${weather.feelsLike}°C)`,
        actionBy: weather.temperature > 40 ? 'Within 2 hours' : 'Today'
      });
    }

    if (weather.temperature < 10) {
      recommendations.push({
        id: 'cold_protection',
        type: 'planting',
        title: 'Cold Weather Protection',
        description: 'Low temperatures may damage sensitive crops. Cover young plants with cloth or plastic sheets overnight.',
        urgency: 'high',
        weatherReason: `Current temperature: ${weather.temperature}°C`,
        actionBy: 'Before sunset'
      });
    }

    // Humidity-based recommendations
    if (weather.humidity > 85) {
      recommendations.push({
        id: 'high_humidity_disease_watch',
        type: 'pesticide',
        title: 'Monitor for Fungal Diseases',
        description: 'High humidity creates ideal conditions for fungal diseases like powdery mildew, rust, and blight. Inspect crops daily and apply preventive fungicides if needed.',
        urgency: 'medium',
        weatherReason: `Current humidity: ${weather.humidity}%`
      });
    }

    if (weather.humidity < 30) {
      recommendations.push({
        id: 'low_humidity_stress',
        type: 'irrigation',
        title: 'Combat Low Humidity Stress',
        description: 'Very low humidity can stress plants. Increase irrigation frequency and consider mulching to retain soil moisture.',
        urgency: 'medium',
        weatherReason: `Current humidity: ${weather.humidity}%`
      });
    }

    // Wind-based recommendations
    if (weather.windSpeed > 8) {
      recommendations.push({
        id: 'strong_wind_precautions',
        type: 'harvesting',
        title: 'Strong Wind Precautions',
        description: 'Strong winds detected. Install windbreaks, stake tall plants, avoid spraying chemicals, and harvest mature fruits before they fall.',
        urgency: weather.windSpeed > 12 ? 'high' : 'medium',
        weatherReason: `Wind speed: ${weather.windSpeed} m/s`,
        actionBy: 'Immediately'
      });
    }

    // UV Index recommendations
    if (weather.uvIndex > 7) {
      recommendations.push({
        id: 'high_uv_protection',
        type: 'planting',
        title: 'UV Protection Needed',
        description: 'High UV levels can damage sensitive crops. Provide shade cloths for delicate plants and avoid working in fields during peak hours (11 AM - 3 PM).',
        urgency: 'medium',
        weatherReason: `UV Index: ${weather.uvIndex} (High)`
      });
    }

    // Forecast-based recommendations
    const totalRainExpected = forecast.reduce((sum, day) => sum + day.precipitation, 0);
    const hasHeavyRainInForecast = forecast.some(day => day.precipitation > 70);
    
    if (hasHeavyRainInForecast) {
      recommendations.push({
        id: 'heavy_rain_prep',
        type: 'irrigation',
        title: 'Prepare for Heavy Rain',
        description: 'Heavy rainfall expected. Ensure proper drainage, reduce irrigation, harvest mature crops, and protect seedlings from waterlogging.',
        urgency: 'high',
        weatherReason: `Heavy rain forecasted (${Math.max(...forecast.map(d => d.precipitation))}% chance)`,
        actionBy: 'Before rain starts'
      });
    } else if (totalRainExpected > 100) {
      recommendations.push({
        id: 'rain_forecast_prep',
        type: 'irrigation',
        title: 'Adjust for Expected Rainfall',
        description: 'Significant rain expected over next 5 days. Reduce irrigation schedule and check drainage systems.',
        urgency: 'medium',
        weatherReason: `Total rain expected: ${Math.round(totalRainExpected)}% over 5 days`
      });
    }

    // Dry weather recommendations
    if (totalRainExpected < 20 && weather.humidity < 50) {
      recommendations.push({
        id: 'dry_weather_irrigation',
        type: 'irrigation',
        title: 'Increase Watering for Dry Spell',
        description: 'Little to no rain expected and low humidity. Increase watering frequency, apply mulch to retain moisture, and consider deep watering techniques.',
        urgency: 'medium',
        weatherReason: `Low rain forecast (${totalRainExpected}%) and humidity (${weather.humidity}%)`
      });
    }

    // Optimal conditions recommendations
    if (weather.temperature >= 20 && weather.temperature <= 30 && 
        weather.humidity >= 40 && weather.humidity <= 70 && 
        weather.windSpeed < 5) {
      recommendations.push({
        id: 'optimal_conditions',
        type: 'planting',
        title: 'Ideal Conditions for Farm Work',
        description: 'Weather conditions are optimal for most farming activities including planting, spraying, and harvesting. Take advantage of these favorable conditions.',
        urgency: 'low',
        weatherReason: `Ideal temp (${weather.temperature}°C), humidity (${weather.humidity}%), and calm winds`
      });
    }

    return recommendations;
  }

  private mapAlertType(event: string): 'warning' | 'watch' | 'advisory' {
    const lowercaseEvent = event.toLowerCase();
    if (lowercaseEvent.includes('warning')) return 'warning';
    if (lowercaseEvent.includes('watch')) return 'watch';
    return 'advisory';
  }

  private mapSeverity(tags: string[] = []): 'minor' | 'moderate' | 'severe' | 'extreme' {
    if (tags.includes('Extreme')) return 'extreme';
    if (tags.includes('Severe')) return 'severe';
    if (tags.includes('Moderate')) return 'moderate';
    return 'minor';
  }

  private getFallbackWeatherData(): WeatherData {
    return {
      location: 'Unknown Location',
      temperature: 25,
      humidity: 65,
      windSpeed: 2.5,
      description: 'partly cloudy',
      icon: '02d',
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      feelsLike: 27
    };
  }

  private getFallbackAlerts(): WeatherAlert[] {
    return [
      {
        id: 'demo_alert_1',
        type: 'advisory',
        severity: 'moderate',
        title: 'High Temperature Advisory',
        description: 'Temperatures expected to exceed 35°C. Farmers advised to increase irrigation frequency.',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        areas: ['Your District']
      }
    ];
  }

  private getFallbackForecast(): DailyForecast[] {
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      return {
        date: date.toISOString().split('T')[0],
        high: 28 + Math.floor(Math.random() * 8),
        low: 18 + Math.floor(Math.random() * 5),
        description: ['partly cloudy', 'sunny', 'light rain', 'cloudy'][Math.floor(Math.random() * 4)],
        icon: ['02d', '01d', '10d', '03d'][Math.floor(Math.random() * 4)],
        humidity: 60 + Math.floor(Math.random() * 20),
        windSpeed: 2 + Math.random() * 3,
        precipitation: Math.floor(Math.random() * 30)
      };
    });
  }

  // Helper method to get coordinates from location name
  async getCoordinatesFromLocation(location: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: data[0].lat,
          lon: data[0].lon
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }
}

export const weatherService = new WeatherService();
export type { WeatherData, WeatherAlert, DailyForecast, FarmingRecommendation };