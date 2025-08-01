import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Download,
  ExternalLink,
  MoreHorizontal,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Removed useAuth import - admin has separate authentication
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  resource_type: string;
  difficulty_level: string;
  estimated_time: string;
  status: string;
  views: number;
  downloads: number;
  created_at: string;
}

export default function ResourcesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Get admin token from localStorage
  const adminToken = localStorage.getItem('admin_token');

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/admin/resources'],
    queryFn: async () => {
      const response = await fetch('/api/admin/resources', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch resources');
      return response.json();
    },
    enabled: !!adminToken
  });

  const deleteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to delete resource');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
      toast({
        title: "Success",
        description: "Resource deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
    }
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    const matchesType = typeFilter === 'all' || resource.resource_type === typeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  const handleDelete = (resourceId: string) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      deleteMutation.mutate(resourceId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business-plan': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      case 'finance': return 'bg-green-100 text-green-800';
      case 'legal': return 'bg-red-100 text-red-800';
      case 'operations': return 'bg-orange-100 text-orange-800';
      case 'technology': return 'bg-indigo-100 text-indigo-800';
      case 'personal-development': return 'bg-pink-100 text-pink-800';
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

  return (
    <div className="min-h-screen bg-ktu-grey p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/admin/dashboard">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 text-ktu-deep-blue hover:text-ktu-orange hover:border-ktu-orange"
                data-testid="button-back-admin"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ktu-deep-blue">Resources Management</h1>
              <p className="text-ktu-dark-grey mt-2">Manage business resources and educational content</p>
            </div>
            <Link to="/admin/resources/add">
              <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search resources by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ktu-orange"
                >
                  <option value="all">All Categories</option>
                  <option value="business-plan">Business Plan</option>
                  <option value="marketing">Marketing</option>
                  <option value="finance">Finance</option>
                  <option value="legal">Legal</option>
                  <option value="operations">Operations</option>
                  <option value="technology">Technology</option>
                  <option value="personal-development">Personal Development</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ktu-orange"
                >
                  <option value="all">All Types</option>
                  <option value="guide">Guide</option>
                  <option value="template">Template</option>
                  <option value="checklist">Checklist</option>
                  <option value="video">Video</option>
                  <option value="webinar">Webinar</option>
                  <option value="ebook">E-book</option>
                  <option value="tool">Tool</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ktu-orange"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-ktu-deep-blue">
                Resources ({filteredResources.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by adding your first resource.'
                    }
                  </p>
                  <Link to="/admin/resources/add">
                    <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Resource
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-ktu-orange transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                          <Badge className={getStatusColor(resource.status)}>
                            {resource.status}
                          </Badge>
                          <Badge className={getCategoryColor(resource.category)}>
                            {resource.category.replace('-', ' ')}
                          </Badge>
                          <Badge className={getDifficultyColor(resource.difficulty_level)}>
                            {resource.difficulty_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Type: {resource.resource_type}</span>
                          {resource.estimated_time && (
                            <span>Time: {resource.estimated_time}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {resource.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {resource.downloads} downloads
                          </span>
                          <span>Added {new Date(resource.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link to={`/admin/resources/${resource.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/resources/edit/${resource.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/resources/${resource.id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Preview
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(resource.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}