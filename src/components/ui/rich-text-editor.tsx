"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Users, 
  FileText, 
  Clock, 
  BookOpen,
  Calculator,
  Code,
  Table,
  Image,
  Link,
  Palette,
  Settings,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  readOnly?: boolean;
  showWordCount?: boolean;
  showReadingTime?: boolean;
  enableCollaboration?: boolean;
  enableTemplates?: boolean;
  enableSpellCheck?: boolean;
  onSave?: (content: string) => Promise<void>;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'lesson' | 'assignment' | 'announcement' | 'general';
  icon: React.ComponentType<{ className?: string }>;
}

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isActive: boolean;
  cursor?: {
    x: number;
    y: number;
  };
}

// Predefined content templates
const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'lesson-intro',
    name: 'Lesson Introduction',
    description: 'Standard lesson opening with objectives',
    category: 'lesson',
    icon: BookOpen,
    content: `
      <h2>Lesson: [Lesson Title]</h2>
      <h3>Learning Objectives</h3>
      <ul>
        <li>Students will be able to...</li>
        <li>Students will understand...</li>
        <li>Students will demonstrate...</li>
      </ul>
      <h3>Materials Needed</h3>
      <ul>
        <li>[Material 1]</li>
        <li>[Material 2]</li>
      </ul>
      <h3>Introduction</h3>
      <p>[Lesson introduction content...]</p>
    `
  },
  {
    id: 'assignment-instructions',
    name: 'Assignment Instructions',
    description: 'Clear assignment guidelines and rubric',
    category: 'assignment',
    icon: FileText,
    content: `
      <h2>Assignment: [Assignment Title]</h2>
      <p><strong>Due Date:</strong> [Date and Time]</p>
      <p><strong>Points:</strong> [Total Points]</p>
      
      <h3>Instructions</h3>
      <p>[Detailed assignment instructions...]</p>
      
      <h3>Requirements</h3>
      <ul>
        <li>[Requirement 1]</li>
        <li>[Requirement 2]</li>
        <li>[Requirement 3]</li>
      </ul>
      
      <h3>Submission Guidelines</h3>
      <p>[How and where to submit...]</p>
      
      <h3>Grading Criteria</h3>
      <table border="1">
        <tr><th>Criteria</th><th>Points</th><th>Description</th></tr>
        <tr><td>[Criteria 1]</td><td>[Points]</td><td>[Description]</td></tr>
        <tr><td>[Criteria 2]</td><td>[Points]</td><td>[Description]</td></tr>
      </table>
    `
  },
  {
    id: 'announcement',
    name: 'Class Announcement',
    description: 'Important class updates and notices',
    category: 'announcement',
    icon: Users,
    content: `
      <h2>📢 Important Announcement</h2>
      <p><strong>Date:</strong> [Current Date]</p>
      
      <h3>What's New</h3>
      <p>[Announcement content...]</p>
      
      <h3>Action Required</h3>
      <p>[What students need to do...]</p>
      
      <h3>Questions?</h3>
      <p>Please reach out during office hours or via email if you have any questions.</p>
    `
  },
  {
    id: 'discussion-prompt',
    name: 'Discussion Prompt',
    description: 'Engaging discussion questions',
    category: 'general',
    icon: Quote,
    content: `
      <h2>Discussion: [Topic]</h2>
      
      <h3>Background</h3>
      <p>[Provide context for the discussion...]</p>
      
      <h3>Discussion Questions</h3>
      <ol>
        <li>[Question 1 - requires analysis]</li>
        <li>[Question 2 - encourages critical thinking]</li>
        <li>[Question 3 - connects to real-world applications]</li>
      </ol>
      
      <h3>Participation Guidelines</h3>
      <ul>
        <li>Post your initial response by [date]</li>
        <li>Respond to at least 2 classmates by [date]</li>
        <li>Use evidence to support your points</li>
        <li>Be respectful and constructive</li>
      </ul>
    `
  }
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  height = 400,
  readOnly = false,
  showWordCount = true,
  showReadingTime = true,
  enableCollaboration = false,
  enableTemplates = true,
  enableSpellCheck = true,
  onSave,
  onImageUpload,
  className = ""
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Calculate word count and reading time
  const updateStats = useCallback((content: string) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const readingTimeMinutes = Math.ceil(words / 200); // Average reading speed
    
    setWordCount(words);
    setReadingTime(readingTimeMinutes);
  }, []);

  useEffect(() => {
    updateStats(value);
  }, [value, updateStats]);

  // Auto-save functionality
  useEffect(() => {
    if (!onSave || !value) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        setIsSaving(true);
        await onSave(value);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [value, onSave]);

  // TinyMCE configuration
  const editorConfig = {
    height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
      'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking',
      'toc', 'imagetools', 'textpattern', 'noneditable', 'quickbars',
      'mathtype', 'chemistry', 'spellchecker'
    ],
    toolbar: [
      'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor',
      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
      'removeformat | link image media table | codesample mathtype chemistry',
      'hr pagebreak | template | code preview fullscreen help'
    ].join(' | '),
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #333;
        max-width: none;
      }
      .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
        color: #999;
        font-style: italic;
      }
    `,
    placeholder,
    spellchecker_active: enableSpellCheck,
    spellchecker_language: 'en_US',
    image_upload_handler: onImageUpload ? async (blobInfo: any) => {
      try {
        const url = await onImageUpload(blobInfo.blob());
        return url;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    } : undefined,
    templates: enableTemplates ? CONTENT_TEMPLATES.map(template => ({
      title: template.name,
      description: template.description,
      content: template.content
    })) : undefined,
    setup: (editor: any) => {
      editor.on('init', () => {
        setIsLoading(false);
      });
      
      editor.on('change keyup', () => {
        const content = editor.getContent();
        onChange(content);
        updateStats(content);
      });

      // Add custom buttons
      editor.ui.registry.addButton('mathtype', {
        text: 'Σ',
        tooltip: 'Insert Math Equation',
        onAction: () => {
          editor.insertContent('<p><strong>Math Equation:</strong> [Insert equation here]</p>');
        }
      });

      editor.ui.registry.addButton('chemistry', {
        text: '⚗️',
        tooltip: 'Insert Chemical Formula',
        onAction: () => {
          editor.insertContent('<p><strong>Chemical Formula:</strong> [Insert formula here]</p>');
        }
      });
    },
    // readonly: readOnly // TinyMCE doesn't support readonly in init config
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(value);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const insertTemplate = (template: ContentTemplate) => {
    if (editorRef.current) {
      editorRef.current.insertContent(template.content);
      setShowTemplates(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          {enableTemplates && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </>
            )}
          </Button>

          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {enableCollaboration && collaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{collaborators.length} collaborator(s)</span>
            </div>
          )}
          
          {showWordCount && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{wordCount} words</span>
            </div>
          )}
          
          {showReadingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
          )}
          
          {lastSaved && (
            <div className="flex items-center gap-2">
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CONTENT_TEMPLATES.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => insertTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <template.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <Badge variant="outline" className="mt-2 capitalize">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor/Preview */}
      <div className="border rounded-lg overflow-hidden">
        {showPreview ? (
          <div className="p-6 min-h-[400px] bg-background">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground italic">No content to preview</p>' }}
            />
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Loading editor...</span>
                </div>
              </div>
            )}
            
            <Editor
              onInit={(evt, editor) => {
                editorRef.current = editor;
                setIsLoading(false);
              }}
              value={value}
              init={editorConfig}
              onEditorChange={onChange}
            />
          </div>
        )}
      </div>

      {/* Collaboration Panel */}
      {enableCollaboration && collaborators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {collaborators.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <span>{user.name}</span>
                  {user.isActive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}