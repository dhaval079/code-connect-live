import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

interface OTPInputProps {
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  label?: string;
}

const OTPInput = ({ value, onChange, label = "OTP Code" }: OTPInputProps) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Update parent component's value
    onChange({ target: { value: otp.join('') } });
  }, [otp, onChange]);

  const handleChange = (element:any, index:any) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (element.value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e:any, index:any) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste event
    if (e.key === 'v' && e.ctrlKey) {
      e.preventDefault();
      const pastedData = e.clipboardData?.getData('text');
      if (pastedData?.length === 6 && !isNaN(pastedData)) {
        const otpArray = pastedData.split('');
        setOtp(otpArray);
        inputRefs.current[5]?.focus();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-1 ml-6">
        <Globe className="w-5 h-5 text-cyan-400" />
        <label className="text-sm font-medium text-cyan-300">
          {label}
        </label>
      </div>
      
      <div className="flex justify-between px-8 py-4">
        {otp.map((digit, index) => (
          <div key={index} className="relative">
            <motion.input
              ref={el => { inputRefs.current[index] = el }}
              value={digit}
              onChange={e => handleChange(e.target, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              maxLength={1}
              className="w-12 h-14 text-center text-xl font-bold text-white 
                         bg-slate-800/50 border-2 border-cyan-500/20 rounded-lg 
                         outline-none transition-all duration-300
                         focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            
            {/* Animated border effect */}
            <AnimatePresence>
              {focusedIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    initial={{ boxShadow: '0 0 0 0 rgba(6,182,212,0.6)' }}
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(6,182,212,0.6)',
                        '0 0 12px 2px rgba(6,182,212,0.8)',
                        '0 0 0 0 rgba(6,182,212,0.6)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OTPInput;