'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, User, Tag, Edit, LogOut, Link as LinkIcon, Trash2, BookText } from "lucide-react" // Added BookText for bio
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea" // Assuming Textarea is available

interface SocialLink {
  heading: string
  link: string
}

interface TrainerProfile {
  _id: string; // The Trainer _id
  user: { // The associated User object
    id: string; // User's _id
    name: string;
    email: string;
    role: string;
    profilePicture?: string;
  };
  bio?: string;
  expertise?: string[]; // Array of strings
  batches?: any[]; // Simplified for now, can be fully typed later
  courses?: any[]; // Simplified for now, can be fully typed later
  profilePicture?: {
    type: string;
    value: string;
  };
}

const ensureAbsoluteUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function TrainerProfilePage() {
  const { user, token, logout, isLoading: isAuthLoading, login } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<TrainerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>(null) // Loosely typed for ease of modification
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || !token || user.role !== 'trainer') {
      router.push("/auth/trainer/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/trainer/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const profileData = data.data as TrainerProfile; // Cast to TrainerProfile
            setProfile(profileData)
            setFormData({
              ...profileData.user, // User fields
              bio: profileData.bio || "",
              expertise: profileData.expertise ? profileData.expertise.join(", ") : "", // Join array for textarea
              profilePicture: profileData.profilePicture?.value || profileData.user?.profilePicture || "/placeholder-user.jpg",
              socialLinks: profileData.user?.socialLinks || [], // Assuming social links are on user profile if needed
            })
          } else {
            setError(data.message || "Failed to fetch profile")
          }
        } else {
          const errorData = await response.json()
          setError(errorData.message || `Error: ${response.status} ${response.statusText}`)
          if (response.status === 401 || response.status === 403) { // 403 for access denied
            logout()
            router.push("/auth/trainer/login")
          }
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, token, router, logout, isAuthLoading])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.id]: e.target.value })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();

      reader.onloadend = () => {
        if (formData) {
          // This updates the local preview URL
          setFormData((prev: { profilePicture: any; }) => ({ ...prev, profilePicture: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData) return

    let uploadedProfilePictureUrl = "";

    if (selectedFile) {
      setUploading(true);
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", selectedFile);
      cloudinaryFormData.append("upload_preset", "student-app"); // Replace with your upload preset
      cloudinaryFormData.append("cloud_name", "dokyhnknj"); // Replace with your cloud name

      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dokyhnknj/image/upload', {
          method: "POST",
          body: cloudinaryFormData,
        });
        const data = await response.json();
        if (data.secure_url) {
          uploadedProfilePictureUrl = data.secure_url;
        } else {
          setError("Image upload failed. Please try again.");
          setUploading(false);
          return;
        }
      } catch (error) {
        setError("Image upload failed. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const updatePayload = {
      name: formData.name,
      email: formData.email, // Can update email for user if model allows
      bio: formData.bio,
      expertise: formData.expertise ? formData.expertise.split(',').map((item: string) => item.trim()) : [],
      profilePicture: uploadedProfilePictureUrl || profile?.profilePicture?.value || profile?.user.profilePicture, // Use new URL, then existing trainer, then existing user
    };

    try {
      const response = await fetch("/api/trainer/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const updatedProfileData = data.data as TrainerProfile;
          setProfile(updatedProfileData);
          setFormData({
            ...updatedProfileData.user,
            bio: updatedProfileData.bio || "",
            expertise: updatedProfileData.expertise ? updatedProfileData.expertise.join(", ") : "",
            profilePicture: updatedProfileData.profilePicture?.value || updatedProfileData.user?.profilePicture || "/placeholder-user.jpg",
          });
          // Update the user name and profile picture in the auth context
          if (user && token) {
            const updatedUser = { 
              ...user, 
              name: updatedProfileData.user.name, 
              profilePicture: updatedProfileData.profilePicture?.value || updatedProfileData.user.profilePicture
            };
            login(updatedUser, token); // Update auth context
          }
          setIsEditing(false);
          setSelectedFile(null); // Clear selected file after successful upload/save
        } else {
          setError(data.message || "Failed to update profile")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || `Error: ${response.status} ${response.statusText}`)
        if (response.status === 401 || response.status === 403) {
            logout()
            router.push("/auth/trainer/login")
          }
      }
    } catch (err: any) {
      setError(err.message || "Network error updating profile")
    }
  }

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-500/20">
        <p className="text-white">Loading trainer profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-500/20 p-6">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error}</p>
            <Button onClick={() => router.push("/auth/trainer/login")} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Go to Trainer Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-500/20 p-6">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">Could not load trainer profile data.</p>
            <Button onClick={() => router.push("/trainer/dashboard")} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-500 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg text-slate-800 font-bold">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="h-24 w-24 mb-4 border-4 border-white/20">
              <AvatarImage src={profile.profilePicture?.value || profile.user.profilePicture || "/placeholder-user.jpg"} alt="Trainer Avatar" />
              <AvatarFallback>{profile.user.name ? profile.user.name.charAt(0).toUpperCase() : ''}</AvatarFallback>
            </Avatar>
            <h2 className="text-3xl font-bold mb-1">{profile.user.name}</h2>
            <p className="text-lg text-slate-600 capitalize">{profile.user.role}</p>
          </div>

          {isEditing ? (
            <div className="space-y-6 mb-8">
              <div className="flex flex-col items-center">
                <Label htmlFor="profilePicture" className="mb-2">Change Profile Picture</Label>
                <Input id="profilePicture" type="file" onChange={handleFileChange} className="bg-white/20 border-none text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData?.name || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData?.email || ""} readOnly className="bg-black/20 border-none text-slate-400 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={formData?.bio || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white min-h-[100px]" placeholder="Tell us about yourself..." />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="expertise">Expertise (comma separated)</Label>
                  <Input id="expertise" value={formData?.expertise || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" placeholder="e.g., JavaScript, React, Node.js" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Contact Information</h3>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex items-center gap-2 hover:text-slate-800"><Mail className="h-4 w-4 text-slate-500" /> {profile.user.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Bio</h3>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex items-center gap-2 hover:text-slate-800"><BookText className="h-4 w-4 text-slate-500" /> {profile.bio || "Not specified"}</p>
                  </div>
                </div>
              </div>
              {profile.expertise && profile.expertise.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Expertise</h3>
                  <div className="space-y-2 text-slate-600 flex flex-wrap gap-2">
                    {profile.expertise.map((item, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-blue-900/50 dark:text-blue-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
               {profile.batches && profile.batches.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Associated Batches</h3>
                  <div className="space-y-2 text-slate-600">
                    {profile.batches.map((batch, index) => (
                      <p key={index} className="flex items-center gap-2 hover:text-slate-800"><Tag className="h-4 w-4 text-slate-500" /> {batch.name}</p>
                    ))}
                  </div>
                </div>
              )}
               {profile.courses && profile.courses.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Associated Courses</h3>
                  <div className="space-y-2 text-slate-600">
                    {profile.courses.map((course, index) => (
                      <p key={index} className="flex items-center gap-2 hover:text-slate-800"><Tag className="h-4 w-4 text-slate-500" /> {course.name}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={uploading} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">{uploading ? "Uploading..." : "Save"}</Button>
                <Button onClick={() => {
                  setIsEditing(false);
                  setFormData(profile); // Reset form data on cancel
                  setSelectedFile(null);
                }} variant="outline" className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300 flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            )}
            <Button onClick={logout} variant="outline" className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300 flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
            <Link href="/" passHref>
              <Button variant="outline" className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300 flex items-center gap-2">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
