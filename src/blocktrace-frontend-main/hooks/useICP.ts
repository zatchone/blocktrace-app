// hooks/useICP.ts
import { useState, useEffect, useCallback } from 'react';
import { icpService, Step, AddStepResult, ESGScore } from '../lib/icp-service';

export interface UseICPReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  connect: () => Promise<boolean>;
  addStep: (stepData: {
    product_id: string;
    actor_name: string;
    role: string;
    action: string;
    location: string;
    notes: string | null;
  }) => Promise<AddStepResult>;
  getAllProducts: () => Promise<string[]>;
  getProductHistory: (productId: string) => Promise<Step[]>;
  getTotalStepsCount: () => Promise<bigint>;
  getCanisterInfo: () => Promise<string>;
  
  // ESG Methods
  calculateESGScore: (productId: string) => Promise<ESGScore | null>;
  getAllESGScores: () => Promise<ESGScore[]>;
  
  // State
  products: string[];
  totalSteps: bigint;
  canisterInfo: string;
  esgScores: ESGScore[];
  
  // Refresh methods
  refreshProducts: () => Promise<void>;
  refreshTotalSteps: () => Promise<void>;
  refreshCanisterInfo: () => Promise<void>;
  refreshESGScores: () => Promise<void>;
}

export const useICP = (): UseICPReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for commonly used data
  const [products, setProducts] = useState<string[]>([]);
  const [totalSteps, setTotalSteps] = useState<bigint>(BigInt(0));
  const [canisterInfo, setCanisterInfo] = useState<string>('');
  const [esgScores, setEsgScores] = useState<ESGScore[]>([]);

  // Helper to handle async operations
  const handleAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: any) => void
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await operation();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('ICP operation failed:', err);
      
      if (onError) {
        onError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to ICP
  const connect = useCallback(async (): Promise<boolean> => {
    const result = await handleAsync(
      () => icpService.connect(),
      (connected) => setIsConnected(connected)
    );
    return result || false;
  }, [handleAsync]);

  // Add step
  const addStep = useCallback(async (stepData: {
    product_id: string;
    actor_name: string;
    role: string;
    action: string;
    location: string;
    notes: string | null;
  }): Promise<AddStepResult> => {
    const result = await handleAsync(
      () => icpService.addStep(stepData),
      (result) => {
        if (result.Ok) {
          // Refresh products, total steps, and ESG scores after successful addition
          refreshProducts();
          refreshTotalSteps();
          refreshESGScores();
        }
      }
    );
    return result || { Err: 'Failed to add step' };
  }, [handleAsync]);

  // Get all products
  const getAllProducts = useCallback(async (): Promise<string[]> => {
    const result = await handleAsync(
      () => icpService.getAllProducts(),
      (products) => setProducts(products)
    );
    return result || [];
  }, [handleAsync]);

  // Get product history
  const getProductHistory = useCallback(async (productId: string): Promise<Step[]> => {
    const result = await handleAsync(
      () => icpService.getProductHistory(productId)
    );
    return result || [];
  }, [handleAsync]);

  // Get total steps count
  const getTotalStepsCount = useCallback(async (): Promise<bigint> => {
    const result = await handleAsync(
      () => icpService.getTotalStepsCount(),
      (count) => setTotalSteps(count)
    );
    return result || BigInt(0);
  }, [handleAsync]);

  // Get canister info
  const getCanisterInfo = useCallback(async (): Promise<string> => {
    const result = await handleAsync(
      () => icpService.getCanisterInfo(),
      (info) => setCanisterInfo(info)
    );
    return result || '';
  }, [handleAsync]);

  // ESG Methods
  const calculateESGScore = useCallback(async (productId: string): Promise<ESGScore | null> => {
    const result = await handleAsync(
      () => icpService.calculateESGScore(productId)
    );
    return result || null;
  }, [handleAsync]);

  const getAllESGScores = useCallback(async (): Promise<ESGScore[]> => {
    const result = await handleAsync(
      () => icpService.getAllESGScores(),
      (scores) => setEsgScores(scores)
    );
    return result || [];
  }, [handleAsync]);

  // Refresh methods
  const refreshProducts = useCallback(async (): Promise<void> => {
    await getAllProducts();
  }, [getAllProducts]);

  const refreshTotalSteps = useCallback(async (): Promise<void> => {
    await getTotalStepsCount();
  }, [getTotalStepsCount]);

  const refreshCanisterInfo = useCallback(async (): Promise<void> => {
    await getCanisterInfo();
  }, [getCanisterInfo]);

  const refreshESGScores = useCallback(async (): Promise<void> => {
    await getAllESGScores();
  }, [getAllESGScores]);

  // Auto-connect on mount
  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      const connected = await connect();
      
      if (connected && mounted) {
        // Load initial data
        await Promise.all([
          refreshProducts(),
          refreshTotalSteps(),
          refreshCanisterInfo(),
          refreshESGScores()
        ]);
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
    };
  }, [connect, refreshProducts, refreshTotalSteps, refreshCanisterInfo, refreshESGScores]);

  return {
    isConnected,
    isLoading,
    error,
    connect,
    addStep,
    getAllProducts,
    getProductHistory,
    getTotalStepsCount,
    getCanisterInfo,
    calculateESGScore,
    getAllESGScores,
    products,
    totalSteps,
    canisterInfo,
    esgScores,
    refreshProducts,
    refreshTotalSteps,
    refreshCanisterInfo,
    refreshESGScores,
  };
};