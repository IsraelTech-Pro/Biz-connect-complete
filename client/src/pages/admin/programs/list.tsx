import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Calendar,
  Users,
  MoreHorizontal
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

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  max_participants: number;
  program_type: string;
  start_date: string;
  end_date: string;
  status: string;
  participants_count: number;
  created_at: string;
}

export default function ProgramsList() {
  // Get admin token directly from localStorage
  const adminToken = localStorage.getItem('admin_token');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ['/api/admin/programs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/programs', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch programs');
      return response.json();
    },
    enabled: !!adminToken
  });

  const deleteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to delete program');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/programs'] });
      toast({
        title: "Success",
        description: "Program deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete program. Please try again.",
        variant: "destructive",
      });
    }
  });

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    const matchesType = typeFilter === 'all' || program.program_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (programId: string) => {
    if (window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      deleteMutation.mutate(programId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mentorship': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      case 'bootcamp': return 'bg-red-100 text-red-800';
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'seminar': return 'bg-teal-100 text-teal-800';
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ktu-deep-blue">Programs Management</h1>
              <p className="text-ktu-dark-grey mt-2">Manage mentorship programs and training courses</p>
            </div>
            <Link to="/admin/programs/add">
              <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Program
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
                      placeholder="Search programs by title or description..."
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
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ktu-orange"
                >
                  <option value="all">All Types</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="workshop">Workshop</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="course">Course</option>
                  <option value="seminar">Seminar</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Programs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-ktu-deep-blue">
                Programs ({filteredPrograms.length})
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
              ) : filteredPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by creating your first program.'
                    }
                  </p>
                  <Link to="/admin/programs/add">
                    <Button className="bg-ktu-orange hover:bg-ktu-orange-light text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Program
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPrograms.map((program) => (
                    <motion.div
                      key={program.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-ktu-orange transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{program.title}</h3>
                          <Badge className={getStatusColor(program.status)}>
                            {program.status}
                          </Badge>
                          <Badge className={getTypeColor(program.program_type)}>
                            {program.program_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {program.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {program.participants_count}/{program.max_participants} participants
                          </span>
                          <span>Duration: {program.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link to={`/admin/programs/${program.id}`}>
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
                              <Link to={`/admin/programs/edit/${program.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(program.id)}
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