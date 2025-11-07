
'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, User, BookOpen, LogOut } from 'lucide-react';

import { PersonalDetails } from '@/components/student/personal-details';
import { EnrolledCourses } from '@/components/student/enrolled-courses';

export default function StudentProfilePage() {
  const { user, token, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'student')) {
      router.push('/auth/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (token) {
        try {
          const response = await fetch('/api/student/dashboard', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setProfileData(data.data);
          } else {
            setError(data.message);
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [token]);

  if (isAuthLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  const renderSection = () => {
    if (!profileData) return null;

    switch (activeSection) {
      case 'profile':
        return <PersonalDetails user={profileData.user} />;
      case 'courses':
        return <EnrolledCourses courses={profileData.courses} />;
      default:
        return <PersonalDetails user={profileData.user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-64 bg-gray-800 p-6">
        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
              activeSection === 'profile' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Personal Details</span>
          </button>
          <button
            onClick={() => setActiveSection('courses')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
              activeSection === 'courses' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>My Courses</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-10">
        {renderSection()}
      </main>
    </div>
  );
}
