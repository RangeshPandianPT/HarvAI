import { Button } from "@/components/ui/button";
import { Mic, MessageSquare, Smartphone } from "lucide-react";
import heroImage from "@/assets/hero-farming.jpg";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-sky-blue/20 to-background">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                {t("hero.title")}{" "}
                <span className="bg-gradient-to-r from-primary to-crop-green bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                {t("hero.description")}
              </p>
            </div>

            {/* Voice Features */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <Mic className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t("hero.voiceFeature")}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t("hero.smsFeature")}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t("hero.simpleFeature")}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="voice" size="lg" className="text-lg h-14 px-8" asChild>
                <a href="/auth">
                  <Mic className="h-5 w-5 mr-2" />
                  {t("hero.tryVoice")}
                </a>
              </Button>
              <Button variant="farmer" size="lg" className="text-lg h-14 px-8" asChild>
                <a href="/auth">
                  {t("hero.getStarted")}
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">26%</div>
                <div className="text-sm text-muted-foreground">{t("hero.yieldIncrease")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">{t("hero.farmersHelped")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">{t("hero.aiSupport")}</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Farmer using HarvAI app in agricultural field"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Voice Badge */}
            <div className="absolute -top-6 -right-6 bg-harvest-gold text-earth-brown p-4 rounded-full shadow-lg animate-pulse">
              <Mic className="h-8 w-8" />
            </div>
          </div> 
        </div>
      </div>
    </section>
  );
};

export default Hero;