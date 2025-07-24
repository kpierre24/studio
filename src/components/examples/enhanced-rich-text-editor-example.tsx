"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ContentTemplateManager } from '@/components/ui/content-template-manager';
import { CollaborativeEditor } from '@/components/ui/collaborative-editor';
import { SpellGrammarChecker } from '@/components/ui/spell-grammar-checker';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  BookOpen, 
  Sparkles,
  Save,
  Share2,
  Settings
} from 'lucide-react';

// Mock data
const mockTemplates = [
  {
    id: '1',
    name: 'Interactive Lesson Plan',
    description: 'Comprehensive lesson plan with activities and assessments',
    content: `
      <h1>📚 Lesson: Introduction to Photosynthesis</h1>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>🎯 Learning Objectives</h2>
        <p>By the end of this lesson, students will be able to:</p>
        <ul>
          <li>Define photosynthesis and explain its importance</li>
          <li>Identify the reactants and products of photosynthesis</li>
          <li>Describe the role of chloroplasts in photosynthesis</li>
        </ul>
      </div>

      <h2>📋 Materials & Resources</h2>
      <ul>
        <li>📖 Biology textbook: Chapter 8</li>
        <li>💻 Interactive simulation: Photosynthesis Lab</li>
        <li>🌱 Live plant specimens</li>
        <li>🔬 Microscopes for chloroplast observation</li>
      </ul>

      <h2>⏰ Lesson Structure (50 minutes)</h2>
      
      <h3>🚀 Opening (10 minutes)</h3>
      <p><strong>Hook:</strong> Show time-lapse video of plant growth</p>
      <p><strong>Question:</strong> "What do plants need to grow and survive?"</p>

      <h3>📖 Direct Instruction (20 minutes)</h3>
      <p>Introduce the photosynthesis equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂</p>

      <h3>🤝 Guided Practice (15 minutes)</h3>
      <p>Students work in pairs to label a photosynthesis diagram</p>

      <h3>🎯 Closure (5 minutes)</h3>
      <p>Exit ticket: "Explain photosynthesis in your own words"</p>
    `,
    category: 'lesson' as const,
    tags: ['interactive', 'science', 'biology'],
    icon: BookOpen,
    createdBy: 'teacher1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    isPublic: true,
    isFavorite: false,
    usageCount: 15,
    version: 1
  },
  {
    id: '2',
    name: 'Project Assignment Template',
    description: 'Comprehensive project assignment with rubric',
    content: `
      <h1>🚀 Research Project: Climate Change Solutions</h1>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>📅 Important Dates</h2>
        <ul>
          <li><strong>Project Assigned:</strong> March 1, 2024</li>
          <li><strong>Topic Approval:</strong> March 8, 2024</li>
          <li><strong>Research Phase:</strong> March 8-22, 2024</li>
          <li><strong>Final Submission:</strong> March 29, 2024</li>
          <li><strong>Presentations:</strong> April 1-5, 2024</li>
        </ul>
      </div>

      <h2>🎯 Project Overview</h2>
      <p>Students will research and propose innovative solutions to address climate change challenges. This project connects scientific understanding with real-world problem-solving and encourages creative thinking about environmental sustainability.</p>

      <h2>📋 Requirements</h2>
      <ul>
        <li>✅ Research paper (1500-2000 words)</li>
        <li>✅ Visual presentation (10-12 slides)</li>
        <li>✅ Minimum 8 credible sources</li>
        <li>✅ Proposed solution with implementation plan</li>
        <li>✅ Cost-benefit analysis</li>
      </ul>

      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h2>📊 Grading Rubric (Total: 100 Points)</h2>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f8f9fa;">
            <th style="padding: 8px;">Criteria</th>
            <th style="padding: 8px;">Excellent (A)</th>
            <th style="padding: 8px;">Good (B)</th>
            <th style="padding: 8px;">Satisfactory (C)</th>
            <th style="padding: 8px;">Points</th>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Research Quality</strong></td>
            <td style="padding: 8px;">Exceptional sources and analysis</td>
            <td style="padding: 8px;">Good sources and analysis</td>
            <td style="padding: 8px;">Adequate sources</td>
            <td style="padding: 8px;">30</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Solution Innovation</strong></td>
            <td style="padding: 8px;">Highly creative and feasible</td>
            <td style="padding: 8px;">Creative with minor issues</td>
            <td style="padding: 8px;">Standard approach</td>
            <td style="padding: 8px;">25</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Presentation</strong></td>
            <td style="padding: 8px;">Engaging and professional</td>
            <td style="padding: 8px;">Clear and organized</td>
            <td style="padding: 8px;">Basic organization</td>
            <td style="padding: 8px;">25</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Writing Quality</strong></td>
            <td style="padding: 8px;">Excellent grammar and style</td>
            <td style="padding: 8px;">Good grammar, minor errors</td>
            <td style="padding: 8px;">Adequate with some errors</td>
            <td style="padding: 8px;">20</td>
          </tr>
        </table>
      </div>
    `,
    category: 'assignment' as const,
    tags: ['project', 'research', 'environmental'],
    icon: FileText,
    createdBy: 'teacher1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    isPublic: true,
    isFavorite: true,
    usageCount: 8,
    version: 2
  }
];

const mockCollaborators = [
  {
    id: 'user1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    avatar: '/avatars/sarah.jpg',
    role: 'owner' as const,
    color: '#3b82f6',
    isActive: true,
    lastSeen: new Date()
  },
  {
    id: 'user2',
    name: 'Mike Chen',
    email: 'mike.chen@school.edu',
    avatar: '/avatars/mike.jpg',
    role: 'editor' as const,
    color: '#10b981',
    isActive: true,
    lastSeen: new Date()
  },
  {
    id: 'user3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@school.edu',
    avatar: '/avatars/emily.jpg',
    role: 'commenter' as const,
    color: '#f59e0b',
    isActive: false,
    lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
  }
];

export function EnhancedRichTextEditorExample() {
  const [activeTab, setActiveTab] = useState('basic');
  const [content, setContent] = useState(`
    <h2>Welcome to Advanced Content Creation</h2>
    <p>This enhanced rich text editor provides powerful tools for creating educational content with:</p>
    <ul>
      <li>Advanced formatting options</li>
      <li>Mathematical equations and chemical formulas</li>
      <li>Collaborative editing capabilities</li>
      <li>Spell checking and grammar suggestions</li>
      <li>Content templates and reusable snippets</li>
    </ul>
    <p>Try editing this content to see the features in action!</p>
  `);
  
  const [templates, setTemplates] = useState(mockTemplates);
  const [collaborativeContent, setCollaborativeContent] = useState(`
    <h1>Collaborative Lesson Planning</h1>
    <p>This document is being edited collaboratively by multiple teachers. You can see real-time changes, add comments, and track version history.</p>
    <h2>Today's Objectives</h2>
    <p>We need to finalize the lesson plan for next week's science unit...</p>
  `);

  const handleSave = async (content: string) => {
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Content saved:', content);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Simulate image upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    return URL.createObjectURL(file);
  };

  const handleTemplateCreate = (template: any) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      version: 1
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleTemplateUpdate = (id: string, updates: any) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    ));
  };

  const handleTemplateDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleTemplateDuplicate = (template: any) => {
    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      version: 1
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Enhanced Rich Text Editor</h1>
        <p className="text-muted-foreground">
          Advanced content creation tools for educators with collaboration, templates, and AI assistance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Basic Editor
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="collaborative" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="checking" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Spell Check
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Rich Text Editor
              </CardTitle>
              <CardDescription>
                Create and edit content with advanced formatting, equations, and media support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={content}
                onChange={setContent}
                onSave={handleSave}
                onImageUpload={handleImageUpload}
                showWordCount={true}
                showReadingTime={true}
                enableSpellCheck={true}
                enableTemplates={true}
                height={500}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Save className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Auto-Save</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Content is automatically saved every 30 seconds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Smart Features</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Math equations, code blocks, and educational tools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Quality Checks</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Built-in spell check and grammar suggestions
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Content Template Manager
              </CardTitle>
              <CardDescription>
                Create, manage, and share reusable content templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentTemplateManager
                templates={templates}
                onTemplateSelect={(template) => setContent(template.content)}
                onTemplateCreate={handleTemplateCreate}
                onTemplateUpdate={handleTemplateUpdate}
                onTemplateDelete={handleTemplateDelete}
                onTemplateDuplicate={handleTemplateDuplicate}
                currentUserId="teacher1"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Collaborative Editor
              </CardTitle>
              <CardDescription>
                Real-time collaboration with comments, version history, and team management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <CollaborativeEditor
                  documentId="lesson-plan-1"
                  initialContent={collaborativeContent}
                  currentUser={mockCollaborators[0]}
                  collaborators={mockCollaborators}
                  comments={[]}
                  versions={[]}
                  onContentChange={setCollaborativeContent}
                  onUserJoin={(user) => console.log('User joined:', user)}
                  onUserLeave={(userId) => console.log('User left:', userId)}
                  onCommentAdd={(comment) => console.log('Comment added:', comment)}
                  onCommentResolve={(commentId) => console.log('Comment resolved:', commentId)}
                  onCommentReply={(commentId, reply) => console.log('Reply added:', reply)}
                  onVersionSave={(version) => console.log('Version saved:', version)}
                  onPermissionChange={(userId, role) => console.log('Permission changed:', userId, role)}
                  onInviteUser={(email, role) => console.log('User invited:', email, role)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Real-time Collaboration</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Multiple teachers can edit simultaneously with live cursors and changes
                </p>
                <div className="flex gap-1">
                  {mockCollaborators.slice(0, 3).map(user => (
                    <div key={user.id} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      <span className="text-xs">{user.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Permission Control</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Granular permissions: Owner, Editor, Commenter, Viewer
                </p>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">Owner</Badge>
                  <Badge variant="outline" className="text-xs">Editor</Badge>
                  <Badge variant="outline" className="text-xs">Viewer</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Spell & Grammar Checker
              </CardTitle>
              <CardDescription>
                Advanced writing assistance with spell check, grammar suggestions, and style improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpellGrammarChecker
                content={content}
                language="en-US"
                onContentChange={setContent}
                enableRealTime={true}
                enableAdvancedGrammar={true}
                enableStyleSuggestions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Rich Formatting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Advanced text formatting with educational-specific tools
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Math Equations</Badge>
                  <Badge variant="outline" className="text-xs">Code Blocks</Badge>
                  <Badge variant="outline" className="text-xs">Tables</Badge>
                  <Badge variant="outline" className="text-xs">Media</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  Content Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pre-built templates for common educational content
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Lesson Plans</Badge>
                  <Badge variant="outline" className="text-xs">Assignments</Badge>
                  <Badge variant="outline" className="text-xs">Rubrics</Badge>
                  <Badge variant="outline" className="text-xs">Announcements</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Team Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Real-time collaborative editing with team features
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Live Editing</Badge>
                  <Badge variant="outline" className="text-xs">Comments</Badge>
                  <Badge variant="outline" className="text-xs">Version History</Badge>
                  <Badge variant="outline" className="text-xs">Permissions</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                  Writing Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  AI-powered writing assistance and quality checks
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Spell Check</Badge>
                  <Badge variant="outline" className="text-xs">Grammar</Badge>
                  <Badge variant="outline" className="text-xs">Style Tips</Badge>
                  <Badge variant="outline" className="text-xs">Readability</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Save className="w-5 h-5 text-red-500" />
                  Auto-Save & Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Automatic saving and synchronization across devices
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Auto-Save</Badge>
                  <Badge variant="outline" className="text-xs">Cloud Sync</Badge>
                  <Badge variant="outline" className="text-xs">Offline Mode</Badge>
                  <Badge variant="outline" className="text-xs">Backup</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-teal-500" />
                  Sharing & Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Multiple sharing and export options for content distribution
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">PDF Export</Badge>
                  <Badge variant="outline" className="text-xs">HTML Export</Badge>
                  <Badge variant="outline" className="text-xs">Share Links</Badge>
                  <Badge variant="outline" className="text-xs">Embed Code</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}