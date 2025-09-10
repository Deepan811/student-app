'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { useAuth } from '@/lib/auth-context';

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCompanies = async () => {
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
      }
    };

    if (token) {
      fetchCompanies();
    }
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Management</h1>
        <Button asChild>
          <Link href="/admin/companies/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Company
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {companies.map((company) => (
          <Card key={company._id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <img src={company.logo || '/placeholder-logo.svg'} alt={`${company.name} logo`} className="w-16 h-16 rounded-full" />
                <div>
                  <CardTitle>{company.name}</CardTitle>
                  <CardDescription>{company.industry}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{company.description}</p>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {company.website}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCompaniesPage;
