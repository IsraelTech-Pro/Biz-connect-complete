import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
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

interface Mentor {
  id: string;
  full_name: string;
  email: string;
  company: string;
  position: string;
  expertise: string;
  bio: string;
  years_experience: number;
  status: string;
  created_at: string;
}

export default function MentorsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Get admin token directly from localStorage
  const adminToken = localStorage.getItem('admin_token');

  const { data: mentors = [], isLoading } = useQuery<Mentor[]>({
    queryKey: ['/api/admin/mentors'],
    queryFn: async () => {
      const response = await fetch('/api/admin/mentors', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch mentors');
      return response.json();
    },
    enabled: !!adminToken
  });

  const deleteMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to delete mentor');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/mentors'] });
      toast({
        title: "Success",
        description: "Mentor deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete mentor. Please try again.",
        variant: "destructive",
      });
    }
  });

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (mentorId: string) => {
    if (window.confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      deleteMutation.mutate(mentorId);
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
              <h1 className="text-3xl font-bold text-ktu-deep-blue">Mentors Management</h1>
              <p className="text-ktu-dark-grey mt-2">Manage mentors and expertise for KTU BizConnect</p>
            </div>
            <Link to="/admin/mentors/add">
              <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Mentor
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search mentors by name, company, or expertise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ktu-orange"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mentors List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-ktu-deep-blue">
                Mentors ({filteredMentors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMentors.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by adding your first mentor.'
                    }
                  </p>
                  <Link to="/admin/mentors/add">
                    <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Mentor
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMentors.map((mentor) => (
                    <motion.div
                      key={mentor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-ktu-orange transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{mentor.full_name}</h3>
                          <Badge className={mentor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {mentor.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {mentor.position} at {mentor.company}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          {mentor.expertise} • {mentor.years_experience} years experience
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(mentor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/mentors/${mentor.id}`}>
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
                              <Link to={`/admin/mentors/edit/${mentor.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(mentor.id)}
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