import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorTab } from '@/lib/types';
import { useState, useCallback, useRef, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github-dark.css';

interface CodeEditorProps {
  activeTab: EditorTab;
  content: {
    html: string;
    css: string;
    js: string;
  };
  onTabChange: (tab: EditorTab) => void;
  onContentChange: (content: string) => void;
}

export default function CodeEditor({ 
  activeTab, 
  content, 
  onTabChange, 
  onContentChange 
}: CodeEditorProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightedCodeRef = useRef<HTMLPreElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Register highlight.js languages
  useEffect(() => {
    hljs.registerLanguage('html', html);
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('javascript', javascript);
  }, []);
  
  // Update highlighted code when content or active tab changes
  useEffect(() => {
    let code = content[activeTab];
    let language = activeTab === 'html' ? 'html' : activeTab === 'css' ? 'css' : 'javascript';
    
    try {
      const highlighted = hljs.highlight(code, { language }).value;
      setHighlightedCode(highlighted);
    } catch (error) {
      console.error('Highlighting error:', error);
      setHighlightedCode(code);
    }
  }, [content, activeTab]);
  
  // Sync scroll between textarea and highlighted code
  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current && highlightedCodeRef.current && scrollRef.current) {
        const { scrollTop } = editorRef.current;
        highlightedCodeRef.current.scrollTop = scrollTop;
        scrollRef.current.scrollTop = scrollTop;
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('scroll', handleScroll);
      return () => editor.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    onTabChange(value as EditorTab);
  };

  // Handle editor content change
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-0 rounded-none">
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="h-full flex flex-col"
      >
        <div className="bg-muted border-b px-2 pt-1">
          <TabsList className="bg-transparent h-9">
            <TabsTrigger value="html" className="data-[state=active]:bg-background">HTML</TabsTrigger>
            <TabsTrigger value="css" className="data-[state=active]:bg-background">CSS</TabsTrigger>
            <TabsTrigger value="js" className="data-[state=active]:bg-background">JS</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden bg-background p-0">
          <TabsContent value={activeTab} className="h-full m-0 p-0 data-[state=active]:flex-1">
            <div className="h-full w-full relative" ref={scrollRef}>
              {/* Highlighted Code - Positioned below the textarea but visible */}
              <pre 
                ref={highlightedCodeRef}
                className="absolute top-0 left-0 w-full h-full m-0 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap break-words"
                style={{ 
                  pointerEvents: 'none',
                  backgroundColor: '#1e293b' /* Slightly lighter dark background for better contrast */
                }}
              >
                <code 
                  className={`language-${activeTab === 'js' ? 'javascript' : activeTab}`}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
              
              {/* Actual Editable Textarea - Transparent background so highlighted code shows through */}
              <textarea
                ref={editorRef}
                value={content[activeTab]}
                onChange={handleTextareaChange}
                className="absolute top-0 left-0 w-full h-full p-4 font-mono text-sm border-none bg-transparent caret-white resize-none focus:outline-none z-10 whitespace-pre-wrap"
                spellCheck="false"
                autoCapitalize="off"
                autoCorrect="off"
                style={{ 
                  tabSize: 2,
                  color: 'rgba(255, 255, 255, 0.05)' /* Very faint text to maintain caret positioning */
                }}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
