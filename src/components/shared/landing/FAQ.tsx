'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  CreditCard,
  BarChart3,
  Shield,
  Settings,
  type LucideIcon
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'pricing' | 'data' | 'security' | 'features';
}

interface CategoryLabel {
  label: string;
  icon: LucideIcon;
}

const faqData: FAQItem[] = [
  // Pricing Questions
  {
    question: 'Can I change my plan later?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll have immediate access to new features. When downgrading, changes take effect at the next billing cycle.',
    category: 'pricing',
  },
  {
    question: 'Do you offer discounts for non-profits or educational institutions?',
    answer: 'Yes, we offer 50% discounts for qualified non-profits and educational institutions. Contact our sales team with proof of your organization\'s status to get started.',
    category: 'pricing',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and ACH bank transfers for annual plans. Enterprise customers can also pay via invoice with NET 30 terms.',
    category: 'pricing',
  },
  
  // Data Questions
  {
    question: 'How often is pricing data updated?',
    answer: 'Free plans receive weekly updates, Pro plans get daily updates, and Enterprise plans can configure real-time monitoring for critical vendors. We also send instant alerts when significant price changes are detected.',
    category: 'data',
  },
  {
    question: 'How accurate is your pricing data?',
    answer: 'Our multi-method verification system achieves 99.7% accuracy. We use automated scraping, vendor APIs where available, and AI-powered screenshot analysis. Every data point includes a confidence score and source timestamp.',
    category: 'data',
  },
  {
    question: 'Which SaaS vendors do you track?',
    answer: 'We currently track over 500 SaaS vendors and add new ones weekly based on user requests. Popular vendors include Salesforce, Microsoft 365, Slack, Zoom, and Adobe. You can request new vendors directly from your dashboard.',
    category: 'data',
  },
  {
    question: 'Can I export historical pricing data?',
    answer: 'Yes! Pro and Enterprise plans can export up to 12 months of historical data in CSV, JSON, or Excel formats. Enterprise plans get unlimited historical data retention and custom export formats.',
    category: 'data',
  },
  
  // Security Questions
  {
    question: 'How do you keep my data secure?',
    answer: 'We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Our infrastructure is SOC 2 Type II compliant, with regular third-party security audits. We never store your vendor login credentials.',
    category: 'security',
  },
  {
    question: 'Do you sell or share my data?',
    answer: 'Never. Your data is your data. We don\'t sell, share, or use your information for anything other than providing you with our service. Our business model is subscriptions, not data brokering.',
    category: 'security',
  },
  {
    question: 'Is there an on-premise option?',
    answer: 'Yes, Enterprise customers can deploy SaaSPrice.AI on-premise or in their private cloud. This includes full feature parity with our cloud version plus dedicated support for setup and maintenance.',
    category: 'security',
  },
  
  // Features Questions
  {
    question: 'Can I integrate SaaSPrice.AI with my existing tools?',
    answer: 'Yes! We offer REST API access for Pro plans and above, plus native integrations with Slack, Microsoft Teams, Zapier, and webhooks for custom integrations. Enterprise plans get priority support for custom integrations.',
    category: 'features',
  },
  {
    question: 'How does the price change alerting work?',
    answer: 'Set custom thresholds for each vendor (e.g., alert me if Salesforce increases prices by >10%). You\'ll receive alerts via email, Slack, or webhook within 24 hours of detection. Configure alert frequency to avoid notification fatigue.',
    category: 'features',
  },
  {
    question: 'Can multiple team members use one account?',
    answer: 'Pro plans include 5 team seats, and Enterprise plans offer unlimited users with role-based access control. Each user gets their own login, personalized alerts, and activity tracking.',
    category: 'features',
  },
];

const categoryLabels: Record<string, CategoryLabel> = {
  pricing: { label: 'Pricing & Billing', icon: CreditCard },
  data: { label: 'Data & Accuracy', icon: BarChart3 },
  security: { label: 'Security & Privacy', icon: Shield },
  features: { label: 'Features & Integrations', icon: Settings },
};

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Everything you need to know about SaaSPrice.AI
          </p>

          {/* Category Filter */}
          <div className="inline-flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Questions
            </button>
            {Object.entries(categoryLabels).map(([key, value]) => {
              const Icon = value.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-md font-medium transition-all inline-flex items-center gap-2 ${
                    selectedCategory === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {value.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => {
            const isOpen = openItems.includes(index);
            const Icon = categoryLabels[item.category].icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                <div
                  id={`faq-answer-${index}`}
                  className={`transition-all duration-200 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed pl-14">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-16 text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:sales@saasprice.ai"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Talk to Sales
            </a>
            <a
              href="mailto:support@saasprice.ai"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}