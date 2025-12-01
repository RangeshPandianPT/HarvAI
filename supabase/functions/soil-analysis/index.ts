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
    const { 
      farmer_id, 
      image_base64, 
      soil_form_data 
    } = await req.json();

    console.log('Processing soil analysis for farmer:', farmer_id);

    if (!farmer_id) {
      throw new Error('farmer_id is required');
    }

    let analysisResult: any = {};
    let recommendations = '';

    // If image is provided, analyze it using OpenAI Vision
    if (image_base64) {
      console.log('Analyzing soil image with AI...');
      
      const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are an expert soil scientist analyzing soil images for Indian farmers. 
              Analyze the soil image and provide:
              1. Soil color and texture assessment
              2. Estimated pH level (acidic/neutral/alkaline)
              3. Organic matter content estimate
              4. Moisture level assessment
              5. Visible nutrient deficiencies
              6. Recommended improvements
              
              Provide your analysis in JSON format with these keys:
              - color_assessment
              - texture_type
              - ph_estimate
              - organic_matter_level
              - moisture_assessment
              - visible_issues
              - recommendations`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this soil image and provide detailed assessment for farming.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${image_base64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!visionResponse.ok) {
        console.error('Vision API error:', await visionResponse.text());
        throw new Error('Failed to analyze soil image');
      }

      const visionResult = await visionResponse.json();
      const analysisText = visionResult.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        analysisResult = JSON.parse(analysisText);
      } catch {
        // If not JSON, store as text analysis
        analysisResult = { text_analysis: analysisText };
      }
      
      recommendations = analysisResult.recommendations || analysisText;
    }

    // If form data is provided, process it
    if (soil_form_data) {
      console.log('Processing soil form data...');
      
      const formAnalysisPrompt = `Analyze soil test results for an Indian farmer:
      ${Object.entries(soil_form_data).map(([key, value]) => `${key}: ${value}`).join('\n')}
      
      Provide specific recommendations for:
      1. Fertilizer requirements (NPK ratios)
      2. Soil amendments needed
      3. Organic matter improvements
      4. pH correction if needed
      5. Best crops for this soil type
      6. Irrigation recommendations
      
      Make recommendations specific to Indian farming conditions and available inputs.`;

      const formAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are an expert soil scientist providing practical advice for Indian farmers.' 
            },
            { role: 'user', content: formAnalysisPrompt }
          ],
          max_tokens: 600,
          temperature: 0.3,
        }),
      });

      if (formAnalysisResponse.ok) {
        const formResult = await formAnalysisResponse.json();
        recommendations += '\n\n' + formResult.choices[0].message.content;
        analysisResult.form_analysis = soil_form_data;
      }
    }

    // Extract numerical values from form data if available
    const ph_level = soil_form_data?.ph_level ? parseFloat(soil_form_data.ph_level) : null;
    const nitrogen_level = soil_form_data?.nitrogen_level || null;
    const phosphorus_level = soil_form_data?.phosphorus_level || null;
    const potassium_level = soil_form_data?.potassium_level || null;
    const organic_matter = soil_form_data?.organic_matter ? parseFloat(soil_form_data.organic_matter) : null;

    // Store analysis in database
    const { data: soilAnalysis, error: insertError } = await supabase
      .from('soil_analysis')
      .insert({
        farmer_id,
        image_url: image_base64 ? 'data:image/jpeg;base64,' + image_base64.substring(0, 50) + '...' : null,
        ph_level,
        nitrogen_level,
        phosphorus_level,
        potassium_level,
        organic_matter,
        analysis_result: analysisResult,
        recommendations: recommendations
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing soil analysis:', insertError);
      throw new Error('Failed to store soil analysis data');
    }

    console.log('Soil analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: soilAnalysis.id,
        analysis_result: analysisResult,
        recommendations: recommendations,
        soil_metrics: {
          ph_level,
          nitrogen_level,
          phosphorus_level,
          potassium_level,
          organic_matter
        },
        created_at: soilAnalysis.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in soil analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});