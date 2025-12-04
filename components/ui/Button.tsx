import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'neon';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  fullWidth, 
  variant = 'primary', 
  className = '', 
  disabled,
  ...props 
}) => {
  
  const baseStyles = "relative font-[Rajdhani] font-bold uppercase tracking-wider py-3.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505]";
  
  const variants = {
    primary: "bg-red-600 border-red-500 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] focus:ring-red-500",
    
    neon: "bg-transparent border-red-500 text-red-500 hover:bg-red-600 hover:text-white shadow-[0_0_10px_rgba(220,38,38,0.2),inset_0_0_10px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6),inset_0_0_20px_rgba(220,38,38,0.2)]",
    
    secondary: "bg-[#111] border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-[#222] hover:text-white focus:ring-gray-600",
    
    danger: "bg-red-900/30 border-red-800 text-red-200 hover:bg-red-900/50 hover:border-red-600",
    
    ghost: "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed grayscale' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Button Shine/Scan Effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1s_infinite] skew-x-12" />
      
      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </span>
    </button>
  );
};

export default Button;