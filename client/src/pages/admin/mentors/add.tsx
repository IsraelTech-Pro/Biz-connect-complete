import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Award, 
  Building2, 
  BookOpen, 
  Plus,
  ArrowLeft 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function AddMentor() {
  const [, navigate] = useLocation();
  const adminToken = localStorage.getItem('admin_token');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    expertise: '',
    bio: '',
    years_experience: '',
    specializations: '',
    availability: 'weekends'
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
      const response = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add mentor');
      }

      toast({
        title: "Success",
        description: "Mentor added successfully!",
      });

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error adding mentor:', error);
      toast({
        title: "Error",
        description: "Failed to add mentor. Please try again.",
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
              <h1 className="text-3xl font-bold text-ktu-deep-blue mb-2">Add New Mentor</h1>
              <p className="text-ktu-dark-grey">Create a new mentor profile for the KTU entrepreneurship platform</p>
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
              <CardTitle className="text-xl text-ktu-deep-blue">Mentor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter mentor's full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="mentor@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+233 123 456 789"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Company/Organization
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="position" className="flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Position/Title
                    </Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      placeholder="CEO, CTO, Senior Developer, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="years_experience" className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Years of Experience
                    </Label>
                    <Input
                      id="years_experience"
                      name="years_experience"
                      type="number"
                      value={formData.years_experience}
                      onChange={handleInputChange}
                      required
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expertise" className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    Area of Expertise
                  </Label>
                  <Input
                    id="expertise"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleInputChange}
                    required
                    placeholder="Technology, Marketing, Finance, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                  <Input
                    id="specializations"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    placeholder="Web Development, Digital Marketing, Business Strategy"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Brief bio about the mentor's background and achievements..."
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ktu-orange focus:border-ktu-orange"
                  >
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="both">Both weekdays and weekends</option>
                    <option value="flexible">Flexible schedule</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-ktu-orange hover:bg-ktu-orange-light text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Adding...' : 'Add Mentor'}
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