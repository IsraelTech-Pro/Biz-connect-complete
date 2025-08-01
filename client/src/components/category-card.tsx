import { Link } from 'wouter';

interface CategoryCardProps {
  category: {
    name: string;
    icon: string;
    href: string;
  };
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={category.href}>
      <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 mb-4 group-hover:bg-gradient-to-br group-hover:from-orange-100 group-hover:to-orange-200 transition-all duration-300 shadow-md hover:shadow-lg">
          <span className="text-3xl">{category.icon}</span>
        </div>
        <h4 className="font-semibold text-black group-hover:text-orange-500 transition-colors duration-200 text-sm">
          {category.name}
        </h4>
      </div>
    </Link>
  );
};
