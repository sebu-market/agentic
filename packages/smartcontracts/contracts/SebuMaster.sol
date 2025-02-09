// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IERC20.sol";
import "./interfaces/IPortfolio.sol";
import "./interfaces/IFunding.sol";

/**
 @title SebuMaster
 @dev Main contract to handle investments and pitches
*/
contract SebuMaster {
    /*Storage*/
    address public fundingContract;
    address public guardian;
    address public shepard;
    address[] public founders; //array of addresses in line to pitch
    uint256 public currentRound;
    uint256 public currentSlot;//current index in queue
    uint256 public fee; //fee to pitch
    uint256 public pitchId;//
    mapping(uint256 => address) slotToToken;//slot to token pitched
    mapping(uint256 => address[]) roundToInvestors;
    mapping(uint256 => uint256) roundToFees;//round to pitch fees
    mapping(uint256 => uint256) roundTopRankingSlot;//slot of top ranked pitch by round
    mapping(uint256 => uint256) roundToTotalInvested;
    mapping(uint256 => uint256) slotToRanking;
    mapping(uint256 => mapping(address => uint256)) founderToSlotbyRound;//round to pitcher to slot
    mapping(uint256 => mapping(address => uint256)) roundToInvestment;//round to investor to amount
    address public investmentToken;
    IPortfolio public portfolio;
    
    /*Events*/
    event Investment(address _investor,uint256 _round, uint256 _amt);
    event NewPitch(address _founder,address _tokenToPitch, uint256 pitchId, uint256 _round, uint256 _slot, uint256 feeAmount);
    event NewPitchQueued(address _founder,address _tokenToPitch, uint256 _slot);
    event NewPitchUp(address _founder,address _tokenToPitch, uint256 _slot);
    event NewTopSlot(address _token, uint256 _slot, uint256 _ranking);
    event PitchInvalidated(uint256 _round, uint256 _slot);
    event RankingSet(uint256 _round, uint256 _slot, uint256 _ranking);
    event RoundClosed(uint256 _currentRound,uint256 _sendAmt);

    /*Modifiers*/
    modifier onlyGuardian{require(msg.sender == guardian);_;}
    modifier onlyShepard {require(msg.sender == shepard);_;}

    /*Functions*/
    /**
     * @dev constructor setting fee, investment token, guardian, shepard, and fundingContract
     * @param _fee cost of a base fee to pitch
     * @param _investmentToken address of token to pay fee/invest with
     * @param _guardian address of party able to invalidate pitches
     * @param _shepard address of shepard who will transfer agent information to the contract
     */
    constructor(uint256 _fee,address _investmentToken,address _guardian, address _shepard){
        require(_investmentToken != address(0), "Investment token address cannot be 0x");
        require(_guardian != address(0), "Guardian address cannot be 0x");
        require(_shepard != address(0), "Shepard address cannot be 0x");
        require(_fee > 0, "Fee must be greater than 0");
        fee = _fee;
        guardian = _guardian;
        shepard = _shepard;
        investmentToken = _investmentToken;
        currentRound=1;
        currentSlot=1;
        founders.push(guardian);//adding to init
    }

    /**
     * @dev called by guardian to close the current round and send investment/fee tokens
     */
    function closeRound() external onlyGuardian{
        //closes the current round, buys the tokens and sends it to the portfolio
        uint256 _teamFee = roundToFees[currentRound]/2;
        require(IERC20(investmentToken).transfer(guardian, _teamFee));
        uint256 _sendAmt = IERC20(investmentToken).balanceOf(address(this));
        require(IERC20(investmentToken).transfer(fundingContract,_sendAmt)); //send the rest to the fundingContract
        IFunding(fundingContract).startAuction(slotToToken[roundTopRankingSlot[currentRound]],_sendAmt);
        emit RoundClosed(currentRound,_sendAmt);
        currentRound += 1;
    }

    /**
     * @dev init function that sets the portfolio address (sebu address needed to deploy it)
     * @param _portfolio address of portfolio token
     */
    function init(address _portfolio, address _funding) external onlyGuardian {
        portfolio = IPortfolio(_portfolio);
        fundingContract = _funding;
    }

    /**
     * @dev allows the guardian to invalidate a pitch for breaking system rules
     * @param _round round of pitch to invalidate
     * @param _slot slotOf pitch to invalidate
     * @param _newTopSlot we don't keep pitches in order, so you'll need to enter the new top pitch
     */
    function invalidatePitch(uint256 _round, uint256 _slot, uint256 _newTopSlot) external onlyGuardian{
        slotToRanking[_slot] = 0;
        if(roundTopRankingSlot[_round] == _slot){
            roundTopRankingSlot[_round] = _newTopSlot;
            emit NewTopSlot(slotToToken[_newTopSlot], _newTopSlot, slotToRanking[_newTopSlot]);
        }
        emit PitchInvalidated( _round,_slot);
    }

    /**
     * @dev allows parties to invest in the given round and get minted portfolio LP shares
     * @param _amount amount of investmentToken to send to the contract
     */
    function invest(uint256 _amount) external{
        require(IERC20(investmentToken).transferFrom(msg.sender,address(this),_amount));
        roundToTotalInvested[currentRound] = roundToTotalInvested[currentRound] + _amount;
        if(roundToInvestment[currentRound][msg.sender] == 0){
            roundToInvestors[currentRound].push(msg.sender);
        }
        roundToInvestment[currentRound][msg.sender] = roundToInvestment[currentRound][msg.sender] + _amount;
        //NOTE: consider adding current round field to avoid subsequent RPC call to get current round.
        emit Investment(msg.sender,currentRound, _amount);
    }

    /**
     * @dev enters the founder in the queue to pitch their token after paying a fee
     * @param _tokenToPitch address of token being pitched 
     * @param _tokenToPitch address of token being pitched 
     * TOKEN MUST BE ON SAME CHAIN
     */
    function pitch(address _tokenToPitch) external{
        //each person can only pitch once per round
        pitchId++;
        require(founderToSlotbyRound[currentRound][msg.sender] == 0, "Sender already pitched this round");
        uint256 _amt = fee * (2 ** getQueueLength());
        require(IERC20(investmentToken).transferFrom(msg.sender,address(this),_amt), "Insufficient fee allowance");
        roundToFees[currentRound] = roundToFees[currentRound] + _amt;
        founderToSlotbyRound[currentRound][msg.sender] = founders.length;
        slotToToken[founders.length] = _tokenToPitch;
        founders.push(msg.sender);
        emit NewPitch(msg.sender, _tokenToPitch, pitchId, currentRound, founders.length, _amt);
        if(slotToToken[currentSlot] == _tokenToPitch){//what if two people pitch same token.. I guess not an issue...
            emit NewPitchUp(msg.sender, _tokenToPitch, founders.length);
        }
        else{
            emit NewPitchQueued(msg.sender, _tokenToPitch, founders.length);
        }
    }

    /**
     * @dev called by shepard to set the ranking of a given pitch
     * @param _score uint score for ranking
     */
    function setRanking(uint256 _score) external onlyShepard{
        slotToRanking[currentSlot] = _score;
        if(_score > slotToRanking[roundTopRankingSlot[currentRound]]){
            roundTopRankingSlot[currentRound] = currentSlot;
            emit NewTopSlot(slotToToken[currentRound],currentSlot, _score);
        }
        currentSlot ++;
        emit RankingSet(currentRound,currentSlot, _score);
        emit NewPitchUp(msg.sender, slotToToken[currentSlot], currentSlot);
    }

    /*Getter Functions*/
    /**
     * @dev returns the slot number of a given founder
     * @param _round round of pitch
     * @param _founder address of person who called pitch function
     */
    function getFounderToSlotByRound(uint256 _round, address _founder) external view returns(uint256 _slot){
        return founderToSlotbyRound[_round][_founder];
    }

    /**
     * @dev returns the percent of a given round an investor is
     * @param _round investment round of interest
     * @param _lp address of investor
     */
    function getInvestmentShare(uint256 _round, address _lp) external view returns(uint256 _share){
        require(_round < currentRound);
        if(roundToTotalInvested[_round] == 0){
            return 0;
        } 
        return roundToInvestment[_round][_lp] * 1e18/ roundToTotalInvested[_round];
    }

    /**
     * @dev returns the entire queue (pitched and to pitch)
     */
    function getFounders() external view returns(address[] memory){
        return founders;
    }

    /**
     * @dev returns the current queue length (0 if no one in line)
     */
    function getQueueLength() public view returns(uint256){
        return founders.length - currentSlot;
    }

    /**
     * @dev returns an array of all investors in a given round
     * @param _round round of interest
     */
    function getRoundInvestors(uint256 _round) external view returns(address[] memory){
        return roundToInvestors[_round];
    }

    /**
     * @dev returns total fee amount of a given round
     * @param _round round of interest
     */
    function getRoundToFees(uint256 _round) external view returns(uint256 _amount){
        return roundToFees[_round];
    }

    /**
     * @dev returns amount invested by a given address by round
     * @param _round round of interest
     * @param _lp address of investor
     */
    function getRoundToInvestment(uint256 _round, address _lp) external view returns(uint256 _amount){
        return roundToInvestment[_round][_lp];
    }

    /**
     * @dev returns the top ranking slot number by round
     * @param _round round of interest
     */
    function getRoundTopRankingSlot(uint256 _round) external view returns(uint256 _slot){
        return roundTopRankingSlot[_round];
    }

    /**
     * @dev returns total investment amount by round
     * @param _round round of interest
     */
    function getRoundToTotalInvested(uint256 _round) external view returns(uint256 _amount){
        return roundToTotalInvested[_round];
    }

    /**
     * @dev returns the ranking by a given slot
     * @param _slot slot of interest
     */
    function getSlotToRanking(uint256 _slot) external view returns(uint256 _ranking){
        return slotToRanking[_slot];
    } 

    /**
     * @dev returns the address of the pitched token by slot
     * @param _slot slot of interest
     */
    function getSlotToToken(uint256 _slot) external view returns(address _token){
        return slotToToken[_slot];
    }
}
