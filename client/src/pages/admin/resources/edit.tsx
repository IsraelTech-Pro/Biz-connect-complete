import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, ExternalLink, FileText, Download, Eye, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface ResourceFile {
  name: string;
  url: string;
  size: string;
  type: string;
}

interface ExternalLink {
  name: string;
  url: string;
  description: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  resource_type: string;
  difficulty_level: string;
  estimated_time: string;
  status: string;
  tags: string[];
  files: ResourceFile[];
  external_links: ExternalLink[];
  thumbnail_url?: string;
}

export default function EditResource() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get admin token from localStorage
  const token = localStorage.getItem('admin_token');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    resource_type: '',
    difficulty_level: '',
    estimated_time: '',
    status: 'draft',
    tags: ''
  });

  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '' });

  // Load existing resource data
  useEffect(() => {
    if (!id || !token) return;

    const loadResource = async () => {
      try {
        const response = await fetch(`/api/admin/resources/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load resource');

        const resource: Resource = await response.json();
        
        setFormData({
          title: resource.title || '',
          description: resource.description || '',
          content: resource.content || '',
          category: resource.category || '',
          resource_type: resource.resource_type || '',
          difficulty_level: resource.difficulty_level || '',
          estimated_time: resource.estimated_time || '',
          status: resource.status || 'draft',
          tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ''
        });

        setFiles(resource.files || []);
        setExternalLinks(resource.external_links || []);
      } catch (error) {
        console.error('Error loading resource:', error);
        toast({
          title: "Error",
          description: "Failed to load resource details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadResource();
  }, [id, token, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const uploadData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      uploadData.append('files', file);
    });

    try {
      const response = await fetch('/api/admin/resources/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });

      if (!response.ok) throw new Error('Failed to upload files');

      const result = await response.json();
      setFiles(prev => [...prev, ...result.files]);
      
      toast({
        title: "Success",
        description: `${result.files.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addExternalLink = () => {
    if (!newLink.name || !newLink.url) {
      toast({
        title: "Error",
        description: "Please provide both name and URL for the external link",
        variant: "destructive",
      });
      return;
    }

    setExternalLinks(prev => [...prev, newLink]);
    setNewLink({ name: '', url: '', description: '' });
  };

  const removeExternalLink = (index: number) => {
    setExternalLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        files,
        external_links: externalLinks,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };

      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update resource');
      }

      toast({
        title: "Success",
        description: "Resource updated successfully",
      });

      // Invalidate resources cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });

      navigate('/admin/resources');
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ktu-grey p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ktu-orange mx-auto mb-4"></div>
          <p className="text-ktu-dark-grey">Loading resource...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ktu-grey p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin/resources">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ktu-deep-blue">Edit Resource</h1>
            <p className="text-ktu-dark-grey mt-2">Update business resource information</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-ktu-deep-blue">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-ktu-deep-blue font-medium">
                    Resource Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter resource title..."
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-ktu-deep-blue font-medium">
                    Short Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the resource..."
                    required
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-ktu-deep-blue font-medium">
                    Full Content
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Detailed content and information..."
                    className="mt-1"
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-ktu-deep-blue font-medium">
                      Category *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="mt-1">
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

                  <div>
                    <Label htmlFor="resource_type" className="text-ktu-deep-blue font-medium">
                      Resource Type
                    </Label>
                    <Select value={formData.resource_type} onValueChange={(value) => handleInputChange('resource_type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="ebook">E-book</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty_level" className="text-ktu-deep-blue font-medium">
                      Difficulty Level
                    </Label>
                    <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="estimated_time" className="text-ktu-deep-blue font-medium">
                      Estimated Time
                    </Label>
                    <Input
                      id="estimated_time"
                      value={formData.estimated_time}
                      onChange={(e) => handleInputChange('estimated_time', e.target.value)}
                      placeholder="e.g., 30-45 minutes"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags" className="text-ktu-deep-blue font-medium">
                      Tags (comma-separated)
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., business, startup, finance"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-ktu-deep-blue font-medium">
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-ktu-deep-blue">Files & Downloads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-ktu-deep-blue font-medium">
                    Upload Files (PDF, Word, Excel, PowerPoint - Max 10MB each)
                  </Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleFileUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ktu-orange file:text-white hover:file:bg-ktu-orange-light"
                    />
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-ktu-deep-blue">Uploaded Files:</h4>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-ktu-orange" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* External Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-ktu-deep-blue">External Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="link-name" className="text-ktu-deep-blue font-medium">
                      Link Name
                    </Label>
                    <Input
                      id="link-name"
                      value={newLink.name}
                      onChange={(e) => setNewLink(prev => ({...prev, name: e.target.value}))}
                      placeholder="Resource name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="link-url" className="text-ktu-deep-blue font-medium">
                      URL
                    </Label>
                    <Input
                      id="link-url"
                      value={newLink.url}
                      onChange={(e) => setNewLink(prev => ({...prev, url: e.target.value}))}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="link-description" className="text-ktu-deep-blue font-medium">
                      Description
                    </Label>
                    <Input
                      id="link-description"
                      value={newLink.description}
                      onChange={(e) => setNewLink(prev => ({...prev, description: e.target.value}))}
                      placeholder="Brief description"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addExternalLink}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add External Link
                </Button>

                {externalLinks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-ktu-deep-blue">External Links:</h4>
                    {externalLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <ExternalLink className="w-5 h-5 text-ktu-orange" />
                          <div>
                            <p className="font-medium text-sm">{link.name}</p>
                            <p className="text-xs text-gray-500">{link.description}</p>
                            <p className="text-xs text-blue-600">{link.url}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeExternalLink(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-ktu-orange hover:bg-ktu-orange-light text-white px-8"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Resource'
              )}
            </Button>
            <Link to="/admin/resources">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </motion.div>
        </form>
      </div>
    </div>
  );
}