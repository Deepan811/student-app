"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Shield, Mail } from "lucide-react"

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-lg bg-slate-800/80 border border-amber-500/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-amber-500/20 rounded-full">
                {isSubmitted ? (
                  <Mail className="h-6 w-6 text-amber-400" />
                ) : (
                  <Shield className="h-6 w-6 text-amber-400" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {isSubmitted ? "Check Your Email" : "Admin Password Reset"}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {isSubmitted
                ? "We've sent a secure password reset link to your admin email"
                : "Enter your admin email address for password recovery"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Admin Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700/50 border-amber-500/30 text-white placeholder:text-slate-400 focus:bg-slate-700/80 focus:border-amber-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  Send Secure Reset Link
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-300">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/admin"
                className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Admin Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
