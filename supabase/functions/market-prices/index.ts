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
    const { crop_name, district, state, days_back = 30 } = await req.json();

    console.log('Fetching market prices for:', { crop_name, district, state, days_back });

    // Mock market data - In production, you would fetch from Agmarknet API or similar
    const generateMockPrices = (crop: string, days: number) => {
      const prices = [];
      const basePrice = {
        'Rice': 2000,
        'Wheat': 1800,
        'Cotton': 5000,
        'Sugarcane': 300,
        'Maize': 1500,
        'Soybean': 4000,
        'Tomato': 1200,
        'Onion': 800,
        'Potato': 600,
        'Banana': 2000
      }[crop] || 1500;

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const randomVariation = (Math.random() - 0.5) * 0.3;
        const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.2;
        const trendFactor = (days - i) / days * 0.1;
        
        const price = basePrice * (1 + randomVariation + seasonalFactor + trendFactor);
        const minPrice = price * 0.9;
        const maxPrice = price * 1.1;
        
        prices.push({
          date: date.toISOString().split('T')[0],
          min_price: Math.round(minPrice),
          max_price: Math.round(maxPrice),
          modal_price: Math.round(price)
        });
      }
      
      return prices;
    };

    const historicalPrices = generateMockPrices(crop_name, days_back);

    // Calculate price trend
    const recentPrices = historicalPrices.slice(-7);
    const olderPrices = historicalPrices.slice(-14, -7);
    
    const recentAvg = recentPrices.reduce((sum, p) => sum + p.modal_price, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((sum, p) => sum + p.modal_price, 0) / olderPrices.length;
    
    let priceTrend = 'stable';
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (changePercent > 5) {
      priceTrend = 'rising';
    } else if (changePercent < -5) {
      priceTrend = 'falling';
    }

    // Generate price prediction using AI
    const predictionPrompt = `Analyze market price data for ${crop_name} in ${district}, ${state}:
    
    Recent 7-day average: ₹${recentAvg.toFixed(0)} per quintal
    Previous 7-day average: ₹${olderAvg.toFixed(0)} per quintal
    Price trend: ${priceTrend} (${changePercent.toFixed(1)}% change)
    Current price range: ₹${recentPrices[recentPrices.length-1].min_price} - ₹${recentPrices[recentPrices.length-1].max_price}
    
    Provide:
    1. 7-day price forecast
    2. Best selling time recommendation
    3. Factors affecting prices
    4. Market advice for farmers
    
    Consider Indian agricultural market conditions and seasonal factors.`;

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
            content: 'You are an expert agricultural market analyst providing price forecasts and market advice for Indian farmers.' 
          },
          { role: 'user', content: predictionPrompt }
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    let marketAnalysis = '';
    if (gptResponse.ok) {
      const gptResult = await gptResponse.json();
      marketAnalysis = gptResult.choices[0].message.content;
    }

    // Store market prices in database
    for (const priceData of historicalPrices) {
      await supabase.from('market_prices').upsert({
        crop_name,
        market_name: `${district} Market`,
        district,
        state,
        min_price: priceData.min_price,
        max_price: priceData.max_price,
        modal_price: priceData.modal_price,
        price_date: priceData.date,
        price_trend: priceTrend
      }, {
        onConflict: 'crop_name,market_name,price_date'
      });
    }

    // Generate price predictions for next 7 days
    const futurePrices = [];
    const lastPrice = historicalPrices[historicalPrices.length - 1];
    
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      const randomVariation = (Math.random() - 0.5) * 0.15;
      const trendContinuation = priceTrend === 'rising' ? 0.02 : priceTrend === 'falling' ? -0.02 : 0;
      
      const predictedPrice = lastPrice.modal_price * (1 + randomVariation + trendContinuation);
      
      futurePrices.push({
        date: futureDate.toISOString().split('T')[0],
        predicted_price: Math.round(predictedPrice),
        confidence: Math.max(60, 90 - (i * 5)) // Decreasing confidence over time
      });
    }

    console.log('Market price analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      data: {
        crop_name,
        location: { district, state },
        current_price: lastPrice,
        price_trend: priceTrend,
        change_percent: changePercent,
        historical_prices: historicalPrices,
        price_predictions: futurePrices,
        market_analysis: marketAnalysis,
        recommendations: {
          selling_advice: priceTrend === 'rising' ? 'Hold for better prices' : 
                         priceTrend === 'falling' ? 'Consider selling soon' : 
                         'Monitor market for 2-3 days',
          best_markets: [`${district} Main Market`, `${state} Agricultural Market`]
        },
        generated_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market prices:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});