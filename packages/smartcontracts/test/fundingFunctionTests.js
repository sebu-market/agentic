const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

advanceTime = async (time) =>{
    await network.provider.send("evm_increaseTime", [time])
    await network.provider.send("evm_mine")
  }

let fee = ethers.parseEther("5", 'wei'); //5USDC
describe("funding - function tests", function() {
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
    });
    it("constructor()", async function() {
        assert(await fundingContract.sebu() == sebu.target);
    });
    it("setPortfolio()", async function() {
        fundingContract = await deploy("Funding",sebu.target)
        assert(await fundingContract.portfolio() == ethers.ZeroAddress);
        await expect(fundingContract.connect(accounts[1]).setPortfolio(portfolio.target)).to.be.reverted;//only owner
        await fundingContract.setPortfolio(portfolio.target)
        assert(await fundingContract.portfolio() == portfolio.target);
    });
    it("startAuction)", async function() {
        fundingContract = await deploy("Funding",accounts[2].address)
        assert(await fundingContract.portfolio() == ethers.ZeroAddress);
        await expect(fundingContract.connect(accounts[1]).startAuction(samplePitch.target, ethers.parseEther("100", 'wei'))).to.be.reverted;//only sebu
        await fundingContract.connect(accounts[2]).startAuction(samplePitch.target, ethers.parseEther("100", 'wei'))
        blocky = await ethers.provider.getBlock();
        assert(await fundingContract.currentRound() == 1);
        assert(await fundingContract.roundAmount(1) == ethers.parseEther("100", 'wei'))
        assert(await fundingContract.roundToken(1) == samplePitch.target)
        assert(await fundingContract.roundStartTime(1) == blocky.timestamp)
        assert(await fundingContract.roundTopBid(1) == 0)
        assert(await fundingContract.roundTopBidder(1) == accounts[0].address)
    });
    it("closeAuction()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        await samplePitch.mint(shepard.address,ethers.parseEther("10", 'wei'))
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("10", 'wei'))
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))
        await expect(fundingContract.closeAuction()).to.be.reverted;//tooSoon
        await advanceTime(60*60*4)//4hours
        await fundingContract.closeAuction()
        await expect(fundingContract.closeAuction()).to.be.reverted;//alreadyClsoed
        assert(await fundingContract.roundIsClosed(1) == true)
        assert(await samplePitch.balanceOf(fundingContract.target) == 0)
        console.log(await token.balanceOf(fundingContract.target))
        assert(await token.balanceOf(fundingContract.target) == 0)
    });
    it("placeBid()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        await expect(fundingContract.connect(shepard).placeBid(1,0)).to.be.reverted;//not enough
        await samplePitch.mint(shepard.address,ethers.parseEther("10", 'wei'))
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("10", 'wei'))
        await expect(fundingContract.connect(shepard).placeBid(2,ethers.parseEther("10", 'wei'))).to.be.reverted;//wronground
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))
        assert(await samplePitch.balanceOf(fundingContract.target) == ethers.parseEther("10", 'wei'))
        assert(await fundingContract.roundTopBid(1) == ethers.parseEther("10", 'wei'))
        assert(await fundingContract.roundTopBidder(1) == shepard.address)
        await advanceTime(60*60*4)//4hours
        await fundingContract.closeAuction()
        await expect(fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))).to.be.reverted;//round is closed
    });


});