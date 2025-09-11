"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, User, Tag, Edit, Home, LogOut, Phone, Building, GraduationCap, Link as LinkIcon, Trash2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SocialLink {
  heading: string
  link: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  status?: string
  mobile?: string
  collegeName?: string
  departmentName?: string
  courseName?: string
  socialLinks?: SocialLink[]
  paymentStatus?: string
  profilePicture?: string;
  batch?: {
    _id: string
    name: string
    startDate: string
    endDate: string
    courseId: {
      _id: string
      name: string
    }
    fees: number
  }
}

const ensureAbsoluteUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function ProfilePage() {
  const { user, token, login, logout, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfile | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth state to load

    if (!user || !token) {
      router.push("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const profileData = data.data
            setProfile(profileData)
            setFormData({
              ...profileData,
              socialLinks: profileData.socialLinks || [],
            })
          } else {
            setError(data.message || "Failed to fetch profile")
          }
        } else {
          const errorData = await response.json()
          setError(errorData.message || `Error: ${response.status} ${response.statusText}`)
          if (response.status === 401) {
            logout()
            router.push("/auth")
          }
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, token, router, logout])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.id]: e.target.value })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create a preview URL
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
      const newSocialLinks = [...formData.socialLinks]
      newSocialLinks[index] = { ...newSocialLinks[index], [field]: value }
      setFormData({ ...formData, socialLinks: newSocialLinks })
    }
  }

  const addSocialLink = () => {
    if (formData) {
      const newSocialLinks = [...(formData.socialLinks || []), { heading: "", link: "" }]
      setFormData({ ...formData, socialLinks: newSocialLinks })
    }
  }

  const removeSocialLink = (index: number) => {
    if (formData && formData.socialLinks) {
      const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index)
      setFormData({ ...formData, socialLinks: newSocialLinks })
    }
  }

  const handleSave = async () => {
    if (!formData) return

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
      mobile: formData.mobile,
      collegeName: formData.collegeName,
      departmentName: formData.departmentName,
      courseName: formData.courseName,
      socialLinks: formData.socialLinks,
      profilePicture: profilePictureUrl,
    };

    try {
      const response = await fetch("/api/auth/profile", {
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
          const profileData = data.data
          setProfile(profileData)
          setFormData({
            ...profileData,
            socialLinks: profileData.socialLinks || [],
          })
          // Update the user in the auth context
          if (user && token) {
            const updatedUser = { ...user, name: profileData.name, profilePicture: profileData.profilePicture };
            login(updatedUser, token);
          }
          setIsEditing(false)
          setSelectedFile(null)
        } else {
          setError(data.message || "Failed to update profile")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || `Error: ${response.status} ${response.statusText}`)
      }
    } catch (err: any) {
      setError(err.message || "Network error updating profile")
    }
  }

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-500">
        <p className="text-white">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-teal-500 p-6">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error}</p>
            <Button onClick={() => router.push("/auth")} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-teal-500 p-6">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">Could not load user profile data.</p>
            <Button onClick={() => router.push("/")} className="bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-500 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg text-slate-800 font-bold hover:bg-white/50 transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="h-24 w-24 mb-4 border-4 border-white/20">
              <AvatarImage src={profile.profilePicture || "/placeholder-user.jpg"} alt="User Avatar" />
              <AvatarFallback>{profile.name ? profile.name.charAt(0).toUpperCase() : ''}</AvatarFallback>
            </Avatar>
            <h2 className="text-3xl font-bold mb-1">{profile.name}</h2>
            <p className="text-lg text-slate-600 capitalize">{profile.role}</p>
            {profile.status && (
              <span className="text-sm text-slate-500 capitalize mt-1">({profile.status})</span>
            )}
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
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" value={formData?.mobile || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
                </div>
                <div>
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input id="collegeName" value={formData?.collegeName || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
                </div>
                <div>
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input id="departmentName" value={formData?.departmentName || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
                </div>
                <div>
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input id="courseName" value={formData?.courseName || ""} onChange={handleInputChange} className="bg-white/20 border-none text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800">Social Links</h3>
                <div className="space-y-4">
                  {formData?.socialLinks?.map((social, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Heading (e.g., GitHub)"
                        value={social.heading}
                        onChange={(e) => handleSocialLinkChange(index, 'heading', e.target.value)}
                        className="bg-white/20 border-none text-white"
                      />
                      <Input
                        placeholder="URL"
                        value={social.link}
                        onChange={(e) => handleSocialLinkChange(index, 'link', e.target.value)}
                        className="bg-white/20 border-none text-white"
                      />
                      <Button onClick={() => removeSocialLink(index)} variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addSocialLink} className="mt-2 bg-white/20 border-none text-white hover:bg-white/60 transition-all duration-300">
                    Add Social Link
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Contact Information</h3>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex items-center gap-2 hover:text-slate-800"><Mail className="h-4 w-4 text-slate-500" /> {profile.email}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800"><Phone className="h-4 w-4 text-slate-500" /> {profile.mobile || "Not specified"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Academic Information</h3>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex items-center gap-2 hover:text-slate-800"><Building className="h-4 w-4 text-slate-500" /> {profile.collegeName || "Not specified"}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800"><GraduationCap className="h-4 w-4 text-slate-500" /> {profile.departmentName || "Not specified"}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800"><Tag className="h-4 w-4 text-slate-500" /> {profile.courseName || "Not specified"}</p>
                  </div>
                </div>
              </div>
              {profile.socialLinks && profile.socialLinks.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Social Media</h3>
                  <div className="space-y-2 text-slate-600">
                    {profile.socialLinks.map((social, index) => (
                      <a key={index} href={ensureAbsoluteUrl(social.link)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-slate-800 transition-colors">
                        <LinkIcon className="h-4 w-4 text-slate-500" />
                        <span>{social.heading}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {profile.batch && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">Batch Details</h3>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex items-center gap-2 hover:text-slate-800">Batch: {profile.batch.name}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800">Course: {profile.batch.courseId?.name}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800">Fees: {profile.batch.fees}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800">Start Date: {new Date(profile.batch.startDate).toLocaleDateString()}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800">End Date: {new Date(profile.batch.endDate).toLocaleDateString()}</p>
                    <p className="flex items-center gap-2 hover:text-slate-800">
                      <CreditCard className="h-4 w-4 text-slate-500" />
                      Payment Status: 
                      <span className={`font-bold ${profile.paymentStatus === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                        {profile.paymentStatus ? profile.paymentStatus.charAt(0).toUpperCase() + profile.paymentStatus.slice(1) : 'Not available'}
                      </span>
                    </p>
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
                ← Go to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
