// hooks/useAuth.tsx - UPDATED WITH OAUTH AND SECURE PASSWORD CHANGE
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/auth-client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithGithub: () => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: { full_name?: string; company_name?: string }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  updateEmail: (newEmail: string) => Promise<{ error: Error | null }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession()
        setSession(activeSession)
        setUser(activeSession?.user ?? null)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setLoading(false)

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          router.push('/login')
        } else if (event === 'PASSWORD_RECOVERY') {
          router.push('/reset-password')
        } else if (event === 'USER_UPDATED') {
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithGithub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email',
        },
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; company_name?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Profile update will be handled by database trigger
      
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // New function for authenticated password change
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // First verify the current password by re-authenticating
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser?.email) {
        throw new Error('No authenticated user found')
      }

      // Re-authenticate with current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      })

      if (authError) {
        throw new Error('Current password is incorrect')
      }

      // If authentication successful, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      setSession(data.session)
      setUser(data.user)
    } catch (error) {
      console.error('Error refreshing session:', error)
      await signOut()
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    changePassword,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}