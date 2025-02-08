#!/usr/bin/env bash

NETWORK=$1;
if [ -z "$NETWORK" ]; then
    echo "Please provide a network";
    exit 1;
fi
CWD=`pwd`
echo "Deploying to $NETWORK from $CWD"

MODULES=(./ignition/modules/Root.module.js)

for module in ${MODULES[@]};
do
    yarn deploy $module --network $NETWORK
done
