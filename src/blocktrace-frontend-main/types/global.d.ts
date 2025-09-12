// types/global.d.ts

interface Window {
  ic?: {
    plug?: {
      requestConnect: (options: {
        whitelist: string[];
        host: string;
      }) => Promise<boolean>;
      isConnected: () => Promise<boolean>;
      agent: {
        getPrincipal: () => Promise<{ toString: () => string }>;
      };
      disconnect: () => Promise<void>;
    };
  };
}