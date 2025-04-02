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
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EditorContent } from '@/lib/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: EditorContent;
}

const formSchema = z.object({
  projectName: z.string().min(1, { message: "Project name is required" }),
  exportHtml: z.boolean().default(true),
  exportCss: z.boolean().default(true),
  exportJs: z.boolean().default(true),
  exportCombined: z.boolean().default(false),
});

export default function ExportModal({ isOpen, onClose, content }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "my-website",
      exportHtml: true,
      exportCss: true,
      exportJs: true,
      exportCombined: false,
    },
  });

  // Export files
  const handleExport = (data: z.infer<typeof formSchema>) => {
    setIsExporting(true);
    
    try {
      const { projectName, exportHtml, exportCss, exportJs, exportCombined } = data;
      
      // Create and download files based on selections
      if (exportHtml) {
        downloadFile(`${projectName}.html`, content.html);
      }
      
      if (exportCss) {
        downloadFile(`${projectName}.css`, content.css);
      }
      
      if (exportJs) {
        downloadFile(`${projectName}.js`, content.js);
      }
      
      if (exportCombined) {
        // Create a combined HTML file with embedded CSS and JS
        const combinedContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${content.css}
  </style>
</head>
<body>
${extractBodyContent(content.html)}
  <script>
${content.js}
  </script>
</body>
</html>`;
        
        downloadFile(`${projectName}-combined.html`, combinedContent);
      }
      
      onClose();
    } catch (error) {
      console.error('Error exporting files:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Extract body content from HTML
  const extractBodyContent = (html: string): string => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : html;
  };
  
  // Download file
  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Website</DialogTitle>
          <DialogDescription>
            Choose which files to export from your website project.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleExport)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="my-website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Export Options</FormLabel>
              
              <FormField
                control={form.control}
                name="exportHtml"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">HTML</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exportCss"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">CSS</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exportJs"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">JavaScript</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exportCombined"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Combined single HTML file</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Download Files"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
