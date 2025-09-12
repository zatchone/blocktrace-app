import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

export type HistoryEvent = {
  timestamp_nanos: bigint;
  event: string;
  actor: string; // principal text
};

export type MutableFlags = {
  transferable: boolean;
  allow_history_append_by_roles: string[];
};

export type Metadata = {
  product_name: string;
  batch_id: string;
  manufacturer: string;
  image_uri: string;
  certificate_uri: string;
  history: string[];
};

export const nftIdlFactory = ({ IDL }: any) => {
  const Metadata = IDL.Record({
    product_name: IDL.Text,
    batch_id: IDL.Text,
    manufacturer: IDL.Text,
    image_uri: IDL.Text,
    certificate_uri: IDL.Text,
    history: IDL.Vec(IDL.Text),
  });
  return IDL.Service({
    mint_nft_simple: IDL.Func([Metadata], [IDL.Nat64], []),
    get_metadata_simple: IDL.Func([IDL.Nat64], [IDL.Opt(Metadata)], ["query"]),
    get_all_nfts_simple: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Nat64, Metadata))], ["query"]),
    mint_passport: IDL.Func([IDL.Text], [IDL.Nat64], []),
    get_passport: IDL.Func([IDL.Nat64], [IDL.Opt(IDL.Text)], ["query"]),
  });
};

type NFTService = {
  mint_nft_simple: (metadata: any) => Promise<bigint>;
  get_metadata_simple: (id: bigint) => Promise<[] | [any]>;
  get_all_nfts_simple: () => Promise<Array<[bigint, any]>>;
  mint_passport: (data: string) => Promise<bigint>;
  get_passport: (id: bigint) => Promise<[] | [string]>;
};

class NFTClient {
  private agent: HttpAgent | null = null;
  private actor: NFTService | null = null;
  private canisterId: string;
  private host: string;
  private connected = false;

  constructor() {
    const canisterId =
      process.env.NEXT_PUBLIC_CANISTER_ID_NFT_BACKEND ||
      process.env.CANISTER_ID_NFT_BACKEND ||
      "uzt4z-lp777-77774-qaabq-cai";
    this.canisterId = canisterId;
    this.host = process.env.NEXT_PUBLIC_DFX_NETWORK === 'local' 
      ? "http://127.0.0.1:8081" 
      : "https://ic0.app";
  }

  async connect() {
    if (this.connected && this.actor) return true;
    this.agent = new HttpAgent({ host: this.host });
    await this.agent.fetchRootKey();
    this.actor = Actor.createActor(nftIdlFactory, {
      agent: this.agent,
      canisterId: this.canisterId,
    }) as unknown as NFTService;
    this.connected = true;
    return true;
  }

  async mintSimple(metadata: Metadata) {
    await this.connect();
    const result = await this.actor!.mint_nft_simple(metadata as any);
    console.log('Minted NFT, tokenId:', result.toString());
    return result;
  }

  async getMetadataSimple(tokenId: bigint): Promise<Metadata | null> {
    await this.connect();
    const res = await this.actor!.get_metadata_simple(tokenId);
    if (Array.isArray(res) && res.length) {
      const m = res[0] as any;
      return {
        product_name: m.product_name,
        batch_id: m.batch_id,
        manufacturer: m.manufacturer,
        image_uri: m.image_uri,
        certificate_uri: m.certificate_uri,
        history: m.history || [],
      };
    }
    return null;
  }

  async mintPassport(json: string): Promise<bigint> {
    await this.connect();
    const id = await this.actor!.mint_passport(json);
    console.log('mint_passport ->', id.toString());
    return id;
  }

  async getPassport(id: bigint): Promise<string | null> {
    await this.connect();
    const res = await this.actor!.get_passport(id);
    if (Array.isArray(res) && res.length) return res[0] as string;
    return null;
  }

  async getAllNftsSimple(): Promise<Array<[bigint, Metadata]>> {
    await this.connect();
    const res = await this.actor!.get_all_nfts_simple();
    return res.map(([id, metadata]: [any, any]) => [
      id,
      {
        product_name: metadata.product_name,
        batch_id: metadata.batch_id,
        manufacturer: metadata.manufacturer,
        image_uri: metadata.image_uri,
        certificate_uri: metadata.certificate_uri,
        history: metadata.history || [],
      }
    ]);
  }
}

export const nftClient = new NFTClient();


