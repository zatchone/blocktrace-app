// Enhanced ICP service with professional blockchain supply chain features
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// Enhanced Step interface with professional supply chain fields
export interface ESGScore {
  product_id: string;
  sustainability_score: number;
  carbon_footprint_kg: number;
  total_distance_km: number;
  total_steps: number;
  impact_message: string;
  co2_saved_vs_traditional: number;
}

export type EnhancedStep = {
  product_id: string;
  actor_name: string;
  role: string;
  action: string;
  location: string;
  notes: [] | [string];
  timestamp: bigint;
  status?: [] | [string];
  // Enhanced blockchain supply chain fields
  transport_mode?: [] | [string];
  temperature_celsius?: [] | [number];
  humidity_percent?: [] | [number];
  gps_latitude?: [] | [number];
  gps_longitude?: [] | [number];
  batch_number?: [] | [string];
  certification_hash?: [] | [string];
  estimated_arrival?: [] | [bigint];
  actual_arrival?: [] | [bigint];
  quality_score?: [] | [number];
  carbon_footprint_kg?: [] | [number];
  distance_km?: [] | [number];
  cost_usd?: [] | [number];
  blockchain_hash?: [] | [string];
};

export type AddStepResult = {
  Ok?: string;
  Err?: string;
};

type EnhancedBlockTraceService = {
  add_step: (step: EnhancedStep) => Promise<AddStepResult>;
  get_product_history: (productId: string) => Promise<EnhancedStep[]>;
  get_all_products: () => Promise<string[]>;
  get_total_steps_count: () => Promise<bigint>;
  get_canister_info: () => Promise<string>;
  calculate_esg_score: (productId: string) => Promise<[] | [ESGScore]>;
  get_all_esg_scores: () => Promise<ESGScore[]>;
};

export const enhancedIdlFactory = ({ IDL }: any) => {
  const EnhancedStep = IDL.Record({
    'product_id': IDL.Text,
    'actor_name': IDL.Text,
    'role': IDL.Text,
    'action': IDL.Text,
    'location': IDL.Text,
    'notes': IDL.Opt(IDL.Text),
    'timestamp': IDL.Nat64,
    'status': IDL.Opt(IDL.Text),
    // Enhanced blockchain supply chain fields
    'transport_mode': IDL.Opt(IDL.Text),
    'temperature_celsius': IDL.Opt(IDL.Float64),
    'humidity_percent': IDL.Opt(IDL.Float64),
    'gps_latitude': IDL.Opt(IDL.Float64),
    'gps_longitude': IDL.Opt(IDL.Float64),
    'batch_number': IDL.Opt(IDL.Text),
    'certification_hash': IDL.Opt(IDL.Text),
    'estimated_arrival': IDL.Opt(IDL.Nat64),
    'actual_arrival': IDL.Opt(IDL.Nat64),
    'quality_score': IDL.Opt(IDL.Nat8),
    'carbon_footprint_kg': IDL.Opt(IDL.Float64),
    'distance_km': IDL.Opt(IDL.Float64),
    'cost_usd': IDL.Opt(IDL.Float64),
    'blockchain_hash': IDL.Opt(IDL.Text),
  });

  const AddStepResult = IDL.Variant({
    'Ok': IDL.Text,
    'Err': IDL.Text,
  });

  const ESGScore = IDL.Record({
    'product_id': IDL.Text,
    'sustainability_score': IDL.Nat8,
    'carbon_footprint_kg': IDL.Float64,
    'total_distance_km': IDL.Float64,
    'total_steps': IDL.Nat32,
    'impact_message': IDL.Text,
    'co2_saved_vs_traditional': IDL.Float64,
  });

  return IDL.Service({
    'add_step': IDL.Func([EnhancedStep], [AddStepResult], []),
    'get_product_history': IDL.Func([IDL.Text], [IDL.Vec(EnhancedStep)], ['query']),
    'get_all_products': IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'get_total_steps_count': IDL.Func([], [IDL.Nat64], ['query']),
    'get_canister_info': IDL.Func([], [IDL.Text], ['query']),
    'calculate_esg_score': IDL.Func([IDL.Text], [IDL.Opt(ESGScore)], ['query']),
    'get_all_esg_scores': IDL.Func([], [IDL.Vec(ESGScore)], ['query']),
  });
};

class EnhancedICPService {
  private agent: HttpAgent | null = null;
  private actor: EnhancedBlockTraceService | null = null;
  private canisterId: string;
  private host: string;
  private isConnected: boolean = false;

  constructor() {
    this.canisterId = this.getCanisterId();
    this.host = "http://127.0.0.1:8081";
    
    console.log(`Enhanced ICP Service initialized - Host: ${this.host}, Canister ID: ${this.canisterId}`);
  }

