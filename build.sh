#!/usr/bin/env sh

yarn clean

yarn workspaces foreach --exclude @sebu/ui --all --topological --parallel  run build