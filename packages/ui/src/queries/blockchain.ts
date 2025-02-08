import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { sebuClient } from "./client";
import { useQuery } from "@tanstack/react-query";
import { useEstimateGas, useSendTransaction } from "wagmi";
;

export const queries = createQueryKeyStore({
    blockchain: {
        currentPitchFee: () => ({
            queryKey: ['currentPitchFee'],
            queryFn: async () => {
                if (!sebuClient.web3.provider) return 0n;
                console.log("Getting pitch fee");
                return sebuClient.payment.getCurrentPitchFee();
            }
        }),
        paymentAllowance: () => ({
            queryKey: ['approvedPaymentAllowance'],
            queryFn: async () => {
                if (!sebuClient.web3.provider) return 0n;
                console.log("Getting payment allowance");
                return sebuClient.payment.getAllowance();
            }
        }),
        getFeeToken: () => ({
            queryKey: ['paymentFeeToken'],
            queryFn: async () => {
                if (!sebuClient.web3.provider) return null;
                return sebuClient.payment.getFeeToken();
            }
        })
    },
});

//================= READ QUERIES ====================//
export const usePitchFee = () => {
    return useQuery({
        ...queries.blockchain.currentPitchFee(),
        enabled: Boolean(sebuClient.web3.provider),
    });
}

/**
 * Fetches current spend allowance
 * @returns 
 */
export const usePaymentAllowance = () => {
    return useQuery({
        ...queries.blockchain.paymentAllowance(),
        enabled: Boolean(sebuClient.web3.provider),
    });
}

export const useFeeToken = () => {
    return useQuery({
        ...queries.blockchain.getFeeToken(),
        enabled: Boolean(sebuClient.web3.provider),
    });
}

//================ ESTIMATES ===================//

export const useApprovalCost = (amount: bigint) => {
    const encoded = sebuClient.payment.approvalTransaction(amount);
    // if(!encoded) return 0n;
    // if(!encoded.to || !encoded.data) return 0n;
    return useEstimateGas({
        to: encoded?.to as `0x${string}`,
        data: encoded?.data as `0x${string}`,
    });
}

export const usePayForPitchCost = (tokenAddress: string) => {
    const encoded = sebuClient.payment.payForPitchTxn(tokenAddress);
    // if(!encoded) return 0n;
    // if(!encoded.to || !encoded.data) return 0n;
    return useEstimateGas({
        to: encoded?.to as `0x${string}`,
        data: encoded?.data as `0x${string}`,
    });
}

//================ MUTATIONS ===================//
export const useApprovePaymentAllowance = (amount: bigint) => {
    const r = useSendTransaction();
    const sendIt = async () => {
        const txn = await sebuClient.payment.approvalTransaction(amount);
        if(!txn) {
            return null;
        }
        if(!txn.to || !txn.data) return 0n;
        return r.sendTransactionAsync({
            to: txn.to as `0x${string}`,
            data: txn.data as `0x${string}`,
        });
    };
    return {
        send: sendIt,
        hash: r.data
    }
}

export const usePayForPitch = (tokenAddress: string) => {
    const r = useSendTransaction();
    const sendIt = async () => {
        const txn = await sebuClient.payment.payForPitchTxn(tokenAddress);
        if(!txn) {
            return null;
        }
        if(!txn.to || !txn.data) return 0n;
        return r.sendTransactionAsync({
            to: txn.to as `0x${string}`,
            data: txn.data as `0x${string}`,
        });
    };
    return {
        send: sendIt,
        hash: r.data
    }
}