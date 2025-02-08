"use client"

import { useApprovePaymentAllowance, useFeeToken, usePayForPitch, usePitchFee } from "@/queries/blockchain"
import { MessageSendRequest, ScreeningMetadata } from "@sebu/dto"
import { useCallback, useState } from "react"
import { PaymentSummary } from "./payment-summary"
import { SignAllowance } from "./sign-allowance"
import { SignPurchase } from "./sign-purchase"
import { Stepper } from "./stepper"
import { WaitForTransaction } from "./wait-for-transaction"
import { useSendScreeningMessage } from "@/queries/screenings"
import { useChainId } from "wagmi"

const steps = ["Sign Spend Allowance", "Wait for Allowance", "Sign Purchase", "Wait for Purchase"]
export type ScreeningMetadataWithTokenMetadata = Omit<ScreeningMetadata, 'tokenMetadata'> & {
    tokenMetadata: NonNullable<ScreeningMetadata['tokenMetadata']>;
};


export type TransactionPlan = {
    pitchFee: bigint;
    feeToken: {
        address: string;
        symbol: string;
        decimals: number;
    }
    // approvalGasEstimate: bigint;
    // pitchPaymentGasEstimate: bigint;
}

export type TransactionWizardProps = {
    screening: ScreeningMetadataWithTokenMetadata;
}

export function TransactionWizard(props: TransactionWizardProps) {

    const { screening } = props;
    const { tokenMetadata } = screening;

    const [currentStep, setCurrentStep] = useState(0)
    const [isCompleted, setIsCompleted] = useState(false)

    const handleNextStep = useCallback(() => {
        setCurrentStep((prevStep) => prevStep + 1)

        if (currentStep == steps.length - 1) {
            setIsCompleted(true);

            const req: MessageSendRequest = {
                sessionId: screening.id,
                content: `
                action: payment
                chainId: ${chainId} 
                hash: ${payForPitchHandler.hash}`,
                lastId: 0,
            };

            sendMessage.mutate(req);
        }
    }, [currentStep]);

    const feeTokenQuery = useFeeToken();
    const feeToken = feeTokenQuery.data;

    const pitchFeeQuery = usePitchFee();
    const pitchFee = pitchFeeQuery.data;

    const approvePaymentAllowanceHandler = useApprovePaymentAllowance(pitchFee ? pitchFee * 2n : 0n);
    const payForPitchHandler = usePayForPitch(tokenMetadata.address);
    const sendMessage = useSendScreeningMessage();
    const chainId = useChainId();

    // const approvalGasEstimateQuery = useApprovalCost(pitchFee ? pitchFee * 2n : 0n);
    // const approvalGasEstimate = approvalGasEstimateQuery.data;
    // const pitchPaymentGasEstimateQuery = usePayForPitchCost(tokenMetadata.address);
    // const pitchPaymentGasEstimate = pitchPaymentGasEstimateQuery.data;

    console.log({
        feeToken,
        screening,
        tokenMetadata,
        pitchFee,
        tokenAllowanceHash: approvePaymentAllowanceHandler.hash,
        tokenPaymentHash: payForPitchHandler.hash,
        // approvalGasEstimate,
        // pitchPaymentGasEstimate
    })

    if ((!feeToken) || (!screening) || (!tokenMetadata) || (!pitchFee)) {
        return null;
    }

    const txnPlan: TransactionPlan = {
        pitchFee,
        feeToken,
        // approvalGasEstimate,
        // pitchPaymentGasEstimate,
    };

    const renderStepContent = () => {
        // return null;
        switch (currentStep) {
            case 0:
                return <SignAllowance onComplete={handleNextStep} onSend={approvePaymentAllowanceHandler.send} />
            case 1:
                return <WaitForTransaction onComplete={handleNextStep} hash={approvePaymentAllowanceHandler.hash} />
            case 2:
                return <SignPurchase onComplete={handleNextStep} onSend={payForPitchHandler.send} />
            case 3:
                return <WaitForTransaction onComplete={handleNextStep} hash={payForPitchHandler.hash} />
            default:
                return null
        }
    }

    return (
        <div>
            <PaymentSummary screening={screening} txnPlan={txnPlan} />
            <div className="flex mt-6">
                <div className="w-1/2 pr-6 border-r">
                    <Stepper currentStep={currentStep} steps={steps} />
                </div>
                <div className="w-1/2 pl-6">
                    {renderStepContent()}
                    {isCompleted && (
                        <div className="mt-4 text-center text-green-600 font-bold">Transaction completed successfully!</div>
                    )}
                </div>
            </div>
        </div>
    )
}

