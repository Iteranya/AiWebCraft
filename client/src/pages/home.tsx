import { useState, useRef, useEffect } from 'react';
import { useApiSettings } from '@/hooks/use-api-settings';
import { useEditorState } from '@/hooks/use-editor-state';
import CodeEditor from '@/components/code-editor';
import PreviewPane from '@/components/preview-pane';
import PromptInput from '@/components/prompt-input';
import SettingsModal from '@/components/settings-modal';
import ExportModal from '@/components/export-modal';
import { Button } from '@/components/ui/button';
import { Heart, Settings, Download, Loader2 } from 'lucide-react';

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const { settings, saveSettings, testConnection, isLoading, getUserId } = useApiSettings();
  const { 
    activeTab, 
    content, 
    isGenerating, 
    updateContent, 
    changeTab, 
    getCombinedContent, 
    generateFromAI 
  } = useEditorState();
  
  const [splitPosition, setSplitPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  // Handle resizing of split panes
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Limit resize within reasonable bounds (20% - 80%)
      if (newPosition > 20 && newPosition < 80) {
        setSplitPosition(newPosition);
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    const divider = dividerRef.current;
    if (divider) {
      divider.addEventListener('mousedown', handleMouseDown);
    }
    
    return () => {
      if (divider) {
        divider.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-background border-b py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Heart className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-semibold">AI Website Builder</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="gap-1"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </header>
      
      {/* Main container */}
      <div 
        ref={containerRef}
        className="flex flex-1 overflow-hidden"
      >
        {/* Left pane - Code Editor and Prompt Input */}
        <div 
          className="flex flex-col h-full overflow-hidden"
          style={{ width: `${splitPosition}%` }}
        >
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              activeTab={activeTab}
              content={content}
              onTabChange={changeTab}
              onContentChange={updateContent}
            />
          </div>
          
          <PromptInput 
            onGenerateCode={generateFromAI}
            apiSettings={settings}
            isGenerating={isGenerating}
            editorContent={content}
          />
        </div>
        
        {/* Divider */}
        <div 
          ref={dividerRef}
          className="w-1 bg-muted hover:bg-primary cursor-col-resize flex-shrink-0"
        />
        
        {/* Right pane - Preview */}
        <div 
          className="h-full overflow-hidden"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <PreviewPane content={getCombinedContent()} />
        </div>
      </div>
      
      {/* Loading overlay */}
      {(isLoading || isGenerating) && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card p-4 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm">{isGenerating ? "Generating website..." : "Loading..."}</p>
          </div>
        </div>
      )}
      
      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
        onTest={testConnection}
        isLoading={isLoading}
      />
      
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        content={content}
      />
    </div>
  );
}
