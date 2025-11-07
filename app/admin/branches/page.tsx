'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast, useToast } from "@/components/ui/use-toast"
import { User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const { toast } = useToast()

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
      fetchBranches()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Branch Management</h1>
          <p className="text-slate-300">Create new branch users and view existing branches.</p>
        </div>
      </div>

      <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Create New Branch User</CardTitle>
          <CardDescription className="text-slate-300">Add a new branch by creating a user account. They will receive an email with credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Branch Name</FormLabel>
                  <FormControl><Input placeholder="Main Campus" {...field} className={inputStyles} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Branch Email</FormLabel>
                  <FormControl><Input placeholder="branch@example.com" {...field} className={inputStyles} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div>
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300">
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  {form.formState.isSubmitting ? "Creating..." : "Create Branch User"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Existing Branches</CardTitle>
          <CardDescription className="text-slate-300">A list of all created branch accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-slate-300"/></div>
          ) : branches.length === 0 ? (
            <p className="text-center text-slate-300 py-10">No branches found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card key={branch._id} className="flex flex-col bg-slate-800/40 border border-slate-700 rounded-lg text-white">
                  <CardHeader className="flex-row items-center gap-4">
                    <div className="bg-blue-500/20 text-blue-300 p-3 rounded-lg">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-white">{branch.name}</CardTitle>
                      <CardDescription className="text-slate-400">{branch.email}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow text-sm space-y-2">
                    <p><span className="font-semibold text-slate-300">Address:</span> {branch.address || "Not set"}</p>
                    <p><span className="font-semibold text-slate-300">GST Number:</span> {branch.gst_number || "Not set"}</p>
                    <p><span className="font-semibold text-slate-300">Alt. Mobile:</span> {branch.alt_mobile_number || "Not set"}</p>
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