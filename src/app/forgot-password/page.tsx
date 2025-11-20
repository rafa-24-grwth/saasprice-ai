'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

// Force dynamic rendering to avoid build-time Supabase client initialization
export const dynamic = 'force-dynamic';
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        setError(error.message)
      } else {
        setIsSubmitted(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-sp-surface-0 via-sp-surface-1 to-sp-primary/5">
      {/* Logo/Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sp-primary to-sp-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-sp-primary to-sp-accent bg-clip-text text-transparent">
              SaaSPrice.AI
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-sp-text-primary">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-sp-text-secondary">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-sp-border">
          {isSubmitted ? (
            // Success Message
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-sp-text-primary mb-2">
                Check your email
              </h3>
              <p className="text-sm text-sp-text-secondary mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="space-y-3">
                <p className="text-xs text-sp-text-tertiary">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                  className="text-sm font-medium text-sp-primary hover:text-sp-primary-dark transition-colors"
                >
                  Try another email
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-sp-border">
                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm font-medium text-sp-text-secondary hover:text-sp-text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-sp-text-primary">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-sp-text-tertiary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-sp-border rounded-lg shadow-sm 
                             placeholder-sp-text-tertiary focus:outline-none focus:ring-2 focus:ring-sp-primary 
                             focus:border-sp-primary transition-all duration-200 text-sp-text-primary"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg 
                           shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sp-primary to-sp-accent 
                           hover:from-sp-primary-dark hover:to-sp-accent-dark focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-sp-primary disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm font-medium text-sp-text-secondary hover:text-sp-text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}