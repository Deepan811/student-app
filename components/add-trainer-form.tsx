'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Course {
  _id: string;
  name: string;
}

interface AddTrainerFormProps {
  onSuccess?: () => void;
}

export const AddTrainerForm = ({ onSuccess }: AddTrainerFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [courses, setCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (data.success) {
          setAllCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses', error);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !email || !bio || !expertise || courses.length === 0) {
      toast({ title: 'Please fill out all required fields', description: 'Name, email, bio, expertise, and at least one course are required.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          bio,
          expertise: expertise.split(',').map(item => item.trim()),
          profilePicture,
          courses,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Trainer added successfully' });
        if (onSuccess) {
          onSuccess();
        }
        // Optionally, clear the form or close the dialog
        setName('');
        setEmail('');
        setBio('');
        setExpertise('');
        setProfilePicture('');
        setCourses([]);
      } else {
        toast({ title: 'Failed to add trainer', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'An error occurred', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500";

  return (
    <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white">Trainer Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputStyles} placeholder="Trainer Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} placeholder="trainer@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-200">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className={inputStyles} placeholder="A short biography..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expertise" className="text-slate-200">Expertise (comma-separated)</Label>
            <Input id="expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} className={inputStyles} placeholder="e.g., React, Node.js, UI/UX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profilePicture" className="text-slate-200">Profile Picture URL</Label>
            <Input id="profilePicture" value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)} className={inputStyles} placeholder="https://example.com/image.png" />
          </div>
          
          <div className="space-y-4">
            <Label className="text-slate-200">Courses</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-md bg-slate-800/50 border border-slate-700">
              {allCourses.map(course => (
                <div key={course._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={course._id}
                    value={course._id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCourses([...courses, course._id]);
                      } else {
                        setCourses(courses.filter(id => id !== course._id));
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                  />
                  <Label htmlFor={course._id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">
                    {course.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
              {isSubmitting ? 'Adding Trainer...' : 'Add Trainer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};