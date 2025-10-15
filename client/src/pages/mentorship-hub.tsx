import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, Star, Calendar, Clock, Users, MapPin,
  MessageCircle, Video, Phone, Mail, Award, BookOpen,
  TrendingUp, Target, Search, Filter, Plus, CheckCircle,
  ArrowRight, User, Building, Briefcase, Trophy
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MentorProfile from '@/components/MentorProfile';
import ProgramDetails from '@/components/ProgramDetails';
import ApplyOtpModal from '@/components/auth/ApplyOtpModal';

import { format } from 'date-fns';

// MentorCard Component
const MentorCard = ({ mentor, index, onViewProfile }: { mentor: any; index: number; onViewProfile: (mentor: any) => void }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="ktu-card animate-card-lift h-full group">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={mentor.profile_image} />
              <AvatarFallback className="bg-ktu-light-blue text-ktu-deep-blue text-lg">
                {getInitials(mentor.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-semibold text-ktu-deep-blue text-lg mb-1 group-hover:text-ktu-orange transition-colors">
              {mentor.full_name}
            </h3>
            <p className="text-sm text-ktu-dark-grey mb-2">{mentor.position}</p>
            <p className="text-xs text-ktu-dark-grey mb-3">{mentor.company}</p>
            
            <Badge variant="secondary" className="bg-ktu-orange text-white mb-3">
              {mentor.expertise}
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ktu-dark-grey">Experience:</span>
              <span className="font-medium text-ktu-deep-blue">{mentor.years_experience} years</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ktu-dark-grey">Availability:</span>
              <span className="font-medium text-ktu-deep-blue capitalize">{mentor.availability}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ktu-dark-grey">Languages:</span>
              <span className="font-medium text-ktu-deep-blue">{mentor.languages_spoken || 'English'}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-ktu-dark-grey mb-2">Bio:</p>
            <p className="text-sm text-gray-700 line-clamp-2">{mentor.bio}</p>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-ktu-orange hover:bg-ktu-orange-light"
              onClick={() => onViewProfile(mentor)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Mentor
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-ktu-deep-blue text-ktu-deep-blue hover:bg-ktu-deep-blue hover:text-white"
              onClick={() => onViewProfile(mentor)}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ProgramCard Component
const ProgramCard = ({ program, index, onViewDetails, onApply }: { program: any; index: number; onViewDetails: (program: any) => void; onApply: (program: any) => void }) => {
  const formatProgramType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const availableSpots = program.max_participants - (program.participants_count || 0);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="ktu-card animate-card-lift cursor-pointer group h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="ktu-orange-gradient p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <Badge className={getStatusColor(program.status)}>
              {formatProgramType(program.status)}
            </Badge>
          </div>

          <h3 className="font-bold text-xl text-ktu-deep-blue mb-2 group-hover:text-ktu-orange transition-colors">
            {program.title}
          </h3>
          
          <p className="text-sm text-ktu-dark-grey mb-4 line-clamp-2">{program.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-ktu-dark-grey">
              <Clock className="h-4 w-4" />
              <span>{program.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ktu-dark-grey">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(program.start_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ktu-dark-grey">
              <Users className="h-4 w-4" />
              <span>{program.participants_count || 0}/{program.max_participants} participants</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ktu-dark-grey">
              <MapPin className="h-4 w-4" />
              <span>{program.location_type || 'Online'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-ktu-orange border-ktu-orange">
              {formatProgramType(program.program_type)}
            </Badge>
            <span className="text-sm font-medium text-green-600">
              {availableSpots} spots left
            </span>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full bg-ktu-orange hover:bg-ktu-orange-light"
              onClick={() => onApply(program)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-ktu-deep-blue text-ktu-deep-blue hover:bg-ktu-deep-blue hover:text-white"
              onClick={() => onViewDetails(program)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function MentorshipHub() {
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  // Fetch mentors from the real database
  const { data: mentorsData, isLoading: mentorsLoading } = useQuery({
    queryKey: ['/api/mentors'],
  });

  // Fetch programs from the real database
  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ['/api/programs'],
  });

  const mentors = Array.isArray(mentorsData) ? mentorsData : [];
  const programs = Array.isArray(programsData) ? programsData : [];

  // Filter mentors based on search and filters
  const filteredMentors = mentors.filter((mentor: any) => {
    const matchesSearch = mentor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = selectedExpertise === 'all' || 
                           mentor.expertise.toLowerCase().includes(selectedExpertise.toLowerCase());
    
    const matchesAvailability = selectedAvailability === 'all' || 
                               mentor.availability === selectedAvailability;
    
    return matchesSearch && matchesExpertise && matchesAvailability;
  });

  // Filter programs based on search
  const filteredPrograms = programs.filter((program: any) => {
    return program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           program.program_type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleViewMentorProfile = (mentor: any) => {
    setSelectedMentor(mentor);
  };

  const handleViewProgramDetails = (program: any) => {
    setSelectedProgram(program);
  };

  const handleApplyToProgram = (program: any) => {
    setSelectedProgram(program);
    setApplyOpen(true);
  };

  if (mentorsLoading || programsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ktu-light-blue via-white to-ktu-cream">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ktu-orange mx-auto mb-4"></div>
            <p className="text-ktu-dark-grey">Loading mentorship data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ktu-light-blue via-white to-ktu-cream">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="ktu-orange-gradient p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-ktu-deep-blue mb-4">
            KTU BizConnect
            <span className="block text-2xl md:text-3xl text-ktu-orange mt-2">Mentorship Hub</span>
          </h1>
          <p className="text-lg text-ktu-dark-grey max-w-3xl mx-auto leading-relaxed">
            Connect with experienced mentors and join transformative programs designed to accelerate your entrepreneurial journey
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="text-center bg-white/80 backdrop-blur-sm border-ktu-light-blue">
            <CardContent className="p-6">
              <div className="ktu-blue-gradient p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-ktu-deep-blue">{mentors.length}</h3>
              <p className="text-ktu-dark-grey">Expert Mentors</p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur-sm border-ktu-light-blue">
            <CardContent className="p-6">
              <div className="ktu-orange-gradient p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-ktu-deep-blue">{programs.length}</h3>
              <p className="text-ktu-dark-grey">Active Programs</p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur-sm border-ktu-light-blue">
            <CardContent className="p-6">
              <div className="bg-green-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-ktu-deep-blue">95%</h3>
              <p className="text-ktu-dark-grey">Success Rate</p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur-sm border-ktu-light-blue">
            <CardContent className="p-6">
              <div className="bg-purple-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-ktu-deep-blue">50+</h3>
              <p className="text-ktu-dark-grey">Success Stories</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-ktu-light-blue"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ktu-dark-grey h-4 w-4" />
                <Input
                  placeholder="Search mentors, programs, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-ktu-light-blue focus:border-ktu-orange"
                />
              </div>
            </div>
            
            <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
              <SelectTrigger className="w-full md:w-48 border-ktu-light-blue">
                <SelectValue placeholder="Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expertise</SelectItem>
                <SelectItem value="business">Business Strategy</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="marketing">Digital Marketing</SelectItem>
                <SelectItem value="financial">Financial Planning</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <SelectTrigger className="w-full md:w-48 border-ktu-light-blue">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Tabs for Mentors and Programs */}
        <Tabs defaultValue="mentors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-ktu-light-blue">
            <TabsTrigger 
              value="mentors" 
              className="data-[state=active]:bg-ktu-orange data-[state=active]:text-white"
            >
              Expert Mentors ({filteredMentors.length})
            </TabsTrigger>
            <TabsTrigger 
              value="programs"
              className="data-[state=active]:bg-ktu-orange data-[state=active]:text-white"
            >
              Programs ({filteredPrograms.length})
            </TabsTrigger>
          </TabsList>

          {/* Mentors Tab */}
          <TabsContent value="mentors" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor: any, index: number) => (
                <MentorCard 
                  key={mentor.id} 
                  mentor={mentor} 
                  index={index}
                  onViewProfile={handleViewMentorProfile}
                />
              ))}
            </div>
            
            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-ktu-dark-grey mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg">No mentors found matching your criteria</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program: any, index: number) => (
                <ProgramCard 
                  key={program.id} 
                  program={program} 
                  index={index}
                  onViewDetails={handleViewProgramDetails}
                  onApply={handleApplyToProgram}
                />
              ))}
            </div>
            
            {filteredPrograms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-ktu-dark-grey mb-4">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg">No programs found matching your criteria</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mentor Profile Modal */}
      {selectedMentor && (
        <MentorProfile
          mentor={selectedMentor}
          open={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
        />
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <ProgramDetails
          program={selectedProgram}
          open={!!selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}

      {/* Apply via Email OTP Modal */}
      <ApplyOtpModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        programId={selectedProgram?.id}
        programTitle={selectedProgram?.title}
      />
    </div>
  );
}