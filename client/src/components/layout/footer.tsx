import { Link } from 'wouter';

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h4 className="text-3xl font-bold mb-6">KTU BizConnect</h4>
          <p className="text-gray-400 mb-6 max-w-4xl mx-auto text-lg">
            Connecting KTU students and businesses. Discover amazing products and services from student entrepreneurs at Koforidua Technical University.
          </p>
          <div className="flex justify-center space-x-6">
            <i className="fab fa-facebook text-orange-500 hover:text-orange-600 cursor-pointer text-xl"></i>
            <i className="fab fa-twitter text-orange-500 hover:text-orange-600 cursor-pointer text-xl"></i>
            <i className="fab fa-instagram text-orange-500 hover:text-orange-600 cursor-pointer text-xl"></i>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 KTU BizConnect. All rights reserved. Empowering KTU student entrepreneurs.</p>
        </div>
      </div>
    </footer>
  );
};
