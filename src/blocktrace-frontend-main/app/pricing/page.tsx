'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, TrendingUp, Globe, Zap, ArrowLeft } from 'lucide-react';

const PricingPage = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small businesses starting their transparency journey',
      features: [
        'Up to 1,000 products tracked',
        'Basic ESG scoring',
        'Standard PDF reports',
        'Email support',
        'Basic API access',
        '5GB data storage'
      ],
      marketValidation: '73% of SMBs willing to pay $50-150/month for supply chain transparency',
      popular: false,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Advanced features for growing enterprises with complex supply chains',
      features: [
        'Up to 10,000 products tracked',
        'Advanced ESG analytics',
        'Custom branding',
        'Priority API access',
        'Real-time monitoring',
        '50GB data storage',
        'Dedicated account manager',
        'Custom integrations'
      ],
      marketValidation: '89% of mid-market companies budget $200-500/month for compliance tools',
      popular: true,
      gradient: 'from-emerald-500 to-blue-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$999',
      period: '/month',
      description: 'Complete solution for large enterprises with global supply chains',
      features: [
        'Unlimited products tracked',
        'White-label solutions',
        'Advanced AI insights',
        'Multi-region deployment',
        'SLA guarantees (99.9%)',
        'Unlimited data storage',
        'Custom development',
        '24/7 premium support'
      ],
      marketValidation: 'Enterprise clients average $800-2000/month spend on supply chain tech',
      popular: false,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const competitiveAdvantages = [
    {
      feature: 'Real-time ESG Scoring',
      blocktrace: 'Live blockchain-based calculations',
      competitors: 'Batch processing, 24-48h delays',
      advantage: '95% faster than traditional solutions'
    },
    {
      feature: 'Transaction Costs',
      blocktrace: '$0 gas fees (ICP reverse gas model)',
      competitors: '$2-15 per transaction (Ethereum)',
      advantage: '100% cost reduction on transactions'
    },
    {
      feature: 'Cross-chain Integration',
      blocktrace: 'Native t-ECDSA for Bitcoin/Ethereum',
      competitors: 'Complex bridge solutions required',
      advantage: 'Seamless multi-chain verification'
    },
    {
      feature: 'API Performance',
      blocktrace: 'Sub-second response times',
      competitors: '3-10 second API responses',
      advantage: '10x faster API performance'
    }
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-purple-900/30 to-blue-900/50"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:p-8">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-white hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-2xl font-bold">BLOCKTRACE</span>
          </button>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-all"
        >
          Back to Home
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose the plan that scales with your supply chain complexity. 
            Serving the $6.2B supply chain transparency market with zero gas fees.
          </p>
          
          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$52B</div>
              <div className="text-sm text-gray-400">Annual losses from supply chain fraud</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-blue-400 mb-2">89%</div>
              <div className="text-sm text-gray-400">Consumers want supply chain transparency</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-purple-400 mb-2">15.8%</div>
              <div className="text-sm text-gray-400">Market CAGR through 2028</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm text-gray-400 mb-8">
              💡 All plans include: HTTP Outcalls • Advanced Timers • t-ECDSA Integration
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 transition-all cursor-pointer hover:bg-white/10 ${
                  plan.popular ? 'ring-2 ring-emerald-500/50 scale-105' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500/50' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className={`bg-gradient-to-r ${plan.gradient} text-white px-4 py-1 rounded-full text-sm font-bold`}>
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    {plan.price}<span className="text-lg text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg mb-6">
                  <div className="text-xs text-gray-400 mb-1">Market Validation:</div>
                  <div className="text-sm text-emerald-400">{plan.marketValidation}</div>
                </div>

                <button className={`w-full py-3 bg-gradient-to-r ${plan.gradient} rounded-xl font-bold text-white hover:opacity-90 transition-opacity`}>
                  Start {plan.name} Plan
                </button>
              </div>
            ))}
          </div>

          {/* Additional Revenue Streams */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Additional Revenue Streams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-2">$0.10</div>
                <div className="text-sm text-gray-400">Per supply chain step recorded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">$50K-200K</div>
                <div className="text-sm text-gray-400">Custom development projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">$100-300/hr</div>
                <div className="text-sm text-gray-400">Compliance consulting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">$10K-50K</div>
                <div className="text-sm text-gray-400">Annual analytics reporting</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Analysis */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why BlockTrace Wins</h2>
            <p className="text-xl text-gray-400">
              Competitive advantages backed by ICP's unique capabilities
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-white">Feature</th>
                    <th className="px-6 py-4 text-left text-emerald-400">BlockTrace (ICP)</th>
                    <th className="px-6 py-4 text-left text-gray-400">Traditional Solutions</th>
                    <th className="px-6 py-4 text-left text-blue-400">Our Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {competitiveAdvantages.map((item, index) => (
                    <tr key={index} className="border-t border-white/10">
                      <td className="px-6 py-4 font-semibold text-white">{item.feature}</td>
                      <td className="px-6 py-4 text-emerald-400">{item.blocktrace}</td>
                      <td className="px-6 py-4 text-gray-400">{item.competitors}</td>
                      <td className="px-6 py-4 text-blue-400 font-semibold">{item.advantage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Acquisition Strategy */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Enterprise Sales</h3>
              <p className="text-gray-400 text-sm mb-4">
                Direct outreach to Fortune 500 procurement teams with proven ROI case studies
              </p>
              <div className="text-emerald-400 font-semibold">Target: 50 enterprise clients Year 1</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <Globe className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Partner Channel</h3>
              <p className="text-gray-400 text-sm mb-4">
                Integration partnerships with SAP, Oracle, and major ERP providers
              </p>
              <div className="text-blue-400 font-semibold">Target: 200 mid-market via partners</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
              <Zap className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Product-Led Growth</h3>
              <p className="text-gray-400 text-sm mb-4">
                Free tier with advanced ICP features to drive viral adoption
              </p>
              <div className="text-purple-400 font-semibold">Target: 10K+ SMB signups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Validated Revenue Projections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$500K</div>
              <div className="text-lg font-semibold text-white mb-2">Year 1 Revenue</div>
              <div className="text-sm text-gray-400">50 enterprise customers</div>
              <div className="text-sm text-gray-400">Based on $10K average ACV</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
              <div className="text-3xl font-bold text-blue-400 mb-2">$2.5M</div>
              <div className="text-lg font-semibold text-white mb-2">Year 2 Revenue</div>
              <div className="text-sm text-gray-400">200 customers + transactions</div>
              <div className="text-sm text-gray-400">Market validation: 89% retention</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
              <div className="text-3xl font-bold text-purple-400 mb-2">$8M</div>
              <div className="text-lg font-semibold text-white mb-2">Year 3 Revenue</div>
              <div className="text-sm text-gray-400">500+ customers + marketplace</div>
              <div className="text-sm text-gray-400">Network effects kick in</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 BlockTrace. Built with ❤️ on the Internet Computer Protocol.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;