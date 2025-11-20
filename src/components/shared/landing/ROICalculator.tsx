'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Download,
  Shield,
  ArrowRight,
  X,
  FileSpreadsheet,
  Zap,
  AlertTriangle,
  Info
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface SampleData {
  duplicates: Array<{
    tool: string;
    instances: number;
    monthlyCost: number;
  }>;
  unused: Array<{
    tool: string;
    lastUsed: string;
    monthlyCost: number;
  }>;
  overpaying: Array<{
    tool: string;
    currentPrice: number;
    marketPrice: number;
    savings: number;
  }>;
}

export default function SpendAnalyzer() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [email, setEmail] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSampleResults, setShowSampleResults] = useState(false);
  const [errors, setErrors] = useState<{ file?: string; email?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample data for demo
  const sampleResults: SampleData = {
    duplicates: [
      { tool: 'Zoom + Google Meet + MS Teams', instances: 3, monthlyCost: 847 },
      { tool: 'Slack + MS Teams', instances: 2, monthlyCost: 625 },
      { tool: 'Dropbox + Google Drive + Box', instances: 3, monthlyCost: 456 },
    ],
    unused: [
      { tool: 'Adobe Creative Suite (12 licenses)', lastUsed: '3 months ago', monthlyCost: 636 },
      { tool: 'Salesforce (5 licenses)', lastUsed: '6 months ago', monthlyCost: 375 },
      { tool: 'Grammarly Business (8 licenses)', lastUsed: '2 months ago', monthlyCost: 144 },
    ],
    overpaying: [
      { tool: 'Salesforce', currentPrice: 150, marketPrice: 125, savings: 25 },
      { tool: 'HubSpot', currentPrice: 890, marketPrice: 800, savings: 90 },
      { tool: 'Jira', currentPrice: 35, marketPrice: 20, savings: 15 },
    ],
  };

  const totalDuplicateCost = sampleResults.duplicates.reduce((sum, item) => sum + item.monthlyCost, 0);
  const totalUnusedCost = sampleResults.unused.reduce((sum, item) => sum + item.monthlyCost, 0);
  const totalOverpayment = sampleResults.overpaying.reduce((sum, item) => sum + item.savings, 0) * 25; // 25 avg licenses

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      // Validate file type
      const validTypes = ['.csv', '.xls', '.xlsx'];
      const fileExtension = uploadedFile.name.toLowerCase().substr(uploadedFile.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        setErrors({ file: 'Please upload a CSV or Excel file' });
        return;
      }
      
      if (uploadedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors({ file: 'File size must be less than 10MB' });
        return;
      }

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type || 'application/octet-stream',
      });
      setErrors({});
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { file?: string; email?: string } = {};
    if (!file) newErrors.file = 'Please upload a file';
    if (!email) newErrors.email = 'Email is required';
    if (!email.includes('@')) newErrors.email = 'Please enter a valid email';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsComplete(true);
    }, 3000);
  };

  const handleViewSample = () => {
    setShowSampleResults(true);
  };

  if (isComplete) {
    return (
      <section className="py-24 px-6 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Analysis Complete! Report Sent
            </h3>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We've identified <strong>$4,847 in monthly savings</strong> across duplicate subscriptions, 
              unused licenses, and overpayments. Check your email for the full report.
            </p>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Summary of Findings:</h4>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600 mb-1">$1,928/mo</div>
                  <div className="text-sm text-gray-600">Duplicate tools</div>
                  <div className="text-xs text-gray-500 mt-1">3 overlapping categories</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600 mb-1">$1,155/mo</div>
                  <div className="text-sm text-gray-600">Unused licenses</div>
                  <div className="text-xs text-gray-500 mt-1">37 inactive users</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">$1,764/mo</div>
                  <div className="text-sm text-gray-600">Overpayments</div>
                  <div className="text-xs text-gray-500 mt-1">Wrong pricing tiers</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsComplete(false);
                  setFile(null);
                  setEmail('');
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Analyze Another Statement
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                View Sample Report
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (showSampleResults) {
    return (
      <section className="py-24 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Sample Analysis Results
                </h3>
                <p className="text-gray-600">
                  Based on analyzing 500+ real company statements
                </p>
              </div>
              <button
                onClick={() => setShowSampleResults(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Duplicate Subscriptions */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Duplicate & Overlapping Tools
              </h4>
              <div className="bg-red-50 rounded-lg p-6">
                <div className="space-y-3">
                  {sampleResults.duplicates.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{item.tool}</div>
                        <div className="text-sm text-gray-600">{item.instances} overlapping subscriptions</div>
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        ${item.monthlyCost}/mo
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Duplicate Spend</span>
                    <span className="text-2xl font-bold text-red-600">${totalDuplicateCost}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Unused Licenses */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Unused Licenses
              </h4>
              <div className="bg-orange-50 rounded-lg p-6">
                <div className="space-y-3">
                  {sampleResults.unused.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{item.tool}</div>
                        <div className="text-sm text-gray-600">Last used: {item.lastUsed}</div>
                      </div>
                      <div className="text-xl font-bold text-orange-600">
                        ${item.monthlyCost}/mo
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Unused Spend</span>
                    <span className="text-2xl font-bold text-orange-600">${totalUnusedCost}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overpayments */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
                Overpayments vs Market Rates
              </h4>
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="space-y-3">
                  {sampleResults.overpaying.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{item.tool}</div>
                        <div className="text-sm text-gray-600">
                          Paying ${item.currentPrice}/user • Market rate: ${item.marketPrice}/user
                        </div>
                      </div>
                      <div className="text-xl font-bold text-yellow-600">
                        Save ${item.savings}/user
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Overpayment</span>
                    <span className="text-2xl font-bold text-yellow-600">${totalOverpayment}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">
                Total Potential Savings
              </h3>
              <div className="text-5xl font-bold mb-4">
                ${(totalDuplicateCost + totalUnusedCost + totalOverpayment).toLocaleString()}/mo
              </div>
              <div className="text-xl opacity-90 mb-6">
                ${((totalDuplicateCost + totalUnusedCost + totalOverpayment) * 12).toLocaleString()} annually
              </div>
              <button
                onClick={() => setShowSampleResults(false)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Analyze Your Statement
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Upload your statement, get instant savings
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Our AI analyzes your credit card or expense statement to find duplicate subscriptions, 
            unused tools, and overpayments. Takes 30 seconds.
          </p>
          <button
            onClick={handleViewSample}
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            View sample results
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Upload Form */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload Your Statement
                </h3>
              </div>

            <form onSubmit={handleAnalyze}>
              {/* File Upload Area */}
              <div className="mb-6">
                <label 
                  htmlFor="file-upload"
                  className={`relative block w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                    file 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                  
                  {file ? (
                    <div>
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="font-semibold text-gray-900 mb-1">{file.name}</p>
                      <p className="text-sm text-gray-600 mb-3">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="font-semibold text-gray-900 mb-1">
                        Drop your statement here
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        Accepts CSV, Excel (.xlsx, .xls) up to 10MB
                      </p>
                    </div>
                  )}
                </label>
                
                {errors.file && (
                  <p className="mt-2 text-sm text-red-600">{errors.file}</p>
                )}
              </div>

              {/* Supported Formats */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Supported Formats:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Credit card statements (Chase, Amex, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Expense management exports (Expensify, Brex, Ramp)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Accounting software (QuickBooks, Xero)
                  </li>
                </ul>
              </div>

              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email for Report
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                  }}
                  placeholder="you@company.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isAnalyzing
                    ? 'bg-gray-400 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing your spend...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze & Find Savings
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-xs text-gray-600">
                  <p className="font-semibold mb-1">Your data is secure</p>
                  <p>Files are encrypted, analyzed, then immediately deleted. We never store your financial data.</p>
                </div>
              </div>
            </div>
          </div>

            {/* Right Column - What We Find */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  What We'll Find
                </h3>
              </div>

              <div className="space-y-4">
                {/* Duplicate Subscriptions */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Duplicate Subscriptions
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Multiple tools serving the same purpose
                      </p>
                      <div className="text-sm font-medium text-red-600">
                        Avg savings: $1,847/month
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unused Licenses */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Unused Licenses
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Paying for inactive users
                      </p>
                      <div className="text-sm font-medium text-orange-600">
                        Avg savings: $976/month
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overpayments */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingDown className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Overpayments
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Above market rates
                      </p>
                      <div className="text-sm font-medium text-yellow-600">
                        Avg savings: $1,234/month
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forgotten Subscriptions */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Forgotten Subscriptions
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Free trials that converted
                      </p>
                      <div className="text-sm font-medium text-purple-600">
                        Avg found: 7 subscriptions
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Moved below main content */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h4 className="text-center text-lg font-semibold mb-6 opacity-90">
                Based on analyzing 10,000+ statements
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">$4,057</div>
                  <div className="text-sm opacity-80">Avg monthly savings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">26%</div>
                  <div className="text-sm opacity-80">Avg spend reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">37</div>
                  <div className="text-sm opacity-80">Avg tools found</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">12</div>
                  <div className="text-sm opacity-80">Avg duplicates</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Trusted by finance teams at:</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="text-gray-400 font-bold text-lg">TechCorp</div>
            <div className="text-gray-400 font-bold text-lg">StartupCo</div>
            <div className="text-gray-400 font-bold text-lg">ScaleUp</div>
            <div className="text-gray-400 font-bold text-lg">Enterprise Inc</div>
          </div>
        </div>
      </div>
    </section>
  );
}