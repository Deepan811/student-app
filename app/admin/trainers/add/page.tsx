'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/use-toast';

const AddTrainerPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [profilePictureType, setProfilePictureType] = useState('url');
  const [profilePictureValue, setProfilePictureValue] = useState('');
  interface Course {
    _id: string;
    name: string;
  }
  
  const [courses, setCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const router = useRouter();
  const { token } = useAuth();

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

    if (!name || !email || !bio || !expertise || courses.length === 0) {
      toast({ title: 'Please fill out all required fields', description: 'Name, email, bio, expertise, and at least one course are required.', variant: 'destructive' });
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
          profilePicture: {
            type: profilePictureType,
            value: profilePictureValue,
          },
          courses,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Trainer added successfully' });
        setTimeout(() => {
          router.push('/admin/trainers');
        }, 1000); // 1 second delay
      } else {
        toast({ title: 'Failed to add trainer', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast({ title: 'An error occurred', description: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Trainer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="expertise">Expertise (comma-separated)</Label>
          <Input id="expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} />
        </div>
        <div>
          <Label>Profile Picture</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="url"
                name="profilePictureType"
                value="url"
                checked={profilePictureType === 'url'}
                onChange={() => {
                  setProfilePictureType('url');
                  setProfilePictureValue('');
                }}
                className="mr-2"
              />
              <Label htmlFor="url">URL</Label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="upload"
                name="profilePictureType"
                value="upload"
                checked={profilePictureType === 'upload'}
                onChange={() => {
                  setProfilePictureType('upload');
                  setProfilePictureValue('');
                }}
                className="mr-2"
              />
              <Label htmlFor="upload">Upload</Label>
            </div>
          </div>
          {profilePictureType === 'url' ? (
            <Input
              key="url-input"
              type="text"
              placeholder="Enter image URL"
              value={profilePictureValue}
              onChange={(e) => setProfilePictureValue(e.target.value)}
            />
          ) : (
            <Input
              key="file-input"
              type="file"
              onChange={(e) => setProfilePictureValue(e.target.files ? e.target.files[0].name : '')}
            />
          )}
        </div>
        <div>
          <Label>Courses</Label>
          <div className="grid grid-cols-3 gap-2">
            {allCourses.map(course => (
              <div key={course._id} className="flex items-center">
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
                  className="mr-2"
                />
                <Label htmlFor={course._id}>{course.name}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button type="submit">Add Trainer</Button>
          <Button asChild variant="outline">
            <Link href="/admin/trainers">Back to Trainers</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTrainerPage;