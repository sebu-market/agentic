// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IERC20.sol";
import "./interfaces/ISebu.sol";
import "./interfaces/IPortfolio.sol";

/**
 @title Funding
 @dev Mock funding contract for testing system
*/
contract Funding{
    address public portfolio;
    uint256 public currentRound;
    address public sebu;
    address public owner;
    uint256 public constant auctionTime = 4 hours;
    mapping(uint256 _round => uint256 _bid) public roundTopBid;
    mapping(uint256 => address) public roundTopBidder;
    mapping(uint256 => uint256) public roundAmount;
    mapping(uint256 => uint256) public roundStartTime;
    mapping(uint256 => address) public roundToken;
    mapping(uint256 => bool) public roundIsClosed;

    constructor(address _sebu){
        sebu = _sebu;
        owner = msg.sender;
    }

    function setPortfolio(address _portfolio) external{
        require(msg.sender == owner);
        require(address(portfolio) == address(0));
        portfolio = _portfolio;
    }

    function startAuction(address _tokenToBuy, uint256 _amount) external{
        require(msg.sender == sebu);
        currentRound++;
        roundAmount[currentRound] = _amount;
        roundToken[currentRound] = _tokenToBuy;
        roundStartTime[currentRound] = block.timestamp;
        roundTopBid[currentRound] = 0;
        roundTopBidder[currentRound] = owner;
    }

    function closeAuction() external{
        //send to tokens to portfolio and investmentTokens to topBidder
        require(!roundIsClosed[currentRound]);
        require((block.timestamp - roundStartTime[currentRound]) > auctionTime);
        roundIsClosed[currentRound] = true;
        IPortfolio(portfolio).newPosition(roundToken[currentRound],roundTopBid[currentRound]);
        IERC20(roundToken[currentRound]).transfer(address(portfolio),roundTopBid[currentRound]);
        IERC20(ISebu(sebu).investmentToken()).transfer(roundTopBidder[currentRound],roundAmount[currentRound]);
    }

    function placeBid(uint256 _round, uint256 _amount) external{
        require(_round == currentRound);
        require(!roundIsClosed[currentRound]);
        require(_amount > roundTopBid[currentRound]);
        if(roundTopBid[currentRound] > 0){
            IERC20(roundToken[currentRound]).transfer(roundTopBidder[currentRound],roundTopBid[currentRound]);
        }
        roundTopBid[currentRound] = _amount;
        roundTopBidder[currentRound] = msg.sender;
        require(IERC20(roundToken[currentRound]).transferFrom(msg.sender,address(this),_amount));
    }


}
