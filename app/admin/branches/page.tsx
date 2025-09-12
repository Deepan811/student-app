
'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { User } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
})

interface Branch {
  _id: string;
  name: string;
  email: string;
  address?: string;
  gst_number?: string;
  alt_mobile_number?: string;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  async function fetchBranches() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/branches')
      if (!response.ok) {
        throw new Error('Failed to fetch branches')
      }
      const data = await response.json()
      // Filter users to only include those with the 'branch' role
      const branchUsers = data.data.filter((user: any) => user.role === 'branch');
      setBranches(branchUsers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch branches.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/branches/create-branch-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create branch user')
      }

      toast({
        title: "Success",
        description: "Branch user created successfully.",
      })
      form.reset()
      fetchBranches() // Refresh the list of branches
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branch Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Branch User</CardTitle>
          <CardDescription>Add a new branch by creating a user account for them. They will receive an email with their login credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Campus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Email</FormLabel>
                    <FormControl>
                      <Input placeholder="branch@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:pt-8">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating..." : "Create Branch User"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Branches</CardTitle>
          <CardDescription>A list of all created branch accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading branches...</p>
          ) : branches.length === 0 ? (
            <p>No branches found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card key={branch._id} className="flex flex-col">
                  <CardHeader className="flex-row items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{branch.name}</CardTitle>
                      <CardDescription>{branch.email}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Address:</strong> {branch.address || "Not set"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>GST Number:</strong> {branch.gst_number || "Not set"}
                      </p>
                       <p className="text-sm text-muted-foreground">
                        <strong>Alt. Mobile:</strong> {branch.alt_mobile_number || "Not set"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
