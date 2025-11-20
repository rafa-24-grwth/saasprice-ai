'use client';

import { 
  Search, 
  RefreshCw, 
  TrendingDown,
  CheckCircle,
  Database,
  Bell,
  FileText,
  ArrowRight
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'We Track Vendors Daily',
    description: 'Our system monitors 500+ SaaS vendors with plans to expand weekly based on user requests. Each vendor\'s pricing is checked daily for changes.',
    icon: Database,
    details: [
      'Automated daily price checks',
      'Screenshot evidence for every price point',
      'Track tier changes and feature updates',
    ]
  },
  {
    number: '02',
    title: 'We Normalize Pricing',
    description: 'Different vendors price differently (per user, per month, tiers). We standardize everything so you can actually compare apples to apples.',
    icon: RefreshCw,
    details: [
      'Convert all pricing to per-user/month',
      'Map features across different tiers',
      'Account for annual vs monthly billing',
    ]
  },
  {
    number: '03',
    title: 'You Get Insights',
    description: 'Access real-time pricing data, get alerts on changes, and identify savings opportunities instantly. Export reports for your team.',
    icon: TrendingDown,
    details: [
      'Real-time price comparison tool',
      'Instant alerts when vendors change pricing',
      'Export data for procurement negotiations',
    ]
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How SaaSPrice.AI works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We handle the tedious work of tracking and normalizing SaaS pricing 
            so you can make informed decisions quickly.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line (hidden on mobile, visible on lg screens) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                )}
                
                <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                  {/* Step number */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-400">
                      STEP {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* How we collect data */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our data collection methods
              </h3>
              <p className="text-gray-600 mb-6">
                We use multiple methods to ensure accuracy and completeness of pricing data:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Public pricing pages</div>
                    <div className="text-sm text-gray-600">Daily automated crawling of vendor websites</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">API integrations</div>
                    <div className="text-sm text-gray-600">Direct data from vendors where available</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Community updates</div>
                    <div className="text-sm text-gray-600">User-reported changes verified by our team</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="font-bold text-gray-900 mb-4">Current Coverage</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SaaS vendors tracked</span>
                  <span className="font-bold text-2xl text-gray-900">500+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Daily price checks</span>
                  <span className="font-bold text-2xl text-gray-900">15,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pricing tiers monitored</span>
                  <span className="font-bold text-2xl text-gray-900">2,500+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New vendors weekly</span>
                  <span className="font-bold text-2xl text-gray-900">~10</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Can't find a vendor you need?
                </p>
                <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 inline-flex items-center gap-1">
                  Request a vendor
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Ready to see how much you could save?
          </p>
          <a
            href="#roi-calculator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try our free spend analyzer
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}