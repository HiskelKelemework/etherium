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

    it('marks caller as manager of campaign', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows users to contribute to the campaign', async () => {
        await campaign.methods.contribute().send({
            value: '2000',
            from: accounts[1],
        });

        const isContributor = await campaign.methods.contributors(accounts[1]).call();
        assert(isContributor);
    });

    it('requires minimum contribution of 1000 wei', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '200',
                from: accounts[1],
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows a manger to make a payment request', async () => {
        await campaign.methods.createSpendingRequest("For some batteries", '1000', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });

        const request = await campaign.methods.requests(0).call();
        assert.equal("For some batteries", request.description);
    });

    it('processes a request', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether'),
        });

        await campaign.methods.createSpendingRequest(
            "For boxes",
            web3.utils.toWei('6', 'ether'),
            accounts[1],
        ).send({
            from: accounts[0],
            gas: '1000000',
        });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000',
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000',
        });

        let finalBalance = await web3.eth.getBalance(accounts[1]);

        assert(finalBalance > 104);
    });
});