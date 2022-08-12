// deploy code will go here
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
    "pattern essay hybrid eternal kiwi away victory spare armed heart hotel scan",
    "https://rinkeby.infura.io/v3/8595408b31a94dc4a640ceb00a268a95"
);

const web3 = new Web3(provider);

(async () => {
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account ", accounts[0]);

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object, arguments: ['Hello there'] })
        .send({ from: accounts[0], gas: '1000000' });

    console.log('Contract deployed to ', result.options.address);

    provider.engine.stop();
})();