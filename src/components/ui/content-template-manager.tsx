"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  Users, 
  Quote, 
  Calculator,
  Code,
  Table,
  Image,
  Video,
  Link,
  Star,
  StarOff,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  Tag,
  Clock,
  TrendingUp
} from 'lucide-react';

// Types
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'lesson' | 'assignment' | 'announcement' | 'quiz' | 'discussion' | 'general';
  tags: string[];
  icon: React.ComponentType<{ className?: string }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  version: number;
  customFields?: Record<string, any>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ContentTemplateManagerProps {
  templates: ContentTemplate[];
  onTemplateSelect: (template: ContentTemplate) => void;
  onTemplateCreate: (template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'version'>) => void;
  onTemplateUpdate: (id: string, template: Partial<ContentTemplate>) => void;
  onTemplateDelete: (id: string) => void;
  onTemplateDuplicate: (template: ContentTemplate) => void;
  currentUserId: string;
  className?: string;
}

// Predefined categories
const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'lesson',
    name: 'Lessons',
    description: 'Lesson plans and instructional content',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 'assignment',
    name: 'Assignments',
    description: 'Assignment instructions and rubrics',
    icon: FileText,
    color: 'bg-green-500'
  },
  {
    id: 'quiz',
    name: 'Quizzes',
    description: 'Quiz templates and question formats',
    icon: Calculator,
    color: 'bg-purple-500'
  },
  {
    id: 'discussion',
    name: 'Discussions',
    description: 'Discussion prompts and forums',
    icon: Quote,
    color: 'bg-orange-500'
  },
  {
    id: 'announcement',
    name: 'Announcements',
    description: 'Class announcements and notices',
    icon: Users,
    color: 'bg-red-500'
  },
  {
    id: 'general',
    name: 'General',
    description: 'Miscellaneous content templates',
    icon: FileText,
    color: 'bg-gray-500'
  }
];

