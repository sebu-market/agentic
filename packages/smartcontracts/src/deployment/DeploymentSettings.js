const { ChainIds } = require("./ChainIds");
const { HardhatTestKeys } = require("./HardhatTestKeys");

const TDG = '0x0616Ab4786C29d0e33F9cCe808886211F7C80D35';
const GUARDIAN = "0xB602fd228b95C7cf8b0bcd1557bDaD2EC3fb8A21";

module.exports = {

    DeploymentSettings: {
        common: {
            lpTokenName: "SebuLP",
            lpTokenSymbol: "SLP",
        },
        [ChainIds.LocalTestnet]: {
            pitchFee: BigInt(5e6),
            investmentToken: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", //usdc on arbitrum
            guardian: HardhatTestKeys[0].address, //foundation key
            shepard: HardhatTestKeys[1].address, //ai agent key
        },
        
        [ChainIds.BaseSepolia]: {
            pitchFee: BigInt(5e6),
            investmentToken: "0x036cbd53842c5426634e7929541ec2318f3dcf7e", //usdc
            guardian: GUARDIAN, //foundation key
            shepard: TDG, //ai agent key
        },
        
        [ChainIds.BaseMainnet]: {
            pitchFee: BigInt(5e6),
            investmentToken: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", //usdc
            guardian: GUARDIAN, //foundation key
            shepard: TDG, //ai agent key
        }
    }
}