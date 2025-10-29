import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Cloud } from "lucide-react";

const WeatherTile = () => {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState("Fetching location...");

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();
        setWeather(data);
        setLocation(data.name);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setLocation("Unable to fetch weather");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocation("Location access denied");
        }
      );
    }
  }, []);

  return (
    <Card className="tile bg-primary text-primary-foreground hover:scale-105 transition-transform duration-200">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Cloud className="h-6 w-6" />
        Live Weather
      </h3>
      <div className="flex flex-col items-center justify-center flex-1">
        <p className="text-sm opacity-90 mb-4">{location}</p>
        {weather && (
          <div className="flex items-center gap-4">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-20 h-20"
            />
            <span className="text-5xl font-bold">{Math.round(weather.main.temp)}°C</span>
          </div>
        )}
        {!weather && <span className="text-5xl font-bold">--°C</span>}
      </div>
    </Card>
  );
};

export default WeatherTile;
