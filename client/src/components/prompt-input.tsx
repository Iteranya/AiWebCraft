import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ApiSettings } from '@/lib/types';

interface PromptInputProps {
  onGenerateCode: (prompt: string, apiSettings: ApiSettings) => Promise<void>;
  apiSettings: ApiSettings;
  isGenerating: boolean;
}

export default function PromptInput({ 
  onGenerateCode, 
  apiSettings, 
  isGenerating 
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async () => {
    if (prompt.trim()) {
      await onGenerateCode(prompt, apiSettings);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="border-t border-x-0 border-b-0 rounded-none shadow-none">
      <CardContent className="p-2">
        <div className="flex items-start space-x-2">
          <Textarea
            placeholder="Describe the website you want to create..."
            className="min-h-[80px] resize-none flex-1 font-mono text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isGenerating || !prompt.trim() || !apiSettings.endpoint || !apiSettings.apiKey}
            className="mt-1"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        {(!apiSettings.endpoint || !apiSettings.apiKey) && (
          <p className="text-xs text-muted-foreground mt-1">
            Please configure your API settings before generating code.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
