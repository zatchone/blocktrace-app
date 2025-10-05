// lib/auth.ts - Complete improved version
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

export interface UserProfile {
  principal: string;
  isAuthenticated: boolean;
  authMethod: 'internet-identity' | 'plug-wallet' | null;
  loginTime: Date | null;
}

// Type definitions for Plug Wallet
interface PlugAgent {
  getPrincipal: () => Promise<{ toString: () => string }>;
}

interface PlugWallet {
  requestConnect: (options: {
    host: string;
    whitelist: string[];
  }) => Promise<boolean>;
  isConnected: () => Promise<boolean>;
  agent: PlugAgent;
  disconnect: () => Promise<void>;
}

interface WindowWithPlug extends Window {
  ic?: {
    plug?: PlugWallet;
  };
}

let authClient: AuthClient | null = null;

export const initAuth = async (): Promise<{ authClient: AuthClient; isAuthenticated: boolean; identity: Identity }> => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  
  const isAuthenticated = await authClient.isAuthenticated();
  const identity = authClient.getIdentity();
  
  return { authClient, isAuthenticated, identity };
};

export const loginWithInternetIdentity = async (): Promise<void> => {
  try {
    if (!authClient) {
      authClient = await AuthClient.create();
    }

    await authClient.login({
      identityProvider: 'https://identity.ic0.app/#authorize',
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
      onSuccess: () => {
        // Store auth method in localStorage
        localStorage.setItem('authMethod', 'internet-identity');
        localStorage.setItem('loginTime', new Date().toISOString());
        window.location.href = '/home';
      },
      onError: (err) => {
        console.error('Internet Identity login failed:', err);
        alert('Login failed. Please try again.');
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred during login. Please try again.');
  }
};

export const loginWithPlugWallet = async (): Promise<void> => {
  try {
    const windowWithPlug = window as WindowWithPlug;
    
    // Check if Plug wallet is installed
    if (!windowWithPlug.ic?.plug) {
      alert('Plug Wallet is not installed. Please install it from https://plugwallet.ooo/');
      return;
    }

    const plug = windowWithPlug.ic.plug;
    
    // Clear any existing auth state first
    localStorage.removeItem('authMethod');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('plugPrincipal');
    localStorage.removeItem('plugConnected');
    
    // Determine the correct host based on environment
    const host = process.env.NEXT_PUBLIC_DFX_NETWORK === 'local' 
      ? 'http://localhost:4943' 
      : 'https://mainnet.dfinity.network';
    
    console.log('Attempting to connect to Plug Wallet with host:', host);
    
    // Request connection with timeout
    const connectionPromise = plug.requestConnect({
      host: host,
      whitelist: [], // Add your canister IDs here when you have them
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 30000)
    );
    
    const connected = await Promise.race([connectionPromise, timeoutPromise]);
    console.log('Plug Wallet connection result:', connected);

    if (connected) {
      // Wait a moment for the connection to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify we can get the principal with timeout
      try {
        const principalPromise = plug.agent.getPrincipal();
        const principalTimeout = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Principal timeout')), 5000)
        );
        
        const principal = await Promise.race([principalPromise, principalTimeout]);
        console.log('Got principal from Plug:', principal.toString());
        
        // Store auth method and principal
        localStorage.setItem('authMethod', 'plug-wallet');
        localStorage.setItem('loginTime', new Date().toISOString());
        localStorage.setItem('plugPrincipal', principal.toString());
        localStorage.setItem('plugConnected', 'true');
        
        window.location.href = '/home';
      } catch (principalError) {
        console.error('Failed to get principal from Plug:', principalError);
        alert('Failed to get user identity from Plug Wallet. Please try again.');
      }
    } else {
      alert('Failed to connect to Plug Wallet');
    }
  } catch (error) {
    console.error('Plug Wallet login failed:', error);
    alert('Plug Wallet login failed. Please try again.');
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const authMethod = localStorage.getItem('authMethod') as 'internet-identity' | 'plug-wallet' | null;
  const loginTimeStr = localStorage.getItem('loginTime');
  
  console.log('Getting user profile, auth method:', authMethod);
  
  if (authMethod === 'internet-identity') {
    try {
      const { isAuthenticated, identity } = await initAuth();
      return {
        principal: identity.getPrincipal().toString(),
        isAuthenticated,
        authMethod,
        loginTime: loginTimeStr ? new Date(loginTimeStr) : null,
      };
    } catch (error) {
      console.error('Error getting II profile:', error);
      return {
        principal: '',
        isAuthenticated: false,
        authMethod: null,
        loginTime: null,
      };
    }
  } else if (authMethod === 'plug-wallet') {
    const plugConnected = localStorage.getItem('plugConnected');
    const storedPrincipal = localStorage.getItem('plugPrincipal');
    
    // If we have stored connection info, use it
    if (plugConnected === 'true' && storedPrincipal) {
      console.log('Using stored Plug connection info');
      return {
        principal: storedPrincipal,
        isAuthenticated: true,
        authMethod,
        loginTime: loginTimeStr ? new Date(loginTimeStr) : null,
      };
    }
    
    // Otherwise try to verify the connection
    try {
      const windowWithPlug = window as WindowWithPlug;
      const plug = windowWithPlug.ic?.plug;
      console.log('Checking Plug wallet, plug object:', !!plug);
      
      if (plug && plug.agent) {
        try {
          const principal = await Promise.race([
            plug.agent.getPrincipal(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]);
          
          console.log('Got principal from Plug in getUserProfile:', principal.toString());
          
          // Update stored info
          localStorage.setItem('plugPrincipal', principal.toString());
          localStorage.setItem('plugConnected', 'true');
          
          return {
            principal: principal.toString(),
            isAuthenticated: true,
            authMethod,
            loginTime: loginTimeStr ? new Date(loginTimeStr) : null,
          };
        } catch (principalError) {
          console.error('Error getting principal from Plug:', principalError);
          
          // Clear potentially stale connection info
          localStorage.removeItem('plugConnected');
          localStorage.removeItem('plugPrincipal');
          localStorage.removeItem('authMethod');
          localStorage.removeItem('loginTime');
        }
      }
    } catch (error) {
      console.error('Error checking Plug wallet:', error);
    }
  }
  
  console.log('Returning unauthenticated profile');
  return {
    principal: '',
    isAuthenticated: false,
    authMethod: null,
    loginTime: null,
  };
};

export const logout = async (): Promise<void> => {
  const authMethod = localStorage.getItem('authMethod');
  
  if (authMethod === 'internet-identity') {
    if (!authClient) {
      authClient = await AuthClient.create();
    }
    await authClient.logout();
  } else if (authMethod === 'plug-wallet') {
    const windowWithPlug = window as WindowWithPlug;
    const plug = windowWithPlug.ic?.plug;
    if (plug) {
      try {
        await plug.disconnect();
      } catch (error) {
        console.error('Error disconnecting from Plug:', error);
      }
    }
  }
  
  // Clear all localStorage
  localStorage.removeItem('authMethod');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('plugPrincipal');
  localStorage.removeItem('plugConnected');
  
  // Redirect to landing page
  window.location.href = '/';
};

// Utility function to check if user is authenticated
export const checkAuthStatus = async (): Promise<boolean> => {
  const userProfile = await getUserProfile();
  return userProfile.isAuthenticated;
};