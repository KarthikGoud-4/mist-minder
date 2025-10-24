// Edge function runtime is automatically available

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages }: { messages: Message[] } = await req.json();
    console.log('Received messages:', messages);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    // Extract the user's last message
    const userMessage = messages[messages.length - 1].content;

    // Use AI to extract city name from natural language
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a weather assistant. Extract the city name from the user's message. 
If they ask about weather, return ONLY the city name with no other text.
If no city is mentioned, respond conversationally asking which city they want to know about.
Examples:
- "What's the weather in Paris?" -> "Paris"
- "Is it raining in Tokyo?" -> "Tokyo"
- "Tell me about the weather" -> "I'd be happy to help! Which city would you like to know about?"`
          },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    const cityOrResponse = aiData.choices[0].message.content.trim();
    
    console.log('AI extracted:', cityOrResponse);

    // Check if response is a city name (short) or a conversational response
    if (cityOrResponse.length > 50 || cityOrResponse.includes('?') || cityOrResponse.toLowerCase().includes('which city')) {
      // It's a conversational response, return it directly
      return new Response(
        JSON.stringify({ message: cityOrResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityOrResponse)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log('Fetching weather for:', cityOrResponse);

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 404) {
        return new Response(
          JSON.stringify({ message: `I couldn't find weather data for "${cityOrResponse}". Could you try a different city name?` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Weather API error');
    }

    const weatherData = await weatherResponse.json();
    console.log('Weather data received:', weatherData);

    // Format the response naturally
    const response = {
      message: `Current weather in ${weatherData.name}, ${weatherData.sys.country}:
🌡️ Temperature: ${Math.round(weatherData.main.temp)}°C (feels like ${Math.round(weatherData.main.feels_like)}°C)
☁️ Condition: ${weatherData.weather[0].description}
💧 Humidity: ${weatherData.main.humidity}%
💨 Wind Speed: ${weatherData.wind.speed} m/s`,
      weather: {
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weather-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        message: 'Sorry, I encountered an error processing your request. Please try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
