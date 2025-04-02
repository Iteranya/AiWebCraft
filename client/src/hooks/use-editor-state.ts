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
  css: `body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

h1 {
  color: #2563eb;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
}

p {
  margin-bottom: 16px;
}`,
  js: `// Add your JavaScript code here
document.addEventListener('DOMContentLoaded', () => {
  console.log('Website loaded successfully!');
});`
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

  // Generate code from AI
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate code");
      }

      const data = await response.json();
      
      if (data.success && data.code) {
        // Parse the generated code to extract HTML, CSS, and JS
        const htmlRegex = /<html[^>]*>([\s\S]*)<\/html>/i;
        const cssRegex = /<style[^>]*>([\s\S]*)<\/style>/i;
        const jsRegex = /<script[^>]*>([\s\S]*)<\/script>/i;
        
        const htmlMatch = data.code.match(htmlRegex);
        const cssMatch = data.code.match(cssRegex);
        const jsMatch = data.code.match(jsRegex);
        
        const newContent = {
          html: htmlMatch ? `<!DOCTYPE html>\n<html>${htmlMatch[1]}</html>` : data.code,
          css: cssMatch ? cssMatch[1] : content.css,
          js: jsMatch ? jsMatch[1] : content.js
        };
        
        setContent(newContent);
        toast({
          title: "Success",
          description: "Website code generated successfully",
        });
      } else {
        throw new Error("No code was generated");
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
