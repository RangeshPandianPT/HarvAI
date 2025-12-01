import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

interface MarketDataPoint {
  date: string;
  price: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

interface MarketAnalysis {
  crop_name: string;
  historical_prices: MarketDataPoint[];
  predictions: MarketDataPoint[];
  analysis: string;
  recommendations: string[];
  price_trend: 'rising' | 'falling' | 'stable';
  current_price: number;
  week_change: number;
}

export const MarketChart: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [marketData, setMarketData] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [farmer, setFarmer] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const crops = [
    'rice', 'wheat', 'cotton', 'sugarcane', 'maize', 'bajra', 'jowar',
    'groundnut', 'soybean', 'mustard', 'sesame', 'turmeric', 'chili',
    'onion', 'potato', 'tomato', 'cabbage', 'cauliflower'
  ];

  useEffect(() => {
    if (user) {
      fetchFarmerProfile();
    }
  }, [user]);

  const fetchFarmerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setFarmer(data);
    } catch (error: any) {
      console.error('Error fetching farmer profile:', error);
    }
  };

  const fetchMarketAnalysis = async () => {
    if (!selectedCrop || !farmer) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-prices', {
        body: {
          crop_name: selectedCrop,
          district: farmer.district,
          state: farmer.state,
          days_back: 30
        }
      });

      if (error) throw error;

      setMarketData(data);
      toast({
        title: "Market Analysis Updated",
        description: `Fetched latest data for ${selectedCrop}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch market data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const combinedChartData = marketData ? [
    ...marketData.historical_prices.map(point => ({
      ...point,
      type: 'historical' as const,
      displayDate: new Date(point.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    })),
    ...marketData.predictions.map(point => ({
      ...point,
      type: 'prediction' as const,
      displayDate: new Date(point.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }))
  ] : [];

  const formatPrice = (value: number) => `₹${value.toFixed(0)}`;

  const getTrendIcon = () => {
    if (!marketData) return <Minus className="h-4 w-4" />;
    
    switch (marketData.price_trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendColor = () => {
    if (!marketData) return 'text-muted-foreground';
    
    switch (marketData.price_trend) {
      case 'rising':
        return 'text-green-600';
      case 'falling':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('priceChart')}
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm ${getTrendColor()}`}>
                {marketData?.price_trend?.toUpperCase() || 'SELECT CROP'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Crop</label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a crop to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={fetchMarketAnalysis}
              disabled={loading || !selectedCrop}
              className="px-8"
            >
              {loading ? 'Analyzing...' : 'Analyze Market'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Stats */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">{formatPrice(marketData.current_price)}</p>
                <p className="text-xs text-muted-foreground">per quintal</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Weekly Change</p>
                <p className={`text-2xl font-bold ${marketData.week_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketData.week_change >= 0 ? '+' : ''}{marketData.week_change.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">vs last week</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Trend</p>
                <div className="flex items-center justify-center gap-2">
                  {getTrendIcon()}
                  <p className={`text-lg font-bold ${getTrendColor()}`}>
                    {marketData.price_trend.charAt(0).toUpperCase() + marketData.price_trend.slice(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Chart */}
      {marketData && combinedChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price Movement - {selectedCrop.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedChartData}>
                  <defs>
                    <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="displayDate" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={formatPrice}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [formatPrice(value), name === 'price' ? 'Price' : name]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    strokeWidth={2}
                    fill="url(#historicalGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                <span className="text-sm">Historical Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-sm opacity-70"></div>
                <span className="text-sm">Price Predictions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis & Recommendations */}
      {marketData && (
        <Card>
          <CardHeader>
            <CardTitle>Market Analysis & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Market Analysis:</h4>
              <p className="text-sm text-muted-foreground">{marketData.analysis}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {marketData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};