// Default templates
const DEFAULT_TEMPLATES: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'version'>[] = [
  {
    name: 'Interactive Lesson Plan',
    description: 'Comprehensive lesson plan with activities and assessments',
    category: 'lesson',
    tags: ['interactive', 'structured', 'assessment'],
    icon: BookOpen,
    createdBy: 'system',
    isPublic: true,
    isFavorite: false,
    content: `
      <h1>📚 Lesson: [Lesson Title]</h1>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>🎯 Learning Objectives</h2>
        <p>By the end of this lesson, students will be able to:</p>
        <ul>
          <li>Objective 1: [Specific, measurable outcome]</li>
          <li>Objective 2: [Specific, measurable outcome]</li>
          <li>Objective 3: [Specific, measurable outcome]</li>
        </ul>
      </div>

      <h2>📋 Materials & Resources</h2>
      <ul>
        <li>📖 Textbook: [Chapter/Pages]</li>
        <li>💻 Technology: [Required tools/software]</li>
        <li>📝 Handouts: [List materials]</li>
        <li>🔗 Online Resources: [Links and references]</li>
      </ul>

      <h2>⏰ Lesson Structure (Total: [Duration])</h2>
      
      <h3>🚀 Opening (5-10 minutes)</h3>
      <ul>
        <li><strong>Hook:</strong> [Engaging opening activity]</li>
        <li><strong>Review:</strong> [Previous lesson connections]</li>
        <li><strong>Preview:</strong> [Today's agenda]</li>
      </ul>

      <h3>📖 Direct Instruction (15-20 minutes)</h3>
      <p>[Main content delivery - concepts, examples, demonstrations]</p>

      <h3>🤝 Guided Practice (10-15 minutes)</h3>
      <p>[Collaborative activities and scaffolded practice]</p>

      <h3>✍️ Independent Practice (10-15 minutes)</h3>
      <p>[Individual work and application]</p>

      <h3>🎯 Closure (5 minutes)</h3>
      <ul>
        <li><strong>Summary:</strong> [Key takeaways]</li>
        <li><strong>Preview:</strong> [Next lesson connection]</li>
        <li><strong>Assignment:</strong> [Homework or follow-up]</li>
      </ul>

      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>📊 Assessment & Differentiation</h2>
        <p><strong>Formative Assessment:</strong> [How you'll check understanding during lesson]</p>
        <p><strong>Summative Assessment:</strong> [End-of-lesson evaluation]</p>
        <p><strong>Differentiation:</strong> [Accommodations for different learners]</p>
      </div>

      <h2>🏠 Homework/Extension</h2>
      <p>[Assignment details and due date]</p>

      <h2>📝 Reflection Notes</h2>
      <p><em>[Space for post-lesson reflection and improvements]</em></p>
    `
  },
  {
    name: 'Project-Based Assignment',
    description: 'Comprehensive project assignment with clear expectations',
    category: 'assignment',
    tags: ['project', 'rubric', 'collaborative'],
    icon: FileText,
    createdBy: 'system',
    isPublic: true,
    isFavorite: false,
    content: `
      <h1>🚀 Project Assignment: [Project Title]</h1>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>📅 Important Dates</h2>
        <ul>
          <li><strong>Project Assigned:</strong> [Date]</li>
          <li><strong>Proposal Due:</strong> [Date]</li>
          <li><strong>Progress Check:</strong> [Date]</li>
          <li><strong>Final Submission:</strong> [Date]</li>
          <li><strong>Presentations:</strong> [Date Range]</li>
        </ul>
      </div>

      <h2>🎯 Project Overview</h2>
      <p>[Detailed description of the project, its purpose, and real-world connections]</p>

      <h2>📋 Requirements</h2>
      <h3>Core Components</h3>
      <ul>
        <li>✅ [Requirement 1 with specific criteria]</li>
        <li>✅ [Requirement 2 with specific criteria]</li>
        <li>✅ [Requirement 3 with specific criteria]</li>
      </ul>

      <h3>📊 Deliverables</h3>
      <ol>
        <li><strong>Project Proposal</strong> (Due: [Date])
          <ul>
            <li>Topic selection and rationale</li>
            <li>Research questions or objectives</li>
            <li>Timeline and milestones</li>
          </ul>
        </li>
        <li><strong>Research & Development</strong>
          <ul>
            <li>Minimum [X] credible sources</li>
            <li>Data collection/analysis</li>
            <li>Progress documentation</li>
          </ul>
        </li>
        <li><strong>Final Product</strong>
          <ul>
            <li>[Specific format: report, presentation, model, etc.]</li>
            <li>Length: [Specifications]</li>
            <li>Required sections/components</li>
          </ul>
        </li>
        <li><strong>Presentation</strong> ([X] minutes)
          <ul>
            <li>Clear communication of findings</li>
            <li>Visual aids and demonstrations</li>
            <li>Q&A session</li>
          </ul>
        </li>
      </ol>

      <h2>🤝 Collaboration Guidelines</h2>
      <p><strong>Group Size:</strong> [Individual/Pairs/Groups of X]</p>
      <p><strong>Role Assignments:</strong> [If applicable, define roles]</p>
      <p><strong>Accountability:</strong> [How individual contributions will be assessed]</p>

      <h2>📚 Resources & Support</h2>
      <ul>
        <li>📖 Required readings: [List]</li>
        <li>🔗 Recommended websites: [Links]</li>
        <li>🏛️ Library resources: [Database access, research guides]</li>
        <li>👨‍🏫 Office hours: [Times and locations]</li>
        <li>💬 Discussion forum: [Platform details]</li>
      </ul>

      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>📊 Grading Rubric (Total: [X] Points)</h2>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px;">Criteria</th>
            <th style="padding: 10px;">Excellent (A)</th>
            <th style="padding: 10px;">Good (B)</th>
            <th style="padding: 10px;">Satisfactory (C)</th>
            <th style="padding: 10px;">Needs Improvement (D/F)</th>
            <th style="padding: 10px;">Points</th>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Content Quality</strong></td>
            <td style="padding: 8px;">[Excellent criteria]</td>
            <td style="padding: 8px;">[Good criteria]</td>
            <td style="padding: 8px;">[Satisfactory criteria]</td>
            <td style="padding: 8px;">[Needs improvement criteria]</td>
            <td style="padding: 8px;">[Points]</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Research & Sources</strong></td>
            <td style="padding: 8px;">[Excellent criteria]</td>
            <td style="padding: 8px;">[Good criteria]</td>
            <td style="padding: 8px;">[Satisfactory criteria]</td>
            <td style="padding: 8px;">[Needs improvement criteria]</td>
            <td style="padding: 8px;">[Points]</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Organization & Presentation</strong></td>
            <td style="padding: 8px;">[Excellent criteria]</td>
            <td style="padding: 8px;">[Good criteria]</td>
            <td style="padding: 8px;">[Satisfactory criteria]</td>
            <td style="padding: 8px;">[Needs improvement criteria]</td>
            <td style="padding: 8px;">[Points]</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Creativity & Innovation</strong></td>
            <td style="padding: 8px;">[Excellent criteria]</td>
            <td style="padding: 8px;">[Good criteria]</td>
            <td style="padding: 8px;">[Satisfactory criteria]</td>
            <td style="padding: 8px;">[Needs improvement criteria]</td>
            <td style="padding: 8px;">[Points]</td>
          </tr>
        </table>
      </div>

      <h2>📤 Submission Instructions</h2>
      <ul>
        <li><strong>Format:</strong> [File format requirements]</li>
        <li><strong>Naming:</strong> [File naming convention]</li>
        <li><strong>Platform:</strong> [Where to submit]</li>
        <li><strong>Late Policy:</strong> [Late submission consequences]</li>
      </ul>

      <h2>❓ Frequently Asked Questions</h2>
      <p><strong>Q: [Common question]</strong><br>
      A: [Answer]</p>
      
      <p><strong>Q: [Common question]</strong><br>
      A: [Answer]</p>

      <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>⚠️ Academic Integrity</h2>
        <p>This project must represent your original work. Proper citation is required for all sources. Plagiarism will result in [consequences]. When in doubt, ask!</p>
      </div>
    `
  }
];

