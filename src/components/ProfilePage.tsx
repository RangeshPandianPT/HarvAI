import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Sprout, 
  Calendar,
  TrendingUp,
  BarChart3,
  Settings,
  Shield
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

interface ProfilePageProps {
  farmer: Farmer;
  onUpdate: () => void;
}

const ProfilePage = ({ farmer, onUpdate }: ProfilePageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    journalEntries: 0,
    lastActivity: ''
  });

  const [formData, setFormData] = useState({
    name: farmer.name,
    phone_number: farmer.phone_number,
    state: farmer.state || '',
    district: farmer.district || '',
    village: farmer.village || '',
    farm_size_acres: farmer.farm_size_acres?.toString() || '',
    primary_crops: farmer.primary_crops?.join(', ') || '',
    preferred_language: farmer.preferred_language,
    gps_latitude: farmer.gps_latitude?.toString() || '',
    gps_longitude: farmer.gps_longitude?.toString() || '',
    sms_enabled: farmer.sms_enabled ?? true
  });

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिन्दी (Hindi)' },
    { value: 'kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'tamil', label: 'தமிழ் (Tamil)' },
    { value: 'telugu', label: 'తెలుగు (Telugu)' },
    { value: 'marathi', label: 'मराठी (Marathi)' }
  ];

  useEffect(() => {
    fetchProfileStats();
  }, [farmer.id]);

  const fetchProfileStats = async () => {
    try {
      // Get total analyses count
      const [soilData, satelliteData, journalData] = await Promise.all([
        supabase.from('soil_analysis').select('id').eq('farmer_id', farmer.id),
        supabase.from('satellite_data').select('id').eq('farmer_id', farmer.id),
        supabase.from('crop_journal').select('id, created_at').eq('farmer_id', farmer.id).order('created_at', { ascending: false })
      ]);

      const totalAnalyses = (soilData.data?.length || 0) + (satelliteData.data?.length || 0);
      const journalEntries = journalData.data?.length || 0;
      const lastActivity = journalData.data?.[0]?.created_at || farmer.created_at;

      setStats({
        totalAnalyses,
        journalEntries,
        lastActivity: new Date(lastActivity).toLocaleDateString()
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        farm_size_acres: formData.farm_size_acres ? parseFloat(formData.farm_size_acres) : null,
        primary_crops: formData.primary_crops.split(',').map(crop => crop.trim()).filter(Boolean),
        gps_latitude: formData.gps_latitude ? parseFloat(formData.gps_latitude) : null,
        gps_longitude: formData.gps_longitude ? parseFloat(formData.gps_longitude) : null,
        preferred_language: formData.preferred_language as any
      };

      const { error } = await supabase
        .from('farmers')
        .update(updateData)
        .eq('id', farmer.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: farmer.name,
      phone_number: farmer.phone_number,
      state: farmer.state || '',
      district: farmer.district || '',
      village: farmer.village || '',
      farm_size_acres: farmer.farm_size_acres?.toString() || '',
      primary_crops: farmer.primary_crops?.join(', ') || '',
      preferred_language: farmer.preferred_language,
      gps_latitude: farmer.gps_latitude?.toString() || '',
      gps_longitude: farmer.gps_longitude?.toString() || '',
      sms_enabled: farmer.sms_enabled ?? true
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-white/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {getInitials(farmer.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{farmer.name}</h1>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Farmer
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-emerald-100">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{farmer.village}, {farmer.district}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(farmer.created_at).getFullYear()}</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.journalEntries}</p>
                <p className="text-sm text-muted-foreground">Journal Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lastActivity}</p>
                <p className="text-sm text-muted-foreground">Last Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <p className="text-sm font-medium">{farmer.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              ) : (
                <p className="text-sm font-medium">{farmer.phone_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Preferred Language
              </Label>
              {isEditing ? (
                <Select value={formData.preferred_language} onValueChange={(value) => setFormData({...formData, preferred_language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">
                  {languages.find(l => l.value === farmer.preferred_language)?.label}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="Karnataka"
                  />
                ) : (
                  <p className="text-sm font-medium">{farmer.state || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                {isEditing ? (
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    placeholder="Bangalore"
                  />
                ) : (
                  <p className="text-sm font-medium">{farmer.district || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                {isEditing ? (
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData({...formData, village: e.target.value})}
                    placeholder="Village name"
                  />
                ) : (
                  <p className="text-sm font-medium">{farmer.village || 'Not set'}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">GPS Latitude</Label>
                {isEditing ? (
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.gps_latitude}
                    onChange={(e) => setFormData({...formData, gps_latitude: e.target.value})}
                    placeholder="12.9716"
                  />
                ) : (
                  <p className="text-sm font-medium">{farmer.gps_latitude || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">GPS Longitude</Label>
                {isEditing ? (
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.gps_longitude}
                    onChange={(e) => setFormData({...formData, gps_longitude: e.target.value})}
                    placeholder="77.5946"
                  />
                ) : (
                  <p className="text-sm font-medium">{farmer.gps_longitude || 'Not set'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farm Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5" />
              Farm Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farm_size">Farm Size (acres)</Label>
              {isEditing ? (
                <Input
                  id="farm_size"
                  type="number"
                  step="0.1"
                  value={formData.farm_size_acres}
                  onChange={(e) => setFormData({...formData, farm_size_acres: e.target.value})}
                  placeholder="5.5"
                />
              ) : (
                <p className="text-sm font-medium">{farmer.farm_size_acres || 'Not set'} acres</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crops">Primary Crops</Label>
              {isEditing ? (
                <Textarea
                  id="crops"
                  value={formData.primary_crops}
                  onChange={(e) => setFormData({...formData, primary_crops: e.target.value})}
                  placeholder="Rice, Wheat, Sugarcane (comma-separated)"
                  rows={3}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {farmer.primary_crops?.length ? (
                    farmer.primary_crops.map((crop, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {crop}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No crops specified</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms" className="text-sm font-medium">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive weather alerts and market updates via SMS</p>
              </div>
              {isEditing ? (
                <Select 
                  value={formData.sms_enabled ? 'enabled' : 'disabled'} 
                  onValueChange={(value) => setFormData({...formData, sms_enabled: value === 'enabled'})}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={farmer.sms_enabled ? 'default' : 'secondary'}>
                  {farmer.sms_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save/Cancel Actions */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;