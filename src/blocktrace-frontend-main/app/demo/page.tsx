'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, RotateCcw, ExternalLink } from 'lucide-react';

const DemoPage = () => {
  const router = useRouter();
  const [currentDemo, setCurrentDemo] = useState(0);

  const demos = [
    {
      title: "Add Supply Chain Step",
      description: "See how easy it is to add a new step to your product's journey with real-time ESG calculations",
      videoUrl: "/demo/add-step.mp4",
      features: ["Real-time form validation", "ESG score calculation", "Blockchain recording", "NFT minting option"],
      cta: "Try Adding a Step",
      route: "/add-step"
    },
    {
      title: "Track Product Journey",
      description: "Follow a product's complete journey from manufacturer to consumer with interactive timeline",
      videoUrl: "/demo/track-product.mp4", 
      features: ["Interactive timeline", "ESG metrics", "Location mapping", "Certificate verification"],
      cta: "Track a Product",
      route: "/track"
    },
    {
      title: "Digital Passport",
      description: "Generate and view NFT-based digital passports with QR codes and PDF certificates",
      videoUrl: "/demo/digital-passport.mp4",
      features: ["NFT generation", "QR code access", "PDF export", "Blockchain verification"],
      cta: "View Passport",
      route: "/passport"
    },
    {
      title: "Advanced ICP Features",
      description: "Experience HTTP outcalls, automated timers, and t-ECDSA cross-chain verification in action",
      videoUrl: "/demo/advanced-features.mp4",
      features: ["HTTP outcalls", "Automated timers", "t-ECDSA signatures", "Cross-chain proofs"],
      cta: "See Advanced Features",
      route: "/features"
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
              Live Demo
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Experience BlockTrace's revolutionary supply chain transparency platform in action
          </p>
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="relative z-10 px-6 lg:px-8 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {demos.map((demo, index) => (
              <button
                key={index}
                onClick={() => setCurrentDemo(index)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  currentDemo === index
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/20'
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Demo */}
      <div className="relative z-10 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Video/Preview */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/60 mx-auto mb-4" />
                  <p className="text-white/60">Interactive Demo Preview</p>
                  <p className="text-sm text-white/40 mt-2">Click "Try It Live" to experience the actual app</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                  <Play className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                  <Pause className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Demo Details */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">{demos[currentDemo].title}</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {demos[currentDemo].description}
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Key Features Demonstrated:</h3>
                <ul className="space-y-3">
                  {demos[currentDemo].features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-4"></div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/pricing')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                >
                  View Pricing Plans
                </button>
                <button 
                  onClick={() => router.push('/contact')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                >
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Business Leaders Choose BlockTrace</h2>
            <p className="text-gray-400">Real metrics that demonstrate ROI and competitive advantage for your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">3</div>
              <div className="text-sm text-gray-400">Advanced ICP Features</div>
              <div className="text-xs text-gray-500 mt-1">HTTP Outcalls, Timers, t-ECDSA</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">$0</div>
              <div className="text-sm text-gray-400">Transaction Fees</div>
              <div className="text-xs text-gray-500 mt-1">vs $2-15 on Ethereum</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-sm text-gray-400">Faster ESG Scoring</div>
              <div className="text-xs text-gray-500 mt-1">Real-time vs batch processing</div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">$6.2B</div>
              <div className="text-sm text-gray-400">Market Opportunity</div>
              <div className="text-xs text-gray-500 mt-1">Supply chain transparency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Experience the Future?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Don't just watch the demo—experience BlockTrace's revolutionary supply chain platform yourself.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
              >
                Get Started Today
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
              >
                Schedule Demo Call
              </button>
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

export default DemoPage;