// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Owned.sol";
import "./Logger.sol";
import "./IFaucet.sol";

contract Faucet is Owned, Logger, IFaucet {
    // Storage variables
    // uint public funds = 1000; // positive values only; uint means uint256 can store a value 2^256 - 1
    // int public counter = -10;

    uint public numOfFunders;

    mapping(address => bool) public funders;
    mapping(uint => address) public lutFunders;

    modifier limitWithdraw(uint withdrawAmount) {
        require(withdrawAmount <= 100000000000000000, "Cannot withdraw more than 0.1 ether");
        _;
    }

    // Types of variables
    // public - can be reacheble everywhere
    // private - can be accesible only within smart contract. Can't be seen in deployedBytecode
    // internal - can be accesible within smart contract and also derived smart contract

    // This is special function
    // It's called when you make the tx that doesn't specify
    // function name to call
    // Allows to receive eth to smart contract
    receive() external payable {}
    // Adding eth to smart contract
    function addFunds() external override payable {
        address funder = msg.sender;
        
        if (!funders[funder]) {
            uint index = numOfFunders++;
            funders[funder] = true;
            lutFunders[index] = funder;
        }
    }

    function getAllFunders() external view returns(address[] memory){
        address[] memory _funders = new address[](numOfFunders);

        for(uint i = 0; i < numOfFunders; i++){
            _funders[i] = lutFunders[i];
        }

        return _funders;
    }

    // function getFunders() public view returns(address[] memory) {
    //     return funders;
    // }

    // External functions are part of the contarct interface
    // which means thay can be called via contracts and othet txs

    // External functions can't be called inside the contract
    // we can call this function with "this" keyword but it takes more gas consumption
    // Public functions can be called inside the contract
    function getFunderAtIndex(uint8 index) external view returns(address) {
        return lutFunders[index];
    }    

    // pure, view - read only, no gas fee
    // view - it indicates that the function will not modify the storage state
    // pure - even more strict, indicating that it won't even read the storage state
    // function testing() external pure returns(uint) {
    //     return 2 + 2;
    // }

    // Transactions (can generate state changes) require gass fee

    function withdraw(uint withdrawAmount) external override limitWithdraw(withdrawAmount) { 
        payable (msg.sender).transfer(withdrawAmount);
    }

    function test1() external onlyOwner {

    }

    function emitLog() public override pure returns(bytes32) {
        return "Hello";
    }
}
// to create contracts in local development EVM use Ganache
// Create new ethereum network in Ganache
// truffle migrate --reset
// truffle console
// const i = await Faucet.deployed()
// i.addFunds({value: 2000000000000000000, from: accounts[0]})
// i.withdraw("1000000000000000000", {from: accounts[1]})