'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AddTrainerRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/trainers');
  }, [router]);

  return null;
};

export default AddTrainerRedirectPage;