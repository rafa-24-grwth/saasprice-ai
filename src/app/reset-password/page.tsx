'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { updatePassword, user } = useAuth()
  const router = useRouter()

  // Check if user has a valid session from the reset link
  useEffect(() => {
    if (!user) {
      // Give it a moment for the session to load
      const timer = setTimeout(() => {
        if (!user) {
          router.push('/forgot-password')
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [user, router])

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, text: '', color: '' }
    
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++
    if (pass.match(/\d/)) strength++
    if (pass.match(/[^a-zA-Z\d]/)) strength++
    
    const strengthLevels = [
      { strength: 0, text: 'Too weak', color: 'bg-red-500' },
      { strength: 1, text: 'Weak', color: 'bg-orange-500' },
      { strength: 2, text: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, text: 'Good', color: 'bg-blue-500' },
      { strength: 4, text: 'Strong', color: 'bg-green-500' },
    ]
    
    return strengthLevels[strength]
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await updatePassword(newPassword)
      
      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sp-surface-0 via-sp-surface-1 to-sp-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-sp-primary" />
      </div>
    )
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
          Set your new password
        </h2>
        <p className="mt-2 text-center text-sm text-sp-text-secondary">
          Please enter a new password for your account
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-sp-border">
          {isSuccess ? (
            // Success Message
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-sp-text-primary mb-2">
                Password updated successfully!
              </h3>
              <p className="text-sm text-sp-text-secondary mb-4">
                Your password has been reset. Redirecting you to the dashboard...
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-sp-primary hover:text-sp-primary-dark transition-colors"
                >
                  Go to dashboard now →
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

              {/* New Password Input */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-sp-text-primary">
                  New password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-sp-text-tertiary" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2.5 border border-sp-border rounded-lg shadow-sm 
                             placeholder-sp-text-tertiary focus:outline-none focus:ring-2 focus:ring-sp-primary 
                             focus:border-sp-primary transition-all duration-200 text-sp-text-primary"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sp-text-tertiary hover:text-sp-text-secondary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-sp-text-secondary">
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-sp-text-primary">
                  Confirm new password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-sp-text-tertiary" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2.5 border border-sp-border rounded-lg shadow-sm 
                             placeholder-sp-text-tertiary focus:outline-none focus:ring-2 focus:ring-sp-primary 
                             focus:border-sp-primary transition-all duration-200 text-sp-text-primary"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sp-text-tertiary hover:text-sp-text-secondary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <p className={`mt-1 text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-sp-surface-1 rounded-lg p-4">
                <p className="text-xs font-medium text-sp-text-secondary mb-2">Password requirements:</p>
                <ul className="text-xs text-sp-text-tertiary space-y-1">
                  <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                    • At least 8 characters
                  </li>
                  <li className={newPassword.match(/[a-z]/) && newPassword.match(/[A-Z]/) ? 'text-green-600' : ''}>
                    • Mix of uppercase and lowercase letters
                  </li>
                  <li className={newPassword.match(/\d/) ? 'text-green-600' : ''}>
                    • At least one number
                  </li>
                  <li className={newPassword.match(/[^a-zA-Z\d]/) ? 'text-green-600' : ''}>
                    • At least one special character
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg 
                           shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sp-primary to-sp-accent 
                           hover:from-sp-primary-dark hover:to-sp-accent-dark focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-sp-primary disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Updating password...
                    </>
                  ) : (
                    'Update password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}