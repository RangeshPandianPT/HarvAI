import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Clock,
  Eye,
  Star,
  User,
  Quote
} from 'lucide-react';

const VideoShowcase = () => {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videos = [
    {
      id: 'farmer-story-1',
      title: 'Ravi\'s Success Story - 30% Yield Increase',
      description: 'See how HarvAI helped Ravi Kumar from Mysore increase his tomato yield using voice-guided farming.',
      thumbnail: 'https://images.unsplash.com/photo-1592982736523-1b3a4ad03f16?w=500&h=300&fit=crop',
      duration: '3:45',
      views: '12.4K',
      rating: 4.9,
      language: 'Kannada with English subtitles',
      farmer: 'Ravi Kumar, Mysore',
      category: 'Success Story'
    },
    {
      id: 'voice-demo',
      title: 'Voice Assistant in Action',
      description: 'Watch a live demonstration of HarvAI\'s voice assistant answering farming questions in Kannada.',
      thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=300&fit=crop',
      duration: '2:30',
      views: '8.7K',
      rating: 4.8,
      language: 'Kannada',
      farmer: 'Demo by HarvAI Team',
      category: 'Product Demo'
    },
    {
      id: 'satellite-analysis',
      title: 'Satellite Crop Monitoring Explained',
      description: 'Learn how our satellite technology detects crop health issues before they become visible.',
      thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=300&fit=crop',
      duration: '4:12',
      views: '15.2K',
      rating: 4.9,
      language: 'English',
      farmer: 'Technical Overview',
      category: 'Technology'
    },
    {
      id: 'weather-alerts',
      title: 'Weather Alert System Demo',
      description: 'See how HarvAI sends timely weather alerts to help farmers protect their crops.',
      thumbnail: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=500&h=300&fit=crop',
      duration: '2:45',
      views: '6.3K',
      rating: 4.7,
      language: 'Hindi with English subtitles',
      farmer: 'Multiple farmers featured',
      category: 'Feature Demo'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Bangalore Rural',
      quote: 'HarvAI made farming so much easier. I can just speak in Kannada and get all the help I need!',
      rating: 5,
      crop: 'Vegetables'
    },
    {
      name: 'Kumar Reddy',
      location: 'Mandya',
      quote: 'The satellite data helped me detect pest issues early. Saved my entire rice crop!',
      rating: 5,
      crop: 'Rice'
    },
    {
      name: 'Lakshmi Naik',
      location: 'Hassan',
      quote: 'Weather alerts are so accurate. I planned my harvest perfectly and got better prices.',
      rating: 5,
      crop: 'Coffee'
    }
  ];

  const currentVideo = videos[selectedVideo];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See <span className="text-primary">HarvAI</span> in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch real farmers share their success stories and see our technology at work
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-black shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
                  {/* Video Thumbnail */}
                  <img 
                    src={currentVideo.thumbnail} 
                    alt={currentVideo.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </Button>
                  </div>

                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-primary text-white">
                          {currentVideo.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          {currentVideo.duration}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4" />
                          {currentVideo.views} views
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {currentVideo.rating}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Details */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-2">{currentVideo.title}</h3>
                  <p className="text-muted-foreground mb-4">{currentVideo.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Language: </span>
                      <span className="text-muted-foreground">{currentVideo.language}</span>
                    </div>
                    <div>
                      <span className="font-medium">Featured: </span>
                      <span className="text-muted-foreground">{currentVideo.farmer}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Playlist & Testimonials */}
          <div className="space-y-6">
            {/* Video Playlist */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">More Videos</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {videos.map((video, index) => (
                    <button
                      key={video.id}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedVideo === index 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedVideo(index)}
                    >
                      <div className="flex gap-3">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{video.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {video.duration}
                            <Eye className="w-3 h-3" />
                            {video.views}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card className="bg-gradient-to-br from-primary/5 to-crop-green/5 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">What Farmers Say</h3>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white/80 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Quote className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 italic">
                            "{testimonial.quote}"
                          </p>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            <div>
                              <div className="text-sm font-medium">{testimonial.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {testimonial.location} • {testimonial.crop} Farmer
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to create your own success story?
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-crop-green">
            <a href="/auth">
              <Play className="w-5 h-5 mr-2" />
              Start Your HarvAI Journey
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;