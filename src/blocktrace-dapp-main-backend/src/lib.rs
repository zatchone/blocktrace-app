use ic_cdk::api::time;
use ic_cdk_macros::{query, update, init, pre_upgrade, post_upgrade};
use std::collections::HashMap;
use std::cell::RefCell;
use candid::{CandidType, candid_method};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Step {
    pub product_id: String,
    pub actor_name: String,
    pub role: String,
    pub action: String,
    pub location: String,
    pub notes: Option<String>,
    pub timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub enum AddStepResult {
    Ok(String),
    Err(String),
}

thread_local! {
    static PRODUCT_HISTORY: RefCell<HashMap<String, Vec<Step>>> = RefCell::new(HashMap::new());
}

#[update]
#[candid_method(update)]
fn add_step(mut step: Step) -> AddStepResult {
    if step.product_id.trim().is_empty() {
        return AddStepResult::Err("Product ID cannot be empty".to_string());
    }
    if step.actor_name.trim().is_empty() {
        return AddStepResult::Err("Actor name cannot be empty".to_string());
    }
    if step.role.trim().is_empty() {
        return AddStepResult::Err("Role cannot be empty".to_string());
    }
    if step.action.trim().is_empty() {
        return AddStepResult::Err("Action cannot be empty".to_string());
    }
    if step.location.trim().is_empty() {
        return AddStepResult::Err("Location cannot be empty".to_string());
    }

    step.timestamp = time();

    if let Some(ref notes) = step.notes {
        if notes.trim().is_empty() {
            step.notes = None;
        }
    }

    ic_cdk::println!("Adding step: {:?}", step);

    PRODUCT_HISTORY.with(|store| {
        store
            .borrow_mut()
            .entry(step.product_id.clone())
            .or_default()
            .push(step.clone());
    });

    ic_cdk::println!("Step added successfully for product: {}", step.product_id);
    AddStepResult::Ok(format!("Step added successfully for product {}", step.product_id))
}

#[query]
#[candid_method(query)]
fn get_product_history(product_id: String) -> Vec<Step> {
    PRODUCT_HISTORY.with(|store| {
        let mut history = store
            .borrow()
            .get(&product_id)
            .cloned()
            .unwrap_or_default();

        history.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));

        ic_cdk::println!("Retrieved {} steps for product: {}", history.len(), product_id);
        history
    })
}

#[query]
#[candid_method(query)]
fn get_all_products() -> Vec<String> {
    PRODUCT_HISTORY.with(|store| {
        let products: Vec<String> = store.borrow().keys().cloned().collect();
        ic_cdk::println!("Retrieved {} products", products.len());
        products
    })
}

#[query]
#[candid_method(query)]
fn get_total_steps_count() -> u64 {
    PRODUCT_HISTORY.with(|store| {
        let count = store.borrow().values().map(|steps| steps.len()).sum::<usize>() as u64;
        ic_cdk::println!("Total steps count: {}", count);
        count
    })
}

#[query]
#[candid_method(query)]
fn get_canister_info() -> String {
    let product_count = PRODUCT_HISTORY.with(|store| store.borrow().len());
    let total_steps = PRODUCT_HISTORY.with(|store| store.borrow().values().map(|v| v.len()).sum::<usize>());

    format!(
        "BlockTrace Canister - Products: {}, Total Steps: {}",
        product_count, total_steps
    )
}

#[init]
fn init() {
    ic_cdk::println!("BlockTrace backend initialized - Starting with empty database");
}

#[pre_upgrade]
fn pre_upgrade() {
    let data = PRODUCT_HISTORY.with(|store| store.borrow().clone());
    ic_cdk::storage::stable_save((data,)).expect("Failed to save data before upgrade");
}

#[post_upgrade]
fn post_upgrade() {
    let (data,): (HashMap<String, Vec<Step>>,) =
        ic_cdk::storage::stable_restore().expect("Failed to restore data after upgrade");

    PRODUCT_HISTORY.with(|store| {
        *store.borrow_mut() = data;
    });

    let product_count = PRODUCT_HISTORY.with(|store| store.borrow().len());
    ic_cdk::println!("BlockTrace backend upgraded - Restored {} products", product_count);
}

// ✅ Candid interface generation
candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
#[candid_method(query)]
fn export_candid() -> String {
    __export_service()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::write;

    #[test]
    fn generate_did() {
        let did = export_candid();
        write(
            "src/blocktrace-dapp-main-backend/blocktrace-dapp-main-backend.did",
            did,
        )
        .expect("Failed to write .did file");
    }
}
