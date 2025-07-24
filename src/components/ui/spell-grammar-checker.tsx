"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  BookOpen, 
  Lightbulb, 
  Zap,
  Eye,
  EyeOff,
  Settings,
  Languages,
  Target,
  TrendingUp,
  Clock,
  FileText,
  Sparkles
} from 'lucide-react';

// Types
export interface SpellError {
  id: string;
  word: string;
  position: { start: number; end: number };
  suggestions: string[];
  type: 'spelling' | 'grammar' | 'style' | 'punctuation';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  context: string;
}

export interface GrammarRule {
  id: string;
  name: string;
  description: string;
  category: 'grammar' | 'style' | 'punctuation' | 'clarity';
  enabled: boolean;
}

export interface WritingStats {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTime: number;
  readabilityScore: number;
  averageWordsPerSentence: number;
  averageSentencesPerParagraph: number;
  complexWords: number;
  passiveVoice: number;
}

export interface SpellGrammarCheckerProps {
  content: string;
  language: string;
  onContentChange: (content: string) => void;
  onErrorsChange?: (errors: SpellError[]) => void;
  enableRealTime?: boolean;
  enableAdvancedGrammar?: boolean;
  enableStyleSuggestions?: boolean;
  customDictionary?: string[];
  className?: string;
}

// Mock spell/grammar checking functions (in real implementation, these would call external APIs)
const checkSpelling = (text: string): SpellError[] => {
  const commonMisspellings = [
    { word: 'teh', correct: 'the' },
    { word: 'recieve', correct: 'receive' },
    { word: 'seperate', correct: 'separate' },
    { word: 'occured', correct: 'occurred' },
    { word: 'definately', correct: 'definitely' },
    { word: 'accomodate', correct: 'accommodate' },
    { word: 'neccessary', correct: 'necessary' },
    { word: 'existance', correct: 'existence' }
  ];

  const errors: SpellError[] = [];
  const words = text.split(/\s+/);
  let position = 0;

  words.forEach((word, index) => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    const misspelling = commonMisspellings.find(m => m.word === cleanWord);
    
    if (misspelling) {
      errors.push({
        id: `spell-${index}`,
        word: cleanWord,
        position: { start: position, end: position + word.length },
        suggestions: [misspelling.correct],
        type: 'spelling',
        severity: 'error',
        message: `"${cleanWord}" is misspelled`,
        context: text.substring(Math.max(0, position - 20), position + word.length + 20)
      });
    }
    
    position += word.length + 1;
  });

  return errors;
};

const checkGrammar = (text: string): SpellError[] => {
  const errors: SpellError[] = [];
  
  // Check for common grammar issues
  const grammarPatterns = [
    {
      pattern: /\b(your|you're)\b/gi,
      check: (match: string, context: string) => {
        if (match.toLowerCase() === 'your' && context.includes('you are')) {
          return { correct: "you're", message: 'Use "you\'re" (you are) instead of "your"' };
        }
        if (match.toLowerCase() === "you're" && !context.includes('you are')) {
          return { correct: 'your', message: 'Use "your" (possessive) instead of "you\'re"' };
        }
        return null;
      }
    },
    {
      pattern: /\b(its|it's)\b/gi,
      check: (match: string, context: string) => {
        if (match.toLowerCase() === 'its' && context.includes('it is')) {
          return { correct: "it's", message: 'Use "it\'s" (it is) instead of "its"' };
        }
        if (match.toLowerCase() === "it's" && !context.includes('it is')) {
          return { correct: 'its', message: 'Use "its" (possessive) instead of "it\'s"' };
        }
        return null;
      }
    }
  ];

  grammarPatterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.pattern.exec(text)) !== null) {
      const context = text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30);
      const correction = pattern.check(match[0], context);
      
      if (correction) {
        errors.push({
          id: `grammar-${patternIndex}-${match.index}`,
          word: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          suggestions: [correction.correct],
          type: 'grammar',
          severity: 'warning',
          message: correction.message,
          context
        });
      }
    }
  });

  return errors;
};

