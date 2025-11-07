
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Company {
  _id: string;
  name: string;
  logo: string;
}

export function TrustedCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/admin/companies');
        const data = await res.json();
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch companies', error);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-muted-foreground mb-8">Trusted by</h2>
        <div className="relative overflow-hidden">
          <motion.div
            className="flex"
            animate={{
              x: ['-50%', '0%'],
              transition: {
                ease: 'linear',
                duration: 20,
                repeat: Infinity,
              }
            }}
          >
            {[...companies, ...companies].map((company, index) => (
              <div key={index} className="flex-shrink-0 w-48 mx-4">
                <img src={company.logo || '/placeholder-logo.png'} alt={company.name} className="h-12 w-auto mx-auto" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
