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
    const { district, state, days = 5 } = await req.json();

    console.log('Fetching weather data for:', { district, state, days });

    if (!district || !state) {
      throw new Error('district and state are required');
    }

    // Get weather data from OpenWeatherMap API
    const weatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!weatherApiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${district},${state},IN&appid=${weatherApiKey}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${await weatherResponse.text()}`);
    }

    const weatherData = await weatherResponse.json();
    
    console.log('Weather data fetched successfully');

    // Analyze weather data for farming alerts
    const alerts = [];
    const forecasts = weatherData.list.slice(0, days * 8); // 8 forecasts per day (3-hour intervals)

    // Group forecasts by day
    const dailyForecasts = [];
    for (let i = 0; i < forecasts.length; i += 8) {
      const dayForecasts = forecasts.slice(i, i + 8);
      const avgTemp = dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length;
      const maxTemp = Math.max(...dayForecasts.map(f => f.main.temp_max));
      const minTemp = Math.min(...dayForecasts.map(f => f.main.temp_min));
      const rainfall = dayForecasts.reduce((sum, f) => sum + (f.rain?.['3h'] || 0), 0);
      const humidity = dayForecasts.reduce((sum, f) => sum + f.main.humidity, 0) / dayForecasts.length;
      const windSpeed = dayForecasts.reduce((sum, f) => sum + f.wind.speed, 0) / dayForecasts.length;
      
      dailyForecasts.push({
        date: new Date(dayForecasts[0].dt * 1000).toISOString().split('T')[0],
        avgTemp,
        maxTemp,
        minTemp,
        rainfall,
        humidity,
        windSpeed,
        weather: dayForecasts[0].weather[0]
      });
    }

    // Generate weather-based farming alerts
    for (const forecast of dailyForecasts) {
      // Heavy rainfall alert
      if (forecast.rainfall > 25) {
        alerts.push({
          type: 'weather',
          severity: forecast.rainfall > 50 ? 'high' : 'medium',
          title: 'Heavy Rainfall Alert',
          description: `Expected rainfall: ${forecast.rainfall.toFixed(1)}mm. Prepare drainage systems and delay irrigation.`,
          date: forecast.date,
          recommendations: [
            'Ensure proper drainage in fields',
            'Delay irrigation activities',
            'Protect stored crops from moisture',
            'Apply fungicides if crops are susceptible to fungal diseases'
          ]
        });
      }

      // High temperature alert
      if (forecast.maxTemp > 38) {
        alerts.push({
          type: 'weather',
          severity: forecast.maxTemp > 42 ? 'high' : 'medium',
          title: 'High Temperature Alert',
          description: `Maximum temperature expected: ${forecast.maxTemp.toFixed(1)}°C. Increase irrigation frequency.`,
          date: forecast.date,
          recommendations: [
            'Increase irrigation frequency',
            'Provide shade for sensitive crops',
            'Avoid mid-day field activities',
            'Monitor crops for heat stress symptoms'
          ]
        });
      }

      // Frost warning (for winter months)
      if (forecast.minTemp < 5) {
        alerts.push({
          type: 'weather',
          severity: forecast.minTemp < 2 ? 'high' : 'medium',
          title: 'Frost Warning',
          description: `Minimum temperature expected: ${forecast.minTemp.toFixed(1)}°C. Protect sensitive crops.`,
          date: forecast.date,
          recommendations: [
            'Cover sensitive crops with cloth or plastic',
            'Light smudge pots if available',
            'Harvest mature vegetables before frost',
            'Water crops before evening to prevent frost damage'
          ]
        });
      }

      // High humidity + moderate temperature (disease risk)
      if (forecast.humidity > 80 && forecast.avgTemp > 20 && forecast.avgTemp < 30) {
        alerts.push({
          type: 'weather',
          severity: 'medium',
          title: 'Disease Risk Alert',
          description: `High humidity (${forecast.humidity.toFixed(1)}%) with moderate temperature increases disease risk.`,
          date: forecast.date,
          recommendations: [
            'Monitor crops for fungal diseases',
            'Apply preventive fungicides',
            'Ensure good air circulation',
            'Avoid overhead irrigation'
          ]
        });
      }
    }

    // Generate AI-powered farming advice based on weather
    const advicePrompt = `Based on the weather forecast for ${district}, ${state}:
    ${dailyForecasts.map(f => 
      `${f.date}: Temp ${f.minTemp.toFixed(1)}-${f.maxTemp.toFixed(1)}°C, Rain ${f.rainfall.toFixed(1)}mm, Humidity ${f.humidity.toFixed(1)}%`
    ).join('\n')}
    
    Provide specific farming advice for the next ${days} days including:
    1. Irrigation recommendations
    2. Field work timing
    3. Crop protection measures
    4. Harvest timing if applicable
    5. Planting recommendations
    
    Consider Indian farming practices and common crops.`;

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
            content: 'You are an expert agricultural meteorologist providing weather-based farming advice for Indian farmers.' 
          },
          { role: 'user', content: advicePrompt }
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    let farmingAdvice = '';
    if (gptResponse.ok) {
      const gptResult = await gptResponse.json();
      farmingAdvice = gptResult.choices[0].message.content;
    }

    // Store alerts in database
    for (const alert of alerts) {
      await supabase.from('weather_alerts').insert({
        district,
        state,
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        start_date: new Date(alert.date + 'T00:00:00Z').toISOString(),
        end_date: new Date(alert.date + 'T23:59:59Z').toISOString(),
        is_active: true
      });
    }

    console.log('Weather analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      data: {
        location: { district, state },
        forecast_days: days,
        daily_forecasts: dailyForecasts,
        alerts: alerts,
        farming_advice: farmingAdvice,
        generated_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather alerts:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});