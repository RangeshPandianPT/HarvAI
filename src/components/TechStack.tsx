import { Card, CardContent } from "@/components/ui/card";
import { 
  Satellite, 
  Brain, 
  Database, 
  Mic, 
  Smartphone, 
  TrendingUp, 
  MessageSquare,
  Zap
} from "lucide-react";

const TechStack = () => {
  const technologies = [
    {
      icon: Satellite,
      name: "Google Earth Engine",
      description: "Satellite crop stress monitoring and NDVI analysis",
      category: "Satellite Data",
      color: "text-sky-blue"
    },
    {
      icon: Brain,
      name: "Gemini AI (Vertex AI)",
      description: "Advanced AI for voice, image, and text processing",
      category: "AI Processing",
      color: "text-primary"
    },
    {
      icon: Database,
      name: "Firebase + Firestore",
      description: "Real-time backend & offline data storage",
      category: "Backend",
      color: "text-harvest-gold"
    },
    {
      icon: Mic,
      name: "TTS/STT APIs",
      description: "Voice interaction in Kannada language",
      category: "Voice Tech",
      color: "text-crop-green"
    },
    {
      icon: Smartphone,
      name: "Flutter",
      description: "Lightweight, farmer-friendly mobile app",
      category: "Frontend",
      color: "text-sky-blue"
    },
    {
      icon: TrendingUp,
      name: "Agmarknet API",
      description: "Real-time market price data integration",
      category: "Market Data",
      color: "text-earth-brown"
    },
    {
      icon: MessageSquare,
      name: "Twilio/SMS API",
      description: "Offline alerts and farming advice via SMS",
      category: "Communication",
      color: "text-muted-foreground"
    },
    {
      icon: Zap,
      name: "Edge Computing",
      description: "Fast processing for real-time farming decisions",
      category: "Performance",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by <span className="text-primary">Cutting-Edge Technology</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            HarvAI combines the best of AI, satellite technology, and mobile development 
            to bring smart farming to every field.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            >
              <CardContent className="p-6">
                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {tech.category}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <tech.icon className={`h-6 w-6 ${tech.color}`} />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {tech.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tech.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Architecture Highlight */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-crop-green/5 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              Built for Scale & Reliability
            </h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-harvest-gold rounded-full"></div>
                <span className="text-muted-foreground">Sub-second Response</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-crop-green rounded-full"></div>
                <span className="text-muted-foreground">Offline Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-blue rounded-full"></div>
                <span className="text-muted-foreground">Multi-language</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;