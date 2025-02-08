"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export type WaitForTransactionProps = {
    onComplete: () => void;
    hash: string;
}

export function WaitForTransaction(props: WaitForTransactionProps) {
    const { onComplete, hash } = props

    useEffect(() => {
        if (hash) {
            onComplete()
        }
    }, [hash])

    return (
        <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">
                <Loader2 className="h-6 w-6 mr-2 animate-spin inline-block" />
                Waiting for Transaction
            </h3>
            <p>Please wait while your transaction is being confirmed...</p>
        </div>
    )
}

