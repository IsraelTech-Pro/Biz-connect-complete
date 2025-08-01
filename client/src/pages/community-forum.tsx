import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Users, 
  CheckCircle, 
  Award, 
  Search, 
  Plus,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  Tag,
  Trash2,
  Edit,
  Pin,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { apiRequest } from '@/lib/queryClient';

// Category configuration
const categories = [
  {
    name: 'General Discussion',
    value: 'general',
    description: 'General business and entrepreneurship topics',
    posts: 0,
    icon: MessageCircle,
    color: 'bg-blue-500'
  },
  {
    name: 'Business Ideas',
    value: 'business-ideas',
    description: 'Share and discuss new business concepts',
    posts: 0,
    icon: Plus,
    color: 'bg-green-500'
  },
  {
    name: 'Funding & Investment',
    value: 'funding',
    description: 'Capital raising and investor discussions',
    posts: 0,
    icon: Award,
    color: 'bg-yellow-500'
  },
  {
    name: 'Marketing & Sales',
    value: 'marketing',
    description: 'Marketing strategies and sales techniques',
    posts: 0,
    icon: Users,
    color: 'bg-purple-500'
  },
  {
    name: 'Technology',
    value: 'tech',
    description: 'Tech tools and digital solutions',
    posts: 0,
    icon: CheckCircle,
    color: 'bg-indigo-500'
  },
  {
    name: 'Success Stories',
    value: 'success-stories',
    description: 'Share your entrepreneurial wins',
    posts: 0,
    icon: Award,
    color: 'bg-orange-500'
  },
  {
    name: 'Questions & Help',
    value: 'questions',
    description: 'Get help from the community',
    posts: 0,
    icon: MessageSquare,
    color: 'bg-red-500'
  },
  {
    name: 'Networking',
    value: 'networking',
    description: 'Connect with other entrepreneurs',
    posts: 0,
    icon: Users,
    color: 'bg-pink-500'
  }
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  ...categories.map(cat => ({ value: cat.value, label: cat.name }))
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'most-commented', label: 'Most Commented' }
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

