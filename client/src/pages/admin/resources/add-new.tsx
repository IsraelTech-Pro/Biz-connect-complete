import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Link as LinkIcon, 
  Tag, 
  Plus,
  ArrowLeft,
  X,
  File,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface ResourceFile {
  name: string;
  url: string;
  type: string;
  size: string;
}

interface ExternalLink {
  name: string;
  url: string;
  description: string;
}

export default function AddResourceNew() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get admin token from localStorage
  const token = localStorage.getItem('admin_token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ResourceFile[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [newExternalLink, setNewExternalLink] = useState({ name: '', url: '', description: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'business-plan',
    resource_type: 'guide',
    tags: '',
    difficulty_level: 'beginner',
    estimated_time: '',
    status: 'published'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/admin/resources/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const result = await response.json();
      setUploadedFiles(prev => [...prev, ...result.files]);
      
      toast({
        title: "Success",
        description: `${result.files.length} file(s) uploaded successfully!`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addExternalLink = () => {
    if (newExternalLink.name && newExternalLink.url) {
      setExternalLinks(prev => [...prev, newExternalLink]);
      setNewExternalLink({ name: '', url: '', description: '' });
    }
  };

  const removeExternalLink = (index: number) => {
    setExternalLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resourceData = {
        ...formData,
        files: uploadedFiles,
        external_links: externalLinks,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
      });

      if (!response.ok) {
        throw new Error('Failed to add resource');
      }

      toast({
        title: "Success",
        description: "Resource added successfully!",
      });

      // Invalidate resources cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });

      navigate('/admin/resources');
    } catch (error) {
      console.error('Error adding resource:', error);
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ktu-grey p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ktu-deep-blue">Add New Resource</h1>
              <p className="text-ktu-dark-grey mt-2">Create a new business resource for students</p>
            </div>
            <Link to="/admin/resources">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-ktu-deep-blue flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Resource Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter resource title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business-plan">Business Plan</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="personal-development">Personal Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="resource_type">Type *</Label>
                    <Select value={formData.resource_type} onValueChange={(value) => handleSelectChange('resource_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="ebook">E-book</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                    <Select value={formData.difficulty_level} onValueChange={(value) => handleSelectChange('difficulty_level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimated_time">Estimated Time</Label>
                    <Input
                      id="estimated_time"
                      name="estimated_time"
                      value={formData.estimated_time}
                      onChange={handleInputChange}
                      placeholder="e.g., 30 minutes"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the resource"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Detailed content of the resource"
                    rows={6}
                    required
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <Label>Upload Files (PDF, Word, Excel, PowerPoint, etc.)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, Word, Excel, PowerPoint, Text, Images (Max 10MB each)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files</Label>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <File className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Links Section */}
                <div className="space-y-4">
                  <Label>External Links</Label>
                  
                  {/* Add New External Link */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Link name"
                        value={newExternalLink.name}
                        onChange={(e) => setNewExternalLink(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        placeholder="URL"
                        value={newExternalLink.url}
                        onChange={(e) => setNewExternalLink(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <Input
                      placeholder="Description (optional)"
                      value={newExternalLink.description}
                      onChange={(e) => setNewExternalLink(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <Button type="button" variant="outline" onClick={addExternalLink}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add External Link
                    </Button>
                  </div>

                  {/* External Links List */}
                  {externalLinks.length > 0 && (
                    <div className="space-y-2">
                      {externalLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <ExternalLink className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">{link.name}</p>
                              <p className="text-xs text-gray-500">{link.url}</p>
                              {link.description && <p className="text-xs text-gray-400">{link.description}</p>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExternalLink(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-ktu-orange hover:bg-ktu-orange-light text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Adding...' : 'Add Resource'}
                  </Button>
                  <Link to="/admin/resources">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}