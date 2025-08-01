import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Target, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Plus,
  ArrowLeft 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function AddProgram() {
  const [, navigate] = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    max_participants: '',
    program_type: 'mentorship',
    start_date: '',
    end_date: '',
    requirements: '',
    outcomes: '',
    status: 'active'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add program');
      }

      toast({
        title: "Success",
        description: "Program created successfully!",
      });

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error adding program:', error);
      toast({
        title: "Error",
        description: "Failed to create program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ktu-grey py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ktu-deep-blue mb-2">Create New Program</h1>
              <p className="text-ktu-dark-grey">Add a new mentorship or training program for KTU students</p>
            </div>
            <Link to="/admin/dashboard">
              <Button variant="outline" className="text-ktu-deep-blue hover:text-ktu-orange">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-ktu-deep-blue">Program Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Program Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Startup Bootcamp for Students"
                    />
                  </div>

                  <div>
                    <Label htmlFor="program_type" className="flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Program Type
                    </Label>
                    <select
                      id="program_type"
                      name="program_type"
                      value={formData.program_type}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ktu-orange focus:border-ktu-orange"
                    >
                      <option value="mentorship">Mentorship Program</option>
                      <option value="workshop">Workshop</option>
                      <option value="bootcamp">Bootcamp</option>
                      <option value="course">Course</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="duration" className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 6 weeks, 3 months"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_participants" className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Max Participants
                    </Label>
                    <Input
                      id="max_participants"
                      name="max_participants"
                      type="number"
                      value={formData.max_participants}
                      onChange={handleInputChange}
                      required
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_date" className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Start Date
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date" className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      End Date
                    </Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Program Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Describe what this program offers to students..."
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="List any prerequisites or requirements for students to join..."
                  />
                </div>

                <div>
                  <Label htmlFor="outcomes">Expected Outcomes</Label>
                  <Textarea
                    id="outcomes"
                    name="outcomes"
                    value={formData.outcomes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="What will students gain from this program..."
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ktu-orange focus:border-ktu-orange"
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-ktu-orange hover:bg-ktu-orange-light text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Creating...' : 'Create Program'}
                  </Button>
                  <Link to="/admin/dashboard">
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