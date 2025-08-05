import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'assistant';
    text: string;
    timestamp: string;
  }>>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिन्दी (Hindi)' },
    { value: 'kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'tamil', label: 'தமிழ் (Tamil)' },
    { value: 'telugu', label: 'తెలుగు (Telugu)' },
    { value: 'marathi', label: 'मराठी (Marathi)' }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak your farming question clearly.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      processAudio();
    }
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioBase64 = await blobToBase64(audioBlob);
      
      // Get farmer ID
      let farmerId = null;
      if (user) {
        const { data: farmer } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        farmerId = farmer?.id;
      }
      
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: {
          audio_data: audioBase64,
          language: language,
          interaction_type: 'voice',
          farmer_id: farmerId
        }
      });

      if (error) throw error;

      if (data.success) {
        // Add to conversation
        setConversation(prev => [
          ...prev,
          {
            type: 'user',
            text: data.original_text,
            timestamp: new Date().toLocaleTimeString()
          },
          {
            type: 'assistant',
            text: data.response,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);

        // Speak the response
        speakText(data.response, language);

        toast({
          title: "Voice processed successfully",
          description: "HarvAI has responded to your question.",
        });
      } else {
        throw new Error(data.error || 'Voice processing failed');
      }
    } catch (error: any) {
      console.error('Error processing audio:', error);
      toast({
        title: "Voice processing failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Get farmer ID
      let farmerId = null;
      if (user) {
        const { data: farmer } = await supabase
          .from('farmers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        farmerId = farmer?.id;
      }
      
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: {
          text_input: textInput,
          language: language,
          interaction_type: 'text',
          farmer_id: farmerId
        }
      });

      if (error) throw error;

      if (data.success) {
        // Add to conversation
        setConversation(prev => [
          ...prev,
          {
            type: 'user',
            text: textInput,
            timestamp: new Date().toLocaleTimeString()
          },
          {
            type: 'assistant',
            text: data.response,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);

        setTextInput('');
        
        // Speak the response
        speakText(data.response, language);

        toast({
          title: "Message sent successfully",
          description: "HarvAI has responded to your question.",
        });
      } else {
        throw new Error(data.error || 'Message processing failed');
      }
    } catch (error: any) {
      console.error('Error processing text:', error);
      toast({
        title: "Message processing failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language for speech synthesis
      const langMap: Record<string, string> = {
        'english': 'en-IN',
        'hindi': 'hi-IN',
        'kannada': 'kn-IN',
        'tamil': 'ta-IN',
        'telugu': 'te-IN',
        'marathi': 'mr-IN'
      };
      
      utterance.lang = langMap[language] || 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      speechSynthesis.speak(utterance);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {t('harvestAI')}
        </CardTitle>
        <CardDescription>
          {t('askQuestions')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t('language')}:</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48">
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

        {/* Voice Recording */}
        <div className="flex items-center gap-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="flex-1"
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                {t('stopRecording')}
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {t('startRecording')}
              </>
            )}
          </Button>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('typeQuestion')}</label>
          <div className="flex gap-2">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t('typePlaceholder')}
              disabled={isProcessing}
              className="flex-1"
              rows={2}
            />
            <Button
              onClick={sendTextMessage}
              disabled={isProcessing || !textInput.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="text-center text-muted-foreground">
            {t('processing')}
          </div>
        )}

        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="font-medium">{t('conversation')}</h3>
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary/10 ml-8'
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs text-muted-foreground ml-2">
                    {message.timestamp}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.type === 'user' ? t('you') : 'HarvAI'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;