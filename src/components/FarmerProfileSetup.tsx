import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Phone, Globe, Sprout } from 'lucide-react';

interface FarmerProfileSetupProps {
  onProfileCreated: () => void;
}

const FarmerProfileSetup = ({ onProfileCreated }: FarmerProfileSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    state: '',
    district: '',
    village: '',
    farm_size_acres: '',
    primary_crops: '',
    preferred_language: 'english'
  });

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिन्दी (Hindi)' },
    { value: 'kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'tamil', label: 'தமிழ் (Tamil)' },
    { value: 'telugu', label: 'తెలుగు (Telugu)' },
    { value: 'marathi', label: 'मराठी (Marathi)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        ...formData,
        user_id: user.id,
        farm_size_acres: formData.farm_size_acres ? parseFloat(formData.farm_size_acres) : null,
        primary_crops: formData.primary_crops.split(',').map(crop => crop.trim()).filter(Boolean),
        preferred_language: formData.preferred_language as any
      };

      const { error } = await supabase
        .from('farmers')
        .insert(profileData);

      if (error) throw error;

      toast({
        title: "Profile Created!",
        description: "Welcome to HarvAI! Your profile has been set up successfully.",
      });

      onProfileCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-lg">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Complete Your Farmer Profile</CardTitle>
          <CardDescription className="text-emerald-100 text-lg">
            Join HarvAI and get personalized farming assistance powered by AI
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-2">
                <User className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="+91 9876543210"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-semibold text-gray-900">Location Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="e.g., Karnataka"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium text-gray-700">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    placeholder="e.g., Bangalore"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village" className="text-sm font-medium text-gray-700">Village</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData({...formData, village: e.target.value})}
                    placeholder="Village name"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Farm Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-semibold text-gray-900">Farm Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farm_size" className="text-sm font-medium text-gray-700">Farm Size (acres)</Label>
                  <Input
                    id="farm_size"
                    type="number"
                    step="0.1"
                    value={formData.farm_size_acres}
                    onChange={(e) => setFormData({...formData, farm_size_acres: e.target.value})}
                    placeholder="e.g., 5.5"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Preferred Language
                  </Label>
                  <Select 
                    value={formData.preferred_language} 
                    onValueChange={(value) => setFormData({...formData, preferred_language: value})}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors">
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="crops" className="text-sm font-medium text-gray-700">Primary Crops</Label>
                <Input
                  id="crops"
                  value={formData.primary_crops}
                  onChange={(e) => setFormData({...formData, primary_crops: e.target.value})}
                  placeholder="e.g., Rice, Wheat, Sugarcane (comma-separated)"
                  className="h-12 border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                />
                <p className="text-xs text-gray-500">Separate multiple crops with commas</p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Profile...
                </div>
              ) : (
                'Create My Profile & Start Farming Smarter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerProfileSetup;