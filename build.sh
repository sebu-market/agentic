#!/usr/bin/env sh

yarn clean

yarn workspaces foreach --all --topological --parallel  run build