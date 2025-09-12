'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Lightbulb, Target, Zap, Globe, Shield } from 'lucide-react';

const AboutPage = () => {
  const router = useRouter();

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
            The Story Behind
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent block">
              BlockTrace
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            From a vision of transparent supply chains to revolutionizing global commerce with blockchain technology
          </p>
        </div>
      </div>

      {/* Founder Story */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <div className="text-center mb-12">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">YS</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Yashasvi Sharma</h2>
              <p className="text-emerald-400 text-lg">Founder & Visionary</p>
            </div>

            <div className="space-y-8 text-gray-300 text-lg leading-relaxed">
              <p>
                <span className="text-emerald-400 font-semibold">"The idea for BlockTrace was born from a simple yet profound realization:"</span> 
                In our interconnected world, we trust products without truly knowing their journey. Every item we touch, every meal we eat, 
                every piece of clothing we wear has a story—but that story remains hidden in the shadows of complex supply chains.
              </p>

              <p>
                As a developer passionate about blockchain technology, I witnessed firsthand how the Internet Computer Protocol was 
                revolutionizing decentralized applications. But I also saw a gap—<span className="text-blue-400 font-semibold">no one was leveraging 
                ICP's unique capabilities to solve one of humanity's most pressing challenges: supply chain transparency.</span>
              </p>

              <p>
                <span className="text-purple-400 font-semibold">The turning point came during a late-night coding session.</span> 
                I was reading about counterfeit medicines killing thousands in developing countries, about fashion brands 
                hiding unethical labor practices, about food fraud costing billions annually. I realized that behind every 
                statistic was a human story—families affected by unsafe products, workers exploited in hidden factories, 
                consumers deceived by false promises.
              </p>

              <p>
                <span className="text-orange-400 font-semibold">That's when BlockTrace was conceived—not just as a technical solution, 
                but as a mission to democratize trust.</span> Using ICP's revolutionary features like HTTP outcalls, advanced timers, 
                and t-ECDSA, I envisioned a platform where every product could tell its authentic story, where transparency 
                wasn't a luxury but a fundamental right.
              </p>

              <p className="text-emerald-400 font-semibold text-xl text-center border-l-4 border-emerald-400 pl-6 italic">
                "BlockTrace isn't just about tracking products—it's about restoring faith in the things we buy, 
                the brands we trust, and the world we're building for future generations."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-emerald-400 mr-4" />
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                To make supply chain transparency accessible, affordable, and actionable for every business—from local artisans 
                to global corporations. We believe that in a world where trust is programmable, ethical business practices 
                become the competitive advantage, not the exception.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-8 h-8 text-blue-400 mr-4" />
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                A world where every product carries its authentic story—where consumers can trace their coffee beans to the 
                farmer who grew them, where fashion brands can prove their ethical practices, where trust isn't just promised 
                but cryptographically guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why ICP */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Why Internet Computer Protocol?</h2>
            <p className="text-xl text-gray-400">
              ICP isn't just our platform—it's our competitive advantage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Zero Gas Fees</h3>
              <p className="text-gray-400">
                Unlike Ethereum's $2-15 per transaction, ICP's reverse gas model makes micro-transactions 
                economically viable for every supply chain step.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">HTTP Outcalls</h3>
              <p className="text-gray-400">
                Real-time integration with external APIs enables live supplier verification and carbon 
                footprint calculations—impossible on traditional blockchains.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">t-ECDSA</h3>
              <p className="text-gray-400">
                Native cross-chain verification with Bitcoin and Ethereum without complex bridge 
                solutions—true interoperability at its finest.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">The Impact We're Creating</h2>
            <p className="text-xl text-gray-400">
              Every line of code, every feature, every partnership is driving real change
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$52B</div>
              <div className="text-sm text-gray-300">Annual fraud losses we're preventing</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">89%</div>
              <div className="text-sm text-gray-300">Consumers demanding transparency</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">15.8%</div>
              <div className="text-sm text-gray-300">Market growth rate we're capturing</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">100%</div>
              <div className="text-sm text-gray-300">Commitment to ethical business</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative z-10 py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <Heart className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-6">Join the Transparency Revolution</h2>
            <p className="text-xl text-gray-300 mb-8">
              BlockTrace is more than a platform—it's a movement toward a more transparent, 
              trustworthy, and ethical global economy. Every business that joins us, every 
              product that gets tracked, every consumer that gains visibility is a step toward 
              the world we're building together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
              >
                Start Your Journey
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 BlockTrace. Built with ❤️ on the Internet Computer Protocol by Yashasvi Sharma.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;