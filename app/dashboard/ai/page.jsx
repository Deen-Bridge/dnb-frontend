"use client";
import {
  Bot,
  CornerDownLeft,
  Mic,
  Paperclip,
  Share,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full AI Response:", data);
      const aiResponse = data.response;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);

      // Store chat history if needed
      if (data.history) {
        // You can use this to populate the history sidebar
        console.log("Chat history:", data.history);
      }
    } catch (error) {
      console.error("Error getting AI response:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.details ||
        error.message ||
        "Failed to get AI response. Please try again.";

      toast.error(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid  w-full overflow-y-hidden overscroll-none absolute h-full pt-16">
      <div className="flex flex-col h-full">
       
        <div className="grid flex-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 h-[calc(100%-57px)]">
         
          <div className="relative flex flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge
              variant="outline"
              className="absolute right-3 top-3 border-accent"
            >
              Output
            </Badge>
            <div className="relative flex-1 overflow-y-auto mb-4 overscroll-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded-lg ${
                    message.role === "user"
                      ? "bg-accent/10 ml-auto max-w-[80%]"
                      : "bg-background mr-auto max-w-[80%]"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot className="size-4 animate-bounce" />
                  AI is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-accent"
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center p-3 pt-0">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Paperclip className="size-4" />
                        <span className="sr-only">Attach file</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Attach File</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ImageIcon className="size-4" />
                        <span className="sr-only">Attach Image</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Attach Image</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Mic className="size-4" />
                        <span className="sr-only">Use Microphone</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Use Microphone</TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <Button
                    round
                    type="submit"
                    className="text-sm ml-auto gap-1.5 text-white flex justify-end bg-accent hover:bg-highlight"
                    disabled={isLoading || !inputMessage.trim()}
                  >
                  
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
