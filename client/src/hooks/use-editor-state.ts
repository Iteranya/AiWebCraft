import { useState, useCallback } from "react";
import { EditorContent, EditorTab } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Default initial content when the editor loads
const DEFAULT_CONTENT: EditorContent = {
  html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aina-chan | Quick Greeting</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #6c5ce7;
            --secondary: #a29bfe;
            --accent: #fd79a8;
            --dark: #2d3436;
            --light: #f5f6fa;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: var(--light);
            color: var(--dark);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 10px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
        }
        
        .aina-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid white;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            margin: 0 auto 1.5rem;
            display: block;
        }
        
        h1 {
            color: var(--primary);
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        
        p {
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
        }
        
        .signature {
            font-family: 'Brush Script MT', cursive;
            font-size: 1.8rem;
            color: var(--accent);
            margin-top: 1.5rem;
        }
        
        .disclaimer {
            font-size: 0.8rem;
            opacity: 0.7;
            margin-top: 2rem;
            padding: 1rem;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
        }
        
        .hearts {
            color: var(--accent);
            font-size: 1.5rem;
            margin: 1rem 0;
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        
        footer {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.9rem;
            color: var(--dark);
            opacity: 0.7;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        .social-link {
            color: var(--primary);
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }
        
        .social-link:hover {
            color: var(--accent);
            transform: translateY(-3px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <img src="https://i.imgur.com/VQ2eNhq.jpeg" alt="Aina-chan" class="aina-avatar">
            <h1>Hello from Aina-chan!</h1>
            <p>I'm your quick AI assistant here to help with web stuff when you're in a hurry.</p>
            <div class="hearts">
                <i class="fas fa-heart"></i>
                <i class="fas fa-heart"></i>
                <i class="fas fa-heart"></i>
            </div>
            <p>Remember: I'm faster, not necessarily better. Use my suggestions at your own discretion!</p>
            <div class="signature">- Aina-chan</div>
            
            <div class="disclaimer">
                <p><i class="fas fa-exclamation-triangle"></i> Disclaimer: Aina-chan generates quick solutions that may require developer review. Speed ≠ perfection. Always test before production use.</p>
            </div>
            
            <div class="social-links">
    <a href="https://github.com/Iteranya/AiWebCraft" class="social-link" target="_blank"><i class="fab fa-github"></i></a>
    <a href="https://discord.gg/Apr4MTE3vm" class="social-link" target="_blank"><i class="fab fa-discord"></i></a>
            </div>
        </div>
    </div>
    
    <footer>
        <p>Made with <i class="fas fa-heart" style="color: var(--accent);"></i> by Aina-chan | Not responsible for questionable color choices</p>
    </footer>
    
    <script>
        // Simple animation for the hearts
        const hearts = document.querySelectorAll('.fa-heart');
        
        setInterval(() => {
            hearts.forEach((heart, index) => {
                setTimeout(() => {
                    heart.style.animation = 'none';
                    void heart.offsetWidth; // Trigger reflow
                    heart.style.animation = 'pulse 1.5s infinite';
                }, index * 200);
            });
        }, 3000);
    </script>
</body>
</html>`,
  css: ``,
  js: ``
};

export function useEditorState() {
  const [activeTab, setActiveTab] = useState<EditorTab>("html");
  const [content, setContent] = useState<EditorContent>(DEFAULT_CONTENT);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Update content for the active tab
  const updateContent = useCallback((newContent: string) => {
    setContent(prev => ({
      ...prev,
      [activeTab]: newContent
    }));
  }, [activeTab]);

  // Change the active tab
  const changeTab = useCallback((tab: EditorTab) => {
    setActiveTab(tab);
  }, []);

  // Generate combinedContent for the preview
  const getCombinedContent = useCallback(() => {
    // Extract body content from HTML
    const bodyMatch = content.html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const headMatch = content.html.match(/<head[^>]*>([\s\S]*)<\/head>/i);

    let bodyContent = bodyMatch ? bodyMatch[1] : content.html;
    let headContent = headMatch ? headMatch[1] : '';

    // Create a complete HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>${content.css}</style>
  ${headContent}
</head>
<body>
  ${bodyContent}
  <script>${content.js}</script>
</body>
</html>`;
  }, [content]);

  // Generate code from AI with streaming
  const generateFromAI = useCallback(async (prompt: string, apiSettings: any) => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      // Switch to HTML tab to show streaming content
      setActiveTab("html");
      
      // Clear the HTML content to start fresh
      setContent(prev => ({
        ...prev,
        html: ''
      }));
      
      // Set up the streaming fetch request
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          ...apiSettings
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Set up event source for streaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }
      
      // Accumulate the complete response
      let accumulatedCode = '';
      const decoder = new TextDecoder();
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.content) {
                // Accumulate code
                accumulatedCode += data.content;
                
                // Update the editor with the accumulated content
                setContent(prev => {
                  // If we have a reasonably complete HTML document, use it directly
                  if (accumulatedCode.includes('<html') && accumulatedCode.includes('</html>')) {
                    return {
                      ...prev,
                      html: accumulatedCode
                    };
                  } 
                  // Otherwise, wrap it in a basic HTML structure
                  else {
                    return {
                      ...prev,
                      html: `${accumulatedCode}`
                    };
                  }
                });
              }
              
              if (data.done) {
                // Streaming is complete, parse the final code
                const finalCode = accumulatedCode;
                
                // Extract HTML, CSS, and JS from the complete response
                const htmlRegex = /<html[^>]*>([\s\S]*)<\/html>/i;
                const cssRegex = /<style[^>]*>([\s\S]*)<\/style>/i;
                const jsRegex = /<script[^>]*>([\s\S]*)<\/script>/i;
                
                const htmlMatch = finalCode.match(htmlRegex);
                const cssMatch = finalCode.match(cssRegex);
                const jsMatch = finalCode.match(jsRegex);
                
                const newContent = {
                  html: htmlMatch ? `<!DOCTYPE html>\n<html>${htmlMatch[1]}</html>` : finalCode,
                  css: cssMatch ? cssMatch[1] : content.css,
                  js: jsMatch ? jsMatch[1] : content.js
                };
                
                setContent(newContent);
                toast({
                  title: "Success",
                  description: "Website code generated successfully",
                });
                break;
              }
            } catch (e) {
              console.error('Error processing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content.css, content.js, toast]);

  // Reset to default content
  const resetContent = useCallback(() => {
    setContent(DEFAULT_CONTENT);
    toast({
      title: "Reset",
      description: "Editor content has been reset to default",
    });
  }, [toast]);

  return {
    activeTab,
    content,
    isGenerating,
    updateContent,
    changeTab,
    getCombinedContent,
    generateFromAI,
    resetContent
  };
}
