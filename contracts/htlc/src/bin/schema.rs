use cosmwasm_schema::write_api;

use htlc::msg::{ExecuteMsg, InstantiateMsg};

fn main() {
    write_api! {
        instantiate: InstantiateMsg,
        execute: ExecuteMsg,
        // query: QueryMsg,
    }
}