const checkStyle = (text: string): SpellError[] => {
  const errors: SpellError[] = [];
  
  // Check for passive voice
  const passivePatterns = [
    /\b(was|were|is|are|been|being)\s+\w+ed\b/gi,
    /\b(was|were|is|are|been|being)\s+\w+en\b/gi
  ];

  passivePatterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      errors.push({
        id: `style-passive-${patternIndex}-${match.index}`,
        word: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        suggestions: ['Consider using active voice'],
        type: 'style',
        severity: 'suggestion',
        message: 'Consider using active voice for clearer writing',
        context: text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20)
      });
    }
  });

  // Check for wordy phrases
  const wordyPhrases = [
    { phrase: 'in order to', suggestion: 'to' },
    { phrase: 'due to the fact that', suggestion: 'because' },
    { phrase: 'at this point in time', suggestion: 'now' },
    { phrase: 'for the purpose of', suggestion: 'to' }
  ];

  wordyPhrases.forEach((wordy, index) => {
    const regex = new RegExp(`\\b${wordy.phrase}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      errors.push({
        id: `style-wordy-${index}-${match.index}`,
        word: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        suggestions: [wordy.suggestion],
        type: 'style',
        severity: 'suggestion',
        message: `Consider using "${wordy.suggestion}" instead of "${wordy.phrase}"`,
        context: text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20)
      });
    }
  });

  return errors;
};

const calculateWritingStats = (text: string): WritingStats => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const complexWords = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return cleanWord.length > 6 || /[A-Z].*[A-Z]/.test(cleanWord);
  }).length;

  const passiveVoiceCount = (text.match(/\b(was|were|is|are|been|being)\s+\w+(ed|en)\b/gi) || []).length;

  const readingTime = Math.ceil(words.length / 200); // Average reading speed
  const readabilityScore = Math.max(0, Math.min(100, 
    206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (complexWords / words.length))
  ));

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    readingTime,
    readabilityScore: Math.round(readabilityScore),
    averageWordsPerSentence: Math.round((words.length / sentences.length) * 10) / 10,
    averageSentencesPerParagraph: Math.round((sentences.length / paragraphs.length) * 10) / 10,
    complexWords,
    passiveVoice: passiveVoiceCount
  };
};

export function SpellGrammarChecker({
  content,
  language = 'en-US',
  onContentChange,
  onErrorsChange,
  enableRealTime = true,
  enableAdvancedGrammar = true,
  enableStyleSuggestions = true,
  customDictionary = [],
  className = ""
}: SpellGrammarCheckerProps) {
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [ignoredWords, setIgnoredWords] = useState<string[]>([]);
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>({
    spelling: true,
    grammar: enableAdvancedGrammar,
    style: enableStyleSuggestions,
    punctuation: true
  });

  // Calculate writing statistics
  const writingStats = useMemo(() => calculateWritingStats(content), [content]);

  // Check content for errors
  const checkContent = useCallback(async () => {
    if (!content.trim()) {
      setErrors([]);
      return;
    }

    setIsChecking(true);
    
    try {
      const allErrors: SpellError[] = [];
      
      if (enabledRules.spelling) {
        const spellErrors = checkSpelling(content);
        allErrors.push(...spellErrors.filter(error => !ignoredWords.includes(error.word)));
      }
      
      if (enabledRules.grammar) {
        const grammarErrors = checkGrammar(content);
        allErrors.push(...grammarErrors);
      }
      
      if (enabledRules.style) {
        const styleErrors = checkStyle(content);
        allErrors.push(...styleErrors);
      }

      setErrors(allErrors);
      onErrorsChange?.(allErrors);
    } catch (error) {
      console.error('Error checking content:', error);
    } finally {
      setIsChecking(false);
    }
  }, [content, enabledRules, ignoredWords, onErrorsChange]);

  // Real-time checking with debounce
  useEffect(() => {
    if (!enableRealTime) return;

    const timer = setTimeout(() => {
      checkContent();
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, checkContent, enableRealTime]);

  // Apply suggestion
  const applySuggestion = (error: SpellError, suggestion: string) => {
    const newContent = 
      content.substring(0, error.position.start) +
      suggestion +
      content.substring(error.position.end);
    
    onContentChange(newContent);
    
    // Remove the applied error
    setErrors(prev => prev.filter(e => e.id !== error.id));
  };

  // Ignore word
  const ignoreWord = (word: string) => {
    setIgnoredWords(prev => [...prev, word]);
    setErrors(prev => prev.filter(e => e.word !== word));
  };

  // Ignore error
  const ignoreError = (errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  };

  // Get error counts by type
  const errorCounts = {
    spelling: errors.filter(e => e.type === 'spelling').length,
    grammar: errors.filter(e => e.type === 'grammar').length,
    style: errors.filter(e => e.type === 'style').length,
    punctuation: errors.filter(e => e.type === 'punctuation').length
  };

  const totalErrors = errors.length;
  const criticalErrors = errors.filter(e => e.severity === 'error').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Checking...</span>
              </>
            ) : totalErrors === 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">No issues found</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm">
                  {totalErrors} issue{totalErrors !== 1 ? 's' : ''} found
                  {criticalErrors > 0 && ` (${criticalErrors} critical)`}
                </span>
              </>
            )}
          </div>

          {totalErrors > 0 && (
            <div className="flex items-center gap-2">
              {errorCounts.spelling > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {errorCounts.spelling} spelling
                </Badge>
              )}
              {errorCounts.grammar > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {errorCounts.grammar} grammar
                </Badge>
              )}
              {errorCounts.style > 0 && (
                <Badge variant="outline" className="text-xs">
                  {errorCounts.style} style
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkContent()}
            disabled={isChecking}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Now
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPanel(!showPanel)}
          >
            {showPanel ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Details
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Writing Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Writing Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Words:</span>
                      <span className="ml-2 font-medium">{writingStats.wordCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sentences:</span>
                      <span className="ml-2 font-medium">{writingStats.sentenceCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paragraphs:</span>
                      <span className="ml-2 font-medium">{writingStats.paragraphCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reading time:</span>
                      <span className="ml-2 font-medium">{writingStats.readingTime} min</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Readability Score:</span>
                      <Badge 
                        variant={writingStats.readabilityScore > 60 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {writingStats.readabilityScore}/100
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Avg. words per sentence: {writingStats.averageWordsPerSentence}
                    </div>
                    
                    {writingStats.passiveVoice > 0 && (
                      <div className="text-xs text-orange-600">
                        {writingStats.passiveVoice} passive voice instances
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Error Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Issues Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {totalErrors === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Great job! No issues found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(errorCounts).map(([type, count]) => {
                        if (count === 0) return null;
                        
                        const getTypeIcon = (type: string) => {
                          switch (type) {
                            case 'spelling': return BookOpen;
                            case 'grammar': return Target;
                            case 'style': return Sparkles;
                            case 'punctuation': return FileText;
                            default: return AlertTriangle;
                          }
                        };
                        
                        const TypeIcon = getTypeIcon(type);
                        
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="w-4 h-4" />
                              <span className="text-sm capitalize">{type}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {count}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Check Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(enabledRules).map(([rule, enabled]) => (
                    <div key={rule} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{rule}</span>
                      <Button
                        variant={enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEnabledRules(prev => ({ ...prev, [rule]: !enabled }))}
                      >
                        {enabled ? 'On' : 'Off'}
                      </Button>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time checking</span>
                    <Badge variant={enableRealTime ? "default" : "outline"} className="text-xs">
                      {enableRealTime ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Language</span>
                    <Badge variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Errors List */}
            {errors.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Issues to Fix</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-3">
                      {errors.map(error => (
                        <ErrorItem
                          key={error.id}
                          error={error}
                          isSelected={selectedError === error.id}
                          onSelect={() => setSelectedError(error.id)}
                          onApplySuggestion={(suggestion) => applySuggestion(error, suggestion)}
                          onIgnore={() => ignoreError(error.id)}
                          onIgnoreWord={() => ignoreWord(error.word)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Error Item Component
interface ErrorItemProps {
  error: SpellError;
  isSelected: boolean;
  onSelect: () => void;
  onApplySuggestion: (suggestion: string) => void;
  onIgnore: () => void;
  onIgnoreWord: () => void;
}

function ErrorItem({
  error,
  isSelected,
  onSelect,
  onApplySuggestion,
  onIgnore,
  onIgnoreWord
}: ErrorItemProps) {
  const getErrorIcon = (type: SpellError['type']) => {
    switch (type) {
      case 'spelling': return BookOpen;
      case 'grammar': return Target;
      case 'style': return Sparkles;
      case 'punctuation': return FileText;
      default: return AlertTriangle;
    }
  };

  const getErrorColor = (severity: SpellError['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-600 border-red-200';
      case 'warning': return 'text-orange-600 border-orange-200';
      case 'suggestion': return 'text-blue-600 border-blue-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const ErrorIcon = getErrorIcon(error.type);
  const colorClass = getErrorColor(error.severity);

  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''} border-l-4 ${colorClass}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ErrorIcon className="w-5 h-5 mt-0.5" />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{error.message}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {error.type}
              </Badge>
              <Badge 
                variant={error.severity === 'error' ? 'destructive' : 'secondary'} 
                className="text-xs capitalize"
              >
                {error.severity}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Context: "...{error.context}..."
            </div>
            
            {error.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {error.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplySuggestion(suggestion);
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onIgnore();
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Ignore
              </Button>
              
              {error.type === 'spelling' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onIgnoreWord();
                  }}
                >
                  Ignore "{error.word}"
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}