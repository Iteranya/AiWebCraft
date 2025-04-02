import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorTab } from '@/lib/types';
import { useState, useCallback, useRef } from 'react';

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
  const [editor, setEditor] = useState<any>(null);
  const monacoRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    onTabChange(value as EditorTab);
  };

  // Handle editor content change - using useCallback to avoid recreating function on every render
  const handleEditorChange = useCallback((value: string) => {
    onContentChange(value);
  }, [onContentChange]);

  // Use simple textarea as fallback (this is temporary until we figure out monaco editor issues)
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
            <div className="h-full w-full">
              <textarea
                value={content[activeTab]}
                onChange={handleTextareaChange}
                className="w-full h-full p-4 font-mono text-sm border-none bg-gray-900 text-white resize-none focus:outline-none"
                spellCheck="false"
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
