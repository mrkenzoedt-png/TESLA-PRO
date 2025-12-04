
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Copy, Zap, BarChart3, Wifi, Cpu, Layers, Clock, Activity, BrainCircuit, Upload, Image as ImageIcon, X, Trash2, LogOut, Settings, Terminal, Send, Filter } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { TRADING_PLATFORMS, PLATFORM_ASSETS, ANALYSIS_STRATEGIES, SUCCESS_RATES, PREDICTION_MODELS } from '../constants';
import { generateSignal } from '../services/signalService';
import { getRealMarketDirection } from '../services/marketService';
import { Signal, Direction } from '../types';
import CyberBackground from './ui/CyberBackground';
import Button from './ui/Button';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'ai' | 'signals'>('config');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Form State
  const [selectedPlatform, setSelectedPlatform] = useState<string>(TRADING_PLATFORMS[0]);
  const [availableAssets, setAvailableAssets] = useState<string[]>(PLATFORM_ASSETS[TRADING_PLATFORMS[0]]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([PLATFORM_ASSETS[TRADING_PLATFORMS[0]][0]]);
  const [martingaleLevel, setMartingaleLevel] = useState(ANALYSIS_STRATEGIES[0]);
  const [successRate, setSuccessRate] = useState(SUCCESS_RATES[0]);
  const [predictionModel, setPredictionModel] = useState(PREDICTION_MODELS[0]);
  const [signalCount, setSignalCount] = useState(10);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSignals, setGeneratedSignals] = useState<Signal[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isCopyingAll, setIsCopyingAll] = useState(false);
  
  // Filter State
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  
  // Popup State
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);

  // AI Analysis State
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ direction: string, reason: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1 Minute Telegram Popup Timer
  useEffect(() => {
    const popupTimer = setInterval(() => {
      setShowTelegramPopup(true);
    }, 60000); // 60 seconds
    return () => clearInterval(popupTimer);
  }, []);

  // Update assets when platform changes
  useEffect(() => {
    const assets = PLATFORM_ASSETS[selectedPlatform] || [];
    setAvailableAssets(assets);
    setSelectedAssets([assets[0]]);
  }, [selectedPlatform]);

  const handleAssetSelect = (asset: string) => {
    if (selectedAssets.includes(asset)) {
      if (selectedAssets.length > 1) {
        setSelectedAssets(selectedAssets.filter(a => a !== asset));
      }
    } else {
      if (selectedAssets.length < 10) {
        setSelectedAssets([...selectedAssets, asset]);
      }
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setActiveTab('signals');
    setFilterDirection('ALL'); // Reset filter on new generation

    const duration = 2500;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    // If Real Market, fetch directions beforehand to use during generation
    let realMarketDirections: Record<string, Direction> = {};
    if (selectedPlatform === 'Real Market') {
        // Fetch direction for selected assets
        for (const asset of selectedAssets) {
            realMarketDirections[asset] = await getRealMarketDirection(asset);
        }
    }

    const interval = setInterval(() => {
      currentStep++;
      setGenerationProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(interval);
        
        // Generate Signals
        const newSignals: Signal[] = [];
        let baseTime = new Date();
        baseTime.setSeconds(0);
        baseTime.setMilliseconds(0);
        
        // Start calculation from the next minute
        let currentTimePointer = new Date(baseTime.getTime() + 60000);
        const gaps = [3, 5, 7, 6]; 

        for (let i = 0; i < signalCount; i++) {
          const randomAsset = selectedAssets[Math.floor(Math.random() * selectedAssets.length)];
          const gap = i === 0 ? 0 : gaps[(i - 1) % gaps.length];
          currentTimePointer = new Date(currentTimePointer.getTime() + gap * 60000);
          
          const utcHours = currentTimePointer.getUTCHours();
          const utcMinutes = currentTimePointer.getUTCMinutes();
          
          // Bangladesh is UTC+6
          const bangladeshOffset = 6;
          const bdHours = (utcHours + bangladeshOffset) % 24;
          const timeString = `${String(bdHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}`;

          let dir: Direction;
          if (selectedPlatform === 'Real Market' && realMarketDirections[randomAsset]) {
             dir = realMarketDirections[randomAsset];
             // Add a bit of randomness to avoid all signals being identical if user selects 1 asset
             if(Math.random() > 0.85) { // 98% win rate attempt logic implies following market mostly
                dir = dir === Direction.BUY ? Direction.SELL : Direction.BUY;
             }
          } else {
             const directions = [Direction.BUY, Direction.SELL];
             dir = directions[Math.floor(Math.random() * directions.length)];
          }

          newSignals.push({
            pair: randomAsset,
            time: timeString,
            duration: '1 MINUTE',
            direction: dir,
            mtg: martingaleLevel === 'Martingale Level 1' ? 'MTG 1' : 'MTG 2',
            timestamp: Date.now() + i
          });
        }
        
        setGeneratedSignals(newSignals);
        setIsGenerating(false);
      }
    }, intervalTime);
  };

  const cleanAssetName = (asset: string) => {
    // Removes slash, (OTC), parenthesis, and spaces
    return asset.replace(/[\/\s]/g, '').replace('OTC', '').replace('(', '').replace(')', '');
  };

  const filteredSignals = generatedSignals.filter(s => {
    if (filterDirection === 'ALL') return true;
    return s.direction === filterDirection;
  });

  const copySignal = (signal: Signal) => {
    const cleanAsset = cleanAssetName(signal.pair);
    const type = selectedPlatform === 'Real Market' ? 'Market' : 'OTC';
    const dirText = signal.direction === 'SELL' ? 'PUT' : 'CALL';
    // Single signal copy format
    const text = `•${signal.time} → ${cleanAsset} | ${type} | ${dirText}`;
    navigator.clipboard.writeText(text);
    setCopiedId(signal.timestamp);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllSignals = () => {
    if (filteredSignals.length === 0) return;
    setIsCopyingAll(true);

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    const mtgValue = martingaleLevel.includes('1') ? '01' : '02';

    const header = `🖥${dateStr}\n\n⌛UTC +06:00 BANGLADESH 🇧🇩\n\n❗️ AVOID SIGNAL AFTER BIG MOMENTUM, DOJI, BELOW 80%, GAPS 😊\n\n⚡️MARTINGALE:-${mtgValue}\n\n📊 SIGNALS LIST:\n\n`;
    
    const body = filteredSignals.map(s => {
       const type = selectedPlatform === 'Real Market' ? 'Market' : 'OTC';
       const dirText = s.direction === 'SELL' ? 'PUT' : 'CALL';
       const cleanAsset = cleanAssetName(s.pair);
       return `•${s.time} → ${cleanAsset} | ${type} | ${dirText}`;
    }).join('\n');

    const footer = `\n\nJOIN NOW CHANNEL UPDATE BOT 👇👇👇👇👇\nhttps://t.me/teslabot00`;

    const fullText = header + body + footer;

    navigator.clipboard.writeText(fullText);
    setTimeout(() => setIsCopyingAll(false), 2000);
  };

  // --- AI Logic ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setAiAnalysisResult(null); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAiAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeWithGemini = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

      const prompt = `
        Act as an expert technical analyst for binary options and forex. 
        Analyze this chart screenshot.
        Identify key technical indicators and price action patterns.
        Output format:
        DIRECTION: [BUY or SELL]
        REASON: [Brief 1-sentence explanation]
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
            { text: prompt }
          ]
        }
      });

      const text = response.text || '';
      const directionMatch = text.match(/DIRECTION:\s*(BUY|SELL)/i);
      const reasonMatch = text.match(/REASON:\s*(.*)/i);

      setAiAnalysisResult({
        direction: directionMatch ? directionMatch[1].toUpperCase() : 'NEUTRAL',
        reason: reasonMatch ? reasonMatch[1].trim() : 'Analysis completed. Market conditions unclear.'
      });

    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      setAiAnalysisResult({
        direction: 'ERROR',
        reason: 'Failed to analyze chart. Check connection and try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] bg-grid text-gray-200 font-sans relative flex flex-col overflow-hidden">
      <CyberBackground state={isGenerating ? 'loading' : 'idle'} />
      
      {/* Telegram Popup Modal */}
      {showTelegramPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-[#111] border border-red-600/50 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-blue-600" />
              <button 
                onClick={() => setShowTelegramPopup(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                 <Send className="w-8 h-8 text-blue-400 -ml-1" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">JOIN SIGNAL CHANNEL</h3>
              <p className="text-xs text-gray-400 mb-6">
                 Get exclusive signals, updates and premium strategies for free.
              </p>
              
              <button 
                 onClick={() => window.open('https://t.me/forenixbot', '_blank')}
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-3"
              >
                 Join Now
              </button>
              
              <button 
                 onClick={() => setShowTelegramPopup(false)}
                 className="text-xs text-gray-600 hover:text-gray-400 underline"
              >
                 Skip for now
              </button>
           </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
               <Zap className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tighter text-white font-[Rajdhani] leading-none">
                 TESLA <span className="text-red-500 text-glow-red">PRO</span>
               </h1>
               <div className="flex items-center gap-2 mt-0.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-mono">System v4.0 Online</span>
               </div>
             </div>
          </div>
          
          {/* Status HUD */}
          <div className="hidden md:flex items-center gap-6 bg-black/40 border border-white/5 px-6 py-2 rounded-full backdrop-blur-md">
             <div className="flex flex-col items-end border-r border-white/10 pr-6">
                <span className="text-[10px] text-gray-500 uppercase font-mono">Server Time (UTC+6)</span>
                <span className="text-red-500 font-bold font-mono text-lg leading-none tracking-widest">
                   {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </span>
             </div>
             <div className="flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-500 uppercase font-mono">Ping</span>
                   <span className="text-green-500 font-bold text-xs font-mono">23ms</span>
                </div>
                <Wifi className="w-4 h-4 text-gray-600" />
             </div>
          </div>

          <button onClick={onLogout} className="group flex items-center gap-2 text-xs font-bold text-red-500 hover:text-white transition-colors border border-red-900/30 hover:border-red-500 hover:bg-red-600 px-4 py-2 rounded-lg uppercase tracking-wider">
             <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
             <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid gap-8 z-10 animate-fade-in">
        
        {/* Navigation Tabs */}
        <div className="glass-panel p-1.5 rounded-xl flex overflow-x-auto gap-2">
           {[
             { id: 'config', icon: Settings, label: 'Configuration' },
             { id: 'ai', icon: BrainCircuit, label: 'AI Chart Vision' },
             { id: 'signals', icon: Activity, label: 'Live Signals' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`
                 relative flex-1 min-w-[140px] py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-all duration-300
                 ${activeTab === tab.id 
                    ? 'text-white bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'}
               `}
             >
               <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* --- CONFIG TAB --- */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             
             {/* Left Column: Platform & Assets */}
             <div className="lg:col-span-7 space-y-6">
                <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full border-t-2 border-t-red-500">
                   <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                         <Layers className="w-4 h-4 text-red-500" /> Platform Selection
                      </h3>
                   </div>
                   
                   <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {TRADING_PLATFORMS.map(platform => (
                            <button
                               key={platform}
                               onClick={() => setSelectedPlatform(platform)}
                               className={`
                                 relative p-4 rounded-xl border transition-all duration-300 group overflow-hidden text-left
                                 ${selectedPlatform === platform 
                                   ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                                   : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-white/5'}
                               `}
                            >
                               <div className={`text-xs font-mono mb-1 ${selectedPlatform === platform ? 'text-red-400' : 'text-gray-500'}`}>
                                   {platform === 'Real Market' ? 'LIVE FEED' : 'BROKER'}
                               </div>
                               <div className="font-bold text-sm text-white">{platform}</div>
                               {selectedPlatform === platform && (
                                  <div className="absolute top-0 right-0 p-1.5">
                                     <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
                                  </div>
                               )}
                            </button>
                         ))}
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between items-end">
                            <label className="text-xs text-gray-500 uppercase font-mono tracking-wider">Available Assets</label>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-900/50">
                               {selectedAssets.length} Selected
                            </span>
                         </div>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                            {availableAssets.map(asset => (
                               <div 
                                 key={asset} 
                                 onClick={() => handleAssetSelect(asset)}
                                 className={`
                                    cursor-pointer px-3 py-2 rounded text-xs font-mono border transition-all duration-200 flex items-center justify-between
                                    ${selectedAssets.includes(asset) 
                                       ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                                       : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'}
                                 `}
                               >
                                  {asset}
                                  {selectedAssets.includes(asset) && <CheckCircle className="w-3 h-3 ml-1" />}
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Strategy */}
             <div className="lg:col-span-5 space-y-6">
                <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full border-t-2 border-t-blue-500">
                   <div className="p-4 border-b border-white/5 bg-white/5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                         <Cpu className="w-4 h-4 text-blue-500" /> Strategy Config
                      </h3>
                   </div>
                   
                   <div className="p-6 space-y-6 flex-1">
                      <div className="space-y-4">
                         {[
                            { label: 'Risk Management', value: martingaleLevel, setter: setMartingaleLevel, options: ANALYSIS_STRATEGIES },
                            { label: 'Success Probability', value: successRate, setter: setSuccessRate, options: SUCCESS_RATES },
                            { label: 'Prediction Model', value: predictionModel, setter: setPredictionModel, options: PREDICTION_MODELS }
                         ].map((field, idx) => (
                            <div key={idx} className="space-y-2">
                               <label className="text-xs text-gray-500 uppercase font-mono tracking-wider">{field.label}</label>
                               <div className="relative">
                                  <select 
                                     value={field.value}
                                     onChange={(e) => field.setter(e.target.value)}
                                     className="w-full bg-black/40 border border-white/10 text-gray-200 text-sm p-4 rounded-xl outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:bg-white/5"
                                  >
                                     {field.options.map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                               </div>
                            </div>
                         ))}
                         
                         <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-mono tracking-wider">Signal Quantity</label>
                            <input 
                               type="range" min="1" max="20" 
                               value={signalCount}
                               onChange={(e) => setSignalCount(Number(e.target.value))}
                               className="w-full accent-blue-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs font-mono text-gray-500">
                               <span>1 Signal</span>
                               <span className="text-blue-400">{signalCount} Signals</span>
                               <span>20 Signals</span>
                            </div>
                         </div>
                      </div>

                      <div className="pt-4">
                         <Button 
                            onClick={handleGenerate} 
                            isLoading={isGenerating} 
                            fullWidth 
                            variant="primary"
                         >
                            {isGenerating ? 'ANALYZING MARKET DATA...' : 'INITIATE ANALYSIS'}
                         </Button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- AI TAB --- */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-[500px]">
            {/* Upload Area */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="glass-panel rounded-2xl p-1 flex-1 flex flex-col relative group">
                 <div className="absolute inset-0 bg-red-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="relative flex-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/5 overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    
                    {selectedImage ? (
                       <div className="w-full h-full relative z-10">
                          <img src={selectedImage} alt="Preview" className="w-full h-full object-contain rounded-lg shadow-2xl" />
                          <div className="absolute top-2 right-2 z-30">
                             <button onClick={(e) => { e.stopPropagation(); clearImage(); }} className="p-2 bg-black/60 backdrop-blur rounded-full hover:bg-red-600 transition-colors text-white">
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    ) : (
                       <div className="relative z-10 space-y-4">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 group-hover:border-red-500/30 transition-all duration-500">
                             <Upload className="w-8 h-8 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </div>
                          <div>
                             <h3 className="text-lg font-bold text-white">Upload Chart</h3>
                             <p className="text-xs text-gray-500 mt-2 max-w-[200px] mx-auto">
                                Drop screenshot from Pocket Option or Quotex
                             </p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              <Button 
                onClick={handleAnalyzeWithGemini} 
                disabled={!selectedImage || isAnalyzing}
                isLoading={isAnalyzing}
                variant="neon"
                fullWidth
              >
                {isAnalyzing ? 'NEURAL SCANNING...' : 'ACTIVATE VISION AI'}
              </Button>
            </div>

            {/* Analysis Result */}
            <div className="md:col-span-8 glass-panel rounded-2xl overflow-hidden relative flex flex-col">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
               
               <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                     <Terminal className="w-4 h-4 text-green-500" /> Analysis Output
                  </h3>
                  {isAnalyzing && <div className="text-[10px] text-green-500 animate-pulse font-mono">PROCESSING...</div>}
               </div>

               <div className="flex-1 p-8 flex items-center justify-center relative">
                  {/* Background Visualization */}
                  <div className="absolute inset-0 opacity-10">
                     <div className="w-full h-full bg-grid-pattern" />
                  </div>

                  {!aiAnalysisResult ? (
                     <div className="text-center space-y-4 relative z-10 opacity-50">
                        <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center mx-auto animate-[spin_10s_linear_infinite]">
                           <div className="w-20 h-20 border-t border-red-500 rounded-full" />
                        </div>
                        <p className="text-sm font-mono text-gray-500">WAITING FOR INPUT DATA STREAM...</p>
                     </div>
                  ) : (
                     <div className="w-full max-w-2xl relative z-10 animate-fade-in">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                           
                           {/* Direction Orb */}
                           <div className="relative group">
                              <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 ${aiAnalysisResult.direction === 'BUY' ? 'border-green-500 bg-green-500/10 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : aiAnalysisResult.direction === 'SELL' ? 'border-red-500 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'border-gray-500'}`}>
                                 <span className={`text-4xl font-black tracking-tighter ${aiAnalysisResult.direction === 'BUY' ? 'text-green-500' : aiAnalysisResult.direction === 'SELL' ? 'text-red-500' : 'text-gray-400'}`}>
                                    {aiAnalysisResult.direction}
                                 </span>
                              </div>
                              <div className="absolute inset-0 rounded-full border border-white/20 scale-125 animate-[pulse_2s_infinite]" />
                           </div>

                           {/* Analysis Text */}
                           <div className="flex-1 space-y-4">
                              <div className="glass-panel p-6 rounded-xl border-l-4 border-l-white/20">
                                 <h4 className="text-xs text-gray-500 uppercase font-mono mb-2">Technical Reasoning</h4>
                                 <p className="text-gray-200 leading-relaxed font-light">
                                    "{aiAnalysisResult.reason}"
                                 </p>
                              </div>
                              <div className="flex gap-2 text-[10px] font-mono text-gray-500 uppercase">
                                 <span className="bg-white/5 px-2 py-1 rounded">Confidence: High</span>
                                 <span className="bg-white/5 px-2 py-1 rounded">Source: Gemini 2.5</span>
                              </div>
                           </div>

                        </div>
                     </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* --- SIGNALS TAB --- */}
        {activeTab === 'signals' && (
          <div className="glass-panel rounded-2xl flex flex-col h-[600px] border-t-2 border-t-green-500 overflow-hidden relative">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center z-10 relative gap-4">
               <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-bold text-white uppercase tracking-widest">Signal Feed</span>
               </div>
               
               {/* Filters & Actions */}
               <div className="flex items-center gap-4">
                  {!isGenerating && generatedSignals.length > 0 && (
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                      {(['ALL', 'BUY', 'SELL'] as const).map(dir => (
                        <button
                          key={dir}
                          onClick={() => setFilterDirection(dir)}
                          className={`
                             px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all
                             ${filterDirection === dir 
                               ? (dir === 'BUY' ? 'bg-green-600 text-white' : dir === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white') 
                               : 'text-gray-500 hover:text-white'}
                          `}
                        >
                          {dir === 'ALL' ? 'ALL' : `${dir} ONLY`}
                        </button>
                      ))}
                    </div>
                  )}

                  {!isGenerating && generatedSignals.length > 0 && (
                    <button 
                      onClick={copyAllSignals}
                      className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-900/20 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-900/40 transition-all"
                    >
                      {isCopyingAll ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopyingAll ? 'COPIED' : 'COPY LIST'}
                    </button>
                  )}
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-black/20">
               {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                     <div className="w-full max-w-md space-y-4 text-center">
                        <div className="text-4xl font-black text-white font-[Rajdhani] animate-pulse">
                           {Math.round(generationProgress)}<span className="text-red-500">%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_15px_#ef4444]" 
                              style={{ width: `${generationProgress}%`, transition: 'width 0.1s linear' }}
                           />
                        </div>
                        <div className="text-xs font-mono text-red-400 tracking-widest">
                           {selectedPlatform === 'Real Market' ? 'FETCHING REAL-TIME MARKET DATA...' : 'SCANNING GLOBAL MARKETS...'}
                        </div>
                     </div>
                  </div>
               ) : generatedSignals.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                     <BarChart3 className="w-16 h-16 mb-4 stroke-1" />
                     <p className="text-lg font-light font-[Rajdhani]">No Active Signals</p>
                     <p className="text-xs font-mono mt-2">Initialize scan from Configuration</p>
                  </div>
               ) : filteredSignals.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                     <Filter className="w-12 h-12 mb-4 stroke-1" />
                     <p className="text-sm font-light">No signals match filter: {filterDirection}</p>
                  </div>
               ) : (
                  <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-3">
                     {filteredSignals.map((signal, index) => (
                        <div 
                          key={signal.timestamp} 
                          className="group relative bg-[#0a0a0a] border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition-all duration-300 animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                           {/* Hover Glow */}
                           <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-xl bg-gradient-to-r ${signal.direction === 'BUY' ? 'from-green-500 to-transparent' : 'from-red-500 to-transparent'}`} />

                           <div className="flex items-center gap-5 relative z-10">
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-gray-400 border border-white/5">
                                 {String(generatedSignals.indexOf(signal) + 1).padStart(2, '0')}
                              </div>
                              <div>
                                 <div className="text-lg font-bold text-white tracking-wide">{cleanAssetName(signal.pair)}</div>
                                 <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-1">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {signal.time} (BD)</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                                    <span>{signal.duration}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-4 relative z-10">
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black tracking-wider shadow-lg ${
                                 signal.direction === 'BUY' 
                                 ? 'bg-gradient-to-r from-green-900/50 to-green-800/20 text-green-400 border border-green-500/30 shadow-green-900/20' 
                                 : 'bg-gradient-to-r from-red-900/50 to-red-800/20 text-red-400 border border-red-500/30 shadow-red-900/20'
                              }`}>
                                 {signal.direction === 'BUY' ? '▲ CALL' : '▼ PUT'}
                              </div>
                              
                              <button 
                                onClick={() => copySignal(signal)}
                                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                              >
                                {copiedId === signal.timestamp ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
            
            <div className="bg-black/40 backdrop-blur-md border-t border-white/5 p-2 flex justify-center">
               <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                  {selectedPlatform === 'Real Market' ? 'LIVE MARKET DATA ACTIVE' : 'OTC MARKET SIMULATION'}
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
