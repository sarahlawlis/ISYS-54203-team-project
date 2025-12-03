import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ChevronDown, X, Send, User, Bot, RefreshCw } from "lucide-react";
import type { Attribute } from "@shared/schema";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestedAttributes?: Attribute[];
  timestamp: Date;
}

interface AttributeSuggestionsProps {
  suggestions: Attribute[];
  isLoading: boolean;
  onAddAttribute: (attribute: Attribute) => void;
  onRefresh: () => void;
  onSendMessage: (message: string) => Promise<{ response: string; attributes?: Attribute[] }>;
}

export function AttributeSuggestions({
  suggestions,
  isLoading,
  onAddAttribute,
  onRefresh,
  onSendMessage,
}: AttributeSuggestionsProps) {
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized by default
  const [isHidden, setIsHidden] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const { response, attributes } = await onSendMessage(inputValue);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        suggestedAttributes: attributes,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Only hide if user explicitly closed it
  if (isHidden) {
    return null;
  }

  // Minimized view - chatbot-style pill (always visible)
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 text-white shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105"
        >
          <Sparkles className="h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm">Form Assistant</span>
            {suggestions.length > 0 ? (
              <span className="text-xs opacity-90">{suggestions.length} suggestions ready</span>
            ) : (
              <span className="text-xs opacity-90">Click to chat</span>
            )}
          </div>
        </button>
      </div>
    );
  }

  // Expanded view - chat interface
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] flex flex-col rounded-lg bg-white dark:bg-gray-950 shadow-2xl border border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            Form Assistant
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHidden(true)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Sparkles className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Welcome to Form Assistant!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              I can help you build your form by suggesting relevant attributes. Try asking me:
            </p>
            <div className="space-y-2 text-xs text-left w-full">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                "What fields do I need for a project form?"
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                "Suggest attributes for tracking tasks"
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                "I need fields for contact information"
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div className={`flex flex-col max-w-[75%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.suggestedAttributes && message.suggestedAttributes.length > 0 && (
                    <div className="mt-2 space-y-2 w-full">
                      {message.suggestedAttributes.map((attr) => {
                        const Icon = attr.icon as any;
                        return (
                          <div
                            key={attr.id}
                            className="flex items-center justify-between p-2 rounded-lg border border-blue-200 bg-white dark:bg-gray-900 dark:border-blue-800 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                                <Icon className="h-3 w-3 text-blue-700 dark:text-blue-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">
                                  {attr.name}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => onAddAttribute(attr)}
                              className="ml-2 h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Add
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-blue-200 dark:border-blue-800 bg-gray-50 dark:bg-gray-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about form attributes..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
