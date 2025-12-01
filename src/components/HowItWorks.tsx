import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Mic, Brain, MessageSquare, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      step: "01",
      icon: Mic,
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
      detail: t('howItWorks.step1Detail')
    },
    {
      step: "02", 
      icon: Brain,
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
      detail: t('howItWorks.step2Detail')
    },
    {
      step: "03",
      icon: MessageSquare,
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
      detail: t('howItWorks.step3Detail')
    },
    {
      step: "04",
      icon: TrendingUp,
      title: t('howItWorks.step4Title'),
      description: t('howItWorks.step4Desc'),
      detail: t('howItWorks.step4Detail')
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('howItWorks.title')} <span className="text-primary">HarvAI</span> {t('howItWorks.works')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-px bg-gradient-to-r from-primary to-primary/20 transform -translate-y-1/2 z-0" />
              )}
              
              <Card className="relative z-10 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                <CardContent className="p-8">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {step.detail}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-muted/50 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">⚡</div>
              <div className="text-sm text-muted-foreground">Instant Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">🎯</div>
              <div className="text-sm text-muted-foreground">Precise Advice</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">🌱</div>
              <div className="text-sm text-muted-foreground">Better Yields</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;