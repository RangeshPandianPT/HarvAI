import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2, 
  Satellite,
  TestTube,
  TrendingUp,
  MessageSquare,
  Smartphone
} from 'lucide-react';

const LiveDemo = () => {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const [progress, setProgress] = useState(0);

  const demoScenarios = [
    {
      id: 'voice',
      title: 'Voice Assistant Demo',
      icon: Mic,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      userQuery: 'ನನ್ನ ಬೆಳೆಯ ಆರೋಗ್ಯ ಹೇಗಿದೆ?',
      userQueryEn: '"How is my crop health?"',
      aiResponse: 'Your NDVI reading shows healthy vegetation. Consider watering in 2 days.',
      features: ['Voice Recognition', 'Kannada Support', 'Real-time Analysis']
    },
    {
      id: 'satellite',
      title: 'Satellite Analysis',
      icon: Satellite,
      color: 'text-sky-blue',
      bgColor: 'bg-sky-blue/10',
      userQuery: 'ಉಪಗ್ರಹ ಡೇಟಾ ತೋರಿಸಿ',
      userQueryEn: '"Show satellite data"',
      aiResponse: 'NDVI: 0.75 - Healthy crops detected. Recommend irrigation in north field.',
      features: ['NDVI Monitoring', 'Crop Health', 'Field Mapping']
    },
    {
      id: 'soil',
      title: 'Soil Analysis',
      icon: TestTube,
      color: 'text-earth-brown',
      bgColor: 'bg-earth-brown/10',
      userQuery: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮಾಡಿ',
      userQueryEn: '"Test my soil"',
      aiResponse: 'pH: 6.8, N: Medium, P: Low. Add phosphorus fertilizer before next season.',
      features: ['pH Testing', 'Nutrient Analysis', 'Fertilizer Advice']
    },
    {
      id: 'market',
      title: 'Market Insights',
      icon: TrendingUp,
      color: 'text-harvest-gold',
      bgColor: 'bg-harvest-gold/10',
      userQuery: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಹೇಳಿ',
      userQueryEn: '"Tell market prices"',
      aiResponse: 'Tomato: ₹45/kg (+15%). Best time to sell in next 3 days.',
      features: ['Price Tracking', 'Market Trends', 'Sell Timing']
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            setIsListening(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const startDemo = () => {
    setIsPlaying(true);
    setIsListening(true);
    setProgress(0);
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setIsListening(false);
    setProgress(0);
  };

  const currentScenario = demoScenarios[currentDemo];

  return (
    <section className="py-20 bg-gradient-to-br from-growth-light to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience <span className="text-primary">HarvAI</span> Live
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Try our interactive demo to see how farmers get instant help in their local language
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Demo Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {demoScenarios.map((scenario, index) => (
              <Button
                key={scenario.id}
                variant={currentDemo === index ? "default" : "outline"}
                className={`h-16 flex-col gap-2 ${currentDemo === index ? 'bg-gradient-to-br from-primary to-crop-green' : ''}`}
                onClick={() => {
                  setCurrentDemo(index);
                  stopDemo();
                }}
              >
                <scenario.icon className="w-5 h-5" />
                <span className="text-xs">{scenario.title}</span>
              </Button>
            ))}
          </div>

          {/* Main Demo Interface */}
          <Card className="bg-gradient-to-br from-white to-muted/20 shadow-2xl border-0">
            <CardHeader className={`${currentScenario.bgColor} rounded-t-lg`}>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className={`p-3 bg-white/20 rounded-full`}>
                  <currentScenario.icon className={`w-6 h-6 ${currentScenario.color}`} />
                </div>
                {currentScenario.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Voice Interface */}
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full ${currentScenario.bgColor} flex items-center justify-center mb-6 ${isListening ? 'animate-pulse' : ''}`}>
                    {isListening ? (
                      <Mic className={`w-12 h-12 ${currentScenario.color} animate-bounce`} />
                    ) : (
                      <MicOff className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    <Button
                      onClick={startDemo}
                      disabled={isPlaying}
                      className="bg-gradient-to-r from-primary to-crop-green"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Demo
                    </Button>
                    <Button
                      onClick={stopDemo}
                      disabled={!isPlaying}
                      variant="outline"
                      size="lg"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  {isPlaying && (
                    <div className="w-full bg-muted rounded-full h-2 mb-6">
                      <div 
                        className="bg-gradient-to-r from-primary to-crop-green h-2 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Conversation Flow */}
                <div className="space-y-6">
                  {/* User Query */}
                  <div className="flex justify-end">
                    <div className="max-w-md bg-gradient-to-r from-primary to-crop-green text-white p-4 rounded-2xl rounded-tr-sm">
                      <div className="text-lg font-medium mb-1">{currentScenario.userQuery}</div>
                      <div className="text-sm opacity-90">{currentScenario.userQueryEn}</div>
                    </div>
                  </div>

                  {/* AI Response */}
                  {progress > 50 && (
                    <div className="flex justify-start animate-slide-up">
                      <div className="max-w-md bg-white border shadow-md p-4 rounded-2xl rounded-tl-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-crop-green rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-crop-green">HarvAI Assistant</span>
                        </div>
                        <div className="text-foreground">{currentScenario.aiResponse}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 text-center">Key Features Demonstrated:</h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentScenario.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className={`${currentScenario.bgColor} ${currentScenario.color}`}>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              Ready to experience the full power of HarvAI?
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-harvest-gold to-sunshine-yellow text-earth-brown hover:from-harvest-gold/90 hover:to-sunshine-yellow/90">
              <a href="/auth">
                <Smartphone className="w-5 h-5 mr-2" />
                Start Your Free Trial
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;