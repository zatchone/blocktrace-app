"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "motion/react";
import { Package, Truck, Factory, Store, MapPin, Calendar, FileText, CheckCircle } from "lucide-react";
import Footer from "@/components/footer";

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const radius = 100;
    const [visible, setVisible] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
      const { currentTarget, clientX, clientY } = event;
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
              #22c55e,
              transparent 80%
            )
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          className={cn(
            `flex h-12 w-full rounded-md border-none bg-white/90 px-4 py-3 text-sm text-gray-800 transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:ring-[2px] focus-visible:ring-green-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-[0px_1px_3px_rgba(0,0,0,0.1)]`,
            className,
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  },
);
Input.displayName = "Input";

// Timeline Event Interface
interface TimelineEvent {
  id: string;
  actor: string;
  role: string;
  action: string;
  date: string;
  location: string;
  notes: string;
  verified: boolean;
}

// API Response Interface
interface ApiResponse {
  success: boolean;
  data?: {
    product_id: string;
    status: string;
    timeline: TimelineEvent[];
  };
  error?: string;
}

// Role Icon Mapping
const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'manufacturer':
      return <Factory className="w-6 h-6" />;
    case 'distributor':
    case 'logistics provider':
      return <Truck className="w-6 h-6" />;
    case 'retailer':
      return <Store className="w-6 h-6" />;
    case 'warehouse':
      return <Package className="w-6 h-6" />;
    default:
      return <Package className="w-6 h-6" />;
  }
};

// Timeline Event Card Component
const TimelineCard = ({ event, index, isLast }: { event: TimelineEvent; index: number; isLast: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="relative flex items-start space-x-4"
    >
      {/* Timeline Line and Icon */}
      <div className="flex flex-col items-center">
        <div className="bg-green-500 rounded-full p-3 shadow-lg border-4 border-green-400/30">
          {getRoleIcon(event.role)}
        </div>
        {!isLast && (
          <div className="w-px h-16 bg-gradient-to-b from-green-500 to-green-300 mt-2"></div>
        )}
      </div>

      {/* Event Card */}
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(34, 197, 94, 0.3)" }}
        className="flex-1 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl p-6 shadow-lg border border-green-300/20 mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-black flex items-center space-x-2">
              <span>{event.actor}</span>
              {event.verified && (
                <CheckCircle className="w-5 h-5 text-green-800" />
              )}
            </h3>
            <p className="text-black/80 font-medium">{event.role}</p>
          </div>
          <div className="bg-black/20 px-3 py-1 rounded-full">
            <span className="text-black text-sm font-medium">{event.action}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-black/90">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{new Date(event.date).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-black/90">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>

        {event.notes && (
          <div className="flex items-start space-x-2 text-black/80">
            <FileText className="w-4 h-4 mt-0.5" />
            <p className="text-sm italic">{event.notes}</p>
          </div>
        )}

        {event.verified && (
          <div className="mt-4 flex items-center space-x-2">
            <div className="bg-green-800/30 px-3 py-1 rounded-full">
              <span className="text-black text-xs font-medium">✓ Blockchain Verified</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Main Track Product Component
const TrackProductPage = () => {
  const [productId, setProductId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState('');
  const [productStatus, setProductStatus] = useState('');

  const handleTrack = async () => {
    if (!productId.trim()) {
      setError('Please enter a Product ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setTimeline([]);
    setProductStatus('');
    
    try {
      // Make actual API call to your backend
      const response = await fetch(`/api/track/${encodeURIComponent(productId.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        // Set the actual data from API response
        setTimeline(data.data.timeline);
        setProductStatus(data.data.status);
      } else {
        setError(data.error || 'Product not found. Please check the Product ID.');
        setTimeline([]);
        setProductStatus('');
      }
    } catch (error) {
      console.error('Error tracking product:', error);
      setError('Failed to fetch product information. Please try again.');
      setTimeline([]);
      setProductStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-400 bg-green-900/30 border-green-400/30';
      case 'in transit':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-400/30';
      case 'delayed':
        return 'text-red-400 bg-red-900/30 border-red-400/30';
      default:
        return 'text-blue-400 bg-blue-900/30 border-blue-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="flex-grow relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Track Your Product</h1>
            <p className="text-gray-400">Enter a Product ID to view its complete supply chain journey</p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl p-8 mb-8 shadow-2xl border border-green-300/20"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter Product ID (e.g., PROD123456)"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTrack}
                disabled={isLoading}
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Tracking...</span>
                  </div>
                ) : (
                  'Track Product'
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-8 text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Product Status Badge */}
          {productStatus && timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-8"
            >
              <div className={`px-6 py-2 rounded-full border ${getStatusColor(productStatus)} font-medium`}>
                Status: {productStatus}
              </div>
            </motion.div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Supply Chain Journey</h2>
              
              <div className="max-w-3xl mx-auto">
                {timeline.map((event, index) => (
                  <TimelineCard
                    key={event.id}
                    event={event}
                    index={index}
                    isLast={index === timeline.length - 1}
                  />
                ))}
              </div>

              {/* Export Options */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center mt-8"
              >
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Export Journey</span>
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && timeline.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Enter a Product ID to start tracking</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TrackProductPage;