import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Sparkles } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  weather?: any;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your weather assistant. Ask me about the weather in any city around the world!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("weather-chat", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        weather: data.weather,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error:", error);
      
      let errorMessage = "Sorry, I couldn't process your request. Please try again.";
      
      if (error.message?.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message?.includes("402")) {
        errorMessage = "AI service requires payment. Please add credits to continue.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Cloud className="h-12 w-12 text-primary animate-pulse-glow" />
              <Sparkles className="h-5 w-5 text-accent absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Weather Chat
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Get real-time weather updates with AI-powered natural language understanding
          </p>
        </header>

        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <div className="h-[500px] md:h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  message={msg.content}
                  isUser={msg.role === "user"}
                  weather={msg.weather}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Cloud className="h-4 w-4 text-primary-foreground animate-pulse" />
                  </div>
                  <Card className="p-4 bg-card border-primary/20">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-primary/20 p-4 md:p-6 bg-card/50 backdrop-blur">
              <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Index;
