"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const router = useRouter()
  const { login } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        // Handle login
        const response = await authApi.login({
          email: formData.email,
          password: formData.password,
        })

        if (response.success && response.user) {
          login(response.user, response.token)
          setMessage({ type: "success", text: "Login successful! Redirecting..." })
          if (response.user.passwordChangeRequired) {
            setTimeout(() => router.push("/auth/force-password-change"), 1500)
          }
          else {
            if (response.user.role === 'branch') {
              setTimeout(() => router.push("/branch/dashboard"), 1500)
            } else {
              setTimeout(() => router.push("/"), 1500)
            }
          }
        } else {
          setMessage({ type: "error", text: response.message })
        }
      } else {
        // Handle registration
        const response = await authApi.register({
          name: formData.name,
          email: formData.email,
        })

        if (response.success) {
          setShowRegistrationSuccess(true)
          setFormData({ name: "", email: "", password: "" })
        } else {
          setMessage({ type: "error", text: response.message })
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  if (showRegistrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl text-white">
            <CardContent className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
              <p className="text-slate-300 mb-6">
                Your registration details have been submitted successfully. You can now:
              </p>

              <div className="bg-blue-50/10 border border-blue-200/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-300 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">What happens next?</span>
                </div>
                <ul className="text-sm text-blue-400 text-left space-y-1">
                  <li>• Admin will review your registration</li>
                  <li>• You'll receive login credentials via email</li>
                  <li>• Use those credentials to access courses</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowRegistrationSuccess(false)
                    setIsLogin(true)
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Go to Login
                </Button>
                <Button variant="outline" onClick={() => setShowRegistrationSuccess(false)} className="w-full bg-transparent border-white/20 hover:bg-white/10">
                  Register Another Account
                </Button>
                <Link href="/" passHref>
                  <Button variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10">
                    Go to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {isLogin ? "Sign in to your account" : "Join our learning platform"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <Button
                variant={isLogin ? "default" : "ghost"}
                className={`flex-1 font-medium ${
                  isLogin ? "bg-white/10 shadow-sm text-white" : "hover:bg-white/5 text-slate-300"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                className={`flex-1 font-medium ${
                  !isLogin ? "bg-white/10 shadow-sm text-white" : "hover:bg-white/5 text-slate-300"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </Button>
            </div>

            {message && (
              <Alert
                className={message.type === "success" ? "border-green-200/20 bg-green-500/10" : "border-red-200/20 bg-red-500/10"}
              >
                <AlertDescription className={message.type === "success" ? "text-green-300" : "text-red-300"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="bg-white/5 border-white/20 focus:bg-white/10 placeholder:font-bold"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border-white/20 focus:bg-white/10 placeholder:font-bold"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className="bg-white/5 border-white/20 focus:bg-white/10 placeholder:font-bold"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Submit Registration"}
              </Button>

              <div className="text-center text-sm text-slate-400">
                {isLogin ? (
                  <>
                    New user?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Existing user?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      Sign in here
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-slate-400 hover:text-slate-300 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
