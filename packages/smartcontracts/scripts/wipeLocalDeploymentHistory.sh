
CHAIN_ID=$1;
if [ -z "$CHAIN_ID" ]; then
  echo "Usage: wipeLocalDeploymentHistory.sh <CHAIN_ID>"
  exit 1
fi

CHAIN="chain-${CHAIN_ID}"
rm ./ignition/deployments/$CHAIN/journal.jsonl
