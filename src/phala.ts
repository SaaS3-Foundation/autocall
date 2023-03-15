import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { typeDefinitions } from '@polkadot/types';
import * as Phala from '@phala/sdk';
import * as fs from 'fs';
import {
  TxQueue,
  blockBarrier,
  hex,
  checkUntil,
  checkUntilEq,
} from './phat.utils';

export const call = async (
  mnemonic: string,
  chainUrl: string,
  pruntimeUrl: string,
  artifact: any,
  name,
  args: any,
) => {
  // Create a keyring instance
  const keyring = new Keyring({ type: 'sr25519' });

  // Prepare accounts
  const sponsor = keyring.addFromUri(mnemonic);
  console.log('sponsor address', sponsor.address);

  // connect to the chain
  console.log(chainUrl);
  const wsProvider = new WsProvider(chainUrl);
  const api = await ApiPromise.create({
    provider: wsProvider,
    types: {
      ...typeDefinitions.contracts.types,
      GistQuote: {
        username: 'String',
        accountId: 'AccountId',
      },
      ...Phala.types,
    },
  });
  const cert = await Phala.signCertificate({ api, pair: sponsor });
  const txqueue = new TxQueue(api);

  // attach to contract
  // call function
  // connect to pruntime
  const prpc = Phala.createPruntimeApi(pruntimeUrl);
  const connectedWorker = hex((await prpc.getInfo({})).publicKey);
  console.log('Connected worker:', connectedWorker);

  let contract = await contractApi(api, pruntimeUrl, artifact);
  console.log('Fat Contract: connected', artifact.address);

  // call function
  const estimate = await contract.contractApi.query[name](
    cert as any,
    {},
    ...args,
  );
  let res = await txqueue.submit(
    contract.contractApi.tx[name](
      {
        gasLimit: estimate.gasRequired,
        storageDepositLimit: estimate.storageDeposit.isCharge
          ? estimate.storageDeposit.asCharge
          : null,
      },
      ...args, // args 或者 ...args 都是同样的错误
    ),
    sponsor,
    true,
  );
  // wait for the worker to sync to the bockchain
  await blockBarrier(api, prpc);

  console.log('Function call finished');
};

export function loadFatContract(contractPath: string) {
  const f = fs.readFileSync(contractPath);
  const contract = JSON.parse(f.toString());
  const constructor = contract.V3.spec.constructors.find(
    (c: any) => c.label === 'default',
  ).selector;
  const { name } = contract.contract;
  const { wasm } = contract.source;
  const { hash } = contract.source;
  return {
    hash,
    wasm,
    contract,
    constructor,
    name,
    address: '',
  };
}

export async function contractApi(api, pruntimeURL, contract) {
  const newApi = await api.clone().isReady;
  const phala = await Phala.create({
    api: newApi,
    baseURL: pruntimeURL,
    contractId: contract.address,
    autoDeposit: true,
  });
  const contractApi = new ContractPromise(
    phala.api,
    contract.contract,
    contract.address,
  );
  return { contractApi, phala };
}
