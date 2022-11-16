import { ethers } from 'ethers';
import Web3 from 'web3';

export const getUserWallet = (mnemonic: string, url: string) => {
  const provider = new ethers.providers.JsonRpcProvider(url);
  return ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
};

export const perform = async (
  addr: string,
  abi: any,
  provider: string,
  sponsorMnemonic: string,
): Promise<any> => {
  const web3 = new Web3(provider);
  const autocall = new web3.eth.Contract(abi as any, addr);

  let res = await autocall.methods['check']().call();
  console.log(res);
  if ((res as boolean) == true) {
    console.log('performing ...');
    let prikey = getUserWallet(sponsorMnemonic, provider).privateKey;
    let signer = web3.eth.accounts.privateKeyToAccount(prikey);
    web3.eth.accounts.wallet.add(signer);

    res = await autocall.methods['perform']().send({
      from: signer.address,
      gas: 1000000,
    });
    console.log(res);
    console.log('performing done.');
  }
  return { ok: true };
};

export const triggle = async (
  addr: string,
  abi: any,
  provider: string,
  sponsorMnemonic: string,
  home: string,
  guest: string,
  nonce: number,
): Promise<any> => {
  const web3 = new Web3(provider);
  const autocall = new web3.eth.Contract(abi as any, addr);
  let d = web3.eth.abi.encodeParameters(['string', 'string'], [home, guest]);
  console.log(d);

  let prikey = getUserWallet(sponsorMnemonic, provider).privateKey;
  let signer = web3.eth.accounts.privateKeyToAccount(prikey);
  web3.eth.accounts.wallet.add(signer);

  //console.log("calling home ...");
  //let h = await autocall.methods['home']().call();
  //console.log(h);
  const r_nonce = await web3.eth.getTransactionCount(addr, 'pending');
  console.log('nonce', r_nonce);

  console.log('triggling ...');

  let retry = await autocall.methods['triggle'](d).send({
    from: signer.address,
    gas: 1000000,
    gasPrice: 54.3 * 1e9,
  });
  console.log('triggling done. retry:', retry);
  return { ok: true, retry: retry };
};

export const encode_test_data = async (provider: string) => {
  const web3 = new Web3(provider);
  // let d = web3.eth.abi.encodeParameters(['string'], ["q"]);
  let d0 = web3.eth.abi.encodeParameters(['uint'], [0]);
  let d1 = web3.eth.abi.encodeParameters(['uint'], [1]);
  let d2 = web3.eth.abi.encodeParameters(['uint'], [2]);
  let d3 = web3.eth.abi.encodeParameters(['uint'], [3]);
  console.log(d0, d1, d2, d3);
};
