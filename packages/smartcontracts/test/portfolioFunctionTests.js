const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

advanceTime = async (time) =>{
    await network.provider.send("evm_increaseTime", [time])
    await network.provider.send("evm_mine")
  }

let fee = ethers.parseEther("5", 'wei'); //5USDC
describe("portfolio - function tests", function() {
    async function deploy(contractName, ...args) {
        const Factory = await ethers.getContractFactory(contractName)
        const instance = await Factory.deploy(...args)
        return instance.waitForDeployment()
      }
    let token,accounts, guardian, sebu, shepard, fundingContract, samplePitch
    beforeEach(async function () {
        accounts = await ethers.getSigners();
        guardian = accounts[0]
        shepard = accounts[1]
        token = await deploy("MockERC20","mock token", "MT");
        samplePitch = await deploy("MockERC20","SampleMeme", "meme")
        sebu = await deploy("SebuMaster",fee,token.target,guardian.address,shepard.address);
        fundingContract = await deploy("Funding",sebu.target)
        portfolio = await deploy("Portfolio","portfolioPoolToken","ppT",sebu.target);
        await fundingContract.setPortfolio(portfolio.target)
        await sebu.init(portfolio.target, fundingContract.target);
        await token.mint(accounts[2],ethers.parseEther("100", 'wei'))//mint some USDC
        await token.mint(accounts[3],ethers.parseEther("100", 'wei'))
        await token.mint(accounts[4],ethers.parseEther("100", 'wei'))
        await samplePitch.mint(shepard,ethers.parseEther("100", 'wei'))

    });
    it("constructor()", async function() {
            assert(await portfolio.sebu() == sebu.target)
            assert(await portfolio.mintAmount() == ethers.parseEther("100", 'wei'))
    });
    it("newPosition()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("10", 'wei'))
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))
        await advanceTime(60*60*4)//4hours
        await expect(portfolio.connect(shepard).newPosition(samplePitch.target,ethers.parseEther("10", 'wei'))).to.be.reverted;//wrong address
        await fundingContract.closeAuction()
        let loT = await portfolio.getListOfTokens()
        assert(loT[0] == samplePitch.target)
        assert(await portfolio.totalLPshares() == ethers.parseEther("100", 'wei'))  
    });
    it("mintLPShares()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("10", 'wei'))
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))
        await advanceTime(60*60*4)//4hours
        await fundingContract.closeAuction()
        //await portfolio.connect(shepard).newPosition(samplePitch.target,ethers.parseEther("10", 'wei'))
        //try a zero guy
        await expect(portfolio.connect(accounts[3]).mintLPShares(1,[accounts[3].address])).to.be.reverted;
        await portfolio.connect(accounts[3]).mintLPShares(1,[accounts[2].address])
        assert(await portfolio.balanceOf(accounts[2].address) == ethers.parseEther("100", 'wei'))
        //try again
        await expect(portfolio.connect(accounts[3]).mintLPShares(1,[accounts[2].address])).to.be.reverted;   
    });
    it("withdraw()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("10", 'wei'))
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))
        await advanceTime(60*60*4)//4hours
        await fundingContract.closeAuction()
        //await portfolio.connect(shepard).newPosition(samplePitch.target,ethers.parseEther("10", 'wei'))
        await portfolio.connect(accounts[3]).mintLPShares(1,[accounts[2].address])
        await expect(portfolio.connect(accounts[3]).withdraw(ethers.parseEther("100", 'wei'),[samplePitch.target])).to.be.reverted;//not right guy
        await expect(portfolio.connect(accounts[2]).withdraw(ethers.parseEther("100", 'wei'),[token.target])).to.be.reverted;//not right token
        await expect(portfolio.connect(accounts[2]).withdraw(0,[samplePitch.target])).to.be.reverted;//zero amount
        await portfolio.connect(accounts[2]).withdraw(ethers.parseEther("100", 'wei'),[samplePitch.target])
        await expect(portfolio.connect(accounts[2]).withdraw(ethers.parseEther("100", 'wei'),[samplePitch.target])).to.be.reverted;//cant do it twice
        assert(await portfolio.balanceOf(accounts[2].address) == 0)//he burned it all
        assert(await portfolio.totalLPshares() == 0)
        assert(await samplePitch.balanceOf(accounts[2].address) == 0)//needs to claim
        assert(await portfolio.getUnclaimedTokenBalance(samplePitch.target) == 0)

    });
    it("claim()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("10", 'wei'))
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))
        await advanceTime(60*60*4)//4hours
        await fundingContract.closeAuction()
        //await portfolio.connect(shepard).newPosition(samplePitch.target,ethers.parseEther("10", 'wei'))
        await portfolio.connect(accounts[3]).mintLPShares(1,[accounts[2].address])
        await expect(portfolio.connect(accounts[3]).claim([samplePitch.target])).to.be.reverted;//not right guy
        await expect(portfolio.connect(accounts[2]).claim([token.target])).to.be.reverted;//wrong token
        await expect(portfolio.connect(accounts[2]).claim([samplePitch.target])).to.be.reverted;//zero amount
        await expect(portfolio.connect(accounts[2]).claim([samplePitch.target])).to.be.reverted;//must run withdraw first
        await portfolio.connect(accounts[2]).withdraw(ethers.parseEther("100", 'wei'),[samplePitch.target])
        assert(await portfolio.balanceOf(accounts[2].address) == 0)//he burned it all
        assert(await samplePitch.balanceOf(portfolio.target) == ethers.parseEther("10", 'wei'))
        await portfolio.connect(accounts[2]).claim([samplePitch.target])
        await expect(portfolio.connect(accounts[2]).claim([samplePitch.target])).to.be.reverted;//cant do it twice
        assert(await portfolio.balanceOf(accounts[2].address) == 0)//he burned it all
        assert(await samplePitch.balanceOf(portfolio.target) == 0)
        assert(await portfolio.totalLPshares() == 0)
        assert(await samplePitch.balanceOf(accounts[2].address) == ethers.parseEther("10", 'wei'))
        assert(await portfolio.getUnclaimedTokenBalance(samplePitch.target) == 0)     
    });
});

