// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.9;

contract CampaignFactory {
    address[] public campains;

    function createCampaign(uint256 minContribution) public {
        Campaign campaign = new Campaign(minContribution, msg.sender);
        campains.push(address(campaign));
    }

    function getCampaigns() public view returns (address[] memory) {
        return campains;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address recepient;
        bool complete;
        mapping(address => bool) approvers;
        uint256 approversCount;
    }

    address public manager;
    uint256 public minimumContribution;
    Request[] public requests;
    mapping(address => bool) public contributors;
    uint256 public contributorsCount;

    constructor(uint256 minContribution, address creator) {
        minimumContribution = minContribution;
        manager = creator;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);
        contributors[msg.sender] = true;
        contributorsCount++;
    }

    function createSpendingRequest(
        string calldata desc,
        uint256 value,
        address recepient
    ) public restricted {
        Request storage request = requests.push();
        request.description = desc;
        request.value = value;
        request.recepient = recepient;
        request.complete = false;
        request.approversCount = 0;
    }

    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.approversCount > (contributorsCount / 2));

        payable(request.recepient).transfer(request.value);
        request.complete = true;
    }

    function approveRequest(uint256 index) public {
        Request storage request = requests[index];
        require(contributors[msg.sender]);
        require(!request.approvers[msg.sender]);

        request.approvers[msg.sender] = true;
        request.approversCount++;
    }
}
