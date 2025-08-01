import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, ExternalLink, Eye, Clock, Tag, 
  BookOpen, FileText, Video, Play, Calculator, CheckCircle,
  Calendar, User, Share2, Heart, Star, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ResourceFile {
  name: string;
  url: string;
  size?: string;
  type?: string;
}

interface ResourceLink {
  name: string;
  url: string;
  description?: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  resource_type: string;
  files: ResourceFile[];
  external_links: ResourceLink[];
  tags: string[];
  difficulty_level: string;
  estimated_time?: string;
  status: string;
  views: number;
  downloads: number;
  thumbnail_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch resource details
  const { data: resource, isLoading, isError } = useQuery({
    queryKey: ['/api/resources', id],
    queryFn: async () => {
      const response = await fetch(`/api/resources/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resource');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Track resource view
  const viewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/resources/${id}/view`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to track view');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources', id] });
    },
  });

  // Track file download
  const downloadMutation = useMutation({
    mutationFn: async (fileUrl: string) => {
      const response = await fetch(`/api/resources/${id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      });
      if (!response.ok) {
        throw new Error('Failed to track download');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources', id] });
    },
  });

  React.useEffect(() => {
    if (resource && !viewMutation.isPending) {
      viewMutation.mutate();
    }
  }, [resource]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'guide': return BookOpen;
      case 'template': return FileText;
      case 'video': return Video;
      case 'webinar': return Play;
      case 'tool': return Calculator;
      case 'checklist': return CheckCircle;
      case 'ebook': return BookOpen;
      default: return FileText;
    }
  };

  const handleFileDownload = async (file: ResourceFile) => {
    try {
      // Track the download
      await downloadMutation.mutateAsync(file.url);
      
      // Trigger file download
      const response = await fetch(file.url);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download started",
          description: `Downloading ${file.name}`,
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file.",
        variant: "destructive",
      });
    }
  };

  const handleExternalLink = (link: ResourceLink) => {
    window.open(link.url, '_blank');
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const Icon = resource ? getIcon(resource.resource_type) : FileText;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ktu-grey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ktu-orange"></div>
          <p className="mt-4 text-ktu-deep-blue">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="min-h-screen bg-ktu-grey flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ktu-deep-blue mb-4">Resource Not Found</h2>
          <p className="text-ktu-dark-grey mb-6">The resource you're looking for doesn't exist.</p>
          <Link href="/resources">
            <Button className="bg-ktu-orange hover:bg-ktu-orange-light">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ktu-grey">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link href="/resources">
          <Button variant="ghost" className="mb-6 text-ktu-deep-blue hover:text-ktu-orange">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-6"
            >
              {/* Header */}
              <Card className="ktu-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-ktu-light-blue">
                        <Icon className="h-8 w-8 text-ktu-deep-blue" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-ktu-deep-blue mb-2">{resource.title}</h1>
                        
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(resource.difficulty_level)}>
                        {resource.difficulty_level}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-ktu-dark-grey mb-4">{resource.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-ktu-orange border-ktu-orange">
                      {resource.category.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-ktu-deep-blue border-ktu-deep-blue">
                      {resource.resource_type}
                    </Badge>
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Tabs */}
              <Card className="ktu-card">
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="files">Files ({resource.files?.length || 0})</TabsTrigger>
                      <TabsTrigger value="links">Links ({resource.external_links?.length || 0})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-ktu-dark-grey leading-relaxed">
                          {resource.content}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="mt-6">
                      {resource.files && resource.files.length > 0 ? (
                        <div className="space-y-4">
                          {resource.files.map((file, index) => (
                            <Card key={index} className="border border-ktu-light-blue">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="h-8 w-8 text-ktu-orange" />
                                    <div>
                                      <h4 className="font-medium text-ktu-deep-blue">{file.name}</h4>
                                      {file.size && (
                                        <p className="text-sm text-ktu-dark-grey">Size: {file.size}</p>
                                      )}
                                      {file.type && (
                                        <p className="text-sm text-ktu-dark-grey">Type: {file.type}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Button 
                                    onClick={() => handleFileDownload(file)}
                                    className="bg-ktu-orange hover:bg-ktu-orange-light"
                                    disabled={downloadMutation.isPending}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-ktu-dark-grey opacity-50" />
                          <p className="text-ktu-dark-grey">No files available for this resource.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="links" className="mt-6">
                      {resource.external_links && resource.external_links.length > 0 ? (
                        <div className="space-y-4">
                          {resource.external_links.map((link, index) => (
                            <Card key={index} className="border border-ktu-light-blue">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <ExternalLink className="h-8 w-8 text-ktu-orange" />
                                    <div>
                                      <h4 className="font-medium text-ktu-deep-blue">{link.name}</h4>
                                      {link.description && (
                                        <p className="text-sm text-ktu-dark-grey">{link.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Button 
                                    onClick={() => handleExternalLink(link)}
                                    variant="outline"
                                    className="border-ktu-deep-blue text-ktu-deep-blue hover:bg-ktu-deep-blue hover:text-white"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ExternalLink className="h-16 w-16 mx-auto mb-4 text-ktu-dark-grey opacity-50" />
                          <p className="text-ktu-dark-grey">No external links available for this resource.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resource Info */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="ktu-card">
                <CardHeader>
                  <CardTitle className="text-ktu-deep-blue">Resource Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-ktu-dark-grey">Category:</span>
                    <span className="text-ktu-deep-blue font-medium">
                      {resource.category.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ktu-dark-grey">Type:</span>
                    <span className="text-ktu-deep-blue font-medium">{resource.resource_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ktu-dark-grey">Difficulty:</span>
                    <Badge className={getDifficultyColor(resource.difficulty_level)}>
                      {resource.difficulty_level}
                    </Badge>
                  </div>
                  {resource.estimated_time && (
                    <div className="flex justify-between">
                      <span className="text-ktu-dark-grey">Duration:</span>
                      <span className="text-ktu-deep-blue font-medium">{resource.estimated_time}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-ktu-dark-grey">Created:</span>
                    <span className="text-ktu-deep-blue font-medium">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Resources */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="ktu-card">
                <CardHeader>
                  <CardTitle className="text-ktu-deep-blue">Related Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ktu-dark-grey text-sm text-center py-4">
                    Related resources will be shown here based on category and tags.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}