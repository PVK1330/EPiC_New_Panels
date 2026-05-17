import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option(s)", 
  searchPlaceholder = "Search...",
  label,
  error,
  required,
  isMulti = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const getValue = () => {
    if (isMulti) return Array.isArray(value) ? value : [];
    return value;
  };

  const currentValues = getValue();

  const selectedOptions = isMulti 
    ? options.filter(opt => currentValues.includes(opt.value))
    : options.find(opt => String(opt.value) === String(value));

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleOption = (val) => {
    if (isMulti) {
      const nextValue = currentValues.includes(val)
        ? currentValues.filter(v => v !== val)
        : [...currentValues, val];
      onChange(nextValue);
    } else {
      onChange(val);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const removeOption = (e, val) => {
    e.stopPropagation();
    onChange(currentValues.filter(v => v !== val));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold cursor-pointer transition-all min-h-[46px] sm:px-4 ${
          isOpen ? 'border-secondary ring-2 ring-secondary/20 shadow-sm' : 'border-gray-200 hover:border-gray-300'
        } ${error ? 'border-primary' : ''} bg-white`}
      >
        {isMulti && selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedOptions.map(opt => (
              <span 
                key={opt.value} 
                className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-1 rounded-lg text-xs font-black border border-secondary/20"
              >
                {opt.label}
                <X 
                  size={14} 
                  className="hover:text-primary transition-colors cursor-pointer" 
                  onClick={(e) => removeOption(e, opt.value)}
                />
              </span>
            ))}
          </div>
        ) : !isMulti && selectedOptions ? (
          <span className="text-gray-900">{selectedOptions.label}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isMulti && selectedOptions.length > 0 && (
            <div 
              className="p-1 hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
            >
              <X size={14} className="text-gray-400" />
            </div>
          )}
          <ChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={18} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  autoFocus
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-secondary/10 outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = isMulti 
                    ? currentValues.includes(opt.value)
                    : String(value) === String(opt.value);
                    
                  return (
                    <div
                      key={opt.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(opt.value);
                      }}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-secondary/5 text-secondary' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isMulti && (
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-secondary border-secondary' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-black">{opt.label}</p>
                          {opt.sublabel && (
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{opt.sublabel}</p>
                          )}
                        </div>
                      </div>
                      {!isMulti && isSelected && (
                        <Check className="text-secondary" size={16} />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-bold text-gray-400">No results found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-primary font-bold">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
