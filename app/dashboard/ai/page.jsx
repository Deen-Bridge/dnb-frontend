"use client";

import {
  Bird,
  Book,
  Bot,
  Code2,
  CornerDownLeft,
  LifeBuoy,
  Mic,
  Paperclip,
  Rabbit,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  SquareUser,
  Triangle,
  ImageIcon,
  Turtle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";

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
      const response = await axiosInstance.post("/api/ai/chat", {
        message: userMessage,
      });

      const aiResponse = response.data.response;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid h-full w-full">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] justify-between items-center gap-1 border-b bg-background px-4">
          <div className="flex flex-col my-2">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text">
              Deen Bridge AI
            </h1>
            {/* <span className="text-sm">Your personal islamic ai</span> */}
          </div>
          <div>
            <Button
              round
              className="ml-auto w-full text-sm  text-white bg-accent hover:bg-highlight"
            >
              <Share className="size-3.5 pr-3" />
              Share
            </Button>
          </div>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            className="relative hidden flex-col items-start gap-8 md:flex"
            x-chunk="dashboard-03-chunk-0"
          >
            <div className="grid w-full items-start gap-6 ">
              <fieldset className="grid gap-6 rounded-lg border p-4 overflow-auto overscroll-y-auto">
                <legend className="-ml-1 px-1 text-md font-medium">
                  History
                </legend>
                <fieldset className="grid gap-6 rounded-lg border p-4 overflow-auto overscroll-y-auto">
                  <legend className="-ml-1 px-1 text-md font-medium">
                    Today
                  </legend>
                  {messages
                    .filter((msg) => msg.role === "user")
                    .map((msg, index) => (
                      <div key={index} className="grid gap-3">
                        <span className="text-sm">{msg.content}</span>
                      </div>
                    ))}
                </fieldset>
              </fieldset>
            </div>
          </div>
          <div className="relative flex  h-full flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge
              variant="outline"
              className="absolute right-3 top-3 border-accent"
            >
              Output
            </Badge>
            <div className="flex-1 overflow-y-auto mb-4">
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
                    Send Message
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
