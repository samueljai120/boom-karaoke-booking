import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, className = '', placeholder = 'Select...', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState('bottom');
  const [rect, setRect] = useState(null);
  const [dropdownDims, setDropdownDims] = useState({ width: 0, height: 0 });
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debug logging for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
    }
  }, [value, options, placeholder]);

  const selectedOption = (options && Array.isArray(options) ? options.find(opt => opt.value === value) : null);

  useEffect(() => {
    if (!isOpen) return;
    if (selectRef.current) {
      const r = selectRef.current.getBoundingClientRect();
      setRect(r);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (dropdownRef.current) {
      const dh = dropdownRef.current.offsetHeight;
      const dw = dropdownRef.current.offsetWidth;
      setDropdownDims({ width: dw, height: dh });

      const viewportHeight = window.innerHeight;
      const r = selectRef.current.getBoundingClientRect();
      if (r.bottom + dh > viewportHeight - 12) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside both the select button and the dropdown
      const isClickInsideSelect = selectRef.current && selectRef.current.contains(event.target);
      const isClickInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      
      if (!isClickInsideSelect && !isClickInsideDropdown) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen && selectRef.current) {
        const r = selectRef.current.getBoundingClientRect();
        setRect(r);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleSelect = (option, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span className="block truncate text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && rect && createPortal(
        <div
          ref={dropdownRef}
          className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{
            position: 'fixed',
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            top: position === 'top' ? Math.round(rect.top - dropdownDims.height - 8) : Math.round(rect.bottom + 8),
            zIndex: 10000,
          }}
        >
          {options && options.length > 0 ? (
            options.map((option, index) => (
              <button
                key={option.key || option.value || index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-md last:rounded-b-md"
                onClick={(event) => handleSelect(option, event)}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="w-full px-3 py-2 text-sm text-gray-500 text-center">
              No options available
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export { CustomSelect };
export default CustomSelect;
