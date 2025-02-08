"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function SignPurchase({ onSend, onComplete }: { onSend: () => Promise<any>, onComplete: () => void }) {
  const [isSigning, setIsSigning] = useState(false)

  const handleSign = async () => {
    setIsSigning(true);
    await onSend();
    setIsSigning(false);
    onComplete();
  }
  
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-4">Sign Purchase Transaction</h3>
      <p className="mb-4">Please sign the transaction to complete your purchase.</p>
      <Button onClick={handleSign} disabled={isSigning}>
        {isSigning ? "Signing..." : "Sign Purchase"}
      </Button>
    </div>
  )
}

