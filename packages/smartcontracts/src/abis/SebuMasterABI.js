module.exports = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_fee",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_investmentToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_guardian",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_shepard",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_investor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_amt",
          "type": "uint256"
        }
      ],
      "name": "Investment",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_founder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenToPitch",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "pitchId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "feeAmount",
          "type": "uint256"
        }
      ],
      "name": "NewPitch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_founder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenToPitch",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        }
      ],
      "name": "NewPitchQueued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_founder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "_tokenToPitch",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        }
      ],
      "name": "NewPitchUp",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_ranking",
          "type": "uint256"
        }
      ],
      "name": "NewTopSlot",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        }
      ],
      "name": "PitchInvalidated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_ranking",
          "type": "uint256"
        }
      ],
      "name": "RankingSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_currentRound",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_sendAmt",
          "type": "uint256"
        }
      ],
      "name": "RoundClosed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "closeRound",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentRound",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentSlot",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "founders",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fundingContract",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_founder",
          "type": "address"
        }
      ],
      "name": "getFounderToSlotByRound",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getFounders",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_lp",
          "type": "address"
        }
      ],
      "name": "getInvestmentShare",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_share",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getQueueLength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getRoundInvestors",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getRoundToFees",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_lp",
          "type": "address"
        }
      ],
      "name": "getRoundToInvestment",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getRoundToTotalInvested",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getRoundTopRankingSlot",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        }
      ],
      "name": "getSlotToRanking",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_ranking",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        }
      ],
      "name": "getSlotToToken",
      "outputs": [
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "guardian",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_portfolio",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_funding",
          "type": "address"
        }
      ],
      "name": "init",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_round",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_slot",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_newTopSlot",
          "type": "uint256"
        }
      ],
      "name": "invalidatePitch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "invest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "investmentToken",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenToPitch",
          "type": "address"
        }
      ],
      "name": "pitch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pitchId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "portfolio",
      "outputs": [
        {
          "internalType": "contract IPortfolio",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_score",
          "type": "uint256"
        }
      ],
      "name": "setRanking",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "shepard",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]