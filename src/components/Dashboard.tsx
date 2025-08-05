import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import VoiceAssistant from './VoiceAssistant';
import FarmerProfileSetup from './FarmerProfileSetup';
import ProfilePage from './ProfilePage';
import { ChatBot } from './ChatBot';
import { MarketChart } from './MarketChart';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/i18n/translations';
import { 
  Satellite, 
  TestTube, 
  CloudRain, 
  Bug, 
  TrendingUp, 
  BookOpen, 
  MessageSquare,
  Upload,
  MapPin,
  Calendar,
  DollarSign,
  User,
  LogOut,
  Bot
} from 'lucide-react';

interface Farmer {
  id: string;
  name: string;
  phone_number: string;
  state?: string;
  district?: string;
  village?: string;
  farm_size_acres?: number;
  primary_crops?: string[];
  preferred_language: string;
  gps_latitude?: number;
  gps_longitude?: number;
  sms_enabled?: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('voice');

  // Soil Analysis States
  const [soilImage, setSoilImage] = useState<File | null>(null);
  const [soilAnalysisLoading, setSoilAnalysisLoading] = useState(false);

  // Satellite Data States
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [satelliteLoading, setSatelliteLoading] = useState(false);

  // Weather States
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);

  // Market Data States
  const [marketData, setMarketData] = useState<any[]>([]);

  // Journal States
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    crop_name: '',
    activity_type: '',
    activity_date: '',
    notes: '',
    cost: '',
    quantity: ''
  });

  // Analysis Results States
  const [soilResults, setSoilResults] = useState<any[]>([]);
  const [satelliteResults, setSatelliteResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchFarmerProfile();
      fetchWeatherAlerts();
      fetchMarketData();
      fetchJournalEntries();
    }
  }, [user]);

  useEffect(() => {
    if (farmer?.id) {
      fetchSoilAnalysisResults();
      fetchSatelliteResults();
    }
  }, [farmer]);

  useEffect(() => {
    if (farmer?.preferred_language) {
      setLanguage(farmer.preferred_language as Language);
    }
  }, [farmer, setLanguage]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      if (!farmer?.state || !farmer?.district) return;

      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('state', farmer.state)
        .eq('district', farmer.district)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWeatherAlerts(data || []);
    } catch (error: any) {
      console.error('Error fetching weather alerts:', error);
    }
  };

  const fetchMarketData = async () => {
    try {
      if (!farmer?.state || !farmer?.district) return;

      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('state', farmer.state)
        .eq('district', farmer.district)
        .order('price_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMarketData(data || []);
    } catch (error: any) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      if (!farmer?.id) return;

      const { data, error } = await supabase
        .from('crop_journal')
        .select('*')
        .eq('farmer_id', farmer.id)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const handleSoilAnalysis = async () => {
    if (!soilImage || !farmer?.id) return;

    setSoilAnalysisLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('soil-analysis', {
          body: {
            farmer_id: farmer.id,
            image_base64: base64
          }
        });

        if (error) throw error;

        toast({
          title: "Soil Analysis Complete",
          description: "AI has analyzed your soil. Check results below.",
        });

        setSoilImage(null);
        // Refresh soil analysis data
        fetchSoilAnalysisResults();
      };
      reader.readAsDataURL(soilImage);
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSoilAnalysisLoading(false);
    }
  };

  const fetchSoilAnalysisResults = async () => {
    try {
      if (!farmer?.id) return;

      const { data, error } = await supabase
        .from('soil_analysis')
        .select('*')
        .eq('farmer_id', farmer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSoilResults(data || []);
    } catch (error: any) {
      console.error('Error fetching soil results:', error);
    }
  };

  const fetchSatelliteResults = async () => {
    try {
      if (!farmer?.id) return;

      const { data, error } = await supabase
        .from('satellite_data')
        .select('*')
        .eq('farmer_id', farmer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSatelliteResults(data || []);
    } catch (error: any) {
      console.error('Error fetching satellite results:', error);
    }
  };

  const handleSatelliteAnalysis = async () => {
    if (!latitude || !longitude || !farmer?.id) return;

    setSatelliteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('satellite-analysis', {
        body: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          farmer_id: farmer.id
        }
      });

      if (error) throw error;

      toast({
        title: "Satellite Analysis Complete",
        description: "NDVI data has been analyzed for your farm.",
      });

      setLatitude('');
      setLongitude('');
      // Refresh satellite data
      fetchSatelliteResults();
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSatelliteLoading(false);
    }
  };

  const addJournalEntry = async () => {
    if (!farmer?.id || !newEntry.crop_name || !newEntry.activity_type) return;

    try {
      const { error } = await supabase
        .from('crop_journal')
        .insert([{
          ...newEntry,
          farmer_id: farmer.id,
          cost: newEntry.cost ? parseFloat(newEntry.cost) : null
        }]);

      if (error) throw error;

      toast({
        title: "Entry Added",
        description: "Journal entry has been saved.",
      });

      setNewEntry({
        crop_name: '',
        activity_type: '',
        activity_date: '',
        notes: '',
        cost: '',
        quantity: ''
      });

      fetchJournalEntries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!farmer) {
    return (
      <div className="container mx-auto p-6">
        <FarmerProfileSetup onProfileCreated={fetchFarmerProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-growth-light via-background to-water-blue/20">
      <div className="container mx-auto p-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-primary to-crop-green rounded-2xl p-8 mb-8 text-white shadow-crop animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 drop-shadow-md">{t('welcome')}, {farmer.name}</h1>
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <MapPin className="w-4 h-4" />
                <p className="text-lg">
                  {farmer.village}, {farmer.district}, {farmer.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={(lang: Language) => setLanguage(lang)}>
                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">हिन्दी</SelectItem>
                  <SelectItem value="kannada">ಕನ್ನಡ</SelectItem>
                  <SelectItem value="tamil">தமிழ்</SelectItem>
                  <SelectItem value="telugu">తెలుగు</SelectItem>
                  <SelectItem value="marathi">मराठी</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary" onClick={signOut} className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <LogOut className="h-4 w-4 mr-2" />
                {t('signOut')}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <Card className="mb-8 border-orange-300 bg-gradient-to-r from-sunshine-yellow/20 to-harvest-gold/20 shadow-soft animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-sunshine-yellow/30 to-harvest-gold/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-earth-brown">
                <div className="p-2 bg-white/50 rounded-full">
                  <CloudRain className="h-6 w-6" />
                </div>
                {t('activeWeatherAlerts')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {weatherAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <Badge variant="destructive" className="shrink-0">
                        {alert.alert_type}
                      </Badge>
                      <div>
                        <h4 className="font-semibold text-earth-brown">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-7 h-16 bg-white/80 backdrop-blur-sm shadow-soft border border-border/50">
            <TabsTrigger value="voice" className="flex-col h-14 data-[state=active]:bg-gradient-to-b data-[state=active]:from-primary data-[state=active]:to-crop-green data-[state=active]:text-white">
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('voiceAI')}</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-col h-14 data-[state=active]:bg-gradient-to-b data-[state=active]:from-sky-blue data-[state=active]:to-water-blue data-[state=active]:text-white">
              <Bot className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('chat')}</span>
            </TabsTrigger>
            <TabsTrigger value="satellite" className="flex-col h-14 data-[state=active]:bg-gradient-to-b data-[state=active]:from-sky-blue data-[state=active]:to-water-blue data-[state=active]:text-white">
              <Satellite className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('satellite')}</span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex-col h-14 data-[state=active]:bg-gradient-to-b data-[state=active]:from-earth-brown data-[state=active]:to-soil-light data-[state=active]:text-white">
              <TestTube className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('soil')}</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex-col h-14 data-[state=active]:bg-gradient-to-b data-[state=active]:from-harvest-gold data-[state=active]:to-sunshine-yellow data-[state=active]:text-earth-brown">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('market')}</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex-col h-14 data-[state=active]:bg-gradient-to-b data-[state=active]:from-primary data-[state=active]:to-crop-green data-[state=active]:text-white">
              <BookOpen className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('journal')}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-col h-14 data-[state=active]:bg-gradient-to-b data-[state=active]:from-secondary data-[state=active]:to-muted data-[state=active]:text-foreground">
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{t('profile')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="mt-8">
            <Card className="bg-gradient-to-br from-primary/5 to-crop-green/5 border-primary/20 shadow-crop">
              <CardContent className="p-8">
                <VoiceAssistant />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-8">
            <Card className="bg-gradient-to-br from-sky-blue/10 to-water-blue/10 border-sky-blue/20 shadow-soft">
              <CardContent className="p-8">
                <ChatBot />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="satellite" className="mt-8">
            <div className="space-y-8">
              <Card className="bg-gradient-to-br from-sky-blue/10 to-water-blue/10 border-sky-blue/20 shadow-soft">
                <CardHeader className="bg-gradient-to-r from-sky-blue/20 to-water-blue/20 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-sky-blue/20 rounded-full">
                      <Satellite className="w-6 h-6 text-sky-blue" />
                    </div>
                    {t('satelliteAnalysis')}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t('analyzeNDVI')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold flex items-center gap-2 text-sky-blue">
                        <MapPin className="w-4 h-4" />
                        {t('latitude')}
                      </label>
                      <Input
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g., 12.9716"
                        type="number"
                        step="any"
                        className="h-12 bg-white/50 border-sky-blue/30 focus:border-sky-blue"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold flex items-center gap-2 text-sky-blue">
                        <MapPin className="w-4 h-4" />
                        {t('longitude')}
                      </label>
                      <Input
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g., 77.5946"
                        type="number"
                        step="any"
                        className="h-12 bg-white/50 border-sky-blue/30 focus:border-sky-blue"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSatelliteAnalysis}
                    disabled={satelliteLoading || !latitude || !longitude}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-sky-blue to-water-blue hover:from-sky-blue/90 hover:to-water-blue/90 text-white shadow-lg"
                  >
                    <Satellite className="w-5 h-5 mr-3" />
                    {satelliteLoading ? t('analyzing') : t('analyzeFarm')}
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Satellite Results */}
              {satelliteResults.length > 0 && (
                <Card className="bg-gradient-to-br from-sky-blue/5 to-water-blue/5 border-sky-blue/20">
                  <CardHeader className="bg-gradient-to-r from-sky-blue/10 to-water-blue/10 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-sky-blue/20 rounded-full">
                        <Satellite className="w-5 h-5 text-sky-blue" />
                      </div>
                      Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {satelliteResults.map((result) => (
                        <div key={result.id} className="bg-white/80 rounded-xl p-6 shadow-soft space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                {new Date(result.created_at).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-3">
                                <div className="text-center p-3 bg-sky-blue/10 rounded-lg">
                                  <p className="text-xs text-sky-blue font-medium">NDVI</p>
                                  <p className="text-xl font-bold text-sky-blue">{result.ndvi_value?.toFixed(3)}</p>
                                </div>
                                <Badge 
                                  variant={result.health_status === 'Healthy' ? 'default' : 'destructive'}
                                  className="text-sm px-3 py-1"
                                >
                                  {result.health_status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {result.recommendations && (
                            <div className="bg-sky-blue/5 rounded-lg p-4">
                              <h4 className="font-semibold text-sky-blue mb-2">AI Recommendations:</h4>
                              <p className="text-sm text-muted-foreground">{result.recommendations}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="soil" className="mt-8">
            <div className="space-y-8">
              <Card className="bg-gradient-to-br from-earth-brown/10 to-soil-light/10 border-earth-brown/20 shadow-soft">
                <CardHeader className="bg-gradient-to-r from-earth-brown/20 to-soil-light/20 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-earth-brown/20 rounded-full">
                      <TestTube className="w-6 h-6 text-earth-brown" />
                    </div>
                    {t('soilAnalysis')}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t('uploadSoil')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-semibold flex items-center gap-2 text-earth-brown">
                      <Upload className="w-4 h-4" />
                      {t('soilPhoto')}
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSoilImage(e.target.files?.[0] || null)}
                      className="h-12 bg-white/50 border-earth-brown/30 focus:border-earth-brown"
                    />
                    {soilImage && (
                      <div className="flex items-center gap-2 text-sm text-crop-green">
                        <div className="w-2 h-2 bg-crop-green rounded-full"></div>
                        {soilImage.name} selected
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleSoilAnalysis}
                    disabled={soilAnalysisLoading || !soilImage}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-earth-brown to-soil-light hover:from-earth-brown/90 hover:to-soil-light/90 text-white shadow-lg"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    {soilAnalysisLoading ? t('analyzing') : t('analyzeSoil')}
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Soil Analysis Results */}
              {soilResults.length > 0 && (
                <Card className="bg-gradient-to-br from-earth-brown/5 to-soil-light/5 border-earth-brown/20">
                  <CardHeader className="bg-gradient-to-r from-earth-brown/10 to-soil-light/10 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-earth-brown/20 rounded-full">
                        <TestTube className="w-5 h-5 text-earth-brown" />
                      </div>
                      Soil Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {soilResults.map((result) => (
                        <div key={result.id} className="bg-white/80 rounded-xl p-6 shadow-soft space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {new Date(result.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Enhanced Soil Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {result.ph_level && (
                              <div className="text-center p-4 bg-gradient-to-br from-sky-blue/10 to-water-blue/10 rounded-lg border border-sky-blue/20">
                                <p className="text-xs text-sky-blue font-medium mb-1">pH Level</p>
                                <p className="text-xl font-bold text-sky-blue">{result.ph_level}</p>
                              </div>
                            )}
                            {result.nitrogen_level && (
                              <div className="text-center p-4 bg-gradient-to-br from-crop-green/10 to-primary/10 rounded-lg border border-crop-green/20">
                                <p className="text-xs text-crop-green font-medium mb-1">Nitrogen</p>
                                <p className="text-xl font-bold text-crop-green">{result.nitrogen_level}</p>
                              </div>
                            )}
                            {result.phosphorus_level && (
                              <div className="text-center p-4 bg-gradient-to-br from-earth-brown/10 to-soil-light/10 rounded-lg border border-earth-brown/20">
                                <p className="text-xs text-earth-brown font-medium mb-1">Phosphorus</p>
                                <p className="text-xl font-bold text-earth-brown">{result.phosphorus_level}</p>
                              </div>
                            )}
                            {result.potassium_level && (
                              <div className="text-center p-4 bg-gradient-to-br from-harvest-gold/10 to-sunshine-yellow/10 rounded-lg border border-harvest-gold/20">
                                <p className="text-xs text-harvest-gold font-medium mb-1">Potassium</p>
                                <p className="text-xl font-bold text-harvest-gold">{result.potassium_level}</p>
                              </div>
                            )}
                          </div>

                          {result.recommendations && (
                            <div className="bg-earth-brown/5 rounded-lg p-4">
                              <h4 className="font-semibold text-earth-brown mb-2">AI Recommendations:</h4>
                              <p className="text-sm text-muted-foreground">{result.recommendations}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>

          <TabsContent value="market" className="mt-8">
            <Card className="bg-gradient-to-br from-harvest-gold/10 to-sunshine-yellow/10 border-harvest-gold/20 shadow-soft">
              <CardContent className="p-8">
                <MarketChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="mt-8">
            <div className="space-y-8">
              <Card className="bg-gradient-to-br from-primary/10 to-crop-green/10 border-primary/20 shadow-soft">
                <CardHeader className="bg-gradient-to-r from-primary/20 to-crop-green/20 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    {t('addJournalEntry')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      placeholder={t('cropName')}
                      value={newEntry.crop_name}
                      onChange={(e) => setNewEntry({...newEntry, crop_name: e.target.value})}
                      className="h-12 bg-white/50 border-primary/30 focus:border-primary"
                    />
                    <Input
                      placeholder={t('activityType')}
                      value={newEntry.activity_type}
                      onChange={(e) => setNewEntry({...newEntry, activity_type: e.target.value})}
                      className="h-12 bg-white/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  <Input
                    type="date"
                    value={newEntry.activity_date}
                    onChange={(e) => setNewEntry({...newEntry, activity_date: e.target.value})}
                    className="h-12 bg-white/50 border-primary/30 focus:border-primary"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      placeholder={t('cost')}
                      type="number"
                      value={newEntry.cost}
                      onChange={(e) => setNewEntry({...newEntry, cost: e.target.value})}
                      className="h-12 bg-white/50 border-primary/30 focus:border-primary"
                    />
                    <Input
                      placeholder={t('quantity')}
                      value={newEntry.quantity}
                      onChange={(e) => setNewEntry({...newEntry, quantity: e.target.value})}
                      className="h-12 bg-white/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  <Textarea
                    placeholder={t('notes')}
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    className="bg-white/50 border-primary/30 focus:border-primary"
                    rows={4}
                  />
                  <Button 
                    onClick={addJournalEntry} 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-crop-green hover:from-primary/90 hover:to-crop-green/90 text-white shadow-lg"
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    {t('addEntry')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-crop-green/5 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-crop-green/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    Journal Entries
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {journalEntries.length > 0 ? (
                    <div className="space-y-4">
                      {journalEntries.map((entry) => (
                        <div key={entry.id} className="bg-white/80 rounded-xl p-6 shadow-soft">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-primary">{entry.crop_name}</h3>
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                  {entry.activity_type}
                                </Badge>
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
                                  {entry.notes}
                                </p>
                              )}
                              {entry.quantity && (
                                <p className="text-sm text-crop-green font-medium">
                                  Quantity: {entry.quantity}
                                </p>
                              )}
                            </div>
                            <div className="text-right space-y-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(entry.activity_date).toLocaleDateString()}</span>
                              </div>
                              {entry.cost && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-harvest-gold">
                                  <DollarSign className="w-4 h-4" />
                                  <span>₹{entry.cost}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">No journal entries yet</p>
                      <p className="text-muted-foreground/70 text-sm">Start documenting your farming activities</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <ProfilePage farmer={farmer} onUpdate={fetchFarmerProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;