import { useState, useRef, useCallback } from 'react';
import { Upload, X, Plus, Image as ImageIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  token?: string;
}

export function MultiImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  token 
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive"
          });
          continue;
        }
        
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a valid image`,
            variant: "destructive"
          });
          continue;
        }

        const imageUrl = await uploadImage(file);
        newImages.push(imageUrl);
      }

      onImagesChange([...images, ...newImages]);
      
      if (newImages.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${newImages.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange, token, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Images</h3>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={image}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 btn-orange-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                        Main
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewIndex(index)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Image Button */}
        {images.length < maxImages && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="border-2 border-dashed border-gray-300 hover:border-orange-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <CardContent className="p-0">
                <div className="aspect-square flex flex-col items-center justify-center space-y-2">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  ) : (
                    <>
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Add Image</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Drop Zone */}
      {images.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Product Images</h3>
          <p className="text-gray-500 mb-4">
            Drag & drop images here or click to select
          </p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Select Images'}
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, GIF up to 5MB each. Max {maxImages} images.
          </p>
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setPreviewIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[previewIndex]}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setPreviewIndex(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}