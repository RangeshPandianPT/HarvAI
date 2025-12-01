import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer, 
  Eye, 
  Gauge, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  MapPin,
  RefreshCw,
  Lightbulb,
  Sprout,
  Shield
} from 'lucide-react';
import { weatherService, WeatherData, WeatherAlert, DailyForecast, FarmingRecommendation } from '@/services/weatherService';
import { useTranslation } from '@/hooks/useTranslation';

interface WeatherComponentProps {
  farmerLocation?: {
    state: string;
    district: string;
    latitude?: number;
    longitude?: number;
  };
}

const WeatherComponent: React.FC<WeatherComponentProps> = ({ farmerLocation }) => {
  const { t } = useTranslation();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [recommendations, setRecommendations] = useState<FarmingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    initializeWeatherData();
  }, [farmerLocation]);

  const initializeWeatherData = async () => {
    if (!farmerLocation) return;
    
    setLoading(true);
    try {
      let coords = coordinates;
      
      // If coordinates are provided, use them; otherwise, geocode the location
      if (farmerLocation.latitude && farmerLocation.longitude) {
        coords = { lat: farmerLocation.latitude, lon: farmerLocation.longitude };
      } else {
        const locationString = `${farmerLocation.district}, ${farmerLocation.state}, India`;
        coords = await weatherService.getCoordinatesFromLocation(locationString);
      }
      
      if (coords) {
        setCoordinates(coords);
        await fetchWeatherData(coords);
      }
    } catch (error) {
      console.error('Error initializing weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (coords: { lat: number; lon: number }) => {
    try {
      const [weather, alerts, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(coords.lat, coords.lon),
        weatherService.getWeatherAlerts(coords.lat, coords.lon),
        weatherService.getWeatherForecast(coords.lat, coords.lon)
      ]);

      setCurrentWeather(weather);
      setWeatherAlerts(alerts);
      setForecast(forecastData);
      
      // Generate farming recommendations based on weather data
      const farmingRecommendations = weatherService.generateFarmingRecommendations(weather, forecastData);
      setRecommendations(farmingRecommendations);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const handleRefresh = () => {
    if (coordinates) {
      fetchWeatherData(coordinates);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '01d': <Sun className="h-8 w-8 text-yellow-500" />,
      '01n': <Sun className="h-8 w-8 text-yellow-300" />,
      '02d': <Sun className="h-8 w-8 text-yellow-500" />,
      '02n': <Sun className="h-8 w-8 text-yellow-300" />,
      '03d': <CloudRain className="h-8 w-8 text-gray-500" />,
      '03n': <CloudRain className="h-8 w-8 text-gray-400" />,
      '04d': <CloudRain className="h-8 w-8 text-gray-600" />,
      '04n': <CloudRain className="h-8 w-8 text-gray-500" />,
      '09d': <CloudRain className="h-8 w-8 text-blue-500" />,
      '09n': <CloudRain className="h-8 w-8 text-blue-400" />,
      '10d': <CloudRain className="h-8 w-8 text-blue-500" />,
      '10n': <CloudRain className="h-8 w-8 text-blue-400" />,
      '11d': <CloudRain className="h-8 w-8 text-purple-500" />,
      '11n': <CloudRain className="h-8 w-8 text-purple-400" />,
      '13d': <CloudRain className="h-8 w-8 text-white" />,
      '13n': <CloudRain className="h-8 w-8 text-gray-200" />,
      '50d': <Wind className="h-8 w-8 text-gray-500" />,
      '50n': <Wind className="h-8 w-8 text-gray-400" />
    };
    
    return iconMap[iconCode] || <Sun className="h-8 w-8 text-yellow-500" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather Card */}
      {currentWeather && (
        <Card className="bg-gradient-to-br from-sky-blue/10 to-water-blue/10 border-sky-blue/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-earth-brown">
                <MapPin className="h-5 w-5" />
                Current Weather
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentWeather.location} • Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Main Weather Display */}
              <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-center gap-4 bg-white/50 rounded-lg p-4">
                {getWeatherIcon(currentWeather.icon)}
                <div>
                  <p className="text-3xl font-bold text-earth-brown">
                    {currentWeather.temperature}°C
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {currentWeather.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Feels like {currentWeather.feelsLike}°C
                  </p>
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-white/30 rounded-lg p-3 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Humidity</p>
                    <p className="text-lg font-bold">{currentWeather.humidity}%</p>
                  </div>
                </div>
                <div className="bg-white/30 rounded-lg p-3 flex items-center gap-2">
                  <Wind className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Wind Speed</p>
                    <p className="text-lg font-bold">{currentWeather.windSpeed} m/s</p>
                  </div>
                </div>
                <div className="bg-white/30 rounded-lg p-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Pressure</p>
                    <p className="text-lg font-bold">{currentWeather.pressure} hPa</p>
                  </div>
                </div>
                <div className="bg-white/30 rounded-lg p-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Visibility</p>
                    <p className="text-lg font-bold">{currentWeather.visibility} km</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <Card className="border-orange-300 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Active Weather Alerts ({weatherAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weatherAlerts.map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm">{alert.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Valid from {new Date(alert.startTime).toLocaleString()} to{' '}
                      {new Date(alert.endTime).toLocaleString()}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs for Forecast and Recommendations */}
      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forecast" className="gap-2">
            <Calendar className="h-4 w-4" />
            5-Day Forecast
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Farming Recommendations ({recommendations.length})
          </TabsTrigger>
        </TabsList>

        {/* 5-Day Forecast */}
        <TabsContent value="forecast" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weather Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <div
                    key={day.date}
                    className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 text-center border border-sky-200"
                  >
                    <p className="font-medium text-sm text-earth-brown">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <div className="my-2 flex justify-center">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-earth-brown">{day.high}°C</p>
                      <p className="text-sm text-muted-foreground">{day.low}°C</p>
                      <p className="text-xs capitalize text-muted-foreground">{day.description}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Droplets className="h-3 w-3" />
                          {day.humidity}%
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <CloudRain className="h-3 w-3" />
                          {day.precipitation}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farming Recommendations */}
        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                Weather-Based Farming Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No urgent recommendations at this time.</p>
                  <p className="text-sm">Weather conditions are favorable for normal farming activities.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-gradient-to-r from-crop-green/10 to-primary/10 rounded-lg p-4 border border-crop-green/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getUrgencyColor(rec.urgency)} className="text-xs">
                              {rec.urgency} priority
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rec.type}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-earth-brown mb-1">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Weather reason:</span> {rec.weatherReason}
                          </p>
                          {rec.actionBy && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              Action needed: {rec.actionBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherComponent;