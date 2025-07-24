'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Minus, 
  Play, 
  Save, 
  Calendar, 
  Filter, 
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  ReportConfig, 
  ReportType, 
  ReportParameter, 
  ExportFormat, 
  ReportSchedule 
} from '@/types/reporting';
import { UserRole } from '@/types';

interface ReportBuilderProps {
  userRole: UserRole;
  onSave?: (config: ReportConfig) => Promise<void>;
  onGenerate?: (config: ReportConfig) => Promise<void>;
  initialConfig?: ReportConfig;
}

export function ReportBuilder({
  userRole,
  onSave,
  onGenerate,
  initialConfig
}: ReportBuilderProps) {
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    name: '',
    description: '',
    type: ReportType.STUDENT_PERFORMANCE,
    userRole,
    parameters: [],
    format: [ExportFormat.PDF],
    ...initialConfig
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = Object.values(ReportType).filter(type => {
    // Filter report types based on user role
    if (userRole === UserRole.STUDENT) {
      return [
        ReportType.STUDENT_PERFORMANCE,
        ReportType.GRADE_DISTRIBUTION,
        ReportType.ATTENDANCE_SUMMARY
      ].includes(type);
    }
    return true; // Teachers and admins can access all report types
  });

  const addParameter = () => {
    const newParameter: ReportParameter = {
      key: `param_${Date.now()}`,
      label: 'New Parameter',
      type: 'text',
      required: false
    };

    setConfig(prev => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParameter]
    }));
  };

  const updateParameter = (index: number, updates: Partial<ReportParameter>) => {
    setConfig(prev => ({
      ...prev,
      parameters: prev.parameters?.map((param, i) => 
        i === index ? { ...param, ...updates } : param
      ) || []
    }));
  };

  const removeParameter = (index: number) => {
    setConfig(prev => ({
      ...prev,
      parameters: prev.parameters?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = async () => {
    if (!onSave || !config.name) return;

    setIsSaving(true);
    try {
      const fullConfig: ReportConfig = {
        id: config.id || `report_${Date.now()}`,
        name: config.name,
        description: config.description || '',
        type: config.type!,
        userRole: config.userRole!,
        parameters: config.parameters || [],
        format: config.format || [ExportFormat.PDF],
        createdAt: config.createdAt || new Date(),
        updatedAt: new Date(),
        createdBy: config.createdBy || 'current_user',
        schedule: config.schedule
      };

      await onSave(fullConfig);
    } catch (error) {
      console.error('Error saving report config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!onGenerate || !config.name) return;

    setIsGenerating(true);
    try {
      const fullConfig: ReportConfig = {
        id: config.id || `report_${Date.now()}`,
        name: config.name,
        description: config.description || '',
        type: config.type!,
        userRole: config.userRole!,
        parameters: config.parameters || [],
        format: config.format || [ExportFormat.PDF],
        createdAt: config.createdAt || new Date(),
        updatedAt: new Date(),
        createdBy: config.createdBy || 'current_user',
        schedule: config.schedule
      };

      await onGenerate(fullConfig);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderParameterEditor = (param: ReportParameter, index: number) => (
    <motion.div
      key={param.key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Parameter {index + 1}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeParameter(index)}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`param-key-${index}`}>Key</Label>
          <Input
            id={`param-key-${index}`}
            value={param.key}
            onChange={(e) => updateParameter(index, { key: e.target.value })}
            placeholder="parameter_key"
          />
        </div>
        <div>
          <Label htmlFor={`param-label-${index}`}>Label</Label>
          <Input
            id={`param-label-${index}`}
            value={param.label}
            onChange={(e) => updateParameter(index, { label: e.target.value })}
            placeholder="Parameter Label"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`param-type-${index}`}>Type</Label>
          <Select
            value={param.type}
            onValueChange={(value: any) => updateParameter(index, { type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="dateRange">Date Range</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="multiSelect">Multi Select</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Checkbox
            id={`param-required-${index}`}
            checked={param.required}
            onCheckedChange={(checked) => 
              updateParameter(index, { required: checked as boolean })
            }
          />
          <Label htmlFor={`param-required-${index}`}>Required</Label>
        </div>
      </div>

      {(param.type === 'select' || param.type === 'multiSelect') && (
        <div>
          <Label>Options</Label>
          <Textarea
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            value={param.options?.map(opt => opt.label).join('\n') || ''}
            onChange={(e) => {
              const options = e.target.value.split('\n').map(line => ({
                value: line.toLowerCase().replace(/\s+/g, '_'),
                label: line
              }));
              updateParameter(index, { options });
            }}
          />
        </div>
      )}

      {param.type !== 'select' && param.type !== 'multiSelect' && (
        <div>
          <Label htmlFor={`param-default-${index}`}>Default Value</Label>
          <Input
            id={`param-default-${index}`}
            value={param.defaultValue || ''}
            onChange={(e) => updateParameter(index, { defaultValue: e.target.value })}
            placeholder="Default value"
          />
        </div>
      )}
    </motion.div>
  );

  const renderScheduleEditor = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Schedule Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-schedule"
            checked={!!config.schedule?.enabled}
            onCheckedChange={(checked) => 
              setConfig(prev => ({
                ...prev,
                schedule: {
                  ...prev.schedule,
                  frequency: 'weekly',
                  time: '09:00',
                  recipients: [],
                  enabled: checked as boolean
                }
              }))
            }
          />
          <Label htmlFor="enable-schedule">Enable Scheduled Reports</Label>
        </div>

        {config.schedule?.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select
                  value={config.schedule.frequency}
                  onValueChange={(value: any) => 
                    setConfig(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule!, frequency: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={config.schedule.time}
                  onChange={(e) => 
                    setConfig(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule!, time: e.target.value }
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Recipients (Email addresses, one per line)</Label>
              <Textarea
                placeholder="user1@example.com&#10;user2@example.com"
                value={config.schedule.recipients?.join('\n') || ''}
                onChange={(e) => 
                  setConfig(prev => ({
                    ...prev,
                    schedule: { 
                      ...prev.schedule!, 
                      recipients: e.target.value.split('\n').filter(email => email.trim())
                    }
                  }))
                }
              />
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Builder</h2>
          <p className="text-muted-foreground">
            Create and configure custom reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || !config.name}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !config.name}
          >
            <Play className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{config.name || 'Untitled Report'}</h3>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{config.type}</Badge>
                <Badge variant="outline">{config.userRole}</Badge>
              </div>

              {config.parameters && config.parameters.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Parameters:</h4>
                  <div className="space-y-2">
                    {config.parameters.map((param, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{param.label}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{param.type}</Badge>
                          {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Export Formats:</h4>
                <div className="flex space-x-2">
                  {config.format?.map(format => (
                    <Badge key={format} variant="secondary">{format.toUpperCase()}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea
                    id="report-description"
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this report will show"
                  />
                </div>

                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select
                    value={config.type}
                    onValueChange={(value: ReportType) => setConfig(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Parameters
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={addParameter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parameter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {config.parameters && config.parameters.length > 0 ? (
                    <div className="space-y-4">
                      {config.parameters.map((param, index) => 
                        renderParameterEditor(param, index)
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No parameters defined. Click "Add Parameter" to get started.
                    </p>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.values(ExportFormat).map(format => (
                  <div key={format} className="flex items-center space-x-2">
                    <Checkbox
                      id={`format-${format}`}
                      checked={config.format?.includes(format)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig(prev => ({
                            ...prev,
                            format: [...(prev.format || []), format]
                          }));
                        } else {
                          setConfig(prev => ({
                            ...prev,
                            format: prev.format?.filter(f => f !== format) || []
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`format-${format}`} className="text-sm">
                      {format.toUpperCase()}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {renderScheduleEditor()}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-refresh" />
                  <Label htmlFor="auto-refresh" className="text-sm">
                    Auto-refresh data
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cache-results" />
                  <Label htmlFor="cache-results" className="text-sm">
                    Cache results
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-notifications" />
                  <Label htmlFor="email-notifications" className="text-sm">
                    Email notifications
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}