export function ContentTemplateManager({
  templates,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onTemplateDuplicate,
  currentUserId,
  className = ""
}: ContentTemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'usage' | 'updated'>('name');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || template.isFavorite;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'usage':
          return b.usageCount - a.usageCount;
        default:
          return 0;
      }
    });

  const handleTemplateUse = (template: ContentTemplate) => {
    onTemplateSelect(template);
    // Increment usage count
    onTemplateUpdate(template.id, { usageCount: template.usageCount + 1 });
  };

  const toggleFavorite = (template: ContentTemplate) => {
    onTemplateUpdate(template.id, { isFavorite: !template.isFavorite });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Templates</h2>
          <p className="text-muted-foreground">
            Create, manage, and use content templates to speed up your workflow
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TEMPLATE_CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="created">Sort by Created</SelectItem>
                <SelectItem value="updated">Sort by Updated</SelectItem>
                <SelectItem value="usage">Sort by Usage</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="w-4 h-4 mr-2" />
              Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {TEMPLATE_CATEGORIES.map(category => {
          const count = templates.filter(t => t.category === category.id).length;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-2`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{count} templates</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={() => handleTemplateUse(template)}
            onEdit={() => setEditingTemplate(template)}
            onDelete={() => onTemplateDelete(template.id)}
            onDuplicate={() => onTemplateDuplicate(template)}
            onToggleFavorite={() => toggleFavorite(template)}
            onPreview={() => setPreviewTemplate(template)}
            canEdit={template.createdBy === currentUserId}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' || showFavoritesOnly
                ? 'Try adjusting your filters or search terms'
                : 'Create your first template to get started'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Template Dialog */}
      <TemplateDialog
        isOpen={isCreateDialogOpen || editingTemplate !== null}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={(templateData) => {
          if (editingTemplate) {
            onTemplateUpdate(editingTemplate.id, templateData);
          } else {
            onTemplateCreate({
              ...templateData,
              name: templateData.name || 'Untitled Template',
              description: templateData.description || 'No description provided',
              content: templateData.content || '',
              icon: templateData.icon || (() => null),
              createdBy: currentUserId,
              isPublic: false,
              isFavorite: false
            });
          }
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
      />

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={previewTemplate ? () => handleTemplateUse(previewTemplate) : undefined}
      />
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: ContentTemplate;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onPreview: () => void;
  canEdit: boolean;
}

function TemplateCard({
  template,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onPreview,
  canEdit
}: TemplateCardProps) {
  const category = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-500'}`}>
              <template.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {template.isFavorite ? (
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{template.usageCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {template.isPublic && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
        </div>
        
        <Separator />
        
        <div className="flex items-center gap-2">
          <Button onClick={onUse} className="flex-1">
            Use Template
          </Button>
          
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="w-4 h-4" />
          </Button>
          
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Template Dialog Component
interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ContentTemplate | null;
  onSave: (template: Partial<ContentTemplate>) => void;
}

function TemplateDialog({ isOpen, onClose, template, onSave }: TemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general' as ContentTemplate['category'],
    tags: '',
    content: '',
    isPublic: false
  });

  React.useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags.join(', '),
        content: template.content,
        isPublic: template.isPublic
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'general',
        tags: '',
        content: '',
        isPublic: false
      });
    }
  }, [template]);

  const handleSave = () => {
    const templateData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      icon: TEMPLATE_CATEGORIES.find(c => c.id === formData.category)?.icon || FileText,
      updatedAt: new Date()
    };
    
    onSave(templateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
          <DialogDescription>
            {template ? 'Update your content template' : 'Create a reusable content template'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: ContentTemplate['category']) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template is for"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="interactive, assessment, group-work"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Template Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your template HTML content"
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
              <Label htmlFor="isPublic">Make this template public (visible to other teachers)</Label>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.content}>
            {template ? 'Update' : 'Create'} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Template Preview Dialog
interface TemplatePreviewDialogProps {
  template: ContentTemplate | null;
  onClose: () => void;
  onUse?: () => void;
}

function TemplatePreviewDialog({ template, onClose, onUse }: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <template.icon className="w-5 h-5" />
            {template.name}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: template.content }}
          />
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
            <span>Used: {template.usageCount} times</span>
            <Badge variant="outline">{template.category}</Badge>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onUse && (
              <Button onClick={onUse}>
                Use This Template
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}