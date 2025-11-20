'use client';

import { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Twitter, 
  Linkedin, 
  Github,
  Mail,
  AlertCircle
} from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'API Docs', href: '/docs/api' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Roadmap', href: '/roadmap' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers', badge: 'Hiring' },
    { label: 'Contact', href: '/contact' },
    { label: 'Partners', href: '/partners' },
    { label: 'Press Kit', href: '/press' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'ROI Calculator', href: '#roi-calculator' },
    { label: 'SaaS Pricing Guide', href: '/guides/saas-pricing' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Webinars', href: '/webinars' },
    { label: 'Status Page', href: 'https://status.saasprice.ai' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Data Security', href: '/security' },
    { label: 'GDPR', href: '/gdpr' },
    { label: 'SOC 2', href: '/compliance/soc2' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/saasprice_ai', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/saasprice-ai', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/saasprice', label: 'GitHub' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscribeStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setSubscribeStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would call your newsletter API
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      
      setSubscribeStatus('success');
      setEmail('');
      
      // Reset success state after 5 seconds
      setTimeout(() => setSubscribeStatus('idle'), 5000);
    } catch (error) {
      setSubscribeStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay ahead of SaaS price changes
              </h3>
              <p className="text-gray-400">
                Get weekly insights on SaaS pricing trends and cost optimization tips.
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubscribeStatus('idle');
                  setErrorMessage('');
                }}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              />
              <button
                type="submit"
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className={`px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                  subscribeStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : subscribeStatus === 'loading'
                    ? 'bg-gray-700 text-gray-400 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {subscribeStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Subscribed!
                  </>
                ) : subscribeStatus === 'loading' ? (
                  'Subscribing...'
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {subscribeStatus === 'error' && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">SaaSPrice.AI</h2>
              <p className="text-sm text-gray-500 mt-1">Track • Compare • Optimize</p>
            </div>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              The intelligent platform for tracking SaaS pricing changes and optimizing your software spend. Trusted by RevOps and FP&A teams worldwide.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
              <a
                href="mailto:hello@saasprice.ai"
                aria-label="Email"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2025 SaaSPrice.AI. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                All systems operational
              </span>
              <a href="/security" className="hover:text-gray-300 transition-colors">
                🔒 SOC 2 Type II
              </a>
              <a href="/gdpr" className="hover:text-gray-300 transition-colors">
                🇪🇺 GDPR Compliant
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}