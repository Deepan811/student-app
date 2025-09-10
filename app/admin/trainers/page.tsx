'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

const TrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch('/api/admin/trainers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setTrainers(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch trainers', error);
      }
    };

    if (token) {
      fetchTrainers();
    }
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trainers</h1>
        <Button asChild>
          <Link href="/admin/trainers/add">Add New Trainer</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map(trainer => (
          <div key={trainer._id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 flex flex-col items-center text-center dark:bg-gray-800/30 dark:border-white/10">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
              {trainer.profilePicture && trainer.profilePicture.value ? (
                <Image
                  src={trainer.profilePicture.type === 'url' ? trainer.profilePicture.value : `/uploads/${trainer.profilePicture.value}`}
                  alt={trainer.user.name}
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold">{trainer.user.name}</h2>
            <p className="text-gray-400">{trainer.user.email}</p>
            <p className="mt-2 text-sm">{trainer.bio}</p>
            <div className="mt-4">
              <h3 className="font-semibold">Expertise</h3>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {trainer.expertise.map(skill => (
                  <span key={skill} className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs">{skill}</span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Courses</h3>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {trainer.courses.map(course => (
                  <span key={course._id} className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">{course.name}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainersPage;