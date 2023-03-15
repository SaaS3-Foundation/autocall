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
  gasLimit: number,
): Promise<any> => {
  const web3 = new Web3(provider);
  const autocall = new web3.eth.Contract(abi as any, addr);
  let d = web3.eth.abi.encodeParameters(['string', 'string'], [home, guest]);
  console.log(d);

  let prikey = getUserWallet(sponsorMnemonic, provider).privateKey;
  let signer = web3.eth.accounts.privateKeyToAccount(prikey);
  web3.eth.accounts.wallet.add(signer);

  const r_nonce = await web3.eth.getTransactionCount(addr, 'pending');
  console.log('nonce', r_nonce);

  console.log('triggling ...');
  let gas_price = await web3.eth.getGasPrice();
  console.log('gas_price', gas_price);

  let c = autocall.methods['triggle'](d);
  let eg =
    (await web3.eth.estimateGas({
      from: signer.address,
      to: addr,
      data: c.encodeABI(),
    })) * 10;
  if (gasLimit > eg) {
    eg = gasLimit;
  }

  let receipt = await web3.eth.sendTransaction({
    from: signer.address,
    to: addr,
    data: c.encodeABI(),
    gas: eg,
    gasPrice: gas_price,
  });

  console.log('triggling done. receipt:', receipt);
  return { ok: true, retry: false };
};

export const encode_test_data = async (provider: string) => {
  const web3 = new Web3(provider);
  // let d = web3.eth.abi.encodeParameters(['string'], ["q"]);
  let d0 = web3.eth.abi.encodeParameters(['uint'], [0]);
  let d1 = web3.eth.abi.encodeParameters(['uint'], [1]);
  let d2 = web3.eth.abi.encodeParameters(['uint'], [2]);
  let d3 = web3.eth.abi.encodeParameters(['uint'], [3]);
  console.log(d0, d1, d2, d3);
  let d = web3.eth.abi.encodeParameters(['string'], ['saas3']);
  console.log(d);
};
