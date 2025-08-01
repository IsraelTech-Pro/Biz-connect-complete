import React from 'react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Building, 
  Briefcase, 
  Star, 
  Clock, 
  Globe, 
  DollarSign,
  Languages
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface Mentor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp_number?: string;
  company: string;
  position: string;
  expertise: string;
  bio: string;
  years_experience: number;
  specializations?: string;
  availability: string;
  status: string;
  profile_image?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  website_url?: string;
  office_address?: string;
  consultation_fee?: number;
  languages_spoken?: string;
}

interface MentorProfileProps {
  mentor: Mentor;
  open: boolean;
  onClose: () => void;
}

const MentorProfile: React.FC<MentorProfileProps> = ({ mentor, open, onClose }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatAvailability = (availability: string) => {
    return availability.charAt(0).toUpperCase() + availability.slice(1);
  };

  const handleContact = (type: 'email' | 'phone' | 'whatsapp') => {
    switch (type) {
      case 'email':
        window.open(`mailto:${mentor.email}`, '_blank');
        break;
      case 'phone':
        window.open(`tel:${mentor.phone}`, '_blank');
        break;
      case 'whatsapp':
        if (mentor.whatsapp_number) {
          window.open(`https://wa.me/${mentor.whatsapp_number.replace(/\D/g, '')}`, '_blank');
        }
        break;
    }
  };

  const handleSocialMedia = (platform: string, url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ktu-blue">
            Mentor Profile
          </DialogTitle>
          <DialogDescription>
            Complete contact information and professional details for {mentor.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src={mentor.profile_image} alt={mentor.full_name} />
              <AvatarFallback className="text-xl bg-ktu-orange text-white">
                {getInitials(mentor.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-ktu-blue">{mentor.full_name}</h3>
                <p className="text-lg text-ktu-orange font-semibold">{mentor.position}</p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {mentor.company}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-ktu-blue text-white">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {mentor.expertise}
                </Badge>
                <Badge variant="outline">
                  <Star className="h-3 w-3 mr-1" />
                  {mentor.years_experience} years experience
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Available {formatAvailability(mentor.availability)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-ktu-blue mb-4">Contact Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email */}
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => handleContact('email')}
                >
                  <Mail className="h-6 w-6 text-ktu-orange" />
                  <div className="text-center">
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-gray-600 break-all">{mentor.email}</p>
                  </div>
                </Button>

                {/* Phone */}
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => handleContact('phone')}
                >
                  <Phone className="h-6 w-6 text-ktu-orange" />
                  <div className="text-center">
                    <p className="font-semibold">Phone</p>
                    <p className="text-sm text-gray-600">{mentor.phone}</p>
                  </div>
                </Button>

                {/* WhatsApp */}
                {mentor.whatsapp_number && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => handleContact('whatsapp')}
                  >
                    <MessageCircle className="h-6 w-6 text-green-600" />
                    <div className="text-center">
                      <p className="font-semibold">WhatsApp</p>
                      <p className="text-sm text-gray-600">{mentor.whatsapp_number}</p>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-ktu-blue mb-4">Professional Background</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Biography</h5>
                  <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
                </div>
                
                {mentor.specializations && (
                  <div>
                    <h5 className="font-semibold mb-2">Specializations</h5>
                    <p className="text-gray-700">{mentor.specializations}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentor.office_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-ktu-orange mt-1" />
                      <div>
                        <p className="font-semibold">Office Address</p>
                        <p className="text-gray-600">{mentor.office_address}</p>
                      </div>
                    </div>
                  )}
                  
                  {mentor.consultation_fee && (
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-5 w-5 text-ktu-orange mt-1" />
                      <div>
                        <p className="font-semibold">Consultation Fee</p>
                        <p className="text-gray-600">₵{mentor.consultation_fee}</p>
                      </div>
                    </div>
                  )}
                  
                  {mentor.languages_spoken && (
                    <div className="flex items-start gap-2">
                      <Languages className="h-5 w-5 text-ktu-orange mt-1" />
                      <div>
                        <p className="font-semibold">Languages</p>
                        <p className="text-gray-600">{mentor.languages_spoken}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media & Online Presence */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-ktu-blue mb-4">Online Presence</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mentor.linkedin_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialMedia('linkedin', mentor.linkedin_url)}
                    className="justify-center"
                  >
                    LinkedIn
                  </Button>
                )}
                
                {mentor.twitter_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialMedia('twitter', mentor.twitter_url)}
                    className="justify-center"
                  >
                    Twitter
                  </Button>
                )}
                
                {mentor.facebook_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialMedia('facebook', mentor.facebook_url)}
                    className="justify-center"
                  >
                    Facebook
                  </Button>
                )}
                
                {mentor.instagram_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialMedia('instagram', mentor.instagram_url)}
                    className="justify-center"
                  >
                    Instagram
                  </Button>
                )}
                
                {mentor.website_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialMedia('website', mentor.website_url)}
                    className="justify-center flex items-center gap-1"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

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
              Contact Mentor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentorProfile;