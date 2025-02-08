import { ConnectKitButton } from "connectkit";
import { Button } from "@/components/ui/button"

export const ConnectButton = () => {

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <Button onClick={show} variant={isConnected ? "outline" : "default"} className="m-1">
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};