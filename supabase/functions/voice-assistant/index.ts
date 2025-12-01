import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Language mapping for Google Translate API
const languageMap = {
  'hindi': 'hi',
  'kannada': 'kn', 
  'tamil': 'ta',
  'telugu': 'te',
  'marathi': 'mr',
  'gujarati': 'gu',
  'bengali': 'bn',
  'punjabi': 'pa',
  'malayalam': 'ml',
  'odia': 'or',
  'assamese': 'as',
  'english': 'en'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      audio_data, 
      text_input, 
      language = 'english', 
      interaction_type = 'general',
      farmer_id 
    } = await req.json();

    console.log('Processing voice assistant request:', { language, interaction_type, farmer_id });

    let inputText = text_input;

    // If audio data is provided, transcribe it
    if (audio_data) {
      console.log('Transcribing audio...');
      
      // Convert base64 to binary
      const binaryAudio = atob(audio_data);
      const bytes = new Uint8Array(binaryAudio.length);
      for (let i = 0; i < binaryAudio.length; i++) {
        bytes[i] = binaryAudio.charCodeAt(i);
      }

      // Create form data for Google Speech-to-Text
      const formData = new FormData();
      const blob = new Blob([bytes], { type: 'audio/webm' });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', languageMap[language] || 'en');

      // Transcribe using OpenAI Whisper
      const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error(`Transcription failed: ${await transcribeResponse.text()}`);
      }

      const transcriptionResult = await transcribeResponse.json();
      inputText = transcriptionResult.text;
      console.log('Transcribed text:', inputText);
    }

    if (!inputText) {
      throw new Error('No input text provided or transcribed');
    }

    // Translate to English if needed
    let englishText = inputText;
    if (language !== 'english') {
      console.log('Translating to English...');
      
      const translateResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${languageMap[language]}|en`);
      const translateResult = await translateResponse.json();
      
      if (translateResult.responseStatus === 200) {
        englishText = translateResult.responseData.translatedText;
        console.log('Translated text:', englishText);
      }
    }

    // Get farmer profile for context
    let farmerContext = '';
    if (farmer_id) {
      const { data: farmer } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmer_id)
        .single();
      
      if (farmer) {
        farmerContext = `Farmer Profile: ${farmer.name} from ${farmer.village}, ${farmer.district}, ${farmer.state}. 
        Farm size: ${farmer.farm_size_acres} acres. Primary crops: ${farmer.primary_crops?.join(', ') || 'Not specified'}.`;
      }
    }

    // Generate AI response using OpenAI GPT
    console.log('Generating AI response...');
    
    const systemPrompt = `You are HarvAI, an intelligent farming assistant for Indian farmers. You provide practical, actionable advice in simple language.

${farmerContext}

Guidelines:
- Give specific, actionable farming advice
- Consider Indian climate, crops, and farming practices
- Keep responses concise and practical
- Include specific numbers when relevant (fertilizer amounts, timing, etc.)
- Focus on sustainable and cost-effective solutions
- If asked about weather, suggest checking local forecasts
- For pest/disease issues, provide both organic and chemical solutions

Current interaction type: ${interaction_type}`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: englishText }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!gptResponse.ok) {
      throw new Error(`OpenAI API error: ${await gptResponse.text()}`);
    }

    const gptResult = await gptResponse.json();
    let responseText = gptResult.choices[0].message.content;

    // Translate response back to user's language if needed
    let finalResponse = responseText;
    if (language !== 'english') {
      console.log('Translating response back to user language...');
      
      const translateBackResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(responseText)}&langpair=en|${languageMap[language]}`);
      const translateBackResult = await translateBackResponse.json();
      
      if (translateBackResult.responseStatus === 200) {
        finalResponse = translateBackResult.responseData.translatedText;
      }
    }

    // Log interaction if farmer_id provided
    if (farmer_id) {
      await supabase.from('voice_interactions').insert({
        farmer_id,
        input_language: language,
        original_text: inputText,
        translated_text: englishText,
        response_text: finalResponse,
        response_language: language,
        interaction_type
      });
    }

    console.log('Response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      original_text: inputText,
      translated_text: englishText,
      response: finalResponse,
      language: language
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice assistant:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});