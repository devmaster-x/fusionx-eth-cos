use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Addr;
use cosmwasm_std::Coin;


/// InstantiateMsg allows optional admin setup during deployment
#[cw_serde]
pub struct InstantiateMsg {
    pub admin: Option<Addr>,
}

#[cw_serde]
pub enum ExecuteMsg {
    CreateEscrow {
        swap_id: String,
        hashlock: String,      // hex-encoded SHA-256 hash
        timelock: u64,         // UNIX timestamp in seconds
        recipient: String,     // address to receive funds if hash is revealed
        amount: Coin,      // includes denom + amount
    },
    // future: Redeem, Refund, etc.
}

// #[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
// #[serde(rename_all = "snake_case")]
// pub enum QueryMsg {
//     // Add your queries here later
// }
