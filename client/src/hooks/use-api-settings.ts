import { useState, useEffect } from "react";
import { ApiSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Default API settings if none are stored
const DEFAULT_API_SETTINGS: ApiSettings = {
  endpoint: "https://llm.chutes.ai/v1/chat/completions",
  apiKey: "",
  model: "gpt-3.5-turbo"
};

export function useApiSettings() {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_API_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Generate a unique user ID for storing settings if one doesn't exist
  const getUserId = (): string => {
    let userId = localStorage.getItem("ai_builder_user_id");
    if (!userId) {
      userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("ai_builder_user_id", userId);
    }
    return userId;
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("ai_builder_settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Error",
          description: "Failed to load API settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Save settings to localStorage and optionally to the server
  const saveSettings = async (newSettings: ApiSettings) => {
    try {
      setIsLoading(true);
      
      // Save to localStorage
      localStorage.setItem("ai_builder_settings", JSON.stringify(newSettings));
      
      // Also save to server if needed
      const userId = getUserId();
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...newSettings,
        }),
      });
      
      setSettings(newSettings);
      toast({
        title: "Success",
        description: "API settings saved successfully",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save API settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test the API connection
  const testConnection = async (settingsToTest?: ApiSettings) => {
    try {
      setIsLoading(true);
      const settingsForTest = settingsToTest || settings;
      
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsForTest),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "API connection successful",
        });
        return true;
      } else {
        toast({
          title: "Connection Failed",
          description: data.message || "Failed to connect to the API",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        title: "Error",
        description: "Failed to test API connection",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    saveSettings,
    testConnection,
    isLoading,
    getUserId,
  };
}
