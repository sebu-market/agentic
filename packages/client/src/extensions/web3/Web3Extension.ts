import { ContractAddresses } from "../../ContractAddresses";
import { AClientExtension } from "../AClientExtension";
import { Contract, Provider, Signer } from "ethers";
import SebuMasterABI from "../../abis/SebuMasterABI";

const ERC20ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
];

export interface IWeb3Props {
    chainId: number;
    address: string;
    signer: Signer;
}

export class Web3Extension extends AClientExtension {

    signer?: Signer;
    provider?: Provider;

    walletAddress?: string;
    chainId?: number;

    sebuMasterContract?: Contract;
    paymentTokenContract?: Contract;

    getSebuMasterAddress(): string | null {
        if(!this.chainId) {
            return null;
        }
        const addys = ContractAddresses[this.chainId];
        return addys.SebuMaster;
    }

    getPaymentTokenAddress(): string | null {
        if(!this.chainId) {
            return null;
        }
        const addys = ContractAddresses[this.chainId];
        return addys.PayToken;
    }

    getSebuMasterABI(): any[] {
        return SebuMasterABI;
    }

    getPaymentTokenABI(): any[] {
        return ERC20ABI;
    }

    async setAddressAndProvider(props: IWeb3Props): Promise<void> {
        const { chainId, address, signer } = props;
        this.signer = signer;
        this.provider = signer.provider;
        this.walletAddress = address;
        this.chainId = chainId;
        
        //await this.signer.provider.getNetwork().then((network) => {
          //  this.chainId = +(network.chainId.toString());
            const addys = ContractAddresses[this.chainId];
            
            if(!addys) {
                throw new Error("Unsupported chainId: " + this.chainId);
            }
            this.sebuMasterContract = new Contract(
                addys.SebuMaster,
                SebuMasterABI,
                signer
            );

            this.paymentTokenContract = new Contract(
                addys.PayToken,
                ERC20ABI,
                signer
            );
        //});
    }
}