
const ethers = require('ethers');
const { ContractAddresses } = require('.');

const initSebu = async () => {

    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const wk = process.env.GUARDIAN_KEY;

    if(!rpcUrl) throw new Error("No RPC URL");
    if(!wk) throw new Error("No guardian key");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const guardian = new ethers.Wallet(wk, provider);
    const SebuMaster = require("./abis/SebuMasterABI");
    const sebuAddress = ContractAddresses[84532].SebuMaster;
    const sebu = new ethers.Contract(sebuAddress, SebuMaster, guardian);
    const funding = ContractAddresses[84532].Funding;
    const portfolio = ContractAddresses[84532].Portfolio;
    console.log("Initializing SebuMaster with", portfolio, funding);
    const txn = await sebu.init(portfolio, funding);
    const r = await txn.wait();
    console.log("Init result", r);
}

initSebu();