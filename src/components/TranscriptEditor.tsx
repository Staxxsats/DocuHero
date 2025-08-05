import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Search,
  Replace,
  Check,
  X,
  Eye,
  EyeOff,
  Type,
  Palette,
  Download,
  Upload,
  Copy,
  Scissors,
  FileText,
  Save,
  RotateCcw,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface TranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  enableSpellCheck?: boolean;
  enableTimestamps?: boolean;
  enableSpeakerLabels?: boolean;
  enableAutoSave?: boolean;
  maxLength?: number;
  className?: string;
  readOnly?: boolean;
  onSave?: (content: string) => void;
  onAutoCorrect?: (corrections: Array<{original: string, corrected: string, position: number}>) => void;
}

interface FormatAction {
  type: 'bold' | 'italic' | 'underline' | 'heading' | 'list' | 'quote';
  payload?: any;
}

interface UndoRedoState {
  content: string;
  selection: { start: number; end: number };
  timestamp: number;
}

interface SpellCheckSuggestion {
  word: string;
  suggestions: string[];
  position: number;
  length: number;
}

interface TimestampEntry {
  time: string;
  text: string;
  speaker?: string;
}

export default function TranscriptEditor({
  value,
  onChange,
  placeholder = "Start typing or recording...",
  enableSpellCheck = true,
  enableTimestamps = false,
  enableSpeakerLabels = false,
  enableAutoSave = true,
  maxLength = 50000,
  className = '',
  readOnly = false,
  onSave,
  onAutoCorrect
}: TranscriptEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFormatting, setShowFormatting] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [undoStack, setUndoStack] = useState<UndoRedoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoRedoState[]>([]);
  const [spellCheckSuggestions, setSpellCheckSuggestions] = useState<SpellCheckSuggestion[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState('Speaker 1');
  const [speakerColors, setSpeakerColors] = useState<Record<string, string>>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize undo stack
  useEffect(() => {
    if (undoStack.length === 0 && value) {
      const initialState: UndoRedoState = {
        content: value,
        selection: { start: 0, end: 0 },
        timestamp: Date.now()
      };
      setUndoStack([initialState]);
    }
  }, [value, undoStack.length]);

  // Update word and character counts
  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(value.length);
  }, [value]);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && !readOnly) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);

      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }
  }, [value, enableAutoSave, readOnly]);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      performSearch();
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
    }
  }, [searchTerm, value]);

  // Spell check
  useEffect(() => {
    if (enableSpellCheck && value) {
      debounceSpellCheck();
    }
  }, [value, enableSpellCheck]);

  const handleAutoSave = async () => {
    if (!onSave) return;

    setIsAutoSaving(true);
    try {
      await onSave(value);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const debounceSpellCheck = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performSpellCheck();
        }, 1000);
      };
    })(),
    [value]
  );

  const performSpellCheck = async () => {
    try {
      const words = value.match(/\b\w+\b/g) || [];
      const uniqueWords = [...new Set(words)];
      
      // Mock spell check API call
      const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: uniqueWords })
      });

      if (response.ok) {
        const { misspelledWords } = await response.json();
        const suggestions: SpellCheckSuggestion[] = [];

        misspelledWords.forEach((wordData: any) => {
          const regex = new RegExp(`\\b${wordData.word}\\b`, 'gi');
          let match;
          while ((match = regex.exec(value)) !== null) {
            suggestions.push({
              word: wordData.word,
              suggestions: wordData.suggestions,
              position: match.index,
              length: wordData.word.length
            });
          }
        });

        setSpellCheckSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Spell check failed:', error);
    }
  };

  const performSearch = () => {
    if (!searchTerm) return;

    const regex = new RegExp(searchTerm, 'gi');
    const matches: number[] = [];
    let match;

    while ((match = regex.exec(value)) !== null) {
      matches.push(match.index);
    }

    setSearchResults(matches);
    setCurrentSearchIndex(matches.length > 0 ? 0 : -1);

    if (matches.length > 0) {
      scrollToMatch(matches[0]);
    }
  };

  const scrollToMatch = (position: number) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(position, position + searchTerm.length);
      
      // Calculate approximate line and scroll to it
      const textBeforeMatch = value.substring(0, position);
      const lineHeight = 24; // Approximate line height
      const lineNumber = textBeforeMatch.split('\n').length - 1;
      const scrollTop = lineNumber * lineHeight;
      
      textareaRef.current.scrollTop = scrollTop;
    }
  };

  const navigateSearch = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    } else {
      newIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    }

    setCurrentSearchIndex(newIndex);
    scrollToMatch(searchResults[newIndex]);
  };

  const performReplace = (replaceAll: boolean = false) => {
    if (!searchTerm || !replaceTerm) return;

    const regex = new RegExp(searchTerm, replaceAll ? 'gi' : 'i');
    let newValue;
    
    if (replaceAll) {
      newValue = value.replace(regex, replaceTerm);
    } else {
      // Replace only current match
      if (currentSearchIndex >= 0 && currentSearchIndex < searchResults.length) {
        const position = searchResults[currentSearchIndex];
        newValue = value.substring(0, position) + 
                  replaceTerm + 
                  value.substring(position + searchTerm.length);
      } else {
        newValue = value.replace(regex, replaceTerm);
      }
    }

    pushToUndoStack();
    onChange(newValue);
    setSearchTerm('');
    setReplaceTerm('');
  };

  const pushToUndoStack = () => {
    if (!textareaRef.current) return;

    const currentState: UndoRedoState = {
      content: value,
      selection: {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      },
      timestamp: Date.now()
    };

    setUndoStack(prev => [...prev.slice(-49), currentState]); // Keep last 50 states
    setRedoStack([]); // Clear redo stack
  };

  const undo = () => {
    if (undoStack.length <= 1) return;

    const current: UndoRedoState = {
      content: value,
      selection: textareaRef.current ? {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      } : { start: 0, end: 0 },
      timestamp: Date.now()
    };

    const previous = undoStack[undoStack.length - 2];
    
    setRedoStack(prev => [...prev, current]);
    setUndoStack(prev => prev.slice(0, -1));
    onChange(previous.content);

    // Restore selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(previous.selection.start, previous.selection.end);
      }
    }, 0);
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    
    pushToUndoStack();
    setRedoStack(prev => prev.slice(0, -1));
    onChange(next.content);

    // Restore selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(next.selection.start, next.selection.end);
      }
    }, 0);
  };

  const applyFormatting = (action: FormatAction) => {
    if (!textareaRef.current || readOnly) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = value.substring(start, end);

    pushToUndoStack();

    let newText = '';
    let newCursorPos = start;

    switch (action.type) {
      case 'bold':
        newText = `**${selectedText}**`;
        newCursorPos = start + (selectedText ? newText.length : 2);
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        newCursorPos = start + (selectedText ? newText.length : 1);
        break;
      case 'underline':
        newText = `<u>${selectedText}</u>`;
        newCursorPos = start + (selectedText ? newText.length : 3);
        break;
      case 'heading':
        newText = `### ${selectedText}`;
        newCursorPos = start + newText.length;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        newCursorPos = start + newText.length;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        newCursorPos = start + newText.length;
        break;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const insertTimestamp = () => {
    if (!textareaRef.current || readOnly) return;

    const timestamp = new Date().toLocaleTimeString();
    const timestampText = `[${timestamp}] `;
    
    const start = textareaRef.current.selectionStart;
    const newValue = value.substring(0, start) + timestampText + value.substring(start);
    
    pushToUndoStack();
    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = start + timestampText.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const insertSpeakerLabel = (speaker: string) => {
    if (!textareaRef.current || readOnly) return;

    const speakerText = `\n${speaker}: `;
    const start = textareaRef.current.selectionStart;
    const newValue = value.substring(0, start) + speakerText + value.substring(start);
    
    pushToUndoStack();
    onChange(newValue);
    setCurrentSpeaker(speaker);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = start + speakerText.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'b':
          e.preventDefault();
          applyFormatting({ type: 'bold' });
          break;
        case 'i':
          e.preventDefault();
          applyFormatting({ type: 'italic' });
          break;
        case 'u':
          e.preventDefault();
          applyFormatting({ type: 'underline' });
          break;
        case 'f':
          e.preventDefault();
          setShowSearch(true);
          setTimeout(() => searchInputRef.current?.focus(), 100);
          break;
        case 's':
          e.preventDefault();
          if (onSave) {
            onSave(value);
          }
          break;
      }
    }

    // Handle special keys
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start + 2, start + 2);
        }
      }, 0);
    }
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelectedText(value.substring(start, end));
    }
  };

  const exportText = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedText || value);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const pasteFromClipboard = async () => {
    if (readOnly) return;

    try {
      const text = await navigator.clipboard.readText();
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newValue = value.substring(0, start) + text + value.substring(end);
        
        pushToUndoStack();
        onChange(newValue);

        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = start + text.length;
            textareaRef.current.setSelectionRange(newPos, newPos);
            textareaRef.current.focus();
          }
        }, 0);
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  return (
    <div className={`bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700 ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {/* Toolbar */}
      {showFormatting && !readOnly && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Formatting Tools */}
            <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-3">
              <button
                onClick={() => applyFormatting({ type: 'bold' })}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormatting({ type: 'italic' })}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormatting({ type: 'underline' })}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            {/* Structure Tools */}
            <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-3">
              <button
                onClick={() => applyFormatting({ type: 'heading' })}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Heading"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormatting({ type: 'list' })}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormatting({ type: 'quote' })}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            {/* Special Inserts */}
            <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-3">
              {enableTimestamps && (
                <button
                  onClick={insertTimestamp}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                  title="Insert Timestamp"
                >
                  <Clock className="w-4 h-4" />
                </button>
              )}
              
              {enableSpeakerLabels && (
                <div className="flex items-center space-x-2">
                  <select
                    value={currentSpeaker}
                    onChange={(e) => setCurrentSpeaker(e.target.value)}
                    className="px-2 py-1 text-sm bg-gray-100 dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white"
                  >
                    <option>Speaker 1</option>
                    <option>Speaker 2</option>
                    <option>Doctor</option>
                    <option>Patient</option>
                    <option>Therapist</option>
                    <option>Nurse</option>
                  </select>
                  <button
                    onClick={() => insertSpeakerLabel(currentSpeaker)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                    title="Insert Speaker Label"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-3">
              <button
                onClick={undo}
                disabled={undoStack.length <= 1}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded ${showSearch ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                title="Search (Ctrl+F)"
              >
                <Search className="w-4 h-4" />
              </button>
              
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Copy"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={exportText}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* View Options */}
            <div className="flex items-center space-x-1 ml-auto">
              <button
                onClick={() => setShowFormatting(!showFormatting)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Toggle Formatting Bar"
              >
                {showFormatting ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-3 py-1 text-sm bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  placeholder="Replace with..."
                  className="flex-1 px-3 py-1 text-sm bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none text-gray-900 dark:text-white"
                />
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigateSearch('prev')}
                    disabled={searchResults.length === 0}
                    className="btn-ghost text-sm p-1 disabled:opacity-50"
                    title="Previous"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => navigateSearch('next')}
                    disabled={searchResults.length === 0}
                    className="btn-ghost text-sm p-1 disabled:opacity-50"
                    title="Next"
                  >
                    ↓
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => performReplace(false)}
                  disabled={!searchTerm || !replaceTerm}
                  className="btn-ghost text-sm disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  onClick={() => performReplace(true)}
                  disabled={!searchTerm || !replaceTerm}
                  className="btn-ghost text-sm disabled:opacity-50"
                >
                  Replace All
                </button>
                <button
                  onClick={() => setShowSearch(false)}
                  className="btn-ghost text-sm p-1 ml-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Editor */}
      <div className="relative flex-1 flex flex-col">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength && !readOnly) {
              onChange(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          onSelect={handleSelectionChange}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={enableSpellCheck}
          className={`w-full flex-1 p-6 bg-transparent border-none resize-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed ${isFullscreen ? 'h-screen' : 'min-h-96'}`}
          style={{
            minHeight: isFullscreen ? '100vh' : '24rem'
          }}
        />

        {/* Spell Check Highlights */}
        {enableSpellCheck && spellCheckSuggestions.length > 0 && (
          <div className="absolute inset-0 pointer-events-none p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {spellCheckSuggestions.map((suggestion, index) => (
              <span
                key={index}
                className="bg-red-200 dark:bg-red-900/30 text-transparent pointer-events-auto cursor-pointer"
                style={{
                  position: 'absolute',
                  left: `${suggestion.position}ch`,
                }}
                title={`Suggestions: ${suggestion.suggestions.join(', ')}`}
              >
                {suggestion.word}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>{charCount}/{maxLength} characters</span>
          {selectedText && <span>{selectedText.length} selected</span>}
          {enableSpellCheck && spellCheckSuggestions.length > 0 && (
            <span className="text-yellow-600 dark:text-yellow-400">
              {spellCheckSuggestions.length} spelling issues
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {enableAutoSave && (
            <div className="flex items-center space-x-2">
              {isAutoSaving ? (
                <>
                  <div className="w-3 h-3 border border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
          )}
          
          {readOnly && (
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Read Only</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}