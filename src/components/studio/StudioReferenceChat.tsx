import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Sparkles, Send, Loader2, Image as ImageIcon,
  MessageSquare, ChevronDown, ChevronUp, Palette, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
}

interface StudioReferenceChatProps {
  studioType: string;
  studioName: string;
  studioGradient: string;
  onAnalysisComplete?: (analysis: string) => void;
}

export const StudioReferenceChat: React.FC<StudioReferenceChatProps> = ({
  studioType,
  studioName,
  studioGradient,
  onAnalysisComplete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = referenceImages.length + files.length;
    if (totalImages > 8) {
      toast.error('Maximum 8 reference images per studio');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setReferenceImages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
    if (referenceImages.length <= 1) {
      setAnalysisComplete(false);
      setMessages([]);
    }
  };

  const streamResponse = async (
    action: 'analyze' | 'chat',
    userMessages: ChatMessage[],
    images?: string[]
  ) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/studio-chat`;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        referenceImages: images,
        studioType,
        action,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errData.error || `Error ${resp.status}`);
    }

    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullText } : m);
              }
              return [...prev, { role: 'assistant', content: fullText }];
            });
          }
        } catch { /* partial json */ }
      }
    }

    return fullText;
  };

  const handleAnalyze = async () => {
    if (referenceImages.length === 0) {
      toast.error('Upload at least one reference image');
      return;
    }

    setIsAnalyzing(true);
    setIsExpanded(true);
    setMessages([]);

    try {
      const analysis = await streamResponse('analyze', [], referenceImages);
      setAnalysisComplete(true);
      onAnalysisComplete?.(analysis);
      toast.success('Reference analysis complete — style profile extracted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);

    try {
      const history = [...messages, userMsg];
      const fullResponse = await streamResponse(
        'chat',
        history,
        analysisComplete ? undefined : referenceImages
      );
      onAnalysisComplete?.(fullResponse);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-8 border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-gradient-to-br', studioGradient)}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">AI Reference Studio</h3>
            <p className="text-xs text-muted-foreground">
              Upload examples &amp; chat with AI to fine-tune your {studioName} designs
            </p>
          </div>
          {referenceImages.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {referenceImages.length} reference{referenceImages.length > 1 ? 's' : ''}
            </Badge>
          )}
          {analysisComplete && (
            <Badge className="text-xs bg-accent/20 text-accent-foreground border-accent/30">
              Analyzed
            </Badge>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t p-4 space-y-4">
              {/* Upload Area */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Reference Images ({referenceImages.length}/8)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {referenceImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border group"
                    >
                      <img src={img} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {referenceImages.length < 8 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-[9px]">Upload</span>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {referenceImages.length > 0 && !analysisComplete && (
                  <Button
                    className={cn('mt-3 gap-2 bg-gradient-to-r', studioGradient)}
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Analyze &amp; Extract Style
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Chat Thread */}
              {messages.length > 0 && (
                <div
                  ref={scrollRef}
                  className="max-h-80 overflow-y-auto space-y-3 pr-1"
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      AI is thinking...
                    </div>
                  )}
                </div>
              )}

              {/* Chat Input */}
              {(analysisComplete || messages.length > 0) && (
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Refine the style... e.g. 'Make it more minimal' or 'Use warmer tones'"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isStreaming || isAnalyzing}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isStreaming}
                    className={cn('bg-gradient-to-r shrink-0', studioGradient)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {referenceImages.length === 0 && messages.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Upload reference images to get started</p>
                  <p className="text-xs mt-1">
                    The AI will analyze your examples and extract style profiles for asset generation
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
