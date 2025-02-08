// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IERC20.sol";
import "./interfaces/ISebu.sol";
import "./Token.sol";

/**
 @title Portfolio
 @dev Main Portfolio contract to hold investments
*/
contract Portfolio is Token{
    /*Storage*/
    address[] public listOfTokens;
    uint256 public mintAmount = 100 ether;//amount of lp tokens to mint per investment round
    uint256 public totalLPshares;
    uint256 public currentRound;
    ISebu public sebu;
    mapping(address => uint256) public portfolioBalance;//balance of each token deposited (no sending tokens to the contract, they will be lost)
    mapping(address => uint256) totalToWithdraw;//portion of tokens set aside to claim by withdrawals
    mapping(uint256 => mapping(address => bool)) public roundToMinted;//checks whether you already minted in a given round
    mapping(address => mapping(address => uint256)) lpSharesPerToken;//for withdrawing individual
    mapping(address => mapping(address => uint256)) mineToWithdraw;//portion of token set aside for me to withdraw

    /*Events*/
    event MintLPShares(uint256 _round, address[] _to);
    event NewPosition(address _token, uint256 _amount);
    event Withdraw(uint256 _amount, address[] _tokens);

    /*Modifiers*/
    modifier onlySebu {require(msg.sender == address(sebu));_;}

    modifier onlyFunding{require(msg.sender == sebu.fundingContract());_;}

    /*Functions*/
    /**
     * @dev constructor setting token, and sebu addresses
     * @param _name token name of Portfolio LP token 
     * @param _symbol token symbol of Portfolio LP token
     * @param _sebu address of SebuMaster contract
     */
    constructor(string memory _name, string memory _symbol, address _sebu) Token(_name,_symbol) {
        sebu = ISebu(_sebu);
        currentRound =1;
    }

    /**
     * @dev function for claiming tokens not claimed during withdraw process
     * @param _tokens list of tokens to claim.  You must run the withdraw function before this one
     * this function should only be used if you don't include them in your "withdraw" run
     */
    function claim(address[] memory _tokens) public{
        uint256 _thisSend;
        for(uint256 _i=0;_i<_tokens.length;_i++){
            _thisSend = mineToWithdraw[_tokens[_i]][msg.sender];
            if(_thisSend > IERC20(_tokens[_i]).balanceOf(address(this))){
                _thisSend = IERC20(_tokens[_i]).balanceOf(address(this));//just rounding issues
            }
            require(_thisSend > 0);
            portfolioBalance[_tokens[_i]] = portfolioBalance[_tokens[_i]] - (_thisSend);
            mineToWithdraw[_tokens[_i]][msg.sender] =  0;
            totalToWithdraw[_tokens[_i]] = totalToWithdraw[_tokens[_i]] - _thisSend;
            IERC20(_tokens[_i]).transfer(msg.sender, (_thisSend));
        }
    }

    /**
     * @dev function for minting shares from a given round in the sebu contract
     * @param _round investment round of sebu contract
     * @param _to address array of parties to mintLPshares to
     */
    function mintLPShares(uint256 _round, address[] memory _to) external{
        uint256 _amt;
        require(_round < currentRound);//must wait until newPosition is created
        for(uint256 _i=0;_i<_to.length;_i++){
            require(!roundToMinted[_round][_to[_i]], "already minted this round");
            _amt = sebu.getInvestmentShare(_round, _to[_i]) * mintAmount / 1e18;
            require(_amt > 0);
            roundToMinted[_round][_to[_i]] = true;
            _mint(_to[_i],_amt);
        }
        emit MintLPShares(_round, _to);
    }

    /**
     * @dev allows the fundingContract to create a new position after a given round
     * @param _token address of token being added to the porfolio 
     * @param _amount token amount sent to this contract
     */
    function newPosition(address _token, uint256 _amount) external onlyFunding{
        //require(IERC20(_token).transferFrom(msg.sender,address(this),_amount));\
        if(portfolioBalance[_token] == 0){
            listOfTokens.push(_token);
        }
        totalLPshares += mintAmount;
        portfolioBalance[_token] = portfolioBalance[_token] + _amount;
        currentRound ++;
        emit NewPosition(_token, _amount);
    }

    /**
     * @dev allows a given LP to withdraw their portion of the tokens by burning the LP tokens
     * @param _amount amount of LP tokens to burn
     * @param _tokens array of token addresses to claim in the portfolio. 
     * the _tokens variable might not be all the tokens in the portfolio.  
     * It marks all the tokens as yours, but you only send the ones in the _tokens array to yourself
     * This is so gas costs are kept to a minimum (you probably only care about the big ones)
     * You can always go back and claim all of them (or any) using the claim function. 
     */
    function withdraw(uint256 _amount, address[] memory _tokens) external{
        require(_amount > 0);
        //burn LP shares
        _burn(msg.sender, _amount);
        uint256 _pct = (1e18 * _amount) / totalLPshares;
        totalLPshares -= _amount;
        //markTokenAsYours
        uint256 _thisSend;
        uint256 _bal;
        for(uint256 _i=0;_i<listOfTokens.length;_i++){
            _bal = totalToWithdraw[_tokens[_i]];
            _thisSend = (portfolioBalance[_tokens[_i]] - _bal) * _pct;//we assume here that the balance of the contract is not updating otherwise
            require(_thisSend > 0);
            mineToWithdraw[_tokens[_i]][msg.sender] = _thisSend /1e18;
            totalToWithdraw[_tokens[_i]] = _bal + _thisSend / 1e18;
        }
        emit Withdraw(_amount, _tokens);
    }

    /*Getter Functions*/
    /**
     * @dev returns the listOfTokens in the portfolio
     */
    function getListOfTokens() external view returns(address[] memory){
        return listOfTokens;
    }

    /**
     * @dev returns the total amount of a given token in the portfolio contract not withdrawn
     * @param _token address of token you want information on
     */
    function getUnclaimedTokenBalance(address _token) external view returns(uint256){
        return portfolioBalance[_token] - totalToWithdraw[_token];
    }
}
