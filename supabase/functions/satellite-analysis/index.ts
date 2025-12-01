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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { farmer_id, latitude, longitude } = await req.json();

    console.log('Processing satellite analysis for:', { farmer_id, latitude, longitude });

    if (!farmer_id || !latitude || !longitude) {
      throw new Error('farmer_id, latitude, and longitude are required');
    }

    // Simulate Google Earth Engine API call
    // In production, you would use the actual Google Earth Engine API
    console.log('Fetching NDVI data from satellite...');
    
    // Mock NDVI calculation based on coordinates and current date
    const currentDate = new Date();
    const baseNDVI = 0.6;
    const randomVariation = (Math.random() - 0.5) * 0.4;
    const seasonalFactor = Math.sin((currentDate.getMonth() / 12) * 2 * Math.PI) * 0.2;
    const ndviValue = Math.max(0, Math.min(1, baseNDVI + randomVariation + seasonalFactor));

    // Determine health status based on NDVI
    let healthStatus: string;
    let recommendations: string;

    if (ndviValue > 0.7) {
      healthStatus = 'healthy';
      recommendations = 'Crops are showing excellent growth. Continue current management practices. Monitor for optimal harvest timing.';
    } else if (ndviValue > 0.5) {
      healthStatus = 'moderate';
      recommendations = 'Crop health is moderate. Consider applying balanced fertilizer and ensure adequate irrigation. Monitor for pest activity.';
    } else if (ndviValue > 0.3) {
      healthStatus = 'stressed';
      recommendations = 'Crops show signs of stress. Check soil moisture, apply nitrogen fertilizer, and inspect for pest/disease issues. Consider foliar spray.';
    } else {
      healthStatus = 'critical';
      recommendations = 'Immediate action required. Inspect for disease, pests, or nutrient deficiency. Consult local agricultural officer if needed.';
    }

    // Generate detailed analysis using AI
    const analysisPrompt = `Analyze satellite NDVI data for an Indian farm:
    Location: ${latitude}, ${longitude}
    NDVI Value: ${ndviValue.toFixed(3)}
    Health Status: ${healthStatus}
    Date: ${currentDate.toISOString().split('T')[0]}
    
    Provide specific recommendations for Indian farming conditions including:
    1. Irrigation recommendations
    2. Fertilizer suggestions
    3. Pest monitoring advice
    4. Harvest timing guidance
    5. Weather considerations`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert agricultural consultant specializing in Indian farming practices and satellite crop monitoring.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!gptResponse.ok) {
      throw new Error(`OpenAI API error: ${await gptResponse.text()}`);
    }

    const gptResult = await gptResponse.json();
    const detailedRecommendations = gptResult.choices[0].message.content;

    // Store satellite data in database
    const { data: satelliteData, error: insertError } = await supabase
      .from('satellite_data')
      .insert({
        farmer_id,
        latitude,
        longitude,
        ndvi_value: ndviValue,
        capture_date: currentDate.toISOString().split('T')[0],
        analysis_result: {
          ndvi_value: ndviValue,
          health_status: healthStatus,
          analysis_date: currentDate.toISOString(),
          coordinates: { latitude, longitude }
        },
        health_status: healthStatus,
        recommendations: detailedRecommendations
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing satellite data:', insertError);
      throw new Error('Failed to store satellite analysis data');
    }

    console.log('Satellite analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: satelliteData.id,
        ndvi_value: ndviValue,
        health_status: healthStatus,
        basic_recommendations: recommendations,
        detailed_recommendations: detailedRecommendations,
        analysis_date: currentDate.toISOString(),
        coordinates: { latitude, longitude }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in satellite analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});