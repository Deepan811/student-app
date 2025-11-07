"use client" // Add this directive as we'll be using client-side hooks

import { useState, useEffect } from "react" // Import useState and useEffect
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CourseCard } from "@/components/course-card"
import { Skeleton } from "@/components/ui/skeleton"

import { TrustedCompanies } from "@/components/trusted-companies"

import { WhyChooseUs } from "@/components/why-choose-us"

import { RobotAnimation } from "@/components/robot-animation"

// Remove the hardcoded courses array
// const courses = [ ... ];

interface CourseData {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
}

export default function HomePage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCourses(data.data);
          } else {
            setError(data.message || "Failed to fetch courses");
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustedCompanies />
      <WhyChooseUs />

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Courses</h2>
            <p className="text-xl text-muted-foreground">
              Discover our most popular courses designed by industry experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-card rounded-lg shadow-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : error ? (
              <p className="text-red-500 text-center col-span-full">Error: {error}</p>
            ) : courses.length === 0 ? (
              <p className="text-foreground text-center col-span-full">No courses found.</p>
            ) : (
              courses.map((course) => (
                <CourseCard
                  key={course._id} // Use unique _id from MongoDB
                  title={course.name} // Map name to title
                  image={course.image}
                  originalPrice={course.price} // Map price to originalPrice
                  discountPrice={course.discountPrice ?? 0}
                  description={course.description}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}