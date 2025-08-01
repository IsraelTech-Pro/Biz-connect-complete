import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function AnimatedModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg' 
}: AnimatedModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`relative bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">{title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]" aria-describedby="modal-content">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}