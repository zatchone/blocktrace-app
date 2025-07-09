// icp-service.ts
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// Define the Candid interface types
export type Step = {
  product_id: string;
  actor_name: string;
  role: string;
  action: string;
  location: string;
  notes: [] | [string];
  timestamp: bigint;
};

export type AddStepResult = {
  Ok?: string;
  Err?: string;
};

type BlockTraceService = {
  add_step: (step: Step) => Promise<AddStepResult>;
  get_product_history: (productId: string) => Promise<Step[]>;
  get_all_products: () => Promise<string[]>;
  get_total_steps_count: () => Promise<bigint>;
  get_canister_info: () => Promise<string>;
};

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

class ICPService {
  private agent: HttpAgent | null = null;
  private actor: BlockTraceService | null = null;
  private canisterId: string;
  private host: string;
  private isConnected: boolean = false;

  constructor() {
    // Force local development settings
    this.canisterId = this.getCanisterId();
    this.host = "http://127.0.0.1:8081"; // Force local host
    
    console.log(`ICP Service initialized - Host: ${this.host}, Canister ID: ${this.canisterId}`);
  }

  private getCanisterId(): string {
    // Try different environment variable names
    const canisterIdSources = [
      process.env.NEXT_PUBLIC_CANISTER_ID_BLOCKTRACE_BACKEND,
      process.env.NEXT_PUBLIC_CANISTER_ID,
      process.env.CANISTER_ID_BLOCKTRACE_BACKEND,
      process.env.CANISTER_ID,
      "uxrrr-q7777-77774-qaaaq-cai" // Your actual canister ID as fallback
    ];

    for (const canisterId of canisterIdSources) {
      if (canisterId && canisterId.trim()) {
        return canisterId.trim();
      }
    }

    // Use the actual canister ID from your canister_ids.json
    return "uxrrr-q7777-77774-qaaaq-cai";
  }

  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to ICP at ${this.host} with canister ${this.canisterId}`);
      
      this.agent = new HttpAgent({ 
        host: this.host
      });

      // Always fetch root key for local development
      console.log("Fetching root key for local development...");
      await this.agent.fetchRootKey();

      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId,
      }) as BlockTraceService;

      // Test connection with a simple query
      console.log("Testing connection with get_canister_info...");
      const info = await this.actor.get_canister_info();
      console.log("Connection successful! Canister info:", info);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("ICP connection error:", error);
      this.isConnected = false;
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('canister_not_found')) {
          console.error(`Canister ${this.canisterId} not found. Please deploy it first: dfx deploy blocktrace_backend`);
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          console.error("Network error - make sure dfx is running: dfx start --background");
        } else if (error.message.includes('subnet')) {
          console.error("Subnet error - try restarting dfx: dfx stop && dfx start --background --clean");
        }
      }
      
      return false;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected || !this.actor) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error(`Failed to connect to ICP network. Canister ${this.canisterId} may not be deployed. Run: dfx deploy blocktrace_backend`);
      }
    }
  }

  async addStep(data: {
    product_id: string;
    actor_name: string;
    role: string;
    action: string;
    location: string;
    notes: string | null;
  }): Promise<AddStepResult> {
    await this.ensureConnected();
    
    const step: Step = {
      product_id: data.product_id,
      actor_name: data.actor_name,
      role: data.role,
      action: data.action,
      location: data.location,
      notes: data.notes ? [data.notes] : [],
      timestamp: BigInt(0), // Backend will set this
    };
    
    console.log("Sending step to backend:", step);
    const result = await this.actor!.add_step(step);
    console.log("Backend response:", result);
    return result;
  }

  async getAllProducts(): Promise<string[]> {
    await this.ensureConnected();
    return await this.actor!.get_all_products();
  }

  async getProductHistory(productId: string): Promise<Step[]> {
    await this.ensureConnected();
    return await this.actor!.get_product_history(productId);
  }

  async getTotalStepsCount(): Promise<bigint> {
    await this.ensureConnected();
    return await this.actor!.get_total_steps_count();
  }

  async getCanisterInfo(): Promise<string> {
    await this.ensureConnected();
    return await this.actor!.get_canister_info();
  }

  isConnectedToICP(): boolean {
    return this.isConnected && this.actor !== null;
  }

  disconnect(): void {
    this.agent = null;
    this.actor = null;
    this.isConnected = false;
    console.log("Disconnected from ICP");
  }

  // Utility method to get connection status
  getConnectionStatus(): { isConnected: boolean; canisterId: string; host: string } {
    return {
      isConnected: this.isConnected,
      canisterId: this.canisterId,
      host: this.host
    };
  }
}

export const icpService = new ICPService();