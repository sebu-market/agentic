import { ContractAddresses } from "../../ContractAddresses";
import { AClientExtension } from "../AClientExtension";
import {TransactionRequest} from "ethers";

export type PaymentToken = {
    symbol: string;
    address: string;
    decimals: number;
}

export type IEncodedTransaction = {
    to: string;
    data: string;
}

export class PaymentExtension extends AClientExtension {

    
    async getAllowance(): Promise<bigint> {
        return await this.client.web3.paymentTokenContract.allowance(
            this.client.web3.walletAddress,
            this.client.web3.sebuMasterContract.address
        );
    }
    
    async getFeeToken(): Promise<PaymentToken | null> {
        if(!this.client.web3.chainId) {
            return null;
        }
        const addys = ContractAddresses[this.client.web3.chainId];
        return {
            symbol: "USDC",
            address: addys.PayToken,
            decimals: 6,
        }
    }

    async getCurrentPitchFee(): Promise<bigint> {
        const ql = await this.client.web3.sebuMasterContract.getQueueLength();
        const fee = await this.client.web3.sebuMasterContract.fee();
        return fee * (2n ** BigInt(ql));
    }

    //=========== MUTATION TXNS =====================//
    approvalTransaction(amount?: bigint): IEncodedTransaction | null {
        
        amount = amount || BigInt(5e6) * 2n;
        const sebu = this.client.web3.getSebuMasterAddress();
        if(!sebu) {
            return null;
        }
        return {
            to: this.client.web3.getPaymentTokenAddress(),
            data: this.client.web3.paymentTokenContract.interface.encodeFunctionData("approve", [sebu, amount])
        }
    }

    payForPitchTxn(pitchedTokenAddress: string): IEncodedTransaction  | null {
        if(!this.client.web3.sebuMasterContract) {
            return null;
        }
        return {
            to: this.client.web3.getSebuMasterAddress(),
            data: this.client.web3.sebuMasterContract.interface.encodeFunctionData("pitch", [ pitchedTokenAddress ])
        };
    }
}