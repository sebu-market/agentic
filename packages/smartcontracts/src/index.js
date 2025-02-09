//const {abi: SebuMasterABI} = require('../artifacts/contracts/SebuMaster.sol/SebuMaster.json');

const SebuMasterABI = require("./abis/SebuMasterABI");
const { ChainIds } = require("./deployment/ChainIds");
const { DeploymentSettings } = require("./deployment/DeploymentSettings");
const { HardhatTestKeys } = require("./deployment/HardhatTestKeys");

module.exports = {
    SebuMasterABI,
    deployment: {
        ChainIds,
        DeploymentSettings,
        HardhatTestKeys
    },
    ContractAddresses: {
        [44444]: {
    
            SebuMaster: "0x2bf192ec303b1b5d9f5d2887e337e9e8401ef471",
            Funding: "0xb72d0382262f29c9d0b1290ef880691810acc460",
            Portfolio: "0x1e011a7fe24aa92b2623eb6efee51e640a109236",
            PayToken: "0xaf88d065e77c8cc2239327c5edb3a432268e5831"
        },
        [84532]: {
            SebuMaster: "0x89fa63e70e4da6640837b55f50fa675edcf76fc6",
            Funding: "0x17a8b545e40edc0b78447f1fca22c21a2370121c",
            Portfolio: "0x4d17b4c7d28fd2c8a7a523e81965271f2ecee939",
            PayToken: "0x036cbd53842c5426634e7929541ec2318f3dcf7e"
        }
    }
};