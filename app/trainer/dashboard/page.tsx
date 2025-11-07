'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function TrainerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "Trainer"}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your trainer dashboard. More features will be added here soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
