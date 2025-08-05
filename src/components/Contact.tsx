import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { Mic, Users, Handshake, Phone, Mail, MapPin } from "lucide-react";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('contact.joinTitle')} <span className="text-primary">{t('contact.revolution')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Farmer Signup */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-primary" />
                Join the Farmer Waitlist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmer-name">Full Name</Label>
                  <Input 
                    id="farmer-name"
                    placeholder="Enter your name"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    placeholder="+91 98765 43210"
                    className="h-12"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Village/Location</Label>
                  <Input 
                    id="location"
                    placeholder="Enter your village"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm-size">Farm Size (Acres)</Label>
                  <Input 
                    id="farm-size"
                    placeholder="e.g., 5 acres"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="crops">Primary Crops</Label>
                <Input 
                  id="crops"
                  placeholder="e.g., Rice, Sugarcane, Cotton"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenges">Current Farming Challenges</Label>
                <Textarea 
                  id="challenges"
                  placeholder="Tell us about your main farming challenges..."
                  className="min-h-[100px]"
                />
              </div>

              <Button variant="farmer" size="lg" className="w-full h-14 text-lg">
                <Mic className="h-5 w-5 mr-2" />
                Join HarvAI Waitlist
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Get early access and priority support when we launch in your area.
              </p>
            </CardContent>
          </Card>

          {/* Contact Info & Partner Signup */}
          <div className="space-y-6">
            {/* Partner Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-primary" />
                  Partner with Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Agricultural organizations, NGOs, and government agencies - 
                  let's work together to empower farmers.
                </p>
                <Button variant="outline" size="lg" className="w-full">
                  Partnership Inquiry
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>info@harvai.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+91 80123 45678</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Bangalore, Karnataka, India</span>
                </div>
              </CardContent>
            </Card>

            {/* Voice Demo */}
            <Card className="bg-gradient-to-br from-primary/5 to-crop-green/5">
              <CardContent className="p-6 text-center">
                <Mic className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="font-semibold mb-2">Try Voice Demo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Experience HarvAI's voice capabilities in Kannada
                </p>
                <Button variant="voice" size="sm" className="w-full">
                  Demo Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-muted/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Farming?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of farmers already using AI to improve their yields and profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="farmer" size="lg">
                Join as Farmer
              </Button>
              <Button variant="outline" size="lg">
                Partner with Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;