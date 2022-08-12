const path = require('path')
const fs = require('fs')
const solc = require('solc')

const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol')
const inboxSource = fs.readFileSync(inboxPath, 'utf8');

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol')
const lotterySource = fs.readFileSync(lotteryPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'Inbox.sol': { content: inboxSource },
        'Lottery.sol': { content: lotterySource }
    },
    settings: {
        outputSelection: {
            '*': { '*': ['*'] }
        }
    }
}

const contracts = JSON.parse(solc.compile(JSON.stringify(input))).contracts;

module.exports = {
    Inbox: contracts['Inbox.sol'].Inbox,
    Lottery: contracts['Lottery.sol'].Lottery,
};