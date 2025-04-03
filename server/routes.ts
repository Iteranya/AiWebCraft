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

  // API endpoint for generating code from AI (streaming version)
  app.post("/api/generate", async (req: Request, res: Response) => {
    // Set headers for server-sent events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Validate the request
      const validatedData = aiRequestSchema.parse(req.body);
      const { prompt, endpoint, apiKey, model, maxTokens } = validatedData;
      
      // Prepare OpenAI API request with streaming enabled
      const apiRequest = {
        model,
        messages: [
          {
            role: "system",
            content: "ONLY USE HTML, CSS AND JAVASCRIPT. If you want to use ICON make sure to import the library first. Try to create the best UI possible by using only HTML, CSS and JAVASCRIPT. Also, try to ellaborate as much as you can, to create something unique. ALWAYS GIVE THE RESPONSE INTO A SINGLE HTML FILE"
          },
          {
            role: "user",
            content: prompt
          },
          {
            role: "assistant",
            content: "```html\n"
          },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        stream: true, // Enable streaming
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      };
      
      // Call the OpenAI-compatible API with streaming
      const response = await axios.post(
        endpoint,
        apiRequest,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          responseType: 'stream'
        }
      );
      
      // Handle streaming response
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              // Extract the content delta if available
              const content = data.choices[0]?.delta?.content || '';
              if (content) {
                // Send the content chunk to the client
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              console.error('Error parsing streaming response:', e);
            }
          }
        }
      });
      
      response.data.on('end', () => {
        // Send a done event when the stream ends
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      });
      
      // Handle errors in the stream
      response.data.on('error', (err: Error) => {
        console.error('Stream error:', err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      });
      
    } catch (error) {
      console.error("Error generating code:", error);
      
      if (error instanceof ZodError) {
        res.write(`data: ${JSON.stringify({ 
          error: "Invalid request data", 
          details: error.errors 
        })}\n\n`);
      } else if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || "Error calling the AI API";
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate code" })}\n\n`);
      }
      
      res.end();
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
