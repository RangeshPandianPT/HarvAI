import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Sprout, 
  TrendingUp, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

const RealTimeStats = () => {
  const [stats, setStats] = useState({
    activeFarmers: 52847,
    cropsAnalyzed: 148392,
    avgYieldIncrease: 26.3,
    alertsSent: 12487,
    onlineFarmers: 1247,
    responsesProcessed: 98754
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, farmer: 'Ravi K.', location: 'Mysore', action: 'Soil analysis completed', time: '2 min ago', type: 'soil' },
    { id: 2, farmer: 'Priya S.', location: 'Bangalore', action: 'Weather alert received', time: '3 min ago', type: 'weather' },
    { id: 3, farmer: 'Kumar M.', location: 'Mandya', action: 'Voice query answered', time: '5 min ago', type: 'voice' },
    { id: 4, farmer: 'Lakshmi R.', location: 'Hassan', action: 'Satellite data analyzed', time: '7 min ago', type: 'satellite' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeFarmers: prev.activeFarmers + Math.floor(Math.random() * 3),
        cropsAnalyzed: prev.cropsAnalyzed + Math.floor(Math.random() * 5),
        avgYieldIncrease: Math.round((prev.avgYieldIncrease + (Math.random() - 0.5) * 0.1) * 10) / 10,
        alertsSent: prev.alertsSent + Math.floor(Math.random() * 2),
        onlineFarmers: 1200 + Math.floor(Math.random() * 100),
        responsesProcessed: prev.responsesProcessed + Math.floor(Math.random() * 7)
      }));

      // Add new activity occasionally
      if (Math.random() < 0.3) {
        const actions = [
          { action: 'Soil analysis completed', type: 'soil' },
          { action: 'Weather alert received', type: 'weather' },
          { action: 'Voice query answered', type: 'voice' },
          { action: 'Satellite data analyzed', type: 'satellite' },
          { action: 'Market price checked', type: 'market' },
          { action: 'Crop journal updated', type: 'journal' }
        ];
        const names = ['Ravi K.', 'Priya S.', 'Kumar M.', 'Lakshmi R.', 'Suresh T.', 'Meera N.'];
        const locations = ['Mysore', 'Bangalore', 'Mandya', 'Hassan', 'Tumkur', 'Kolar'];
        
        const newActivity = {
          id: Date.now(),
          farmer: names[Math.floor(Math.random() * names.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          ...actions[Math.floor(Math.random() * actions.length)],
          time: 'Just now'
        };

        setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'soil': return <Sprout className="w-4 h-4 text-earth-brown" />;
      case 'weather': return <AlertTriangle className="w-4 h-4 text-sky-blue" />;
      case 'voice': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'satellite': return <Globe className="w-4 h-4 text-sky-blue" />;
      case 'market': return <TrendingUp className="w-4 h-4 text-harvest-gold" />;
      case 'journal': return <Clock className="w-4 h-4 text-crop-green" />;
      default: return <Zap className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-crop-green/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary">Live</span> Impact Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how HarvAI is helping farmers across Karnataka in real-time
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-crop-green rounded-full animate-pulse"></div>
            <span className="text-sm text-crop-green font-medium">Live Data</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Stats */}
          <Card className="bg-gradient-to-br from-primary/10 to-crop-green/10 border-primary/20 shadow-soft">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-primary mb-2 font-mono">
                {formatNumber(stats.activeFarmers)}
              </div>
              <div className="text-sm text-muted-foreground">Active Farmers</div>
              <Badge variant="secondary" className="mt-2 bg-crop-green/10 text-crop-green">
                +{stats.onlineFarmers} online now
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-earth-brown/10 to-soil-light/10 border-earth-brown/20 shadow-soft">
            <CardContent className="p-6 text-center">
              <Sprout className="w-12 h-12 text-earth-brown mx-auto mb-4" />
              <div className="text-3xl font-bold text-earth-brown mb-2 font-mono">
                {formatNumber(stats.cropsAnalyzed)}
              </div>
              <div className="text-sm text-muted-foreground">Crops Analyzed</div>
              <Badge variant="secondary" className="mt-2 bg-earth-brown/10 text-earth-brown">
                This month
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-harvest-gold/10 to-sunshine-yellow/10 border-harvest-gold/20 shadow-soft">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-harvest-gold mx-auto mb-4" />
              <div className="text-3xl font-bold text-harvest-gold mb-2 font-mono">
                {stats.avgYieldIncrease}%
              </div>
              <div className="text-sm text-muted-foreground">Avg. Yield Increase</div>
              <Badge variant="secondary" className="mt-2 bg-harvest-gold/10 text-harvest-gold">
                Verified results
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Real-time Activity Feed */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Live Activity Feed</h3>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-crop-green rounded-full animate-pulse"></div>
                  <span className="text-xs text-crop-green">Real-time</span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {activity.farmer} • {activity.location}
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.action}</div>
                      <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-soft">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6">Today's Impact</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-sky-blue/10">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-sky-blue" />
                    <span className="text-sm font-medium">Weather Alerts Sent</span>
                  </div>
                  <span className="text-xl font-bold text-sky-blue font-mono">
                    {formatNumber(stats.alertsSent)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Voice Queries Answered</span>
                  </div>
                  <span className="text-xl font-bold text-primary font-mono">
                    {formatNumber(stats.responsesProcessed)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-crop-green/10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-crop-green" />
                    <span className="text-sm font-medium">Avg Response Time</span>
                  </div>
                  <span className="text-xl font-bold text-crop-green">1.2s</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-harvest-gold/10">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-harvest-gold" />
                    <span className="text-sm font-medium">Coverage Areas</span>
                  </div>
                  <span className="text-xl font-bold text-harvest-gold">30+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Join thousands of farmers already using HarvAI
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Be part of the farming revolution</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealTimeStats;