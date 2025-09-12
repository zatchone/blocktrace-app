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
    pub status: Option<String>,
    // Enhanced blockchain supply chain fields
    pub transport_mode: Option<String>,
    pub temperature_celsius: Option<f64>,
    pub humidity_percent: Option<f64>,
    pub gps_latitude: Option<f64>,
    pub gps_longitude: Option<f64>,
    pub batch_number: Option<String>,
    pub certification_hash: Option<String>,
    pub estimated_arrival: Option<u64>,
    pub actual_arrival: Option<u64>,
    pub quality_score: Option<u8>,
    pub carbon_footprint_kg: Option<f64>,
    pub distance_km: Option<f64>,
    pub cost_usd: Option<f64>,
    pub blockchain_hash: Option<String>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct ESGScore {
    pub product_id: String,
    pub sustainability_score: u8,
    pub carbon_footprint_kg: f64,
    pub total_distance_km: f64,
    pub total_steps: u32,
    pub impact_message: String,
    pub co2_saved_vs_traditional: f64,
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
    if step.status.is_none() || step.status.as_ref().unwrap().trim().is_empty() {
        step.status = Some("verified".to_string());
    }
    step.timestamp = time();
    if let Some(ref notes) = step.notes {
        if notes.trim().is_empty() {
            step.notes = None;
        }
    }
    ic_cdk::println!("Adding enhanced step: {:?}", step);
    PRODUCT_HISTORY.with(|store| {
        store
            .borrow_mut()
            .entry(step.product_id.clone())
            .or_default()
            .push(step.clone());
    });
    ic_cdk::println!("Enhanced step added successfully for product: {}", step.product_id);
    AddStepResult::Ok(format!("Enhanced step added successfully for product {}", step.product_id))
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

        ic_cdk::println!("Retrieved {} enhanced steps for product: {}", history.len(), product_id);
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
        ic_cdk::println!("Total enhanced steps count: {}", count);
        count
    })
}

#[query]
#[candid_method(query)]
fn calculate_esg_score(product_id: String) -> Option<ESGScore> {
    PRODUCT_HISTORY.with(|store| {
        let history = store.borrow().get(&product_id).cloned().unwrap_or_default();
        
        if history.is_empty() {
            return None;
        }

        let total_steps = history.len() as u32;
        
        // Use actual distance data if available, otherwise estimate
        let total_distance_km = history.iter()
            .filter_map(|step| step.distance_km)
            .sum::<f64>()
            .max(0.0);
        
        let estimated_distance = if total_distance_km > 0.0 {
            total_distance_km
        } else {
            let unique_locations: std::collections::HashSet<String> = 
                history.iter().map(|step| step.location.clone()).collect();
            (unique_locations.len() as f64 - 1.0) * 500.0
        };
        
        // Use actual carbon footprint if available, otherwise calculate
        let carbon_footprint = history.iter()
            .filter_map(|step| step.carbon_footprint_kg)
            .sum::<f64>()
            .max(0.0);
        
        let estimated_carbon = if carbon_footprint > 0.0 {
            carbon_footprint
        } else {
            estimated_distance * 0.162
        };
        
        let base_score = 100.0;
        let distance_penalty = (estimated_distance / 100.0).min(30.0);
        let steps_bonus = (total_steps as f64 * 2.0).min(20.0);
        
        let sustainability_score = ((base_score - distance_penalty + steps_bonus).max(0.0).min(100.0)) as u8;
        
        let traditional_co2 = estimated_carbon * 1.3;
        let co2_saved = traditional_co2 - estimated_carbon;
        
        let impact_message = format!(
            "Enhanced Impact Score: {}/100 🌿 — saved {:.1}kg CO₂ vs traditional supply chains",
            sustainability_score,
            co2_saved
        );

        Some(ESGScore {
            product_id: product_id.clone(),
            sustainability_score,
            carbon_footprint_kg: estimated_carbon,
            total_distance_km: estimated_distance,
            total_steps,
            impact_message,
            co2_saved_vs_traditional: co2_saved,
        })
    })
}

#[query]
#[candid_method(query)]
fn get_all_esg_scores() -> Vec<ESGScore> {
    PRODUCT_HISTORY.with(|store| {
        let mut scores = Vec::new();
        for product_id in store.borrow().keys() {
            if let Some(score) = calculate_esg_score(product_id.clone()) {
                scores.push(score);
            }
        }
        scores
    })
}

#[query]
#[candid_method(query)]
fn get_canister_info() -> String {
    let product_count = PRODUCT_HISTORY.with(|store| store.borrow().len());
    let total_steps = PRODUCT_HISTORY.with(|store| store.borrow().values().map(|v| v.len()).sum::<usize>());

    format!(
        "Enhanced BlockTrace Canister - Products: {}, Total Steps: {}",
        product_count, total_steps
    )
}

#[init]
fn init() {
    ic_cdk::println!("Enhanced BlockTrace backend initialized - Starting with empty database");
}

#[pre_upgrade]
fn pre_upgrade() {
    let data = PRODUCT_HISTORY.with(|store| store.borrow().clone());
    ic_cdk::storage::stable_save((data,)).expect("Failed to save enhanced data before upgrade");
}

#[post_upgrade]
fn post_upgrade() {
    let (data,): (HashMap<String, Vec<Step>>,) =
        ic_cdk::storage::stable_restore().expect("Failed to restore enhanced data after upgrade");

    PRODUCT_HISTORY.with(|store| {
        *store.borrow_mut() = data;
    });

    let product_count = PRODUCT_HISTORY.with(|store| store.borrow().len());
    ic_cdk::println!("Enhanced BlockTrace backend upgraded - Restored {} products", product_count);
}

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
        .expect("Failed to write enhanced .did file");
    }
}