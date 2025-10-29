import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Cloud } from "lucide-react";

const WeatherTile = () => {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState("Fetching location...");
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeatherByCoords = async (lat: number, lon: number) => {
      try {
        // Use a free geocoding service to get city name from coordinates
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const geoData = await geoResponse.json();
        const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || "your location";
        
        setLocation(cityName);
        
        // For now, show a placeholder since we need the API key configured
        setWeather({
          temp: "--",
          description: "Configure API key to see live weather"
        });
      } catch (err) {
        console.error("Error fetching location:", err);
        setLocation("Unable to fetch location");
        setError(true);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setLocation("Location access denied");
          setError(true);
        }
      );
    } else {
      setLocation("Geolocation not supported");
      setError(true);
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
        <div className="flex flex-col items-center gap-2">
          <Cloud className="h-16 w-16 opacity-70" />
          <span className="text-3xl font-bold">
            {weather ? weather.temp : "--"}°C
          </span>
          {weather && weather.description && (
            <p className="text-sm opacity-80 text-center">{weather.description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WeatherTile;
