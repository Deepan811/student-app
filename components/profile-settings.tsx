
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

interface SocialLink {
  heading: string;
  link: string;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  collegeName?: string;
  departmentName?: string;
  socialLinks?: SocialLink[];
  profilePicture?: string;
}

interface ProfileSettingsProps {
  profile: ProfileData | null;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
}

export function ProfileSettings({ profile, onProfileUpdate }: ProfileSettingsProps) {
  const { token, login, user } = useAuth();
  const [formData, setFormData] = useState<ProfileData | null>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)


  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            if (formData) {
                setFormData({ ...formData, profilePicture: reader.result as string });
            }
        };
        reader.readAsDataURL(file);
    }
};

  const handleSocialLinkChange = (index: number, field: 'heading' | 'link', value: string) => {
    if (formData && formData.socialLinks) {
      const newSocialLinks = [...formData.socialLinks];
      newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
      setFormData({ ...formData, socialLinks: newSocialLinks });
    }
  };

  const addSocialLink = () => {
    if (formData) {
      const newSocialLinks = [...(formData.socialLinks || []), { heading: '', link: '' }];
      setFormData({ ...formData, socialLinks: newSocialLinks });
    }
  };

  const removeSocialLink = (index: number) => {
    if (formData && formData.socialLinks) {
      const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index);
      setFormData({ ...formData, socialLinks: newSocialLinks });
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    setError(null);

    let profilePictureUrl = profile?.profilePicture;

    if (selectedFile) {
      setUploading(true);
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", selectedFile);
      cloudinaryFormData.append("upload_preset", "student-app");
      cloudinaryFormData.append("cloud_name", "dokyhnknj");

      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dokyhnknj/image/upload', {
          method: "POST",
          body: cloudinaryFormData,
        });
        const data = await response.json();
        if (data.secure_url) {
          profilePictureUrl = data.secure_url;
        } else {
          setError("Image upload failed. Please try again.");
          setUploading(false);
          setIsSaving(false);
          return;
        }
      } catch (error) {
        setError("Image upload failed. Please try again.");
        setUploading(false);
        setIsSaving(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const updatePayload = {
      name: formData.name,
      mobile: formData.mobile,
      collegeName: formData.collegeName,
      departmentName: formData.departmentName,
      socialLinks: formData.socialLinks,
      profilePicture: profilePictureUrl,
    };

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onProfileUpdate(data.data);
          if (user && token) {
            const updatedUser = { ...user, name: data.data.name, profilePicture: data.data.profilePicture };
            login(updatedUser, token);
        }
          alert('Profile updated successfully!');
        } else {
          setError(data.message || 'Failed to update profile');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred');
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-300"/></div>;
  }

  return (
    <div className="space-y-8">
         <div className="flex flex-col items-center">
                <Label htmlFor="profilePicture" className="mb-2 text-blue-300">Change Profile Picture</Label>
                <Input id="profilePicture" type="file" onChange={handleFileChange} className="bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
              </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-blue-300">Name</Label>
          <Input id="name" value={formData.name || ''} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <Label htmlFor="email" className="text-blue-300">Email</Label>
          <Input id="email" type="email" value={formData.email || ''} readOnly className="bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed" />
        </div>
        <div>
          <Label htmlFor="mobile" className="text-blue-300">Mobile</Label>
          <Input id="mobile" value={formData.mobile || ''} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <Label htmlFor="collegeName" className="text-blue-300">College Name</Label>
          <Input id="collegeName" value={formData.collegeName || ''} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="departmentName" className="text-blue-300">Department Name</Label>
          <Input id="departmentName" value={formData.departmentName || ''} onChange={handleInputChange} className="bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Social Links</h3>
        <div className="space-y-4">
          {formData.socialLinks?.map((social, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Heading (e.g., GitHub)"
                value={social.heading}
                onChange={(e) => handleSocialLinkChange(index, 'heading', e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
              <Input
                placeholder="URL"
                value={social.link}
                onChange={(e) => handleSocialLinkChange(index, 'link', e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button onClick={() => removeSocialLink(index)} variant="destructive" size="icon" className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addSocialLink} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
            Add Social Link
          </Button>
        </div>
      </div>

      {error && <p className="text-red-400 text-center">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || uploading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          {(isSaving || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {uploading ? 'Uploading Image...' : (isSaving ? 'Saving...' : 'Save Changes')}
        </Button>
      </div>
    </div>
  );
}
