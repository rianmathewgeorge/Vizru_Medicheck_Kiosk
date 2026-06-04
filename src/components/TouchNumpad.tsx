import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

interface TouchNumpadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  onClose: () => void;
  label: string;
}

export default function TouchNumpad({ value, onChange, maxLength, onClose, label }: TouchNumpadProps) {
  const handleKey = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (key === 'clear') {
      onChange('');
    } else {
      if (maxLength && value.length >= maxLength) return;
      onChange(value + key);
    }
  };

  const keys = ['1','2','3','4','5','6','7','8','9','clear','0','backspace'];

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-[420px] bg-white rounded-t-3xl shadow-2xl p-6 pb-8">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

          {/* Label + Done */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-gray-900 rounded-xl px-4 py-2 hover:bg-gray-700 transition-colors"
            >
              <CornerDownLeft size={13} />
              Done
            </button>
          </div>

          {/* Display */}
          <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-5 text-center min-h-[64px] flex items-center justify-center">
            {value ? (
              <span className="text-3xl font-black font-mono text-gray-900 tracking-[0.15em]">{value}</span>
            ) : (
              <span className="text-gray-300 text-lg font-medium">tap to enter</span>
            )}
          </div>

          {/* Keys */}
          <div className="grid grid-cols-3 gap-3">
            {keys.map((key) => (
              <button
                key={key}
                onMouseDown={(e) => { e.preventDefault(); handleKey(key); }}
                onTouchStart={(e) => { e.preventDefault(); handleKey(key); }}
                className={`
                  h-[60px] rounded-2xl font-bold text-xl select-none
                  transition-transform duration-75 active:scale-95
                  ${key === 'clear'
                    ? 'bg-gray-100 text-gray-500 text-sm tracking-widest hover:bg-gray-200'
                    : key === 'backspace'
                    ? 'bg-gray-900 text-white hover:bg-gray-700 flex items-center justify-center'
                    : 'bg-white border-2 border-gray-100 text-gray-900 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                  }
                `}
              >
                {key === 'backspace' ? (
                  <Delete size={22} className="mx-auto" />
                ) : key === 'clear' ? (
                  'CLR'
                ) : (
                  key
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
