const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledCampaign = require('../etherium/build/Campaign.json');
const compiledCampaignFactory = require('../etherium/build/CampaignFactory.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    console.log(await web3.eth.getBalance(accounts[0]));

    factory = await new web3.eth.Contract(compiledCampaignFactory.abi)
        .deploy({ data: compiledCampaignFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: '1900000' });

    await factory.methods.createCampaign('1000').send({
        from: accounts[0],
        gas: '1000000',
    });

    [campaignAddress] = await factory.methods.getCampaigns().call();

    campaign = await new web3.eth.Contract(
        compiledCampaign.abi,
        campaignAddress,
    );
});

describe('Campaign', () => {
    it('deploys campaign and campaign factory', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });
});