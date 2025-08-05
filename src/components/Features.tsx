import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  Satellite, 
  TestTube, 
  Mic, 
  Cloud, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  MessageSquare 
} from "lucide-react";

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Satellite,
      title: t('features.satelliteTitle'),
      description: t('features.satelliteDesc'),
      color: "text-sky-blue"
    },
    {
      icon: TestTube,
      title: t('features.soilTitle'),
      description: t('features.soilDesc'),
      color: "text-earth-brown"
    },
    {
      icon: Mic,
      title: t('features.voiceTitle'),
      description: t('features.voiceDesc'),
      color: "text-primary"
    },
    {
      icon: Cloud,
      title: t('features.weatherTitle'),
      description: t('features.weatherDesc'),
      color: "text-sky-blue"
    },
    {
      icon: AlertTriangle,
      title: t('features.alertTitle'),
      description: t('features.alertDesc'),
      color: "text-destructive"
    },
    {
      icon: TrendingUp,
      title: t('features.priceTitle'),
      description: t('features.priceDesc'),
      color: "text-harvest-gold"
    },
    {
      icon: BookOpen,
      title: t('features.journalTitle'),
      description: t('features.journalDesc'),
      color: "text-crop-green"
    },
    {
      icon: MessageSquare,
      title: t('features.smsTitle'),
      description: t('features.smsDesc'),
      color: "text-muted-foreground"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('features.title')}{" "}
            <span className="text-primary">{t('features.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('features.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-l-4 border-l-primary/20 hover:border-l-primary"
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground mb-4">
            {t('features.voiceCommand')}
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-3">
            <Mic className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-primary font-medium">{t('features.sampleVoice')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;