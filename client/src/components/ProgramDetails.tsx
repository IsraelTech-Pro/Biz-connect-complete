import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  MessageCircle, 
  Phone, 
  Video,
  CheckCircle,
  Target,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  max_participants: number;
  program_type: string;
  start_date: string;
  end_date: string;
  requirements?: string;
  outcomes?: string;
  status: string;
  participants_count?: number;
  mentor_id?: string;
  location_type?: string;
  location_address?: string;
  platform_link?: string;
  whatsapp_support?: string;
  call_support?: string;
  program_fee?: number;
  mentor?: {
    full_name: string;
    expertise: string;
    profile_image?: string;
  };
}

interface ProgramDetailsProps {
  program: Program;
  open: boolean;
  onClose: () => void;
}

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, open, onClose }) => {
  const formatProgramType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatLocationDisplay = () => {
    if (program.location_type === 'online') {
      return 'Online Program';
    } else if (program.location_type === 'physical') {
      return program.location_address || 'Physical Location TBA';
    } else if (program.location_type === 'hybrid') {
      return `Hybrid: ${program.location_address || 'Location TBA'} + Online`;
    }
    return 'Location TBA';
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

  const handleContact = (type: 'whatsapp' | 'call' | 'platform') => {
    switch (type) {
      case 'whatsapp':
        if (program.whatsapp_support) {
          window.open(`https://wa.me/${program.whatsapp_support.replace(/\D/g, '')}`, '_blank');
        }
        break;
      case 'call':
        if (program.call_support) {
          window.open(`tel:${program.call_support}`, '_blank');
        }
        break;
      case 'platform':
        if (program.platform_link) {
          window.open(program.platform_link, '_blank');
        }
        break;
    }
  };

  const availableSpots = program.max_participants - (program.participants_count || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ktu-blue">
            Program Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {program.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-bold text-ktu-blue">{program.title}</h3>
              <Badge className={getStatusColor(program.status)}>
                {formatProgramType(program.status)}
              </Badge>
              <Badge variant="outline">
                {formatProgramType(program.program_type)}
              </Badge>
            </div>
            
            <p className="text-gray-700 leading-relaxed">{program.description}</p>
          </div>

          {/* Program Overview */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-ktu-blue mb-4">Program Overview</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-ktu-orange" />
                  <div>
                    <p className="font-semibold">Duration</p>
                    <p className="text-gray-600">{program.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-ktu-orange" />
                  <div>
                    <p className="font-semibold">Participants</p>
                    <p className="text-gray-600">
                      {program.participants_count || 0} / {program.max_participants}
                      <span className="text-green-600 ml-1">({availableSpots} spots left)</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-ktu-orange" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-gray-600">{formatLocationDisplay()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-ktu-orange" />
                  <div>
                    <p className="font-semibold">Start Date</p>
                    <p className="text-gray-600">
                      {format(new Date(program.start_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-ktu-orange" />
                  <div>
                    <p className="font-semibold">End Date</p>
                    <p className="text-gray-600">
                      {format(new Date(program.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                {program.program_fee !== undefined && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-ktu-orange" />
                    <div>
                      <p className="font-semibold">Program Fee</p>
                      <p className="text-gray-600">
                        {program.program_fee === 0 ? 'Free' : `₵${program.program_fee}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {program.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-ktu-blue mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Requirements
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{program.requirements}</p>
                </CardContent>
              </Card>
            )}
            
            {program.outcomes && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-ktu-blue mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Expected Outcomes
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{program.outcomes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Support & Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-ktu-blue mb-4">Support & Contact</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* WhatsApp Support */}
                {program.whatsapp_support && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => handleContact('whatsapp')}
                  >
                    <MessageCircle className="h-6 w-6 text-green-600" />
                    <div className="text-center">
                      <p className="font-semibold">WhatsApp Support</p>
                      <p className="text-sm text-gray-600">{program.whatsapp_support}</p>
                    </div>
                  </Button>
                )}

                {/* Call Support */}
                {program.call_support && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => handleContact('call')}
                  >
                    <Phone className="h-6 w-6 text-ktu-orange" />
                    <div className="text-center">
                      <p className="font-semibold">Call Support</p>
                      <p className="text-sm text-gray-600">{program.call_support}</p>
                    </div>
                  </Button>
                )}

                {/* Platform Access */}
                {program.platform_link && (program.location_type === 'online' || program.location_type === 'hybrid') && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => handleContact('platform')}
                  >
                    <Video className="h-6 w-6 text-blue-600" />
                    <div className="text-center">
                      <p className="font-semibold">Join Platform</p>
                      <p className="text-sm text-gray-600">Online Access</p>
                    </div>
                  </Button>
                )}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For any questions or issues, please contact our support team via WhatsApp or phone. 
                  Platform access links will be provided to registered participants closer to the program start date.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mentor Information */}
          {program.mentor && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-ktu-blue mb-4">Program Mentor</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-ktu-orange text-white flex items-center justify-center font-semibold">
                    {program.mentor.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{program.mentor.full_name}</p>
                    <p className="text-gray-600">{program.mentor.expertise}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              className="bg-ktu-orange hover:bg-ktu-orange-light"
              onClick={() => handleContact('whatsapp')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramDetails;