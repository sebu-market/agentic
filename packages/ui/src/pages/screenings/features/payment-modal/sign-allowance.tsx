"use client"

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SignAllowance({ onSend, onComplete }: { onSend: () => Promise<any>, onComplete: () => void }) {
  const [isSigning, setIsSigning] = useState(false);

  const handleSign = async () => {
    setIsSigning(true);
    await onSend();
    setIsSigning(false);
    onComplete();
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Sign Spend Allowance</h3>
      <p className="mb-4">Please sign the transaction to approve the spend allowance.</p>
      <Button onClick={handleSign} disabled={isSigning}>
        {isSigning ? "Signing..." : "Sign Allowance"}
      </Button>
    </div>
  )
}

