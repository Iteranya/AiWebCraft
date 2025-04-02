import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ApiSettings } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSave: (settings: ApiSettings) => Promise<void>;
  onTest: (settings: ApiSettings) => Promise<boolean>;
  isLoading: boolean;
}

const formSchema = z.object({
  endpoint: z.string().url({ message: "Please enter a valid URL" }),
  apiKey: z.string().min(1, { message: "API Key is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  maxTokens: z.number().int().min(100, { message: "Minimum 100 tokens required" }).max(16000, { message: "Maximum 16000 tokens allowed" }),
});

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSave, 
  onTest, 
  isLoading 
}: SettingsModalProps) {
  const [isTesting, setIsTesting] = useState(false);

  // Initialize form with current settings
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: settings.endpoint,
      apiKey: settings.apiKey,
      model: settings.model,
      maxTokens: settings.maxTokens,
    },
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await onSave(data);
    onClose();
  };

  // Handle test connection
  const handleTestConnection = async () => {
    const formData = form.getValues();
    setIsTesting(true);
    await onTest(formData);
    setIsTesting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI compatible API endpoint.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI Compatible Endpoint</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://your-endpoint/v1/chat/completions" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="sk-..." 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter model name (e.g., gpt-3.5-turbo)" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Response Length (tokens)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="4000" 
                      min={100}
                      max={16000}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 4000)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex justify-between sm:justify-between items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isLoading || isTesting}
                className="text-xs sm:text-sm"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="text-xs sm:text-sm"
                >
                  Save Settings
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
