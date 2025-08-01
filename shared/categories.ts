// Centralized category configuration for KTU BizConnect
// This ensures consistency across all components and filters

export interface BusinessCategory {
  value: string;
  label: string;
  description: string;
  icon?: string;
  color: string;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    value: 'tech-and-innovation',
    label: 'Tech & Innovation',
    description: 'Web development, mobile apps, software solutions',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'fashion-and-design',
    label: 'Fashion & Design',
    description: 'Custom clothing, tailoring, fashion accessories',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    value: 'food-and-catering',
    label: 'Food & Catering',
    description: 'Catering services, food delivery, restaurants',
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'digital-marketing',
    label: 'Digital Marketing',
    description: 'Social media management, content creation, SEO',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    value: 'arts-and-crafts',
    label: 'Arts & Crafts',
    description: 'Handmade items, jewelry, custom art pieces',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'education-and-tutoring',
    label: 'Education & Tutoring',
    description: 'Academic tutoring, skill training, courses',
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    value: 'health-and-wellness',
    label: 'Health & Wellness',
    description: 'Fitness, nutrition, wellness coaching',
    color: 'bg-teal-100 text-teal-800'
  },
  {
    value: 'services',
    label: 'Professional Services',
    description: 'Consulting, business services, general services',
    color: 'bg-gray-100 text-gray-800'
  }
];

// Helper functions for category operations
export const getCategoryByValue = (value: string): BusinessCategory | undefined => {
  return BUSINESS_CATEGORIES.find(cat => cat.value === value);
};

export const getCategoryLabel = (value: string): string => {
  const category = getCategoryByValue(value);
  return category ? category.label : 'Professional Services';
};

export const getCategoryColor = (value: string): string => {
  const category = getCategoryByValue(value);
  return category ? category.color : 'bg-gray-100 text-gray-800';
};

// Get all categories with "All Categories" option for filters
export const getFilterCategories = () => [
  { value: 'all', label: 'All Categories' },
  ...BUSINESS_CATEGORIES
];

// Normalize category value for consistent comparison
export const normalizeCategoryValue = (category: string): string => {
  return category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
};