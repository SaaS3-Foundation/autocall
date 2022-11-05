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

    await autocall.methods['perform']().send({
      from: signer.address,
      gas: 1000000,
    });
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
): Promise<any> => {
  const web3 = new Web3(provider);
  const autocall = new web3.eth.Contract(abi as any, addr);
  let d = web3.eth.abi.encodeParameters(['string', 'string'], [home, guest]);
  console.log(d);

  console.log('triggling ...');
  let prikey = getUserWallet(sponsorMnemonic, provider).privateKey;
  let signer = web3.eth.accounts.privateKeyToAccount(prikey);
  web3.eth.accounts.wallet.add(signer);

  let retry = await autocall.methods['triggle'](d).send({
    from: signer.address,
    gas: 1000000,
  });
  console.log('triggling done. retry:', retry);
  return { ok: true, retry: retry };
};