  private getCanisterId(): string {
    const canisterIdSources = [
      process.env.NEXT_PUBLIC_CANISTER_ID_BLOCKTRACE_BACKEND,
      process.env.NEXT_PUBLIC_CANISTER_ID,
      process.env.CANISTER_ID_BLOCKTRACE_BACKEND,
      process.env.CANISTER_ID,
      "rdmx6-jaaaa-aaaaa-aaadq-cai" // Updated canister ID
    ];

    for (const canisterId of canisterIdSources) {
      if (canisterId && canisterId.trim()) {
        return canisterId.trim();
      }
    }

    return "rdmx6-jaaaa-aaaaa-aaadq-cai";
  }

  async connect(): Promise<boolean> {
    try {
      console.log(`Connecting to Enhanced ICP at ${this.host} with canister ${this.canisterId}`);
      
      this.agent = new HttpAgent({ 
        host: this.host
      });

      console.log("Fetching root key for local development...");
      await this.agent.fetchRootKey();

      this.actor = Actor.createActor(enhancedIdlFactory, {
        agent: this.agent,
        canisterId: this.canisterId,
      }) as EnhancedBlockTraceService;

      console.log("Testing connection with get_canister_info...");
      const info = await this.actor.get_canister_info();
      console.log("Enhanced connection successful! Canister info:", info);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Enhanced ICP connection error:", error);
      this.isConnected = false;
      return false;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected || !this.actor) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error(`Failed to connect to Enhanced ICP network. Canister ${this.canisterId} may not be deployed.`);
      }
    }
  }

  async addEnhancedStep(data: {
    product_id: string;
    actor_name: string;
    role: string;
    action: string;
    location: string;
    notes: string | null;
    // Enhanced fields (optional)
    transport_mode?: string;
    temperature_celsius?: number;
    humidity_percent?: number;
    gps_latitude?: number;
    gps_longitude?: number;
    batch_number?: string;
    certification_hash?: string;
    estimated_arrival?: number;
    quality_score?: number;
    carbon_footprint_kg?: number;
    distance_km?: number;
    cost_usd?: number;
    blockchain_hash?: string;
  }): Promise<AddStepResult> {
    await this.ensureConnected();
    
    const step: EnhancedStep = {
      product_id: data.product_id,
      actor_name: data.actor_name,
      role: data.role,
      action: data.action,
      location: data.location,
      notes: data.notes ? [data.notes] : [],
      timestamp: BigInt(0), // Backend will set this
      status: ["verified"], // Default status
      // Enhanced fields
      transport_mode: data.transport_mode ? [data.transport_mode] : [],
      temperature_celsius: data.temperature_celsius !== undefined ? [data.temperature_celsius] : [],
      humidity_percent: data.humidity_percent !== undefined ? [data.humidity_percent] : [],
      gps_latitude: data.gps_latitude !== undefined ? [data.gps_latitude] : [],
      gps_longitude: data.gps_longitude !== undefined ? [data.gps_longitude] : [],
      batch_number: data.batch_number ? [data.batch_number] : [],
      certification_hash: data.certification_hash ? [data.certification_hash] : [],
      estimated_arrival: data.estimated_arrival ? [BigInt(data.estimated_arrival)] : [],
      actual_arrival: [], // Will be set when product actually arrives
      quality_score: data.quality_score !== undefined ? [data.quality_score] : [],
      carbon_footprint_kg: data.carbon_footprint_kg !== undefined ? [data.carbon_footprint_kg] : [],
      distance_km: data.distance_km !== undefined ? [data.distance_km] : [],
      cost_usd: data.cost_usd !== undefined ? [data.cost_usd] : [],
      blockchain_hash: data.blockchain_hash ? [data.blockchain_hash] : [],
    };
    
    console.log("Sending enhanced step to backend:", step);
    const result = await this.actor!.add_step(step);
    console.log("Enhanced backend response:", result);
    return result;
  }

  async calculateESGScore(productId: string): Promise<ESGScore | null> {
    await this.ensureConnected();
    
    try {
      const result = await this.actor!.calculate_esg_score(productId);
      if (Array.isArray(result) && result.length > 0) {
        return result[0] ?? null;
      }
      return null;
    } catch (error) {
      console.error('Error calculating ESG score:', error);
      throw error;
    }
  }

  async getAllESGScores(): Promise<ESGScore[]> {
    await this.ensureConnected();
    
    try {
      const result = await this.actor!.get_all_esg_scores();
      return result || [];
    } catch (error) {
      console.error('Error getting all ESG scores:', error);
      throw error;
    }
  }

  async getAllProducts(): Promise<string[]> {
    await this.ensureConnected();
    return await this.actor!.get_all_products();
  }

  async getProductHistory(productId: string): Promise<EnhancedStep[]> {
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
    console.log("Disconnected from Enhanced ICP");
  }

  getConnectionStatus(): { isConnected: boolean; canisterId: string; host: string } {
    return {
      isConnected: this.isConnected,
      canisterId: this.canisterId,
      host: this.host
    };
  }
}

export const enhancedIcpService = new EnhancedICPService();