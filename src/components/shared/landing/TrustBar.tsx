'use client';

export default function TrustBar() {
  return (
    <section className="py-12 border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm text-gray-500 mb-8">
          Trusted by finance teams to track and optimize SaaS spend
        </p>
        
        {/* Placeholder company names - replace with actual logos when you have them */}
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40">
          <div className="text-gray-600 font-semibold text-lg">TechCorp</div>
          <div className="text-gray-600 font-semibold text-lg">StartupCo</div>
          <div className="text-gray-600 font-semibold text-lg">ScaleUp Inc</div>
          <div className="text-gray-600 font-semibold text-lg">Growth Labs</div>
          <div className="text-gray-600 font-semibold text-lg">Digital Co</div>
        </div>
        
        <div className="mt-8 flex justify-center items-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">500+</span>
            <span>vendors tracked</span>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">$2M+</span>
            <span>saved annually</span>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">99.7%</span>
            <span>accuracy rate</span>
          </div>
        </div>
      </div>
    </section>
  );
}