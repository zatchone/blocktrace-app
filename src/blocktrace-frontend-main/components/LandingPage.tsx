'use client';

import React, { useState } from 'react';
import { loginWithInternetIdentity, loginWithPlugWallet } from '@/lib/auth';
import { CheckCircle, TrendingUp, Shield, Globe, Clock, Zap } from 'lucide-react';

const LandingPage = () => {
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
      popular: false
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
      popular: true
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
      popular: false
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

  const scrollToPricing = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Navigation */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              BLOCKTRACE
            </div>
            <nav className="flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <button onClick={scrollToPricing} className="text-gray-300 hover:text-white transition-colors font-semibold">
                Pricing
              </button>
              <a href="#competitive" className="text-gray-300 hover:text-white transition-colors">Compare</a>
              <button
                onClick={loginWithInternetIdentity}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition-all"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            BLOCKTRACE
          </h1>
          <p className="text-xl mb-4 text-gray-300">
            The world's first ICP-native supply chain platform with real-time ESG scoring
          </p>
          <p className="text-lg mb-8 text-gray-400">
            Serving the $6.2B supply chain transparency market with zero gas fees and web-speed performance
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={loginWithInternetIdentity}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-lg transition-all"
            >
              Start Free Trial
            </button>
            
            <button
              onClick={loginWithPlugWallet}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition-all"
            >
              Connect Wallet
            </button>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gray-900 p-6 rounded-xl">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$52B</div>
              <div className="text-sm text-gray-400">Annual losses from supply chain fraud</div>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl">
              <div className="text-3xl font-bold text-blue-400 mb-2">89%</div>
              <div className="text-sm text-gray-400">Consumers want supply chain transparency</div>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl">
              <div className="text-3xl font-bold text-purple-400 mb-2">15.8%</div>
              <div className="text-sm text-gray-400">Market CAGR through 2028</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing-section" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-400 mb-8">
              Choose the plan that scales with your supply chain complexity
            </p>
            <div className="text-sm text-gray-500">
              💡 All plans include: HTTP Outcalls • Advanced Timers • t-ECDSA Integration
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gray-900 rounded-2xl p-8 transition-all cursor-pointer ${
                  plan.popular ? 'ring-2 ring-emerald-500 scale-105' : 'hover:scale-102'
                } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {plan.price}<span className="text-lg text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <div className="text-xs text-gray-400 mb-1">Market Validation:</div>
                  <div className="text-sm text-emerald-400">{plan.marketValidation}</div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold hover:opacity-90 transition-opacity">
                  Start {plan.name} Plan
                </button>
              </div>
            ))}
          </div>

          {/* Additional Revenue Streams */}
          <div className="bg-gray-900 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Additional Revenue Streams</h3>
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
      <div id="competitive" className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why BlockTrace Wins</h2>
            <p className="text-xl text-gray-400">
              Competitive advantages backed by ICP's unique capabilities
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-2xl overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left">Feature</th>
                  <th className="px-6 py-4 text-left text-emerald-400">BlockTrace (ICP)</th>
                  <th className="px-6 py-4 text-left text-gray-400">Traditional Solutions</th>
                  <th className="px-6 py-4 text-left text-blue-400">Our Advantage</th>
                </tr>
              </thead>
              <tbody>
                {competitiveAdvantages.map((item, index) => (
                  <tr key={index} className="border-t border-gray-800">
                    <td className="px-6 py-4 font-semibold">{item.feature}</td>
                    <td className="px-6 py-4 text-emerald-400">{item.blocktrace}</td>
                    <td className="px-6 py-4 text-gray-400">{item.competitors}</td>
                    <td className="px-6 py-4 text-blue-400 font-semibold">{item.advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Customer Acquisition Strategy */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl">
              <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Enterprise Sales</h3>
              <p className="text-gray-400 text-sm mb-4">
                Direct outreach to Fortune 500 procurement teams with proven ROI case studies
              </p>
              <div className="text-emerald-400 font-semibold">Target: 50 enterprise clients Year 1</div>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl">
              <Globe className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Partner Channel</h3>
              <p className="text-gray-400 text-sm mb-4">
                Integration partnerships with SAP, Oracle, and major ERP providers
              </p>
              <div className="text-blue-400 font-semibold">Target: 200 mid-market via partners</div>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl">
              <Zap className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Product-Led Growth</h3>
              <p className="text-gray-400 text-sm mb-4">
                Free tier with advanced ICP features to drive viral adoption
              </p>
              <div className="text-purple-400 font-semibold">Target: 10K+ SMB signups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Validated Revenue Projections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-2xl">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$500K</div>
              <div className="text-lg font-semibold mb-2">Year 1 Revenue</div>
              <div className="text-sm text-gray-400">50 enterprise customers</div>
              <div className="text-sm text-gray-400">Based on $10K average ACV</div>
            </div>
            <div className="bg-gray-900 p-8 rounded-2xl">
              <div className="text-3xl font-bold text-blue-400 mb-2">$2.5M</div>
              <div className="text-lg font-semibold mb-2">Year 2 Revenue</div>
              <div className="text-sm text-gray-400">200 customers + transactions</div>
              <div className="text-sm text-gray-400">Market validation: 89% retention</div>
            </div>
            <div className="bg-gray-900 p-8 rounded-2xl">
              <div className="text-3xl font-bold text-purple-400 mb-2">$8M</div>
              <div className="text-lg font-semibold mb-2">Year 3 Revenue</div>
              <div className="text-sm text-gray-400">500+ customers + marketplace</div>
              <div className="text-sm text-gray-400">Network effects kick in</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;