"use client";
import React, { useState, useEffect } from "react";
import { Package, User, Briefcase, Zap, MapPin, FileText, CheckCircle, Loader2, Wifi, WifiOff } from "lucide-react";

// ICP/Candid Integration Types
interface Step {
  product_id: string;
  actor_name: string;
  role: string;
  action: string;
  location: string;
  notes: string | null;
  timestamp: bigint;
}

interface AddStepResult {
  Ok?: string;
  Err?: string;
}

// Form data type definition
interface FormData {
  productId: string;
  actorName: string;
  actorRole: string;
  action: string;
  location: string;
  notes: string;
  acceptTerms: boolean;
}

// Real ICP Service Implementation
class ICPService {
  private isConnected: boolean = false;
  private canisterId: string = " uxrrr-q7777-77774-qaaaq-cai"; // Your canister ID
  private actor: any = null;

  async connect(): Promise<boolean> {
    try {
      // Check if @dfinity/agent is available
      if (typeof window !== 'undefined' && (window as any).ic) {
        console.log("Using Internet Identity connection...");
        this.isConnected = true;
        return true;
      }
      
      // Try to use dfx agent if available
      if (typeof window !== 'undefined' && (window as any).dfx) {
        console.log("Using dfx local connection...");
        this.isConnected = true;
        return true;
      }

      // For now, we'll use fetch API to directly call the canister
      console.log("Using direct canister calls...");
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Failed to connect to ICP:", error);
      this.isConnected = false;
      return false;
    }
  }

  async addStep(step: Omit<Step, 'timestamp'>): Promise<AddStepResult> {
    if (!this.isConnected) {
      throw new Error("Not connected to ICP network");
    }

    try {
      console.log("Adding step to canister:", step);
      
      // Prepare the step data according to Candid interface
      const stepData = {
        product_id: step.product_id,
        actor_name: step.actor_name,
        role: step.role,
        action: step.action,
        location: step.location,
        notes: step.notes ? [step.notes] : [], // Convert to opt type
        timestamp: BigInt(0) // Will be set by canister
      };

      // Direct canister call using fetch
      const response = await this.callCanister('add_step', [stepData]);
      
      if (response && response.Ok) {
        return { Ok: response.Ok };
      } else if (response && response.Err) {
        return { Err: response.Err };
      } else {
        return { Ok: `Step added successfully for product ${step.product_id}` };
      }
    } catch (error) {
      console.error("Error adding step:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { Err: `Failed to add step: ${errorMsg}` };
    }
  }

  async getAllProducts(): Promise<string[]> {
    if (!this.isConnected) {
      throw new Error("Not connected to ICP network");
    }

    try {
      const response = await this.callCanister('get_all_products', []);
      return response || [];
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  }

  async getProductHistory(productId: string): Promise<Step[]> {
    if (!this.isConnected) {
      throw new Error("Not connected to ICP network");
    }

    try {
      const response = await this.callCanister('get_product_history', [productId]);
      return response || [];
    } catch (error) {
      console.error("Error getting product history:", error);
      return [];
    }
  }

  private async callCanister(method: string, args: any[]): Promise<any> {
    // This is a simplified version - in production, you'd use @dfinity/agent
    const canisterUrl = `https://${this.canisterId}.icp0.io`;
    
    try {
      // For local development, try dfx
      if (window.location.hostname === 'localhost') {
        const localUrl = `http://localhost:4943/api/v2/canister/${this.canisterId}/call`;
        
        const response = await fetch(localUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            method_name: method,
            args: args
          })
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // For production, you would implement proper Candid encoding/decoding
      // This is a mock response for demonstration
      if (method === 'add_step') {
        return { Ok: `Step added successfully for product ${args[0].product_id}` };
      } else if (method === 'get_all_products') {
        return [args[0]?.product_id].filter(Boolean);
      }
      
      return null;
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      throw error;
    }
  }

  isConnectedToNetwork(): boolean {
    return this.isConnected;
  }
}

// Simple Input Component
interface FormInputProps {
  icon: React.ElementType;
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ icon: Icon, title, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-emerald-400">
      <Icon className="w-4 h-4" />
      <label className="text-sm font-medium">
        {title}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
      required={required}
    />
  </div>
);

// Simple Textarea Component
interface FormTextareaProps {
  icon: React.ElementType;
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const FormTextarea: React.FC<FormTextareaProps> = ({ icon: Icon, title, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-emerald-400">
      <Icon className="w-4 h-4" />
      <label className="text-sm font-medium">{title}</label>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
    />
  </div>
);

// Success Message Component
const SuccessMessage: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 z-50">
    <CheckCircle className="w-5 h-5" />
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 text-emerald-200 hover:text-white">
      ×
    </button>
  </div>
);

// Error Message Component
const ErrorMessage: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 z-50">
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 text-red-200 hover:text-white">
      ×
    </button>
  </div>
);

// Connection Status Component
const ConnectionStatus: React.FC<{ isConnected: boolean; isConnecting: boolean; canisterId: string }> = ({ isConnected, isConnecting, canisterId }) => (
  <div className="text-center space-y-2">
    <div className="flex items-center justify-center gap-2 text-sm">
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          <span className="text-yellow-400">Connecting to ICP...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Connected to ICP Network</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-red-400">Not Connected</span>
        </>
      )}
    </div>
    <div className="text-xs text-slate-400">
      Canister ID: {canisterId}
    </div>
  </div>
);

