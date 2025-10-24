import { Bot, User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  weather?: {
    city: string;
    country: string;
    temperature: number;
    feelsLike: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
}

const ChatMessage = ({ message, isUser, weather }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isUser ? "bg-accent" : "bg-primary"
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-accent-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      
      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <Card className={`p-4 ${
          isUser 
            ? "bg-accent text-accent-foreground" 
            : "bg-card border-primary/20"
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </Card>
        
        {weather && !isUser && (
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <div className="flex items-center gap-3">
              <img 
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-16 h-16"
              />
              <div>
                <h3 className="font-semibold text-lg">
                  {weather.city}, {weather.country}
                </h3>
                <p className="text-2xl font-bold text-primary">
                  {weather.temperature}°C
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {weather.description}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
