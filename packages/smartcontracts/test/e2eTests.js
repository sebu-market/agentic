const { expect, assert } = require("chai");
const { ethers } = require("hardhat");


let fee = ethers.parseEther("5", 'wei'); //5USDC
describe("e2e tests", function() {
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
        await token.mint(accounts[2],ethers.parseEther("200", 'wei'))//mint some USDC
        await token.mint(accounts[3],ethers.parseEther("100", 'wei'))
        await token.mint(accounts[4],ethers.parseEther("100", 'wei'))
        await samplePitch.mint(shepard,ethers.parseEther("100", 'wei'))
    });
    it("oneFullTest()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("100", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("100", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        assert(await token.balanceOf(guardian.address) == ethers.parseEther("2.5"))
        assert(await token.balanceOf(fundingContract.target) == ethers.parseEther("102.5", 'wei'))
        assert(await sebu.currentRound() == 2);
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("10", 'wei'))
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("10", 'wei'))
        await advanceTime(60*60*4)//4hours
        await fundingContract.closeAuction()
        //await portfolio.connect(shepard).newPosition(samplePitch.target,ethers.parseEther("10", 'wei'))
        await portfolio.connect(accounts[3]).mintLPShares(1,[accounts[2].address])
        await portfolio.connect(accounts[2]).withdraw(ethers.parseEther("100", 'wei'),[samplePitch.target])
        assert(await portfolio.balanceOf(accounts[2].address) == 0)//he burned it all
        assert(await samplePitch.balanceOf(portfolio.target) == ethers.parseEther("10", 'wei'))
        await portfolio.connect(accounts[2]).claim([samplePitch.target])
        assert(await samplePitch.balanceOf(portfolio.target) == 0)
        assert(await portfolio.totalLPshares() == 0)
        assert(await samplePitch.balanceOf(accounts[2].address) == ethers.parseEther("10", 'wei'))
        assert(await portfolio.getUnclaimedTokenBalance(samplePitch.target) == 0)     
    });
    it("one Round-10 investors, 10pitches, 1 invalid()", async function() {    
        for(let i=2;i<=11;i++){
            await token.mint(accounts[i].address,ethers.parseEther("100", 'wei'));
            await token.connect(accounts[i]).approve(sebu.target,ethers.parseEther("100", 'wei'))
            await sebu.connect(accounts[i]).invest(ethers.parseEther("100", 'wei'))
        }
        for(let i=10;i<20;i++){
            samplePitch = await deploy("MockERC20","SampleMeme", "meme")
            await token.mint(accounts[i].address,ethers.parseEther("5", 'wei'));
            await token.connect(accounts[i]).approve(sebu.target,ethers.parseEther("5", 'wei'))
            await sebu.connect(accounts[i]).pitch(samplePitch.target);
            await sebu.connect(shepard).setRanking(50+i);
        }
        await sebu.connect(guardian).closeRound()
        assert(await token.balanceOf(guardian.address) == ethers.parseEther("25"))
        assert(await token.balanceOf(fundingContract.target) == ethers.parseEther("1025", 'wei'))
        assert(await sebu.currentRound() == 2);
        await samplePitch.connect(shepard).approve(portfolio.target,ethers.parseEther("10", 'wei'))  
    });
    it("ten Rounds-3 investors, 3 pitches, 1 invalid, 1 trade of LP token, 1 withdrawal", async function() {   
        for(let i=2;i<=11;i++){
            await token.mint(accounts[i].address,ethers.parseEther("100", 'wei'));
            await token.connect(accounts[i]).approve(sebu.target,ethers.parseEther("100", 'wei'))
            await sebu.connect(accounts[i]).invest(ethers.parseEther("100", 'wei'))
        }
        for(let i=10;i<20;i++){
            samplePitch = await deploy("MockERC20","SampleMeme", "meme")
            await token.mint(accounts[i].address,ethers.parseEther("5", 'wei'));
            await token.connect(accounts[i]).approve(sebu.target,ethers.parseEther("5", 'wei'))
            await sebu.connect(accounts[i]).pitch(samplePitch.target);
            await sebu.connect(shepard).setRanking(50+i);
        }
        await sebu.connect(guardian).closeRound()
        assert(await token.balanceOf(guardian.address) == ethers.parseEther("25"))
        assert(await token.balanceOf(fundingContract.target) == ethers.parseEther("1025", 'wei'))
        assert(await sebu.currentRound() == 2);
        await samplePitch.connect(shepard).approve(portfolio.target,ethers.parseEther("10", 'wei')) 
    });
    it("5 withdraws to close out system", async function() { 
        for(let i=2;i<7;i++){
            await token.mint(accounts[i].address,ethers.parseEther("100", 'wei'));
            await token.connect(accounts[i]).approve(sebu.target,ethers.parseEther("100", 'wei'))
            await sebu.connect(accounts[i]).invest(ethers.parseEther("100", 'wei'))
        }
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(50);
        await sebu.connect(guardian).closeRound()
        assert(await token.balanceOf(guardian.address) == ethers.parseEther("2.5"))
        assert(await token.balanceOf(fundingContract.target) == ethers.parseEther("502.5", 'wei'))
        assert(await sebu.currentRound() == 2);
        await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("100", 'wei'))
        await fundingContract.connect(shepard).placeBid(1,ethers.parseEther("100", 'wei'))
        await advanceTime(60*60*4)//4hours
        await fundingContract.closeAuction()
        //await portfolio.connect(shepard).newPosition(samplePitch.target,ethers.parseEther("10", 'wei'))
        for(let i=2;i<7;i++){
            await portfolio.connect(accounts[3]).mintLPShares(1,[accounts[i].address])
            await portfolio.connect(accounts[i]).withdraw(ethers.parseEther("20", 'wei'),[samplePitch.target])
            await portfolio.connect(accounts[i]).claim([samplePitch.target])
            assert(await portfolio.balanceOf(accounts[i].address) == 0)//he burned it all
            assert(await samplePitch.balanceOf(accounts[i].address) >= ethers.parseEther("19.90", 'wei'))//will occasionally get few wei rounding issue
            assert(await samplePitch.balanceOf(accounts[i].address) <= ethers.parseEther("20.01", 'wei'))
        }
        assert(await portfolio.totalLPshares() == 0)
        assert(await portfolio.getUnclaimedTokenBalance(samplePitch.target) == 0)
    });
    it("test 100 tokens to withdraw --gas cost view", async function() { 
        let pitches = []
        for(let i=1;i<=100;i++){
            await token.mint(accounts[2].address,ethers.parseEther("1", 'wei'));
            await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("1", 'wei'))
            await sebu.connect(accounts[2]).invest(ethers.parseEther("1", 'wei'))
            samplePitch = await deploy("MockERC20","SampleMeme", "meme")
            await token.mint(accounts[2].address,ethers.parseEther("5", 'wei'));
            await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
            await sebu.connect(accounts[2]).pitch(samplePitch.target);
            await sebu.connect(shepard).setRanking(51);
            await sebu.connect(guardian).closeRound()
            await samplePitch.mint(shepard.address,ethers.parseEther("100", 'wei'))
            await samplePitch.connect(shepard).approve(fundingContract.target,ethers.parseEther("100", 'wei'))
            await fundingContract.connect(shepard).placeBid(i,ethers.parseEther("100", 'wei'))
            await advanceTime(60*60*4)//4hours
            await fundingContract.closeAuction()
            //await portfolio.connect(shepard).newPosition(samplePitch.target,ethers.parseEther("10", 'wei'))
            await portfolio.connect(accounts[3]).mintLPShares(i,[accounts[2].address])
            pitches.push(samplePitch.target)
        }
        await portfolio.getListOfTokens()
        await portfolio.connect(accounts[2]).withdraw(ethers.parseEther("100", 'wei'),pitches)
        await portfolio.connect(accounts[2]).claim(pitches) 
    });

    // it("see get founder size limit", async function() { 
    //     let pitches = [guardian.address]
    //     let samplePitch
    //     let signer
    //     console.log("this is going to take a minute...")
    //     for(let i=1;i<=2000;i++){
    //         samplePitch = await deploy("MockERC20","SampleMeme", "meme")
    //         signer = await ethers.getImpersonatedSigner(ethers.Wallet.createRandom().address);
    //         await guardian.sendTransaction({
    //             to: signer.address,
    //             value: ethers.parseEther(".1", 'wei'),
    //           });
    //         await token.mint(signer.address,ethers.parseEther("5", 'wei'));
    //         await token.connect(signer).approve(sebu.target,ethers.parseEther("5", 'wei'))
    //         await sebu.connect(signer).pitch(samplePitch.target);
    //         await sebu.connect(shepard).setRanking(51);
    //         pitches.push(signer.address)
    //     }
    //     let _arr = await sebu.getFounders()
    //     assert(pitches[1] ==  _arr[1])
    //     assert(pitches[100] ==  _arr[100])
    //     assert(pitches[999] ==  _arr[999])
    // });
});