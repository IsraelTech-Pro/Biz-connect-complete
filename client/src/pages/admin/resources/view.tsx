import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'wouter';
import { ArrowLeft, Edit, Download, ExternalLink, FileText, Eye, Calendar, User, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  views: number;
  downloads: number;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
}

export default function ViewResource() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Get admin token from localStorage
  const token = localStorage.getItem('admin_token');
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;

    const loadResource = async () => {
      try {
        const response = await fetch(`/api/admin/resources/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load resource');

        const resourceData = await response.json();
        setResource(resourceData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!resource) {
    return (
      <div className="min-h-screen bg-ktu-grey p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ktu-deep-blue mb-2">Resource Not Found</h2>
          <p className="text-ktu-dark-grey mb-4">The resource you're looking for doesn't exist.</p>
          <Link to="/admin/resources">
            <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
              Back to Resources
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ktu-grey p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/resources">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Resources
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin/resources/edit/${resource.id}`}>
                <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Resource
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resource Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-ktu-deep-blue mb-2">
                        {resource.title}
                      </CardTitle>
                      <p className="text-ktu-dark-grey text-lg">
                        {resource.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Badge className={getStatusColor(resource.status)}>
                        {resource.status}
                      </Badge>
                      <Badge className={getDifficultyColor(resource.difficulty_level)}>
                        {resource.difficulty_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Meta Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Eye className="w-5 h-5 text-ktu-orange mx-auto mb-1" />
                        <p className="text-sm font-medium">{resource.views}</p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Download className="w-5 h-5 text-ktu-orange mx-auto mb-1" />
                        <p className="text-sm font-medium">{resource.downloads}</p>
                        <p className="text-xs text-gray-500">Downloads</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-ktu-orange mx-auto mb-1" />
                        <p className="text-sm font-medium">
                          {new Date(resource.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Created</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <BarChart className="w-5 h-5 text-ktu-orange mx-auto mb-1" />
                        <p className="text-sm font-medium">{resource.resource_type}</p>
                        <p className="text-xs text-gray-500">Type</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-ktu-deep-blue mb-3">Content</h3>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-ktu-dark-grey leading-relaxed">
                          {resource.content || 'No detailed content provided.'}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-ktu-deep-blue mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Files Section */}
            {resource.files && resource.files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-ktu-deep-blue">
                      Downloadable Files ({resource.files.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resource.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-ktu-orange" />
                            <div>
                              <p className="font-medium text-ktu-deep-blue">{file.name}</p>
                              <p className="text-sm text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.url;
                                link.download = file.name;
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* External Links */}
            {resource.external_links && resource.external_links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-ktu-deep-blue">
                      External Links ({resource.external_links.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resource.external_links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <ExternalLink className="w-6 h-6 text-ktu-orange" />
                            <div>
                              <p className="font-medium text-ktu-deep-blue">{link.name}</p>
                              <p className="text-sm text-gray-500">{link.description}</p>
                              <p className="text-xs text-blue-600">{link.url}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Visit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resource Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-ktu-deep-blue">Resource Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Category</Label>
                    <p className="text-ktu-deep-blue font-medium capitalize">
                      {resource.category.replace('-', ' ')}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Type</Label>
                    <p className="text-ktu-deep-blue font-medium capitalize">
                      {resource.resource_type}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Difficulty</Label>
                    <p className="text-ktu-deep-blue font-medium capitalize">
                      {resource.difficulty_level}
                    </p>
                  </div>

                  {resource.estimated_time && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estimated Time</Label>
                      <p className="text-ktu-deep-blue font-medium">
                        {resource.estimated_time}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created</Label>
                    <p className="text-ktu-deep-blue">
                      {new Date(resource.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <p className="text-ktu-deep-blue">
                      {new Date(resource.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-ktu-deep-blue">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to={`/admin/resources/edit/${resource.id}`}>
                    <Button className="w-full bg-ktu-orange hover:bg-ktu-orange-light text-white">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Resource
                    </Button>
                  </Link>
                  <Link to={`/resources/${resource.id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview as Student
                    </Button>
                  </Link>
                  <Link to="/admin/resources">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Resources
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ className, children, ...props }: any) {
  return (
    <label className={`block text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
}