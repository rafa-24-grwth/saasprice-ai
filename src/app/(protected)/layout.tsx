// app/(protected)/layout.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { 
  LayoutDashboard, 
  Building2, 
  GitCompare, 
  Settings, 
  User, 
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vendors', href: '/vendors', icon: Building2 },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-6 bg-gray-900">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">SaasPrice.AI</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                    ${isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`} 
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* User Section */}
          <div className="flex-shrink-0 border-t border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-400">Free Plan</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-3 p-1.5 text-gray-400 hover:text-white transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex h-16 items-center justify-between bg-gray-900 px-4 shadow-sm">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-white">SaasPrice.AI</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-gray-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                      ${isActive 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}