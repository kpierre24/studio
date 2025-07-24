"use client";

import React from 'react';
import { z } from 'zod';
import { MobileForm, MobileInput, MobileTextarea } from '../ui/mobile-form';
import { MobileFileUpload } from '../ui/mobile-file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Mail, Phone, User, MapPin, Calendar, Lock } from 'lucide-react';

// Form validation schema
const mobileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter a complete address'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profileImage: z.any().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type MobileFormData = z.infer<typeof mobileFormSchema>;

export function MobileFormExample() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: MobileFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', data);
    console.log('Selected files:', selectedFiles);
    
    setIsSubmitting(false);
  };

  const handleAutoSave = async (data: MobileFormData) => {
    // Simulate auto-save
    console.log('Auto-saving:', data);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `https://example.com/uploads/${file.name}`;
  };

  const handleVoiceInput = (transcript: string, fieldName: string) => {
    console.log(`Voice input for ${fieldName}:`, transcript);
  };

  const handleCameraCapture = (file: File) => {
    console.log('Camera capture:', file);
    setSelectedFiles(prev => [...prev, file]);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Mobile Form Demo</h1>
          <p className="text-muted-foreground">
            Experience enhanced mobile form interactions with touch optimization, 
            voice input, and camera integration.
          </p>
        </div>

        {/* Features showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced Features</CardTitle>
            <CardDescription>
              This form demonstrates mobile-optimized UI components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Touch Optimized</Badge>
              <Badge variant="secondary">Voice Input</Badge>
              <Badge variant="secondary">Camera Integration</Badge>
              <Badge variant="secondary">Auto-save</Badge>
              <Badge variant="secondary">Real-time Validation</Badge>
              <Badge variant="secondary">Keyboard Optimization</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Form */}
        <MobileForm
          schema={mobileFormSchema}
          onSubmit={handleSubmit}
          title="User Registration"
          description="Fill out your information below. The form will auto-save as you type."
          submitText="Create Account"
          isLoading={isSubmitting}
          showProgress={true}
          stickySubmit={true}
          autoSave={true}
          autoSaveDelay={1500}
          onAutoSave={handleAutoSave}
          touchOptimized={true}
          keyboardOptimization={{
            submitOnEnter: true,
            preventZoom: true,
            adjustViewport: true
          }}
        >
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MobileInput
                  name="firstName"
                  label="First Name"
                  placeholder="Enter your first name"
                  leftIcon={<User className="w-4 h-4" />}
                  size="md"
                  variant="outlined"
                  touchOptimized={true}
                  enableVoiceInput={true}
                  onVoiceInput={(transcript) => handleVoiceInput(transcript, 'firstName')}
                  hint="Use voice input by clicking the microphone"
                />

                <MobileInput
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter your last name"
                  leftIcon={<User className="w-4 h-4" />}
                  size="md"
                  variant="outlined"
                  touchOptimized={true}
                  enableVoiceInput={true}
                  onVoiceInput={(transcript) => handleVoiceInput(transcript, 'lastName')}
                />
              </div>

              <MobileInput
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                leftIcon={<Mail className="w-4 h-4" />}
                size="md"
                variant="outlined"
                touchOptimized={true}
                hint="We'll never share your email with anyone"
              />

              <MobileInput
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="Enter your phone number"
                leftIcon={<Phone className="w-4 h-4" />}
                size="md"
                variant="outlined"
                touchOptimized={true}
              />

              <MobileInput
                name="dateOfBirth"
                type="date"
                label="Date of Birth"
                leftIcon={<Calendar className="w-4 h-4" />}
                size="md"
                variant="outlined"
                touchOptimized={true}
              />

              <MobileTextarea
                name="address"
                label="Address"
                placeholder="Enter your full address"
                size="md"
                variant="outlined"
                touchOptimized={true}
                enableVoiceInput={true}
                enableAutoResize={true}
                onVoiceInput={(transcript) => handleVoiceInput(transcript, 'address')}
                hint="Include street, city, state, and zip code"
              />
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MobileInput
                name="password"
                type="password"
                label="Password"
                placeholder="Create a strong password"
                leftIcon={<Lock className="w-4 h-4" />}
                size="md"
                variant="outlined"
                showPasswordToggle={true}
                touchOptimized={true}
                hint="Must be at least 8 characters long"
              />

              <MobileInput
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                leftIcon={<Lock className="w-4 h-4" />}
                size="md"
                variant="outlined"
                showPasswordToggle={true}
                touchOptimized={true}
              />
            </CardContent>
          </Card>

          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MobileTextarea
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself..."
                size="md"
                variant="outlined"
                touchOptimized={true}
                enableVoiceInput={true}
                enableAutoResize={true}
                enableFullscreen={true}
                maxLength={500}
                showCharCount={true}
                onVoiceInput={(transcript) => handleVoiceInput(transcript, 'bio')}
                hint="Optional: Share a brief description about yourself"
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile Image
                </label>
                <MobileFileUpload
                  onFilesSelected={setSelectedFiles}
                  onFileUpload={handleFileUpload}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024} // 5MB
                  multiple={false}
                  enableCamera={true}
                  enableGallery={true}
                  compressionQuality={0.8}
                  touchOptimized={true}
                  mobileLayout={true}
                  // onCameraCapture removed as it's not part of MobileFileUploadProps
                />
              </div>
            </CardContent>
          </Card>

          {/* Floating Label Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Floating Labels Demo</CardTitle>
              <CardDescription>
                These inputs use floating label animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MobileInput
                name="floatingExample1"
                label="Floating Label Input"
                variant="floating"
                size="md"
                touchOptimized={true}
              />

              <MobileTextarea
                name="floatingExample2"
                label="Floating Label Textarea"
                variant="floating"
                size="md"
                touchOptimized={true}
                enableAutoResize={true}
              />
            </CardContent>
          </Card>
        </MobileForm>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Try These Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Tap the microphone icon to use voice input</li>
              <li>• Use camera or gallery buttons to upload images</li>
              <li>• Notice the form auto-saves as you type</li>
              <li>• Try the fullscreen mode on the bio textarea</li>
              <li>• Form validates in real-time with helpful messages</li>
              <li>• Submit button sticks to bottom when keyboard is open</li>
              <li>• Use Cmd+Enter to submit the form quickly</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}