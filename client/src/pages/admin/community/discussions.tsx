import { useState } from 'react';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Users, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Pin,
  Lock,
  Eye,
  MessageSquare,
  Heart,
  Calendar,
  User,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';

// Category configuration
const categories = [
  { value: 'general', label: 'General Discussion' },
  { value: 'business-ideas', label: 'Business Ideas' },
  { value: 'funding', label: 'Funding & Investment' },
  { value: 'marketing', label: 'Marketing & Sales' },
  { value: 'tech', label: 'Technology' },
  { value: 'success-stories', label: 'Success Stories' },
  { value: 'questions', label: 'Questions & Help' },
  { value: 'networking', label: 'Networking' }
];

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author_id: string;
  author_name: string;
  author_email: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
}

// Create Discussion Dialog Component
function CreateDiscussionDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (discussionData: any) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(discussionData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create discussion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/stats'] });
      
      setOpen(false);
      setTitle('');
      setContent('');
      setCategory('general');
      setTags('');
      setIsPinned(false);
      
      toast({
        title: 'Success',
        description: 'Discussion created successfully!'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create discussion',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const discussionData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      is_pinned: isPinned
    };

    createMutation.mutate(discussionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-ktu-orange hover:bg-ktu-orange-light">
          <Plus className="h-4 w-4 mr-2" />
          Create Discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
          <DialogDescription>
            Create a new discussion as an admin. You can pin discussions to keep them at the top.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for the discussion"
              className="border-ktu-light-blue focus:border-ktu-orange"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-ktu-light-blue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ideas, or announcements..."
              className="min-h-32 border-ktu-light-blue focus:border-ktu-orange resize-none"
              required
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., announcement, important, startup)"
              className="border-ktu-light-blue focus:border-ktu-orange"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-ktu-light-blue"
            />
            <Label htmlFor="pinned">Pin this discussion to the top</Label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-ktu-orange hover:bg-ktu-orange-light"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Discussion Dialog Component
function EditDiscussionDialog({ 
  discussion, 
  open, 
  onOpenChange 
}: { 
  discussion: Discussion | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form when discussion changes
  React.useEffect(() => {
    if (discussion) {
      setTitle(discussion.title);
      setContent(discussion.content);
      setCategory(discussion.category);
      setTags(discussion.tags.join(', '));
      setIsPinned(discussion.is_pinned);
    }
  }, [discussion]);

  const updateMutation = useMutation({
    mutationFn: async (discussionData: any) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/discussions/${discussion!.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(discussionData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update discussion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/stats'] });
      
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Discussion updated successfully!'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update discussion',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const discussionData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      is_pinned: isPinned
    };

    updateMutation.mutate(discussionData);
  };

  if (!discussion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Discussion</DialogTitle>
          <DialogDescription>
            Update the discussion details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Discussion Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for the discussion"
              className="border-ktu-light-blue focus:border-ktu-orange"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-ktu-light-blue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-content">Content *</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to discuss?"
              className="min-h-32 border-ktu-light-blue focus:border-ktu-orange resize-none"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-tags">Tags (optional)</Label>
            <Input
              id="edit-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., startup, funding, marketing (comma-separated)"
              className="border-ktu-light-blue focus:border-ktu-orange"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-pinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-ktu-light-blue"
            />
            <Label htmlFor="edit-pinned">Pin this discussion to the top</Label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-ktu-orange hover:bg-ktu-orange-light"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDiscussions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch discussions
  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ['/api/admin/discussions'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/discussions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch discussions');
      return response.json();
    }
  });

  // Fetch community stats
  const { data: stats } = useQuery<CommunityStats>({
    queryKey: ['/api/community/stats'],
    queryFn: async () => {
      const response = await fetch('/api/community/stats');
      if (!response.ok) throw new Error('Failed to fetch community stats');
      return response.json();
    }
  });

  // Update discussion mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/discussions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update discussion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discussions'] });
      toast({
        title: 'Success',
        description: 'Discussion updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update discussion',
        variant: 'destructive'
      });
    }
  });

  // Delete discussion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/discussions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete discussion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/stats'] });
      toast({
        title: 'Success',
        description: 'Discussion deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete discussion',
        variant: 'destructive'
      });
    }
  });

  const handleTogglePin = (discussion: Discussion) => {
    updateMutation.mutate({
      id: discussion.id,
      data: { is_pinned: !discussion.is_pinned }
    });
  };

  const handleToggleLock = (discussion: Discussion) => {
    updateMutation.mutate({
      id: discussion.id,
      data: { is_locked: !discussion.is_locked }
    });
  };

  const handleEdit = (discussion: Discussion) => {
    setEditingDiscussion(discussion);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Filter discussions
  const filteredDiscussions = discussions
    .filter((discussion: Discussion) => {
      if (selectedCategory !== 'all' && discussion.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && discussion.status !== selectedStatus) return false;
      if (searchTerm && !discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !discussion.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  return (
    <div className="min-h-screen bg-ktu-grey">
      {/* Header */}
      <div className="bg-white border-b border-ktu-light-blue">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-ktu-deep-blue">Community Discussions</h1>
                <p className="text-ktu-dark-grey">Manage and moderate community discussions</p>
              </div>
            </div>
            <CreateDiscussionDialog />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ktu-dark-grey">Total Members</p>
                  <p className="text-2xl font-bold text-ktu-deep-blue">{stats?.totalMembers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-ktu-orange" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ktu-dark-grey">Total Discussions</p>
                  <p className="text-2xl font-bold text-ktu-deep-blue">{stats?.totalPosts || 0}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-ktu-orange" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ktu-dark-grey">Total Comments</p>
                  <p className="text-2xl font-bold text-ktu-deep-blue">{stats?.totalComments || 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-ktu-orange" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ktu-dark-grey">Total Likes</p>
                  <p className="text-2xl font-bold text-ktu-deep-blue">{stats?.totalLikes || 0}</p>
                </div>
                <Heart className="h-8 w-8 text-ktu-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ktu-dark-grey h-4 w-4" />
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-ktu-light-blue focus:border-ktu-orange"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 border-ktu-light-blue">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48 border-ktu-light-blue">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Discussions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Discussions ({filteredDiscussions.length})</span>
              <Filter className="h-4 w-4 text-ktu-dark-grey" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {discussionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ktu-orange mx-auto mb-4"></div>
                <p className="text-ktu-dark-grey">Loading discussions...</p>
              </div>
            ) : filteredDiscussions.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-ktu-dark-grey opacity-50" />
                <h3 className="text-lg font-semibold text-ktu-deep-blue mb-2">No discussions found</h3>
                <p className="text-ktu-dark-grey mb-4">Try adjusting your filters or create a new discussion</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Discussion</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscussions.map((discussion: Discussion) => (
                    <TableRow key={discussion.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-ktu-deep-blue line-clamp-1">
                              {discussion.title}
                            </span>
                            {discussion.is_pinned && (
                              <Pin className="h-3 w-3 text-ktu-orange" />
                            )}
                            {discussion.is_locked && (
                              <Lock className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-ktu-dark-grey line-clamp-2">
                            {discussion.content}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-ktu-orange text-white text-xs">
                              {discussion.author_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-ktu-deep-blue">
                              {discussion.author_name}
                            </p>
                            <p className="text-xs text-ktu-dark-grey">
                              {discussion.author_email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary">
                          {categories.find(c => c.value === discussion.category)?.label || discussion.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-4 text-sm text-ktu-dark-grey">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{discussion.view_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{discussion.like_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{discussion.comment_count}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={discussion.status === 'published' ? 'default' : 'secondary'}
                          className={discussion.status === 'published' ? 'bg-green-500' : ''}
                        >
                          {discussion.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-ktu-dark-grey">
                          {timeAgo(discussion.created_at)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(discussion)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleTogglePin(discussion)}>
                              <Pin className="h-4 w-4 mr-2" />
                              {discussion.is_pinned ? 'Unpin' : 'Pin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleLock(discussion)}>
                              <Lock className="h-4 w-4 mr-2" />
                              {discussion.is_locked ? 'Unlock' : 'Lock'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(discussion.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Discussion Dialog */}
      <EditDiscussionDialog 
        discussion={editingDiscussion}
        open={!!editingDiscussion}
        onOpenChange={(open) => {
          if (!open) setEditingDiscussion(null);
        }}
      />
    </div>
  );
}