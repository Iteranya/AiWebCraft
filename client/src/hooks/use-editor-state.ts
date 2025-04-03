import { useState, useCallback } from "react";
import { EditorContent, EditorTab } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Default initial content when the editor loads
const DEFAULT_CONTENT: EditorContent = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <style>
    /* CSS will be injected from the CSS tab */
  </style>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>This is a simple website created with the AI Website Builder.</p>
  <p>Edit the HTML, CSS, and JS to create your own website.</p>
  <p>Use the AI prompt below to generate content for your website.</p>
  
  <script>
    // JavaScript will be injected from the JS tab
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
