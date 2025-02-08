import ContractAddresses from "../web3/ContractAddresses";
import { AClientExtension } from "../AClientExtension";

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
        console.log(`Getting pitch queue length from sebu @${this.client.web3.getSebuMasterAddress()}`);
        const ql = await this.client.web3.sebuMasterContract.getQueueLength();
        console.log(`Queue length: ${ql}`);
        const fee = await this.client.web3.sebuMasterContract.fee();
        console.log(`Fee: ${fee}`);
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