// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);

        players.push(msg.sender);
    }

    function pickWinner() public restricted {
        uint256 winnerIndex = random() % players.length;
        payable(players[winnerIndex]).transfer(address(this).balance);
        players = new address[](0);
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}
