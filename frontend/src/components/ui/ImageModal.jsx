import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageModal({ imageUrl, title, onClose }) {
  const handleDownload = async () => {
    if (!imageUrl) {
      toast.error("No image to download.");
      return;
    }
    try {
      // Create a safe filename
      const safeTitle = (title || 'image').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeTitle}_${Date.now()}.png`; // Assuming PNG, or derive from URL if possible
      
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.target = '_blank'; // Open in new tab to ensure download
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try right-clicking the image to save it.");
    }
  };

  return (
    <Dialog open={!!imageUrl} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title || "Image Preview"}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow flex items-center justify-center overflow-hidden p-4">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title || "Image Preview"} 
              className="max-w-full max-h-full object-contain rounded-lg" 
            />
          ) : (
            <div className="text-center text-slate-500">No image to display.</div>
          )}
        </div>
        <DialogFooter className="flex justify-center sm:justify-end">
          <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}