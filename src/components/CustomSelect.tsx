import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import cx from 'classnames';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function CustomSelect({ options, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50 text-sm" ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-56 bg-background border border-border text-white rounded-md px-3 py-1.5 focus:outline-none hover:border-textMuted transition-colors"
      >
        <span className="flex items-center truncate">
          {selectedOption.icon && <span className="mr-2">{selectedOption.icon}</span>}
          {selectedOption.label}
        </span>
        <ChevronDown className={cx("w-4 h-4 text-textMuted ml-2 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-panel border border-border rounded-md shadow-xl overflow-hidden py-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cx(
                "flex items-center w-full text-left px-3 py-2 hover:bg-accent/20 transition-colors",
                option.value === value ? "bg-accent/10 text-accentLight" : "text-textMain"
              )}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
