import React, { useState, useEffect, useCallback, useRef } from 'react';
import { correctText } from '../services/geminiService';
import { CorrectionResponse, ToneOption } from '../types';
import { IconCopy, IconCheck, IconLoader, IconRefresh, IconArrowRight, IconSparkles } from './Icons';

const DEBOUNCE_DELAY = 700; // Reduced debounce for a faster, more real-time feel

const Editor: React.FC<{ tone: ToneOption }> = ({ tone }) => {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Refs for managing debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestRef = useRef<number>(0);

  const performAnalysis = useCallback(async (textToAnalyze: string, currentTone: ToneOption) => {
    if (!textToAnalyze.trim()) {
      setResult(null);
      setIsAnalyzing(false);
      return;
    }

    if (textToAnalyze === lastAnalyzedInput && result && result.tone === currentTone) {
      return; // No change
    }

    setIsAnalyzing(true);
    setError(null);
    const requestId = ++requestRef.current;

    try {
      const data = await correctText(textToAnalyze, currentTone);
      
      // Race condition check: Only update if this is the latest request
      if (requestId === requestRef.current) {
        setResult(data);
        setLastAnalyzedInput(textToAnalyze);
      }
    } catch (err: any) {
      if (requestId === requestRef.current) {
        setError("Could not analyze text. Please try again.");
      }
    } finally {
      if (requestId === requestRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, [lastAnalyzedInput, result]);

  // Handle Input Change with Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInput(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newVal.trim().length > 3) {
      // Show loading state immediately if user stops typing for a bit to indicate "thinking"
      // But actual call happens after full delay
      debounceTimerRef.current = setTimeout(() => {
        performAnalysis(newVal, tone);
      }, DEBOUNCE_DELAY);
    } else {
      setResult(null);
    }
  };

  // Trigger re-analysis if Tone changes
  useEffect(() => {
    if (input.trim().length > 3) {
      performAnalysis(input, tone);
    }
  }, [tone, performAnalysis, input]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleCopy = () => {
    if (result?.correctedText) {
      navigator.clipboard.writeText(result.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAccept = () => {
      if(result?.correctedText) {
          setInput(result.correctedText);
          setLastAnalyzedInput(result.correctedText);
          // Optional: clear result or keep it? Keeping it implies "perfect match" now.
      }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
      
      {/* LEFT PANEL: INPUT */}
      <div className="flex-1 flex flex-col border-r border-slate-200 h-1/2 md:h-full relative group">
        <div className="bg-white border-b border-slate-100 px-4 py-2 flex justify-between items-center shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original Draft</span>
          {input.length > 0 && (
             <span className="text-xs text-slate-400">{input.length} chars</span>
          )}
        </div>
        <textarea
          className="flex-1 w-full p-6 resize-none outline-none text-slate-800 text-lg leading-relaxed placeholder:text-slate-300 bg-white"
          placeholder="Start typing your text here..."
          value={input}
          onChange={handleInputChange}
          spellCheck={false}
        />
        {/* Floating Action Button for Mobile if needed, or just overlays */}
      </div>

      {/* RIGHT PANEL: OUTPUT */}
      <div className="flex-1 flex flex-col h-1/2 md:h-full bg-slate-50/50 relative">
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-2 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Polished Version</span>
            {isAnalyzing && (
                <span className="flex items-center gap-1 text-xs text-indigo-400 animate-pulse">
                    <IconLoader className="w-3 h-3 animate-spin" />
                    Refining...
                </span>
            )}
           </div>
           
           <div className="flex items-center gap-1">
             {result && (
               <>
                 <button 
                   onClick={handleAccept}
                   className="text-xs flex items-center gap-1 px-2 py-1 hover:bg-indigo-50 text-indigo-600 rounded transition-colors"
                   title="Replace Original"
                 >
                    <IconArrowRight className="w-3 h-3" />
                    Use This
                 </button>
                 <div className="w-px h-3 bg-slate-200 mx-1"></div>
                 <button 
                   onClick={handleCopy}
                   className="text-xs flex items-center gap-1 px-2 py-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                   title="Copy to Clipboard"
                 >
                    {copied ? <IconCheck className="w-3 h-3 text-green-500" /> : <IconCopy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                 </button>
               </>
             )}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          {!input.trim() ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 select-none">
              <IconSparkles className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Context-aware corrections will appear here.</p>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-400">
               <p className="text-sm flex items-center gap-2">
                 <IconRefresh className="w-4 h-4" /> {error}
               </p>
            </div>
          ) : result ? (
             <div className="animate-fade-in space-y-8">
                <div className="prose prose-lg text-slate-800 leading-relaxed max-w-none">
                   {result.correctedText}
                </div>

                {/* Changes Summary Section */}
                <div className="mt-8 pt-6 border-t border-indigo-100">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        Key Improvements
                    </h3>
                    <div className="text-sm text-slate-600 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                        {/* Using Markdown rendering for simple lists or just whitespace handling */}
                         <div className="markdown-body text-sm leading-6 whitespace-pre-line">
                            {result.changesSummary}
                         </div>
                    </div>
                </div>
             </div>
          ) : isAnalyzing ? (
             <div className="space-y-4 opacity-50 pointer-events-none">
                {/* Skeleton Loader */}
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
             </div>
          ) : (
            <div className="text-slate-400 italic">Waiting for pause in typing...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;