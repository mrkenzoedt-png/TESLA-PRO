
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Fingerprint, Power, ExternalLink, AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './ui/Button';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showErrorOptions, setShowErrorOptions] = useState(false);

  const CORRECT_PIN = '082535';
  const TELEGRAM_CHANNEL = 'https://t.me/forenixbot';
  const PASSWORD_BOT = 'https://t.me/teslabot00';

  const handleKeyPress = (num: string) => {
    if (isScanning) return;
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
      setShowErrorOptions(false);
    }
  };

  const handleBackspace = () => {
    if (isScanning) return;
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin === CORRECT_PIN) {
      setIsScanning(true);
      setTimeout(() => {
        onLogin();
      }, 1500);
    } else {
      setError(true);
      setShowErrorOptions(true);
      setPin('');
    }
  };

  const handleRetry = () => {
    setPin('');
    setError(false);
    setShowErrorOptions(false);
  };

  const openTelegram = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <div className="min-h-screen bg-[#030303] bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Holographic Header */}
        <div className="text-center mb-8 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/20 blur-3xl rounded-full"></div>
           <h1 className="text-4xl font-black tracking-tighter text-white font-[Rajdhani] relative z-10 drop-shadow-2xl">
              TESLA <span className="text-red-500 text-glow-red">PRO</span>
           </h1>
           <p className="text-xs text-red-500/80 uppercase tracking-[0.5em] mt-2 font-mono">
              Secure Terminal v4.0
           </p>
        </div>

        {/* Glass Panel */}
        <div className="glass-panel rounded-2xl p-8 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
               <div className="relative">
                  <Fingerprint className="w-20 h-20 text-red-500 animate-pulse" />
                  <div className="absolute inset-0 border-t-2 border-red-500 animate-scan w-full h-full opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
               </div>
               <div className="mt-4 text-red-500 font-mono text-xs tracking-widest animate-pulse">
                  AUTHENTICATING IDENTITY...
               </div>
            </div>
          )}

          <div className="flex justify-center mb-8 relative">
             <div className={`p-4 rounded-full border-2 transition-all duration-500 ${error ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-gray-700 bg-black/40'}`}>
                {error ? <Lock className="w-8 h-8 text-red-500" /> : <ShieldCheck className="w-8 h-8 text-gray-400" />}
             </div>
             {error && (
                <div className="absolute -bottom-6 text-red-500 text-[10px] font-bold tracking-widest animate-bounce">
                   INVALID ACCESS CODE
                </div>
             )}
          </div>

          {/* PIN Indicators */}
          <div className="flex justify-center gap-4 mb-10">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all duration-300 border ${
                  i < pin.length 
                    ? 'bg-red-500 border-red-500 shadow-[0_0_10px_#ef4444] scale-125' 
                    : 'bg-transparent border-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Error Options (Show when PIN wrong) */}
          {showErrorOptions && (
            <div className="mb-6 space-y-3 animate-fade-in">
              <button 
                onClick={() => openTelegram(PASSWORD_BOT)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600/20 border border-blue-500/50 text-blue-400 p-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-600/40 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Get Password
              </button>
              <button 
                 onClick={handleRetry}
                 className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 p-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-700 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Keypad */}
          {!showErrorOptions && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="group relative h-16 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/50 hover:bg-red-900/10 transition-all duration-200 active:scale-95 flex items-center justify-center overflow-hidden"
                >
                  <span className="text-2xl font-bold text-gray-300 group-hover:text-white font-[Rajdhani] relative z-10">{num}</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-600/0 via-red-600/0 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              
              <button 
                className="h-16 rounded-xl bg-transparent hover:bg-white/5 text-gray-500 flex items-center justify-center transition-colors"
                onClick={() => setPin('')}
              >
                <span className="text-xs font-bold tracking-widest">CLR</span>
              </button>
              
              <button
                onClick={() => handleKeyPress('0')}
                className="group relative h-16 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/50 hover:bg-red-900/10 transition-all duration-200 active:scale-95 flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-gray-300 group-hover:text-white font-[Rajdhani] relative z-10">0</span>
              </button>
              
              <button 
                className="h-16 rounded-xl bg-transparent hover:bg-white/5 text-gray-500 flex items-center justify-center transition-colors"
                onClick={handleBackspace}
              >
                <span className="text-xl">⌫</span>
              </button>
            </div>
          )}

          {!showErrorOptions && (
            <div className="space-y-3">
              <Button 
                onClick={() => {
                   if(pin.length < 6) {
                      handleSubmit(); // Will trigger error if incomplete, or just do nothing
                   }
                }}
                fullWidth 
                variant={pin.length >= 6 ? 'primary' : 'secondary'}
                className="shadow-lg"
              >
                <Power className="w-4 h-4 mr-2" />
                INITIATE SYSTEM
              </Button>

              <div className="w-full">
                 <button 
                   onClick={() => openTelegram(TELEGRAM_CHANNEL)}
                   className="w-full flex items-center justify-center gap-1 bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/20 hover:text-white py-3 rounded-lg text-[10px] font-bold uppercase transition-colors"
                 >
                   <ExternalLink className="w-3 h-3" /> Join Channel
                 </button>
              </div>
            </div>
          )}

        </div>
        
        <div className="mt-6 flex justify-between px-4 text-[10px] text-gray-600 font-mono">
           <span>ID: T-884X-Q</span>
           <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> SERVER ONLINE</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
