'use client'

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function BranchDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branch Dashboard</h1>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Link>
        </Button>
      </div>
      {user && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Welcome, {user.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is your branch dashboard. You can manage your branch details and students from here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
