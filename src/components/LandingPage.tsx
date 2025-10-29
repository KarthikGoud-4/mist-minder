import { Card } from "@/components/ui/card";
import { MessageSquare, BookOpen, Cloud, Sparkles } from "lucide-react";
import WeatherTile from "./WeatherTile";

interface LandingPageProps {
  onStartChat: () => void;
}

const LandingPage = ({ onStartChat }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Cloud className="h-16 w-16 text-primary animate-pulse" />
              <Sparkles className="h-6 w-6 text-accent absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
            Weather Chat
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Get real-time weather updates with AI-powered natural language understanding
          </p>
        </header>

        <div className="tile-container">
          <Card
            className="tile cursor-pointer hover:scale-105 transition-transform duration-200 bg-card border-primary/20"
            onClick={onStartChat}
          >
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-foreground">
              <MessageSquare className="h-7 w-7 text-primary" />
              Chatbot Interface
            </h3>
            <p className="text-muted-foreground mb-4 flex-1">
              Start a conversation to get the weather forecast instantly.
            </p>
            <span className="tile-cta text-primary font-bold">Launch Chat →</span>
          </Card>

          <WeatherTile />

          <Card className="tile cursor-pointer hover:scale-105 transition-transform duration-200 bg-card border-primary/20">
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-foreground">
              <BookOpen className="h-7 w-7 text-accent" />
              Project Info
            </h3>
            <p className="text-muted-foreground mb-4 flex-1">
              Built with React, Vite, and OpenWeather API integration.
            </p>
            <span className="tile-cta text-accent font-bold">Learn More →</span>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
