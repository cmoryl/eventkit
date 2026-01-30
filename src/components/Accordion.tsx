import React, { useState, useRef, useEffect } from 'react';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState('0px');

  useEffect(() => {
    setHeight(isOpen ? `${contentRef.current?.scrollHeight}px` : '0px');
  }, [isOpen]);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-md">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-3 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-200 text-left">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: height }}
        className="overflow-hidden transition-max-height duration-500 ease-in-out"
      >
        <div className="p-3 border-t border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
