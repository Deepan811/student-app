'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/use-toast';

const AddCompanyPage = () => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          logo,
          website,
          industry,
          description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Company added successfully' });
        router.push('/admin/companies');
      } else {
        toast({ title: 'Failed to add company', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'An error occurred', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Company</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="logo">Logo URL</Label>
          <Input id="logo" value={logo} onChange={(e) => setLogo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button type="submit">Add Company</Button>
      </form>
    </div>
  );
};

export default AddCompanyPage;
