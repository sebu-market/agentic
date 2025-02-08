// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IFunding{
   function startAuction(address _tokenToBuy, uint256 _amount) external;
}
