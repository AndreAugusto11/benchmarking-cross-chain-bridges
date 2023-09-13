import { exec } from 'child_process';

import { validate_chain, validate_keys } from '@benchmarking-cross-chain-bridges/helper/inp_validator';
import { get_deployed_contract_address, get_contract_address, get_token_address, get_rpc_url, get_contract_file_name, get_domain_identifier, get_tx_hash, HYPERLANE_GAS_AMOUNT } from './constants_local';
import { CHAIN_ID_MAP } from '@benchmarking-cross-chain-bridges/helper/constants_global';

// txChain: number tells us which chain we're sending the transaction on
export async function script_interface(sourceChain: number, destChain: number, txChain: number, contractName: string, operation: string, val: number = 0, mode: string = 'test', confirmationResponse: boolean = false) {
    validate_chain('HYPERLANE', sourceChain, destChain);
    const key_pair = validate_keys();

    const paths = get_contract_file_name(contractName);
    const rpc_url = get_rpc_url(txChain);
    const dispatcher_path = paths[0];
    const contract_name = paths[1];
    const contract_file_name = paths[1].split(':')[0];

    const source_domain = get_domain_identifier(CHAIN_ID_MAP[sourceChain]);
    const dest_domain = get_domain_identifier(CHAIN_ID_MAP[destChain]);
    const mailbox_address = get_contract_address(destChain, 'HYPERLANE_MAILBOX');
    const igp_address = get_contract_address(destChain, 'HYPERLANE_IGP');

    // If mode is not test, ask for user confirmation
    if (mode === 'broadcast' && !confirmationResponse) {
        throw new Error(`User input confirmationResponse was ${confirmationResponse}. Aborting.`);
    }

    let params = ' --source_domain ' + source_domain + ' --dest_domain ' + dest_domain + ' --mailbox_address ' + mailbox_address + ' --igp_address ' + igp_address + ' --number ' + val + ' --gas ' + HYPERLANE_GAS_AMOUNT;

    return new Promise((resolve, reject) => {
        exec(`./${dispatcher_path} ${mode} ${rpc_url} ${operation} ${contract_name} ${params}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                if (operation === 'deploy') {
                    console.log(stdout);
                    resolve(get_deployed_contract_address(contractName));
                } else if (operation === 'send') {
                    const tx_hash = get_tx_hash(sourceChain, contract_file_name, mode);
                    resolve(tx_hash);
                } else if (operation === 'call') {
                    resolve(stdout);
                }
            }
        });
    });
}