// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// interface can't inherrit from other conract
// they can only inherit from other interfaces

// they can't declare constructor
// they can't declare variables
// all declared functions have to be external

interface IFaucet {
    function addFunds() external payable;
    function withdraw(uint withdrawAmount) external;
}