import { exec } from 'child_process';

import { validate_chain, validate_keys } from '../../helper/inp_validator';
import { get_contract, get_rpc_url } from './constants_local';

// Function that handles user input (mocked during testing)
function getUserConfirmation(response: boolean, callback: (confirmed: boolean) => void) {
    callback(response);
}

export async function deploy_contract(toChain: number, contract_name: string, mode: string = 'test', confirmationResponse: boolean = false) {
    validate_chain('HASHI', toChain, toChain);
    const key_pair = validate_keys();

    const paths = get_contract(contract_name);
    const rpc_url = get_rpc_url(toChain);
    const dispatcher_path = paths[0];
    const contract_path = paths[1];

    // If mode is not test, ask for user confirmation
    if (mode === 'broadcast') {
        getUserConfirmation(confirmationResponse, (confirmed) => {
            if (!confirmed) {
                throw new Error('No confirmation received. Aborting.');
            }
        });
    }

    return new Promise((resolve, reject) => {
        exec(`./${dispatcher_path} ${mode} ${rpc_url} ${contract_path}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}
