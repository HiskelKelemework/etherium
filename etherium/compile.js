const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);

const contractFileName = 'Campaign.sol';
const contractPath = path.resolve(__dirname, 'contracts', contractFileName);
const contractSource = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        [contractFileName]: { content: contractSource },
    },
    settings: {
        outputSelection: {
            '*': { '*': ['*'] }
        }
    }
};

const contracts = JSON.parse(solc.compile(JSON.stringify(input))).contracts[contractFileName];
for (contract in contracts) {
    fs.writeJsonSync(
        path.resolve(buildPath, contract + '.json'),
        contracts[contract],
    )
}