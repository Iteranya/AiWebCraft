import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Tablet, Monitor, RotateCw } from 'lucide-react';
import { PreviewDevice } from '@/lib/types'; // Assuming this type definition exists

interface PreviewPaneProps {
  content: string; // HTML content string
}

const previewDevices: PreviewDevice[] = [
  { name: 'mobile', width: '375px', icon: 'Smartphone' },
  { name: 'tablet', width: '768px', icon: 'Tablet' },
  { name: 'desktop', width: '100%', icon: 'Monitor' },
];

// Helper to get Lucide icon components dynamically
// (Improved for type safety and clarity if possible, but keeping original logic)
const getDeviceIcon = (iconName: string) => {
  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className="h-4 w-4" />;
    case 'Tablet':
      return <Tablet className="h-4 w-4" />;
    case 'Monitor':
      return <Monitor className="h-4 w-4" />;
    default:
      // Fallback icon
      return <Monitor className="h-4 w-4" />;
  }
};


export default function PreviewPane({ content }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeDevice, setActiveDevice] = useState<string>('desktop');

  // Update the iframe content using srcdoc when 'content' prop changes
  useEffect(() => {
    if (iframeRef.current) {
      // Use srcdoc for safer and more reliable content injection
      // This triggers a full reload of the iframe content
      iframeRef.current.srcdoc = content;
    }
  }, [content]); // Re-run only when content changes

  // Refresh the preview by reapplying the current content to srcdoc
  const refreshPreview = () => {
    if (iframeRef.current) {
      // Re-assigning srcdoc forces the iframe to reload the content
      iframeRef.current.srcdoc = content;
    }
  };

  // Get the width for the current device view
  const getPreviewWidth = () => {
    const device = previewDevices.find(d => d.name === activeDevice);
    return device ? device.width : '100%';
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
      <CardHeader className="border-b py-2 px-4 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
        <div className="flex items-center space-x-1">
          {/* Device selection tabs */}
          <Tabs value={activeDevice} onValueChange={setActiveDevice}>
            <TabsList className="h-8 bg-muted">
              {previewDevices.map((device) => (
                <TabsTrigger
                  key={device.name}
                  value={device.name}
                  className="px-2 py-1"
                  aria-label={`Switch to ${device.name} view`}
                >
                  {getDeviceIcon(device.icon)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refreshPreview}
            title="Refresh preview"
            aria-label="Refresh preview"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 overflow-auto bg-gray-100 dark:bg-gray-800 h-full">
        {/* Container to center and apply width */}
        <div
          className="bg-background mx-auto h-full overflow-auto shadow-md transition-all duration-300 ease-in-out flex justify-center border border-border"
          style={{ width: getPreviewWidth() }}
        >
          <iframe
            ref={iframeRef}
            title="Preview Content" // More descriptive title
            className="w-full h-full border-0"
            // sandbox is crucial for security and isolating the preview
            // 'allow-scripts' permits JavaScript execution.
            // 'allow-same-origin' is often needed for scripts expecting an origin,
            // though srcdoc content typically gets a unique opaque origin.
            // Add other permissions like 'allow-forms' or 'allow-popups' if
            // the previewed content needs them, but be cautious.
            sandbox="allow-scripts allow-same-origin"
            // We are now using srcdoc, remove src if previously used for blobs etc.
            // srcdoc={content} // Set via useEffect instead to manage updates
          />
        </div>
      </CardContent>
    </Card>
  );
}