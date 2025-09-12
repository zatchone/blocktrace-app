use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::caller as ic_caller;
use ic_cdk::api::time as ic_time;
use ic_cdk_macros::{init, query, update};
use std::cell::RefCell;
use std::collections::HashMap;

pub type TokenId = u64;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct MutableFlags {
    pub transferable: bool,
    pub allow_history_append_by_roles: Vec<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct HistoryEvent {
    pub timestamp_nanos: u64,
    pub event: String,
    pub actor: Principal,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Metadata {
    pub product_name: String,
    pub batch_id: String,
    pub manufacturer: Principal,
    pub issue_date: u64,
    pub certificates: Vec<String>,
    pub image_uri: String,
    pub image_hash: String,
    pub history: Vec<HistoryEvent>,
    pub mutable_flags: MutableFlags,
}

// Simple metadata model requested
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct SimpleMetadata {
    pub product_name: String,
    pub batch_id: String,
    pub manufacturer: String,
    pub image_uri: String,
    pub certificate_uri: String,
    pub history: Vec<String>,
}

thread_local! {
    static NFTS: RefCell<HashMap<TokenId, Metadata>> = RefCell::new(HashMap::new());
    static OWNERS: RefCell<HashMap<TokenId, Principal>> = RefCell::new(HashMap::new());
    static ROLES: RefCell<HashMap<Principal, String>> = RefCell::new(HashMap::new());
    static NEXT_ID: RefCell<TokenId> = RefCell::new(0);
    static MANUFACTURERS: RefCell<Vec<Principal>> = RefCell::new(Vec::new());
    // Simple model storage per user's spec
    static SIMPLE_NFTS: RefCell<HashMap<TokenId, SimpleMetadata>> = RefCell::new(HashMap::new());
    // Ultra-simple passport map: id -> JSON string
    static PASSPORTS: RefCell<HashMap<TokenId, String>> = RefCell::new(HashMap::new());
}

fn is_manufacturer(p: &Principal) -> bool {
    ROLES.with(|r| r.borrow().get(p).map(|role| role == "Manufacturer").unwrap_or(false))
        || MANUFACTURERS.with(|m| m.borrow().contains(p))
}

fn is_owner(token_id: TokenId, p: &Principal) -> bool {
    OWNERS.with(|o| o.borrow().get(&token_id).map(|own| own == p).unwrap_or(false))
}

#[derive(CandidType, Deserialize)]
pub struct MintArgs {
    pub metadata: Metadata,
    pub owner_principal: Principal,
}

#[update]
pub fn mint_nft(args: MintArgs) -> Result<TokenId, String> {
    let caller = ic_caller();
    if !(is_manufacturer(&caller)) {
        return Err("Only manufacturer can mint".into());
    }
    let token_id = NEXT_ID.with(|n| {
        let mut nmut = n.borrow_mut();
        let id = *nmut;
        *nmut += 1;
        id
    });

    ic_cdk::println!("Minting NFT - token_id: {}, owner: {}", token_id, args.owner_principal.to_text());

    NFTS.with(|nfts| {
        let mut map = nfts.borrow_mut();
        map.insert(token_id, args.metadata.clone());
    });
    OWNERS.with(|o| o.borrow_mut().insert(token_id, args.owner_principal));

    ic_cdk::println!("NFT minted and stored. Total tokens: {}", NFTS.with(|n| n.borrow().len()));
    Ok(token_id)
}

#[query]
pub fn get_metadata(token_id: TokenId) -> Option<Metadata> {
    let meta = NFTS.with(|n| n.borrow().get(&token_id).cloned());
    ic_cdk::println!("get_metadata called for token_id {} -> found: {}", token_id, meta.is_some());
    meta
}

#[update]
pub fn transfer(token_id: TokenId, new_owner: Principal) -> Result<(), String> {
    let caller = ic_caller();
    if !is_owner(token_id, &caller) {
        return Err("Only current owner can transfer".into());
    }
    let transferable = NFTS.with(|n| {
        n.borrow()
            .get(&token_id)
            .map(|m| m.mutable_flags.transferable)
            .unwrap_or(false)
    });
    if !transferable {
        return Err("Token is not transferable".into());
    }
    OWNERS.with(|o| o.borrow_mut().insert(token_id, new_owner));
    // append transfer to history
    append_history_internal(token_id, format!("Transfer to {}", new_owner.to_text()), caller)
}

#[update]
pub fn append_history(token_id: TokenId, event: String) -> Result<(), String> {
    let caller = ic_caller();
    append_history_internal(token_id, event, caller)
}

fn append_history_internal(token_id: TokenId, event: String, actor: Principal) -> Result<(), String> {
    // Permissions: manufacturer, owner, or allowed roles
    let allowed_by_role = NFTS.with(|n| {
        n.borrow().get(&token_id).map(|m| m.mutable_flags.allow_history_append_by_roles.clone())
    }).unwrap_or_default();

    let has_role = ROLES.with(|r| {
        r.borrow().get(&actor).map(|role| allowed_by_role.contains(role)).unwrap_or(false)
    });

    if !(is_manufacturer(&actor) || is_owner(token_id, &actor) || has_role) {
        return Err("Not authorized to append history".into());
    }

    let evt = HistoryEvent { timestamp_nanos: ic_time(), event, actor };

    NFTS.with(|n| {
        let mut map = n.borrow_mut();
        if let Some(meta) = map.get_mut(&token_id) {
            meta.history.push(evt);
            Ok(())
        } else {
            Err("Token not found".into())
        }
    })
}

#[query]
pub fn owner_of(token_id: TokenId) -> Option<Principal> {
    OWNERS.with(|o| o.borrow().get(&token_id).cloned())
}

#[update]
pub fn set_role(principal: Principal, role: String) -> Result<(), String> {
    // Only manufacturer can grant roles
    let caller = ic_caller();
    if !is_manufacturer(&caller) {
        return Err("Only manufacturer can set roles".into());
    }
    ROLES.with(|r| r.borrow_mut().insert(principal, role));
    Ok(())
}

#[update]
pub fn add_manufacturer(principal: Principal) -> Result<(), String> {
    let caller = ic_caller();
    // bootstrap: if no manufacturers exist, first caller can add themselves
    let can_add = MANUFACTURERS.with(|m| m.borrow().is_empty()) || is_manufacturer(&caller);
    if !can_add {
        return Err("Not authorized".into());
    }
    MANUFACTURERS.with(|m| {
        let mut v = m.borrow_mut();
        if !v.contains(&principal) {
            v.push(principal);
        }
    });
    Ok(())
}

#[query]
pub fn get_manufacturers() -> Vec<Principal> {
    MANUFACTURERS.with(|m| m.borrow().clone())
}

#[query]
pub fn get_roles() -> Vec<(Principal, String)> {
    ROLES.with(|r| r.borrow().iter().map(|(k, v)| (*k, v.clone())).collect())
}

#[query]
pub fn list_tokens() -> Vec<TokenId> {
    NFTS.with(|n| n.borrow().keys().copied().collect())
}

#[query]
pub fn get_all_nfts() -> Vec<(TokenId, Metadata)> {
    NFTS.with(|n| n.borrow().iter().map(|(k,v)| (*k, v.clone())).collect())
}

// --- Simple API endpoints ---

#[update]
pub fn mint_nft_simple(metadata: SimpleMetadata) -> TokenId {
    let token_id = NEXT_ID.with(|n| {
        let mut nmut = n.borrow_mut();
        let id = *nmut;
        *nmut += 1;
        id
    });
    ic_cdk::println!("mint_nft_simple: token_id {}", token_id);
    SIMPLE_NFTS.with(|m| { m.borrow_mut().insert(token_id, metadata); });
    ic_cdk::println!("mint_nft_simple: total {}", SIMPLE_NFTS.with(|m| m.borrow().len()));
    token_id
}

#[query]
pub fn get_metadata_simple(token_id: TokenId) -> Option<SimpleMetadata> {
    let out = SIMPLE_NFTS.with(|m| m.borrow().get(&token_id).cloned());
    ic_cdk::println!("get_metadata_simple: token_id {} -> {}", token_id, out.is_some());
    out
}

#[query]
pub fn get_all_nfts_simple() -> Vec<(TokenId, SimpleMetadata)> {
    SIMPLE_NFTS.with(|m| m.borrow().iter().map(|(k,v)| (*k, v.clone())).collect())
}

// --- Ultra-simple passport API ---

#[update]
pub fn mint_passport(data: String) -> TokenId {
    let id = NEXT_ID.with(|n| {
        let mut nmut = n.borrow_mut();
        let id = *nmut;
        *nmut += 1;
        id
    });
    ic_cdk::println!("mint_passport: id {} data {}", id, data);
    PASSPORTS.with(|p| { p.borrow_mut().insert(id, data); });
    id
}

#[query]
pub fn get_passport(id: TokenId) -> Option<String> {
    let res = PASSPORTS.with(|p| p.borrow().get(&id).cloned());
    ic_cdk::println!("get_passport: id {} -> {}", id, res.is_some());
    res
}

#[init]
fn init() {
    let caller = ic_caller();
    MANUFACTURERS.with(|m| m.borrow_mut().push(caller));
}

// Export candid
ic_cdk::export_candid!();


