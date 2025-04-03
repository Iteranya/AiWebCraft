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
            --card-bg: white;
            --text-color: #2d3436;
            --footer-bg: transparent;
        }

        [data-theme="dark"] {
            --primary: #a29bfe;
            --secondary: #6c5ce7;
            --accent: #ff9ff3;
            --dark: #f5f6fa;
            --light: #2d3436;
            --card-bg: #1e272e;
            --text-color: #f5f6fa;
            --footer-bg: rgba(0, 0, 0, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        body {
            background-color: var(--light);
            color: var(--text-color);
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
            background: var(--card-bg);
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
            border: 5px solid var(--card-bg);
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
            color: var(--text-color);
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
            color: var(--text-color);
            opacity: 0.7;
            background-color: var(--footer-bg);
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

        .theme-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: none;
            color: var(--primary);
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
        }

        .theme-toggle:hover {
            color: var(--accent);
            transform: rotate(30deg);
        }

        .theme-toggle:focus {
            outline: none;
        }

        [data-theme="dark"] .disclaimer {
            background-color: rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body>
    <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
        <i class="fas fa-moon"></i>
    </button>

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

        // Dark mode toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;
        let darkMode = localStorage.getItem('darkMode') === 'true';

        // Apply saved theme
        if (darkMode) {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            darkMode = !darkMode;
            localStorage.setItem('darkMode', darkMode);

            if (darkMode) {
                body.setAttribute('data-theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                body.removeAttribute('data-theme');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });

        // Add smooth transition when page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            }, 100);
        });
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
      // Use functional update to preserve current css and js
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

                // Update the editor with the accumulated content (HTML only for now)
                setContent(prev => {
                  // Try to format reasonably during streaming if possible
                  let currentHtml = accumulatedCode;
                  if (accumulatedCode.includes('<html') && accumulatedCode.includes('</html>')) {
                     currentHtml = accumulatedCode;
                  } else if (accumulatedCode.includes('<body') && accumulatedCode.includes('</body>')) {
                     // If body tags exist, assume it's body content
                     currentHtml = `<!DOCTYPE html>\n<html>\n<head>\n <title>Generating...</title>\n</head>\n<body>${accumulatedCode}</body>\n</html>`;
                  } else {
                    // Otherwise just stream raw content maybe wrapped minimally
                     currentHtml = `${accumulatedCode}`;
                  }
                  return {
                    ...prev, // Keep existing css, js
                    html: currentHtml // Update html as it streams
                  };
                });
              }

              if (data.done) {
                // Streaming is complete, parse the final code
                const finalCode = accumulatedCode;

                // Extract HTML content
                const htmlRegex = /<html[^>]*>([\s\S]*)<\/html>/i;
                const htmlMatch = finalCode.match(htmlRegex);

                // Prepare the final HTML state
                const finalHtml = htmlMatch
                  ? `<!DOCTYPE html>\n<html>${htmlMatch[1]}</html>` // Use extracted content if full HTML found
                  : finalCode; // Otherwise, use the full accumulated code as HTML

                // *** HARDCODING APPLIED HERE ***
                // Update only the HTML content, keeping the previous CSS and JS
                setContent(prev => ({
                  ...prev,          // Keep all previous state properties...
                  html: finalHtml   // ...except update the HTML
                  // css: prev.css, // Explicitly showing css is kept (implicitly done by ...prev)
                  // js: prev.js    // Explicitly showing js is kept (implicitly done by ...prev)
                }));

                toast({
                  title: "Success",
                  description: "Website code generated successfully",
                });
                // No need to break here, the outer loop condition (done) handles it
              }
            } catch (e) {
              console.error('Error processing stream data:', e);
              // Optionally, display an error toast here as well
               toast({
                 title: "Stream Error",
                 description: e instanceof Error ? e.message : "Error processing generated content",
                 variant: "destructive",
               });
               // We might want to stop processing if a chunk fails
               reader.cancel(); // Attempt to cancel the stream reader
               break; // Exit the inner loop
            }
          }
        }
         if (done) break; // Exit the while loop if done flag received outside data block too
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
  // Removed content.css and content.js from dependencies as they are now read via functional update `prev`
  }, [toast]); // Dependencies updated


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