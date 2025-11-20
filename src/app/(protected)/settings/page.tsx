// app/(protected)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Add this import

// Force dynamic rendering to avoid build-time Supabase client initialization
export const dynamic = 'force-dynamic';
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Eye,
  Check,
  X,
  Loader2,
  Key,
  TrendingUp,
  AlertCircle,
  Mail
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  role?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const { user, updateEmail } = useAuth(); // Get actual user data
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  // FIX: Add 'info' to the type union
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || '1',
    email: user?.email || '', // Use actual user email
    full_name: '',
    company: '',
    role: '',
    subscription_tier: 'pro',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [notifications, setNotifications] = useState({
    email_alerts: true,
    price_changes: true,
    weekly_digest: false,
    new_vendors: true,
    feature_updates: true
  });

  // Update profile when user data loads
  useEffect(() => {
    if (user?.email) {
      setProfile(prev => ({
        ...prev,
        email: user.email || '',
        id: user.id
      }));
    }
  }, [user]);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'watchlist', label: 'Watchlist', icon: Eye },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          company: profile.company,
          role: profile.role
        })
      });

      let emailMessage = '';
      if (user?.email && profile.email !== user.email) {
        const { error } = await updateEmail(profile.email);
        if (error) {
          throw new Error(error.message);
        }
        emailMessage = ' Please check your new email for a confirmation link.';
      }
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' + emailMessage });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Save profile error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Helper function to get message styles
  const getMessageStyles = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${getMessageStyles(message.type)}`}>
            <AlertCircle className="h-5 w-5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={profile.company || ''}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      placeholder="Your company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile.role || ''}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      placeholder="Your role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {profile.subscription_tier.toUpperCase()} PLAN
                    </span>
                    <span className="text-sm text-gray-500">
                      Member since {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ... rest of the tabs remain the same ... */}
          </div>
        </div>
      </div>
    </div>
  );
}