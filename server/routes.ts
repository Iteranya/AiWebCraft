import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiRequestSchema } from "@shared/schema";
import axios from "axios";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for getting user API settings
  app.get("/api/settings/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const settings = await storage.getApiSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      // Don't expose the full API key to the client
      const maskedSettings = {
        ...settings,
        apiKey: settings.apiKey.slice(0, 3) + "..." + settings.apiKey.slice(-3),
      };
      
      res.json(maskedSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // API endpoint for saving user API settings
  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const { userId, endpoint, apiKey, model } = req.body;
      
      if (!userId || !endpoint || !apiKey || !model) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const settings = await storage.saveApiSettings({
        userId,
        endpoint,
        apiKey,
        model
      });
      
      // Don't expose the full API key to the client
      const maskedSettings = {
        ...settings,
        apiKey: settings.apiKey.slice(0, 3) + "..." + settings.apiKey.slice(-3),
      };
      
      res.json(maskedSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Test API connection
  app.post("/api/test-connection", async (req: Request, res: Response) => {
    try {
      const { endpoint, apiKey, model } = req.body;
      
      if (!endpoint || !apiKey || !model) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Make a simple request to the provided endpoint to test connection
      const response = await axios.post(
        endpoint,
        {
          model,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      
      if (response.status >= 200 && response.status < 300) {
        res.json({ success: true, message: "Connection successful" });
      } else {
        res.status(response.status).json({ success: false, message: "Connection failed" });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      let errorMessage = "Failed to connect to API";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error?.message || errorMessage;
      }
      
      res.status(500).json({ success: false, message: errorMessage });
    }
  });

  // API endpoint for generating code from AI
  app.post("/api/generate", async (req: Request, res: Response) => {
    try {
      // Validate the request
      const validatedData = aiRequestSchema.parse(req.body);
      const { prompt, endpoint, apiKey, model } = validatedData;
      
      // Prepare OpenAI API request
      const apiRequest = {
        model,
        messages: [
          {
            role: "system",
            content: "You are a web developer assistant. Generate clean, valid HTML, CSS, and JavaScript code based on the user's request. Provide the code in an appropriate format without any additional explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      };
      
      // Call the OpenAI-compatible API
      const response = await axios.post(
        endpoint,
        apiRequest,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      
      // Extract the generated content
      const generatedCode = response.data.choices[0].message.content;
      
      // Return the generated code to the client
      res.json({ 
        success: true, 
        code: generatedCode
      });
    } catch (error) {
      console.error("Error generating code:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error?.message || "Error calling the AI API";
        
        return res.status(statusCode).json({ 
          success: false, 
          message: errorMessage 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate code" 
      });
    }
  });

  // API endpoint for saving projects
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const { userId, name, htmlContent, cssContent, jsContent } = req.body;
      
      if (!userId || !name || !htmlContent) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const now = new Date().toISOString();
      
      const project = await storage.createProject({
        userId,
        name,
        htmlContent,
        cssContent: cssContent || "",
        jsContent: jsContent || "",
        createdAt: now,
        updatedAt: now
      });
      
      res.json({ success: true, project });
    } catch (error) {
      console.error("Error saving project:", error);
      res.status(500).json({ success: false, message: "Failed to save project" });
    }
  });

  // API endpoint for getting user projects
  app.get("/api/projects/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const projects = await storage.getUserProjects(userId);
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
