'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { AddTrainerForm } from '@/components/add-trainer-form';
import { Loader2, Users, Mail, Book, Briefcase, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface BatchInfo {
  _id: string;
  name: string;
}

interface Trainer {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  bio: string;
  expertise: string[];
  profilePicture?: {
    value: string;
  };
  courses: { _id: string; name: string }[];
  batches: BatchInfo[];
}

const TrainerCard = ({ trainer, index }: { trainer: Trainer; index: number }) => {
  const [imgSrc, setImgSrc] = useState(trainer.profilePicture?.value || '/placeholder-user.jpg');

  return (
    <div className="relative p-6 rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-orange-500/30 group">
      {/* Futuristic Border Effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-orange-500 transition-all duration-300 animate-pulse-border"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h3 className="text-orange-400 text-sm font-bold tracking-widest mb-4">TRAINER PROFILE</h3>

        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-orange-500 flex-shrink-0">
          <Image
            src={imgSrc}
            alt={trainer.user.name}
            layout="fill"
            objectFit="cover"
            priority={index < 3}
            onError={() => setImgSrc('/placeholder-user.jpg')}
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">{trainer.user.name}</h2>
        <p className="text-teal-400 text-sm mb-4">{trainer.user.email}</p>

        <div className="w-full text-left mb-4">
          <p className="text-orange-400 text-xs font-bold tracking-wider mb-1">Bio</p>
          <p className="text-gray-300 text-sm leading-relaxed">{trainer.bio || 'No bio provided.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-4">
          <div className="text-left">
            <p className="text-orange-400 text-xs font-bold tracking-wider mb-1">EXPERTISE</p>
            <div className="flex flex-wrap gap-1">
              {trainer.expertise && trainer.expertise.length > 0 ? (
                trainer.expertise.map((skill, idx) => (
                  <span key={idx} className="bg-teal-600/30 text-teal-300 text-xs px-2 py-0.5 rounded-full">{skill}</span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">N/A</span>
              )}
            </div>
          </div>
          <div className="text-left">
            <p className="text-orange-400 text-xs font-bold tracking-wider mb-1">COURSES</p>
            <div className="flex flex-wrap gap-1">
              {trainer.courses && trainer.courses.length > 0 ? (
                trainer.courses.map((course, idx) => (
                  <span key={idx} className="bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full">{course.name}</span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">N/A</span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full text-left">
          <p className="text-orange-400 text-xs font-bold tracking-wider mb-1">ASSIGNED BATCHES</p>
          <div className="flex flex-wrap gap-1">
            {trainer.batches && trainer.batches.length > 0 ? (
              trainer.batches.map((batch, idx) => (
                <span key={idx} className="bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">{batch.name}</span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">N/A</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [trainersPerPage] = useState(6); // Display 6 trainers per page
  const { token } = useAuth();

  const fetchTrainers = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrainers();
    }
  }, [token]);

  const filteredTrainers = trainers.filter(trainer =>
    trainer.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trainers</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-white/10 border-white/20 text-white"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Trainer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-slate-900 text-white border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Trainer</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Fill in the details to add a new trainer.
                </DialogDescription>
              </DialogHeader>
              <AddTrainerForm onSuccess={() => {
                setIsDialogOpen(false);
                fetchTrainers(); // Refresh the list of trainers
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-300">
            <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p>No trainers found matching your search.</p>
          </div>
        ) : (
          filteredTrainers.slice((currentPage - 1) * trainersPerPage, currentPage * trainersPerPage).map((trainer, index) => (
            <TrainerCard key={trainer._id} trainer={trainer} index={index} />
          ))
        )}
      </div>

      {filteredTrainers.length > trainersPerPage && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
              </PaginationItem>
              {[...Array(Math.ceil(filteredTrainers.length / trainersPerPage)).keys()].map(number => (
                <PaginationItem key={number + 1}>
                  <Button
                    variant={currentPage === number + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(number + 1)}
                  >
                    {number + 1}
                  </Button>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === Math.ceil(filteredTrainers.length / trainersPerPage)}
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default TrainersPage;
