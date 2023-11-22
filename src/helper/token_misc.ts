import { ethers, Contract } from "ethers";
import { get_signer } from "./provider";
import { CHAIN_MAP } from "./constants_global";

import ERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { tokenToString } from "typescript";

export async function approveAllow(
    chain_name: string,
    from_token: string,
    spender_address: string,
    amount: string = ethers.constants.MaxUint256.toString()
) {
    const signer = get_signer(chain_name);

    const token_address = CHAIN_MAP[chain_name].token_map[from_token];

    const erc20 = new Contract(token_address, ERC20.abi, signer);

    const allowance = await erc20.allowance(
        await signer.getAddress(),
        spender_address
    );

    if (allowance >= amount) {
        return true;
    }

    const tx = await erc20
        .connect(signer)
        .approve(spender_address, amount);
    await tx.wait();

    return true;
}

export async function transferEventFromBlock(
    chain_name: string,
    to_token: string,
    from_block: number,
    to_block: number,
    to_address: string,
) {
    const signer = get_signer(chain_name);

    const token_address = CHAIN_MAP[chain_name].token_map[to_token];

    const erc20 = new Contract(token_address, ERC20.abi, signer);

    const filter = erc20.filters.Transfer(null, to_address);

    const events = await erc20.queryFilter(filter, from_block, to_block);

    let total_amount = ethers.BigNumber.from(0);

    for (const event of events) {
        if (event.args) {
            total_amount = total_amount.add(event.args.value);
        }
    }

    return total_amount.toNumber();
}

export async function getBalanceAtBlock(
    chain_name: string,
    token_name: string,
    block_number: number,
    address: string
) {
    const signer = get_signer(chain_name);
    const token_address = CHAIN_MAP[chain_name].token_map[token_name];

    const erc20 = new Contract(token_address, ERC20.abi, signer)

    const balance = await erc20.callStatic.balanceOf(address, { blockTag: block_number });

    return balance.toNumber();
}