// Category Card Component
function CategoryCard({ category, index }: { category: any; index: number }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${category.color}`}>
              <category.icon className="h-6 w-6 text-white" />
            </div>
            <Badge variant="secondary" className="text-sm">
              {category.posts} posts
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-ktu-deep-blue mb-2 group-hover:text-ktu-orange transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-ktu-dark-grey">{category.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Comment Component
function CommentSection({ discussionId }: { discussionId: string }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user - use proper user detection
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const adminToken = localStorage.getItem('admin_token');
    
    if (authToken) {
      // Fetch regular user data
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user) {
          setCurrentUser(user);
          setIsAdmin(false);
        }
      })
      .catch(() => {});
    } else if (adminToken) {
      // Get admin user from localStorage
      try {
        const adminUserData = localStorage.getItem('admin_user');
        if (adminUserData) {
          const adminUser = JSON.parse(adminUserData);
          setCurrentUser(adminUser);
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error parsing admin user:', error);
      }
    }
  }, []);

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/discussions/${discussionId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/discussions/${discussionId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: showComments
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string }) => {
      const authToken = localStorage.getItem('authToken');
      
      // Regular users should always use the regular endpoint
      // Only use admin endpoint when specifically in admin interface
      const endpoint = `/api/discussions/${discussionId}/comments`;
      const token = authToken;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/discussions/${discussionId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive'
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!currentUser.id) {
      toast({
        title: 'Please login',
        description: 'You need to login to comment',
        variant: 'destructive'
      });
      return;
    }
    
    createCommentMutation.mutate({ content: newComment.trim() });
  };

  return (
    <div className="border-t border-ktu-light-blue pt-4">
      <Button
        variant="ghost"
        onClick={() => setShowComments(!showComments)}
        className="text-ktu-dark-grey hover:text-ktu-orange mb-4"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {showComments ? 'Hide Comments' : `View Comments (${comments.length})`}
      </Button>

      {showComments && (
        <div className="space-y-4">
          {/* Add Comment Form */}
          {currentUser.id && (
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-20 border-ktu-light-blue focus:border-ktu-orange resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-ktu-orange hover:bg-ktu-orange-light"
                  disabled={createCommentMutation.isPending || !newComment.trim()}
                >
                  {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ktu-orange mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-ktu-dark-grey text-center py-4">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div key={comment.id} className="bg-ktu-grey p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-ktu-orange text-white text-xs">
                        {comment.author_name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-ktu-deep-blue">{comment.author_name}</span>
                    <span className="text-xs text-ktu-dark-grey">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-ktu-dark-grey">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Edit Discussion Dialog Component
function EditDiscussionDialog({ post, open, onOpenChange }: { post: Discussion; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category);
  const [tags, setTags] = useState(post.tags.join(', '));
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (discussionData: any) => {
      const authToken = localStorage.getItem('authToken');
      
      // Regular users should always use the regular endpoint
      // Only use admin endpoint when specifically in admin interface
      const endpoint = `/api/discussions/${post.id}`;
      const token = authToken;
      
      const response = await fetch(endpoint, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
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
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive'
      });
      return;
    }

    const discussionData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    updateMutation.mutate(discussionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Discussion</DialogTitle>
          <DialogDescription>
            Update your discussion details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter discussion title..."
              className="border-ktu-light-blue focus:border-ktu-orange"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to discuss?"
              className="min-h-32 border-ktu-light-blue focus:border-ktu-orange resize-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-ktu-light-blue focus:border-ktu-orange">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="business, startup, tech..."
                className="border-ktu-light-blue focus:border-ktu-orange"
              />
            </div>
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

// Discussion Post Card Component
function PostCard({ post, index }: { post: Discussion; index: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Get current user - use proper authentication check
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const adminToken = localStorage.getItem('admin_token');
    
    if (authToken) {
      // Fetch regular user data
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
    } else if (adminToken) {
      // Get admin user from localStorage
      try {
        const adminUserData = localStorage.getItem('admin_user');
        if (adminUserData) {
          setCurrentUser(JSON.parse(adminUserData));
        }
      } catch (error) {
        console.error('Error parsing admin user:', error);
        setCurrentUser(null);
      }
    }
  }, []);
  
  const isAuthor = currentUser?.id === post.author_id;

  // Like toggle mutation
  const likeMutation = useMutation({
    mutationFn: async ({ targetId, type }: { targetId: string; type: string }) => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('admin_token');
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ target_id: targetId, type })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle like');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update local state
      if (data.liked) {
        setUserLikes(prev => [...prev, post.id]);
      } else {
        setUserLikes(prev => prev.filter(id => id !== post.id));
      }
      
      // Invalidate discussions query to refresh counts
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      
      toast({
        title: data.liked ? 'Discussion liked!' : 'Like removed',
        description: `${data.count} ${data.count === 1 ? 'like' : 'likes'} total`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle like',
        variant: 'destructive'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const authToken = localStorage.getItem('authToken');
      
      // Regular users should always use the regular endpoint
      // Only use admin endpoint when specifically in admin interface
      const endpoint = `/api/discussions/${id}`;
      const token = authToken;
      
      const response = await fetch(endpoint, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
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

  const handleLike = () => {
    if (!currentUser.id) {
      toast({
        title: 'Please login',
        description: 'You need to login to like discussions',
        variant: 'destructive'
      });
      return;
    }
    
    likeMutation.mutate({ targetId: post.id, type: 'discussion' });
  };

  const handleViewPost = async () => {
    try {
      await fetch(`/api/discussions/${post.id}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      deleteMutation.mutate(post.id);
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

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-500';
  };

  const isLiked = userLikes.includes(post.id);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-ktu-light-blue">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-ktu-orange text-white">
                  {post.author_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-ktu-deep-blue">{post.author_name}</h4>
                  {post.is_pinned && (
                    <Pin className="h-4 w-4 text-ktu-orange" />
                  )}
                  {post.is_locked && (
                    <Lock className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-ktu-dark-grey">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(post.created_at)}</span>
                </div>
              </div>
            </div>
            
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ktu-dark-grey hover:text-ktu-orange"
                  onClick={() => setShowEditDialog(true)}
                  title="Edit discussion"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ktu-dark-grey hover:text-red-500"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  title="Delete discussion"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 
              className="text-lg font-semibold text-ktu-deep-blue mb-2 hover:text-ktu-orange cursor-pointer transition-colors"
              onClick={handleViewPost}
            >
              {post.title}
            </h3>
            <p className="text-ktu-dark-grey leading-relaxed line-clamp-3">
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge 
                variant="secondary" 
                className={`${getCategoryColor(post.category)} text-white`}
              >
                {categories.find(c => c.value === post.category)?.name || post.category}
              </Badge>
              
              {post.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3 text-ktu-dark-grey" />
                  <div className="flex space-x-1">
                    {post.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-ktu-dark-grey">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`flex items-center space-x-1 transition-colors hover:text-ktu-orange ${
                  isLiked ? 'text-ktu-orange' : 'text-ktu-dark-grey'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.like_count}</span>
              </button>
              
              <span className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comment_count}</span>
              </span>
            </div>
          </div>

          {/* Comment Section */}
          <CommentSection discussionId={post.id} />
        </CardContent>
      </Card>

      {/* Edit Discussion Dialog */}
      <EditDiscussionDialog 
        post={post} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </motion.div>
  );
}

// Create Discussion Dialog Component
function CreateDiscussionDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (discussionData: any) => {
      const authToken = localStorage.getItem('authToken');
      
      // Regular users should always use the regular endpoint
      // Only use admin endpoint when specifically in admin interface
      const endpoint = '/api/discussions';
      const token = authToken;
      
      const response = await fetch(endpoint, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/stats'] });
      
      setOpen(false);
      setTitle('');
      setContent('');
      setCategory('general');
      setTags('');
      
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
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    createMutation.mutate(discussionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-ktu-orange hover:bg-ktu-orange-light">
          <Plus className="h-4 w-4 mr-2" />
          Start New Discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
          <DialogDescription>
            Share your ideas, ask questions, or start a conversation with the KTU entrepreneurship community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Discussion Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your discussion"
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
                    {cat.name}
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
              placeholder="Share your thoughts, ideas, or questions..."
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
              placeholder="Enter tags separated by commas (e.g., startup, funding, marketing)"
              className="border-ktu-light-blue focus:border-ktu-orange"
            />
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

export default function CommunityForum() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch discussions
  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ['/api/discussions', { category: selectedCategory, search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/discussions?${params}`);
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

  // Sort and filter discussions
  const filteredPosts = discussions
    .filter((post: Discussion) => {
      if (selectedCategory === 'all') return true;
      return post.category === selectedCategory;
    })
    .filter((post: Discussion) => {
      if (!searchTerm) return true;
      return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             post.content.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a: Discussion, b: Discussion) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most-liked':
          return b.like_count - a.like_count;
        case 'most-commented':
          return b.comment_count - a.comment_count;
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Update category post counts
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    posts: discussions.filter((d: Discussion) => d.category === cat.value).length
  }));

  return (
    <div className="min-h-screen bg-ktu-grey">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-5xl font-bold text-ktu-deep-blue mb-6"
            >
              Community Forum
            </motion.h1>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-ktu-dark-grey mb-8"
            >
              Connect, share ideas, and grow together with the KTU entrepreneurship community
            </motion.p>
            
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <CreateDiscussionDialog />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Forum Stats */}
      <section className="bg-ktu-section-gradient py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Members", value: stats?.totalMembers || 0, icon: Users },
              { label: "Total Posts", value: stats?.totalPosts || 0, icon: MessageCircle },
              { label: "Total Comments", value: stats?.totalComments || 0, icon: MessageSquare },
              { label: "Total Likes", value: stats?.totalLikes || 0, icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-ktu-orange" />
                <div className="text-2xl font-bold text-ktu-deep-blue">{stat.value}</div>
                <div className="text-sm text-ktu-dark-grey">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-ktu-deep-blue mb-4">Discussion Categories</h2>
          <p className="text-ktu-dark-grey max-w-2xl mx-auto">
            Browse by category to find relevant discussions and connect with like-minded entrepreneurs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {categoriesWithCounts.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 border-ktu-light-blue">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {discussionsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ktu-orange mx-auto mb-4"></div>
              <p className="text-ktu-dark-grey">Loading discussions...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-ktu-dark-grey opacity-50" />
              <h3 className="text-lg font-semibold text-ktu-deep-blue mb-2">No discussions found</h3>
              <p className="text-ktu-dark-grey mb-4">Try adjusting your search terms or browse different categories</p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-ktu-orange hover:bg-ktu-orange-light"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredPosts.map((post: Discussion, index: number) => (
              <PostCard key={post.id} post={post} index={index} />
            ))
          )}
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-ktu-deep-blue mb-6">Community Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Be Respectful",
                  description: "Treat all community members with respect and kindness"
                },
                {
                  title: "Stay On Topic",
                  description: "Keep discussions relevant to entrepreneurship and business"
                },
                {
                  title: "Help Others",
                  description: "Share your knowledge and support fellow entrepreneurs"
                }
              ].map((guideline, index) => (
                <motion.div
                  key={guideline.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="ktu-orange-gradient p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-ktu-deep-blue mb-2">{guideline.title}</h3>
                  <p className="text-sm text-ktu-dark-grey">{guideline.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}