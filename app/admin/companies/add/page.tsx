'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const AddCompanyPage = () => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="space-y-8 text-white">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="icon" className="bg-white/10 border-none text-white hover:bg-white/20 transition-all duration-300">
          <Link href="/admin/companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Add New Company</h1>
          <p className="text-slate-300">Enter the details for the new partner company.</p>
        </div>
      </div>

      <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white">Company Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputStyles} placeholder="Company Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-slate-200">Logo URL</Label>
              <Input id="logo" value={logo} onChange={(e) => setLogo(e.target.value)} className={inputStyles} placeholder="https://example.com/logo.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-200">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputStyles} placeholder="https://company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-slate-200">Industry</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputStyles} placeholder="e.g., Tech, Finance" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-200">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputStyles} placeholder="Brief description of the company..." />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
              {isSubmitting ? 'Adding Company...' : 'Add Company'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCompanyPage;