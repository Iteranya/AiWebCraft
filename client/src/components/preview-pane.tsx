import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Tablet, Monitor, RotateCw } from 'lucide-react';
import { PreviewDevice } from '@/lib/types';

interface PreviewPaneProps {
  content: string;
}

const previewDevices: PreviewDevice[] = [
  { name: 'mobile', width: '375px', icon: 'Smartphone' },
  { name: 'tablet', width: '768px', icon: 'Tablet' },
  { name: 'desktop', width: '100%', icon: 'Monitor' },
];

export default function PreviewPane({ content }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeDevice, setActiveDevice] = useState<string>('desktop');
  
  // Update the iframe content when content changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
      }
    }
  }, [content]);
  
  // Refresh the preview
  const refreshPreview = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
      }
    }
  };
  
  // Get icon component based on device name
  const getDeviceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="h-4 w-4" />;
      case 'Tablet':
        return <Tablet className="h-4 w-4" />;
      case 'Monitor':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };
  
  // Get the width for the current device
  const getPreviewWidth = () => {
    const device = previewDevices.find(d => d.name === activeDevice);
    return device ? device.width : '100%';
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
      <CardHeader className="border-b py-2 px-4 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
        <div className="flex items-center space-x-1">
          <Tabs value={activeDevice} onValueChange={setActiveDevice}>
            <TabsList className="h-8 bg-muted">
              {previewDevices.map((device) => (
                <TabsTrigger
                  key={device.name}
                  value={device.name}
                  className="px-2 py-1"
                >
                  {getDeviceIcon(device.icon)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refreshPreview}
            title="Refresh preview"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 overflow-auto bg-gray-50 h-full">
        <div 
          className="bg-white mx-auto h-full overflow-auto transition-all duration-200 flex justify-center" 
          style={{ width: getPreviewWidth() }}
        >
          <iframe
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </CardContent>
    </Card>
  );
}
