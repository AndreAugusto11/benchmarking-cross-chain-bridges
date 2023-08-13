import { ethers } from "ethers";
import { get_provider, create_tx, send_tx } from "./provider";

export async function approve_token_transfer(contract_abi: string, token_address: string, spender_address: string, amount: string): Promise<ethers.providers.TransactionResponse> {

    const tokenContract = new ethers.Contract(token_address, contract_abi, get_provider('GOERLI', 'ALCHEMY'));

    const transaction = await tokenContract.approve(spender_address, amount);

    const response = await send_tx(transaction);

    return response;
}




