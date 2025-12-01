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
    const { farmer_id, message_type, custom_message } = await req.json();

    console.log('Processing SMS service for farmer:', farmer_id);

    if (!farmer_id) {
      throw new Error('farmer_id is required');
    }

    // Get farmer details
    const { data: farmer, error: farmerError } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', farmer_id)
      .single();

    if (farmerError || !farmer) {
      throw new Error('Farmer not found');
    }

    if (!farmer.sms_enabled) {
      throw new Error('SMS service is disabled for this farmer');
    }

    let smsMessage = custom_message;

    // Generate contextual messages based on type
    if (message_type && !custom_message) {
      switch (message_type) {
        case 'weather_alert':
          // Get latest weather alerts for farmer's location
          const { data: weatherAlerts } = await supabase
            .from('weather_alerts')
            .select('*')
            .eq('district', farmer.district)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

          if (weatherAlerts && weatherAlerts.length > 0) {
            const alert = weatherAlerts[0];
            smsMessage = `HARVAI ALERT: ${alert.title} - ${alert.description}. Stay safe!`;
          } else {
            smsMessage = `HARVAI: Weather looks normal for ${farmer.district}. Good time for regular farm activities.`;
          }
          break;

        case 'market_update':
          // Get latest market prices
          const { data: marketPrices } = await supabase
            .from('market_prices')
            .select('*')
            .eq('district', farmer.district)
            .in('crop_name', farmer.primary_crops || ['Rice'])
            .order('price_date', { ascending: false })
            .limit(1);

          if (marketPrices && marketPrices.length > 0) {
            const price = marketPrices[0];
            smsMessage = `HARVAI MARKET: ${price.crop_name} - Rs.${price.modal_price}/quintal in ${price.market_name}. Trend: ${price.price_trend}`;
          } else {
            smsMessage = `HARVAI: Check local market for latest crop prices in ${farmer.district}.`;
          }
          break;

        case 'pest_alert':
          // Get recent pest reports in the area
          const { data: pestReports } = await supabase
            .from('pest_disease_reports')
            .select('*')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .order('created_at', { ascending: false })
            .limit(5);

          // Simple distance check (within ~50km)
          const nearbyPests = pestReports?.filter(report => {
            if (!farmer.gps_latitude || !farmer.gps_longitude) return false;
            const latDiff = Math.abs(report.latitude - farmer.gps_latitude);
            const lonDiff = Math.abs(report.longitude - farmer.gps_longitude);
            return latDiff < 0.5 && lonDiff < 0.5; // Rough 50km radius
          });

          if (nearbyPests && nearbyPests.length > 0) {
            const pest = nearbyPests[0];
            smsMessage = `HARVAI PEST ALERT: ${pest.pest_disease_name || 'Pest/Disease'} reported in ${pest.crop_affected} crop nearby. Check your crops and take preventive measures.`;
          } else {
            smsMessage = `HARVAI: No major pest/disease reports in your area. Continue regular crop monitoring.`;
          }
          break;

        case 'irrigation_reminder':
          smsMessage = `HARVAI REMINDER: Check soil moisture and irrigate crops if needed. Avoid overwatering. Best time: early morning or evening.`;
          break;

        case 'harvest_reminder':
          // Check crop journal for planting dates
          const { data: journalEntries } = await supabase
            .from('crop_journal')
            .select('*')
            .eq('farmer_id', farmer_id)
            .eq('activity_type', 'planting')
            .order('activity_date', { ascending: false })
            .limit(5);

          let harvestMessage = `HARVAI: Check crop maturity. `;
          if (journalEntries && journalEntries.length > 0) {
            const plantingDate = new Date(journalEntries[0].activity_date);
            const daysSincePlanting = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
            harvestMessage += `${journalEntries[0].crop_name} planted ${daysSincePlanting} days ago. `;
          }
          harvestMessage += `Monitor for harvest signs.`;
          smsMessage = harvestMessage;
          break;

        default:
          smsMessage = `HARVAI: Hello ${farmer.name}! Check our app for latest farming advice and updates for your ${farmer.farm_size_acres} acre farm.`;
      }
    }

    // Truncate message to SMS limit (160 characters for basic SMS)
    if (smsMessage.length > 160) {
      smsMessage = smsMessage.substring(0, 157) + '...';
    }

    // Translate message to farmer's preferred language if not English
    if (farmer.preferred_language !== 'english') {
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
        'assamese': 'as'
      };

      const targetLang = languageMap[farmer.preferred_language];
      if (targetLang) {
        const translateResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(smsMessage)}&langpair=en|${targetLang}`);
        const translateResult = await translateResponse.json();
        
        if (translateResult.responseStatus === 200) {
          smsMessage = translateResult.responseData.translatedText;
        }
      }
    }

    // Send SMS using Twilio (mock implementation)
    console.log('Sending SMS...');
    
    // In production, you would use actual Twilio API
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    let smsResult = { success: false, message: 'SMS service not configured' };

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('To', farmer.phone_number);
        formData.append('From', twilioPhoneNumber);
        formData.append('Body', smsMessage);

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (twilioResponse.ok) {
          const twilioResult = await twilioResponse.json();
          smsResult = { 
            success: true, 
            message: 'SMS sent successfully',
            sid: twilioResult.sid 
          };
        } else {
          const errorText = await twilioResponse.text();
          console.error('Twilio error:', errorText);
          smsResult = { success: false, message: 'Failed to send SMS via Twilio' };
        }
      } catch (error) {
        console.error('SMS sending error:', error);
        smsResult = { success: false, message: 'SMS sending failed' };
      }
    } else {
      // Mock success for demo purposes
      console.log('Mock SMS sent:', smsMessage, 'to', farmer.phone_number);
      smsResult = { 
        success: true, 
        message: 'SMS sent successfully (demo mode)',
        demo: true 
      };
    }

    console.log('SMS service completed');

    return new Response(JSON.stringify({
      success: true,
      data: {
        farmer_id,
        phone_number: farmer.phone_number,
        message_content: smsMessage,
        message_type: message_type || 'custom',
        language: farmer.preferred_language,
        sms_result: smsResult,
        sent_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in SMS service:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});