import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Satellite, 
  Cloud, 
  Thermometer, 
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const InteractiveMap = () => {
  const [selectedRegion, setSelectedRegion] = useState('bangalore');
  const [weatherData, setWeatherData] = useState({
    temp: 28,
    humidity: 65,
    rainfall: 12,
    windSpeed: 8
  });

  const regions = [
    {
      id: 'bangalore',
      name: 'Bangalore Rural',
      farmers: 12847,
      avgYield: '+23%',
      alerts: 2,
      position: { top: '60%', left: '55%' },
      crops: ['Tomato', 'Onion', 'Potato'],
      status: 'healthy',
      ndvi: 0.72
    },
    {
      id: 'mysore',
      name: 'Mysore',
      farmers: 8945,
      avgYield: '+31%',
      alerts: 0,
      position: { top: '75%', left: '35%' },
      crops: ['Sugarcane', 'Rice', 'Ragi'],
      status: 'excellent',
      ndvi: 0.81
    },
    {
      id: 'mandya',
      name: 'Mandya',
      farmers: 15623,
      avgYield: '+28%',
      alerts: 1,
      position: { top: '70%', left: '45%' },
      crops: ['Rice', 'Sugarcane', 'Maize'],
      status: 'healthy',
      ndvi: 0.75
    },
    {
      id: 'hassan',
      name: 'Hassan',
      farmers: 9834,
      avgYield: '+19%',
      alerts: 3,
      position: { top: '65%', left: '25%' },
      crops: ['Coffee', 'Arecanut', 'Cardamom'],
      status: 'warning',
      ndvi: 0.68
    },
    {
      id: 'tumkur',
      name: 'Tumkur',
      farmers: 11567,
      avgYield: '+25%',
      alerts: 1,
      position: { top: '55%', left: '40%' },
      crops: ['Groundnut', 'Sunflower', 'Ragi'],
      status: 'healthy',
      ndvi: 0.74
    }
  ];

  // Simulate weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherData(prev => ({
        temp: Math.round((prev.temp + (Math.random() - 0.5) * 2) * 10) / 10,
        humidity: Math.round((prev.humidity + (Math.random() - 0.5) * 5) * 10) / 10,
        rainfall: Math.round((prev.rainfall + (Math.random() - 0.5) * 1) * 10) / 10,
        windSpeed: Math.round((prev.windSpeed + (Math.random() - 0.5) * 2) * 10) / 10
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const selectedRegionData = regions.find(r => r.id === selectedRegion) || regions[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-crop-green bg-crop-green/10 border-crop-green/20';
      case 'healthy': return 'text-primary bg-primary/10 border-primary/20';
      case 'warning': return 'text-harvest-gold bg-harvest-gold/10 border-harvest-gold/20';
      case 'alert': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'healthy': 
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'alert': 
        return <AlertTriangle className="w-4 h-4" />;
      default: 
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-sky-blue/10 to-water-blue/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real-time <span className="text-sky-blue">Regional</span> Insights
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore how HarvAI is supporting farmers across Karnataka with live data and analytics
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm shadow-soft h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-blue" />
                  Karnataka Agricultural Regions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative h-96 bg-gradient-to-br from-crop-green/20 to-primary/20 rounded-lg overflow-hidden">
                  {/* Simplified Karnataka Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-growth-light to-primary/10">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
                      <path 
                        d="M20 30 Q30 20 50 25 Q70 30 80 40 Q85 60 80 80 Q60 85 40 80 Q20 75 15 50 Z" 
                        fill="currentColor" 
                        className="text-primary"
                      />
                    </svg>
                  </div>

                  {/* Region Markers */}
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        selectedRegion === region.id ? 'scale-125 z-10' : 'hover:scale-110'
                      }`}
                      style={{ 
                        top: region.position.top, 
                        left: region.position.left 
                      }}
                      onClick={() => setSelectedRegion(region.id)}
                    >
                      <div className={`relative`}>
                        <div className={`w-8 h-8 rounded-full border-2 ${getStatusColor(region.status)} flex items-center justify-center shadow-lg`}>
                          {getStatusIcon(region.status)}
                        </div>
                        
                        {/* Pulse animation for selected region */}
                        {selectedRegion === region.id && (
                          <div className="absolute inset-0 w-8 h-8 rounded-full bg-primary/20 animate-ping"></div>
                        )}
                        
                        {/* Region label */}
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-md text-xs font-medium whitespace-nowrap">
                          {region.name}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 shadow-md">
                    <div className="text-xs font-semibold mb-2">Crop Health Status</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-crop-green"></div>
                        <span>Excellent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>Healthy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-harvest-gold"></div>
                        <span>Warning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Region Details & Weather */}
          <div className="space-y-6">
            {/* Selected Region Info */}
            <Card className="bg-gradient-to-br from-white to-muted/20 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-sky-blue" />
                  {selectedRegionData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-lg font-bold text-primary">{selectedRegionData.farmers.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Active Farmers</div>
                  </div>
                  <div className="text-center p-3 bg-crop-green/10 rounded-lg">
                    <div className="text-lg font-bold text-crop-green">{selectedRegionData.avgYield}</div>
                    <div className="text-xs text-muted-foreground">Avg Yield Increase</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NDVI Score</span>
                    <Badge variant="secondary" className="bg-sky-blue/10 text-sky-blue">
                      {selectedRegionData.ndvi}
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-sky-blue to-primary h-2 rounded-full"
                      style={{ width: `${selectedRegionData.ndvi * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Primary Crops</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRegionData.crops.map((crop, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedRegionData.alerts > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-harvest-gold/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-harvest-gold" />
                    <span className="text-sm text-harvest-gold font-medium">
                      {selectedRegionData.alerts} Active Alert{selectedRegionData.alerts > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weather Card */}
            <Card className="bg-gradient-to-br from-sky-blue/10 to-water-blue/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-sky-blue" />
                  Live Weather Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <div>
                      <div className="text-lg font-bold">{weatherData.temp}°C</div>
                      <div className="text-xs text-muted-foreground">Temperature</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-blue" />
                    <div>
                      <div className="text-lg font-bold">{weatherData.humidity}%</div>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-lg font-bold">{weatherData.rainfall}mm</div>
                      <div className="text-xs text-muted-foreground">Rainfall</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-500" />
                    <div>
                      <div className="text-lg font-bold">{weatherData.windSpeed} km/h</div>
                      <div className="text-xs text-muted-foreground">Wind Speed</div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Badge variant="secondary" className="bg-crop-green/10 text-crop-green">
                    <Sun className="w-3 h-3 mr-1" />
                    Optimal Growing Conditions
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-gradient-to-r from-sky-blue to-water-blue text-white">
            <a href="/auth">
              <TrendingUp className="w-5 h-5 mr-2" />
              Get Regional Insights for Your Farm
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;