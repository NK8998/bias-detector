import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Modal({
  children,
  isOpen,
  setIsOpen,
  title, // Added a title prop for the header
}: {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
}) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // The modal relies on a target element existing in the DOM, e.g., <div id="modal-target" />
    const element = document.getElementById("modal-target");
    if (element) setTargetElement(element);
  }, []);

  if (!targetElement) return null;

  return createPortal(
    isOpen ? (
      <div className='fixed inset-0 flex items-center justify-center z-100 p-4'>
        {/* Frosted Glass Backdrop */}
        <div
          className='fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm transition-opacity duration-300'
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Modal Content Box */}
        <div
          className='rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden bg-white transform scale-100 transition-transform duration-300 z-101'
          onClick={(e) => e.stopPropagation()} // Prevent clicking the backdrop when clicking content
        >
          {/* Header with Title and Close Button */}
          <div className='flex items-center justify-between p-4  border-gray-200 bg-gray-50'>
            <h2 className='text-xl font-bold text-gray-800'>{title}</h2>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsOpen(false)}
              className='text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors'
              aria-label='Close modal'
            >
              <X className='w-5 h-5' />
            </Button>
          </div>

          {/* Main Content Area */}
          <div className='p-0 overflow-y-auto max-h-[calc(95vh-60px)]'>
            {children}
          </div>
        </div>
      </div>
    ) : null,
    targetElement
  );
}
