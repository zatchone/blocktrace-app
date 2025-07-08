// icp-service.ts
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// Define the Candid interface
export interface Step {
  product_id: string;
  actor_name: string;
  role: string;
  action: string;
  location: string;
  notes: [] | [string]; // Candid opt type
  timestamp: bigint;
}

export interface AddStepResult {
  Ok?: string;
  Err?: string;
}

// Define the service interface
export interface BlockTraceService {
  add_step: (step: Step) => Promise<AddStepResult>;
  get_product_history: (productId: string) => Promise<Step[]>;
  get_all_products: () => Promise<string[]>;
  get_total_steps_count: () => Promise<bigint>;
  get_canister_info: () => Promise<string>;
}

// IDL Factory (generated from your .did file)
export const idlFactory = ({ IDL }: any) => {
  const Step = IDL.Record({
    'product_id': IDL.Text,
    'actor_name': IDL.Text,
    'role': IDL.Text,
    'action': IDL.Text,
    'location': IDL.Text,
    'notes': IDL.Opt(IDL.Text),
    'timestamp': IDL.Nat64,
  });

  const AddStepResult = IDL.Variant({
    'Ok': IDL.Text,
    'Err': IDL.Text,
  });

  return IDL.Service({
    'add_step': IDL.Func([Step], [AddStepResult], []),
    'get_product_history': IDL.Func([IDL.Text], [IDL.Vec(Step)], ['query']),
    'get_all_products': IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'get_total_steps_count': IDL.Func([], [IDL.Nat64], ['query']),
    'get_canister_info': IDL.Func([], [IDL.Text], ['query']),
  });
};

export class ICPService {
  private agent: HttpAgent | null = null;
  private actor: BlockTraceService | null = null;
  private canisterId: string;
  private host: string;
  private isConnected: boolean = false;

  constructor() {
    // Determine environment and set appropriate values
    const isDevelopment = typeof window !== 'undefined' && 
                         (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
    
    // Use environment variables or fallback to defaults
    this.canisterId = process.env.NEXT_PUBLIC_CANISTER_ID || 
                     (isDevelopment ? "rdmx6-jaaaa-aaaaa-aaadq-cai" : "uxrrr-q7777-77774-qaaaq-cai");
    
    this.host = process.env.NEXT_PUBLIC_ICP_HOST || 
               (isDevelopment ? "http://localhost:4943" : "https://ic0.app");
    
    console.log(`ICP Service initialized:`, {
      canisterId: this.canisterId,
      host: this.host,
      environment: isDevelopment ? 'development' : 'production'
    });
  }

  async connect(): Promise<boolean> {
    try {
      console.log(`Attempting to connect to ICP...`, {
        canisterId: this.canisterId,
        host: this.host
      });

      // Create HTTP agent
      this.agent = new HttpAgent({
        host: this.host
      });

      // Fetch root key for local development
      if (this.host.includes('localhost') || this.host.includes('127.0.0.1')) {
        console.log('Fetching root key for local development...');
        try {
          await this.agent.fetchRootKey();
          console.log('Root key fetched successfully');
        } catch (rootKeyError) {
          console.error('Failed to fetch root key:', rootKeyError);
          throw new Error('Local dfx replica not running. Please start with: dfx start');
        }
      }

      // Create actor
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId,
      }) as BlockTraceService;

      // Test connection with a simple query
      console.log('Testing connection with canister...');
      const info = await this.actor.get_canister_info();
      console.log('Connection test successful:', info);
      
      this.isConnected = true;
      console.log("Successfully connected to ICP canister:", this.canisterId);
      return true;
    } catch (error) {
      console.error("Failed to connect to ICP:", error);
      
      // Provide helpful error messages
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string" &&
        (error as any).message.includes('canister_not_found')
      ) {
        console.error(`
❌ Canister not found!
   
Possible solutions:
1. If developing locally:
   - Make sure dfx is running: dfx start
   - Deploy your canister: dfx deploy
   - Check canister ID: dfx canister id your_canister_name
   
2. If using mainnet:
   - Deploy to mainnet: dfx deploy --network ic
   - Get mainnet canister ID: dfx canister id your_canister_name --network ic
   - Update NEXT_PUBLIC_CANISTER_ID in your environment

Current config:
- Canister ID: ${this.canisterId}
- Host: ${this.host}
        `);
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string" &&
        (error as any).message.includes('Connection refused')
      ) {
        console.error(`
❌ Connection refused!
   
This usually means the local dfx replica is not running.
Please start it with: dfx start
        `);
      }
      
      this.isConnected = false;
      return false;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected || !this.actor) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error("Failed to connect to ICP network");
      }
    }
  }

  async addStep(stepData: {
    product_id: string;
    actor_name: string;
    role: string;
    action: string;
    location: string;
    notes: string | null;
  }): Promise<AddStepResult> {
    await this.ensureConnected();
    
    try {
      const step: Step = {
        product_id: stepData.product_id,
        actor_name: stepData.actor_name,
        role: stepData.role,
        action: stepData.action,
        location: stepData.location,
        notes: stepData.notes ? [stepData.notes] : [], // Convert to Candid opt type
        timestamp: BigInt(0) // Will be set by canister
      };

      console.log("Calling add_step with:", step);
      const result = await this.actor!.add_step(step);
      console.log("add_step result:", result);
      return result;
    } catch (error) {
      console.error("Error adding step:", error);
      return { Err: `Failed to add step: ${error}` };
    }
  }

  async getAllProducts(): Promise<string[]> {
    await this.ensureConnected();
    
    try {
      console.log("Calling get_all_products...");
      const products = await this.actor!.get_all_products();
      console.log("get_all_products result:", products);
      return products;
    } catch (error) {
      console.error("Error getting products:", error);
      return [];
    }
  }

  async getProductHistory(productId: string): Promise<Step[]> {
    await this.ensureConnected();
    
    try {
      console.log("Calling get_product_history with:", productId);
      const history = await this.actor!.get_product_history(productId);
      console.log("get_product_history result:", history);
      return history;
    } catch (error) {
      console.error("Error getting product history:", error);
      return [];
    }
  }

  async getTotalStepsCount(): Promise<bigint> {
    await this.ensureConnected();
    
    try {
      console.log("Calling get_total_steps_count...");
      const count = await this.actor!.get_total_steps_count();
      console.log("get_total_steps_count result:", count);
      return count;
    } catch (error) {
      console.error("Error getting total steps count:", error);
      return BigInt(0);
    }
  }

  async getCanisterInfo(): Promise<string> {
    await this.ensureConnected();
    
    try {
      console.log("Calling get_canister_info...");
      const info = await this.actor!.get_canister_info();
      console.log("get_canister_info result:", info);
      return info;
    } catch (error) {
      console.error("Error getting canister info:", error);
      return "Error getting canister info";
    }
  }

  // Helper method to check connection status
  isConnectedToICP(): boolean {
    return this.isConnected && this.actor !== null;
  }

  // Method to disconnect
  disconnect(): void {
    this.agent = null;
    this.actor = null;
    this.isConnected = false;
    console.log("Disconnected from ICP canister");
  }
}

// Create a singleton instance
export const icpService = new ICPService();