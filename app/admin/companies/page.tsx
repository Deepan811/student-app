'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from '@/lib/auth-context';

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/companies', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch companies', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCompanies();
    }
  }, [token]);

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Company Management</h1>
          <p className="text-slate-300">Manage partner companies for placements.</p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300">
          <Link href="/admin/companies/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Company
          </Link>
        </Button>
      </div>
      
      <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Partner Companies</CardTitle>
          <CardDescription className="text-slate-300">A list of all partner companies.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-slate-300"/></div>
          ) : companies.length === 0 ? (
            <p className="text-center text-slate-300 py-10">No companies found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company._id} className="bg-slate-800/40 border border-slate-700 rounded-lg text-white overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <img src={company.logo || '/placeholder-logo.svg'} alt={`${company.name} logo`} className="w-16 h-16 rounded-full bg-slate-700 object-cover" />
                      <div>
                        <CardTitle className="text-lg font-semibold text-white">{company.name}</CardTitle>
                        <CardDescription className="text-slate-400">{company.industry}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 mb-4 h-20 overflow-y-auto">{company.description}</p>
                    <Button asChild variant="outline" className="w-full bg-white/10 border-none text-white hover:bg-white/20 transition-all duration-300">
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompaniesPage;