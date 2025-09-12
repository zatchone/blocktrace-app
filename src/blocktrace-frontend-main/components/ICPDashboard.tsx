"use client";

// components/ICPDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useICP } from '../hooks/useICP';
import { Step } from '@/lib/icp-service';

interface ProductHistoryProps {
  productId: string;
  onClose: () => void;
}

const ProductHistory: React.FC<ProductHistoryProps> = ({ productId, onClose }) => {
  const { getProductHistory, isLoading } = useICP();
  const [history, setHistory] = useState<Step[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const steps = await getProductHistory(productId);
      setHistory(steps);
    };

    loadHistory();
  }, [productId, getProductHistory]);

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Product History: {productId}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No history found for this product</div>
        ) : (
          <div className="space-y-4">
            {history.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Actor:</strong> {step.actor_name}
                  </div>
                  <div>
                    <strong>Role:</strong> {step.role}
                  </div>
                  <div>
                    <strong>Action:</strong> {step.action}
                  </div>
                  <div>
                    <strong>Location:</strong> {step.location}
                  </div>
                  <div className="col-span-2">
                    <strong>Timestamp:</strong> {formatTimestamp(step.timestamp)}
                  </div>
                  {step.notes.length > 0 && (
                    <div className="col-span-2">
                      <strong>Notes:</strong> {step.notes[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface AddStepFormProps {
  onClose: () => void;
  onStepAdded: () => void;
}

const AddStepForm: React.FC<AddStepFormProps> = ({ onClose, onStepAdded }) => {
  const { addStep, isLoading } = useICP();
  const [formData, setFormData] = useState({
    product_id: '',
    actor_name: '',
    role: '',
    action: '',
    location: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await addStep({
      ...formData,
      notes: formData.notes.trim() || null
    });

    if (result.Ok) {
      alert('Step added successfully!');
      onStepAdded();
      onClose();
    } else {
      alert(`Error: ${result.Err}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Step</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID
            </label>
            <input
              type="text"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actor Name
            </label>
            <input
              type="text"
              name="actor_name"
              value={formData.actor_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <input
              type="text"
              name="action"
              value={formData.action}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Step'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ICPDashboard: React.FC = () => {
  const {
    isConnected,
    isLoading,
    error,
    products,
    totalSteps,
    canisterInfo,
    connect,
    refreshProducts,
    refreshTotalSteps,
    refreshCanisterInfo
  } = useICP();

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleRefreshAll = async () => {
    await Promise.all([
      refreshProducts(),
      refreshTotalSteps(),
      refreshCanisterInfo()
    ]);
  };

  const handleStepAdded = () => {
    handleRefreshAll();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ICP BlockTrace Dashboard</h1>
        <p className="text-gray-600">Blockchain-based product traceability system</p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
              {isConnected ? 'Connected to ICP' : 'Disconnected'}
            </span>
          </div>
          <div className="space-x-2">
            {!isConnected && (
              <button
                onClick={connect}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            )}
            <button
              onClick={handleRefreshAll}
              disabled={isLoading || !isConnected}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Total Steps</h3>
          <p className="text-3xl font-bold text-green-600">{totalSteps.toString()}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Canister Status</h3>
          <p className="text-sm text-purple-600 truncate">{canisterInfo || 'Loading...'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          disabled={!isConnected}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add New Step
        </button>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Products</h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{product}</h3>
                      <p className="text-sm text-gray-500">Product ID</p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductHistory
          productId={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showAddForm && (
        <AddStepForm
          onClose={() => setShowAddForm(false)}
          onStepAdded={handleStepAdded}
        />
      )}
    </div>
  );
};

export default ICPDashboard;