import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TransactionWizard } from "./payment-modal/transaction-wizard";
import { ScreeningMetadata } from "@sebu/dto";



export type PaymentModalProps = {
    screening: ScreeningMetadata;
}

enum PaymentState {
    WAITING_FOR_USER_INPUT = "WAITING_FOR_USER_INPUT",
    WAITING_FOR_TXN_SIGNATURE = "WAITING_FOR_TXN_SIGNATURE",
    WAITING_FOR_TXN_CONFIRMATION = "WAITING_FOR_TXN_CONFIRMATION",
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
    PAYMENT_FAILED = "PAYMENT_FAILED",
}

export function PaymentModal({
    screening
}: PaymentModalProps) {

    const [paymentState, setPaymentState] = useState(PaymentState.WAITING_FOR_USER_INPUT);
    // onClick={() => { makePayment.mutate({ id: pitch.id }) }}

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="border-2 inline-flex relative"
                    variant={"outline"}

                >
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex size-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                    </span>
                    Make Payment
                </Button>


            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <TransactionWizard screening={screening} />
            </DialogContent>
        </Dialog>
    );
}