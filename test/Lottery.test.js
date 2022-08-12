const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const { abi, evm } = require('../compile').Lottery;

const web3 = new Web3(ganache.provider());

let accounts;
let lotteryContract;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lotteryContract = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery contract', () => {
    it('creates a contract', () => {
        assert.ok(lotteryContract.options.address);
    });

    it('requires some ether to enter the lottery', async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: accounts[0],
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('lets a user enter the lottery', async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether'),
            });
            assert(true);
        } catch (err) {
            assert(false)
        }
    });

    it('lets multiple users enter the lottery', async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether'),
            });

            await lotteryContract.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei('0.02', 'ether'),
            });

            await lotteryContract.methods.enter().send({
                from: accounts[2],
                value: web3.utils.toWei('0.02', 'ether'),
            });

            const players = await lotteryContract.methods.getPlayers().call();

            assert.equal(accounts[0], players[0]);
            assert.equal(accounts[1], players[1]);
            assert.equal(accounts[2], players[2]);
            assert.equal(players.length, 3);
        } catch (err) {
            assert(false)
        }
    });

    it('only lets the manager call pickWinner', async () => {
        try {
            await lotteryContract.methods.pickWinner().send({
                from: accounts[1],
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players', async () => {
        await lotteryContract.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether'),
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lotteryContract.methods.pickWinner().send({
            from: accounts[0],
        });

        const players = await lotteryContract.methods.getPlayers().call();

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.9', 'ether'));
        assert.equal(players.length, 0);
    });
});