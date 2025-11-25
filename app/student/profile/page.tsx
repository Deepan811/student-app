
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
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [batchDetails, setBatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'student')) {
      router.push('/auth/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (token) {
        setLoading(true);
        try {
          const [coursesResponse, batchResponse] = await Promise.all([
            fetch('/api/students/enrolled-courses', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch('/api/students/my-batch', {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const coursesData = await coursesResponse.json();
          const batchData = await batchResponse.json();

          if (coursesData.success) {
            setEnrolledCourses(coursesData.data);
          } else {
            setError(coursesData.message || 'Failed to fetch courses');
          }

          if (batchData.success) {
            setBatchDetails(batchData.data);
          } else {
            // It's possible a student isn't in a batch, so don't treat "not found" as a hard error
            if (batchResponse.status !== 404) {
              setError(batchData.message || 'Failed to fetch batch details');
            }
          }

        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudentData();
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
    switch (activeSection) {
      case 'profile':
        return <PersonalDetails user={user} />;
      case 'courses':
        return <EnrolledCourses courses={enrolledCourses} />;
      case 'batch':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Batch</h2>
            {batchDetails ? (
              <div>
                <p>Batch Name: {batchDetails.name}</p>
                {/* Add more batch details as needed */}
              </div>
            ) : (
              <p>You are not currently enrolled in a batch.</p>
            )}
          </div>
        );
      default:
        return <PersonalDetails user={user} />;
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
            onClick={() => setActiveSection('batch')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg ${
              activeSection === 'batch' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9z" />
              <path d="M9 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9z" />
            </svg>
            <span>My Batch</span>
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
