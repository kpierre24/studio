
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppContext } from '@/contexts/AppContext';
import type { User, UpdateUserPayload } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Edit, Save, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { state, handleUpdateUserProfile } = useAppContext();
  const { currentUser, isLoading: isContextLoading } = state;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
      phoneNumber: '',
      bio: '',
    }
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl || '',
        phoneNumber: currentUser.phoneNumber || '',
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser, reset]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!currentUser) return;
    setIsSubmitting(true);

    const payload: UpdateUserPayload = {
      id: currentUser.id,
      name: data.name,
      avatarUrl: data.avatarUrl || `https://placehold.co/100x100.png?text=${data.name.substring(0,1)}`, // Default if empty
      phoneNumber: data.phoneNumber,
      bio: data.bio,
    };

    await handleUpdateUserProfile(payload);
    setIsSubmitting(false);
    if (!state.error) {
      setIsEditing(false);
    }
  };

  if (isContextLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const effectiveAvatarUrl = currentUser.avatarUrl || `https://placehold.co/128x128.png?text=${currentUser.name.substring(0,1)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            <Image
              src={effectiveAvatarUrl}
              alt={currentUser.name}
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-primary/20 shadow-md"
              data-ai-hint="user profile picture"
            />
             <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 bg-background rounded-full h-8 w-8"
                onClick={() => setIsEditing(!isEditing)}
                title="Edit Profile"
            >
                <Edit className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-3xl font-headline">{currentUser.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{currentUser.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditing ? (
            <>
              {currentUser.phoneNumber && (
                <div className="flex items-center">
                  <Label className="w-1/4 font-semibold">Phone:</Label>
                  <p className="text-muted-foreground">{currentUser.phoneNumber}</p>
                </div>
              )}
              {currentUser.bio && (
                <div className="flex flex-col">
                  <Label className="font-semibold mb-1">Bio:</Label>
                  <p className="text-muted-foreground whitespace-pre-wrap p-3 bg-muted/30 rounded-md">{currentUser.bio}</p>
                </div>
              )}
              {(!currentUser.phoneNumber && !currentUser.bio) && (
                <p className="text-muted-foreground text-center py-4">
                  No additional profile information. Click "Edit Profile" to add more details.
                </p>
              )}
              <Button onClick={() => setIsEditing(true)} className="w-full mt-4">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} disabled={isSubmitting} />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" {...register("avatarUrl")} placeholder="https://example.com/avatar.png" disabled={isSubmitting} />
                {errors.avatarUrl && <p className="text-destructive text-sm mt-1">{errors.avatarUrl.message}</p>}
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...register("phoneNumber")} placeholder="(123) 456-7890" disabled={isSubmitting} />
                {errors.phoneNumber && <p className="text-destructive text-sm mt-1">{errors.phoneNumber.message}</p>}
              </div>
              <div>
                <Label htmlFor="bio">Bio (max 500 characters)</Label>
                <Textarea id="bio" {...register("bio")} placeholder="Tell us a bit about yourself..." rows={4} disabled={isSubmitting} />
                {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(); }} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isContextLoading}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