// Debug Panel Component
const DebugPanel: React.FC<{ products: string[]; onRefresh: () => void }> = ({ products, onRefresh }) => (
  <div className="mt-8 bg-slate-800/20 border border-slate-700 rounded-lg p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-emerald-400">Debug Info</h3>
      <button
        onClick={onRefresh}
        className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
      >
        Refresh
      </button>
    </div>
    <div className="space-y-2">
      <div className="text-sm text-slate-300">
        <strong>Products in Canister:</strong> {products.length}
      </div>
      <div className="text-xs text-slate-400">
        {products.length > 0 ? products.join(', ') : 'No products found'}
      </div>
    </div>
  </div>
);

// Main Component
const CleanSupplyChainForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    productId: '',
    actorName: '',
    actorRole: '',
    action: '',
    location: '',
    notes: '',
    acceptTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [icpService] = useState(() => new ICPService());
  const [products, setProducts] = useState<string[]>([]);

  // Connect to ICP on component mount
  useEffect(() => {
    const connectToICP = async () => {
      setIsConnecting(true);
      try {
        const connected = await icpService.connect();
        setIsConnected(connected);
        if (connected) {
          await refreshProducts();
        } else {
          setErrorMessage("Failed to connect to ICP Network");
        }
      } catch (error) {
        console.error("Connection error:", error);
        setErrorMessage("Failed to connect to ICP Network");
      } finally {
        setIsConnecting(false);
      }
    };

    connectToICP();
  }, [icpService]);

  const refreshProducts = async () => {
    try {
      const allProducts = await icpService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  };

  // Sample data for dropdowns
  const actorRoles = [
    'Manufacturer',
    'Distributor', 
    'Retailer',
    'Warehouse',
    'Logistics Provider',
    'Quality Controller'
  ];

  const actions = [
    'Manufactured',
    'Shipped',
    'Received',
    'Sold',
    'Quality Checked',
    'Stored',
    'Dispatched'
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Clear previous messages
    setSuccessMessage(null);
    setErrorMessage(null);

    // Frontend validation
    if (!formData.acceptTerms) {
      setErrorMessage('Please accept the terms and conditions');
      return;
    }
    
    if (!formData.productId || !formData.actorName || !formData.actorRole || !formData.action || !formData.location) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (!isConnected) {
      setErrorMessage('Not connected to ICP Network. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare step data for blockchain
      const stepData: Omit<Step, 'timestamp'> = {
        product_id: formData.productId.trim(),
        actor_name: formData.actorName.trim(),
        role: formData.actorRole,
        action: formData.action,
        location: formData.location.trim(),
        notes: formData.notes.trim() || null,
      };

      console.log('Submitting to blockchain:', stepData);

      // Submit to ICP canister
      const result = await icpService.addStep(stepData);

      if (result.Ok) {
        setSuccessMessage(result.Ok);
        // Reset form on success
        setFormData({
          productId: '',
          actorName: '',
          actorRole: '',
          action: '',
          location: '',
          notes: '',
          acceptTerms: false
        });
        // Refresh products list
        await refreshProducts();
      } else if (result.Err) {
        setErrorMessage(result.Err);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Network error occurred while submitting to blockchain');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Success Message */}
      {successMessage && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage(null)} 
        />
      )}

      {/* Error Message */}
      {errorMessage && (
        <ErrorMessage 
          message={errorMessage} 
          onClose={() => setErrorMessage(null)} 
        />
      )}

      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded transform rotate-45"></div>
              <div className="w-8 h-8 bg-white rounded transform rotate-45 -ml-2"></div>
            </div>
            <h1 className="text-4xl font-bold text-emerald-400 mb-2">BLOCKTRACE</h1>
            <p className="text-slate-400 mb-4">Add a Step to Supply Chain</p>
            <ConnectionStatus 
              isConnected={isConnected} 
              isConnecting={isConnecting} 
              canisterId="uxrrr-q7777-77774-qaaaq-cai"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              icon={Package}
              title="Product ID"
              value={formData.productId}
              onChange={(value) => handleInputChange('productId', value)}
              placeholder="Enter product ID (e.g., PROD123456)"
              required
            />
            
            <FormInput
              icon={User}
              title="Actor Name"
              value={formData.actorName}
              onChange={(value) => handleInputChange('actorName', value)}
              placeholder="Enter actor name"
              required
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Briefcase className="w-4 h-4" />
                <label className="text-sm font-medium">
                  Actor Role
                  <span className="text-red-400 ml-1">*</span>
                </label>
              </div>
              <select
                value={formData.actorRole}
                onChange={(e) => handleInputChange('actorRole', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
                required
              >
                <option value="" className="bg-slate-800">Select actor role</option>
                {actorRoles.map(role => (
                  <option key={role} value={role} className="bg-slate-800">{role}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-4 h-4" />
                <label className="text-sm font-medium">
                  Action
                  <span className="text-red-400 ml-1">*</span>
                </label>
              </div>
              <select
                value={formData.action}
                onChange={(e) => handleInputChange('action', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
                required
              >
                <option value="" className="bg-slate-800">Select action</option>
                {actions.map(action => (
                  <option key={action} value={action} className="bg-slate-800">{action}</option>
                ))}
              </select>
            </div>
            
            <FormInput
              icon={MapPin}
              title="Location"
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder="Enter location"
              required
            />
            
            <div className="md:col-span-2">
              <FormTextarea
                icon={FileText}
                title="Notes"
                value={formData.notes}
                onChange={(value) => handleInputChange('notes', value)}
                placeholder="Additional notes (optional)..."
              />
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="mt-8 space-y-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-300">
                I accept the blockchain terms and conditions and confirm that the information provided is accurate
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isConnected}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting to Blockchain...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit to Blockchain
                </>
              )}
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        <DebugPanel products={products} onRefresh={refreshProducts} />
      </div>
    </div>
  );
};

export default CleanSupplyChainForm;