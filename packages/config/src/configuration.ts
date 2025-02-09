
export default async (): Promise<any> => {

    return {
        cookies: {
            auth: {
                password: process.env.AUTH_COOKIE_PASSWORD
            }
        },
        ai: {
            llm_provider: process.env.LLM_PROVIDER || 'openai',
            apiKey: process.env.AI_API_KEY,
            embeddingApiKey: process.env.EMBEDDING_API_KEY,
        },
        aime: {
            screening: {
                promptKey: process.env.AIME_SCREENING_PROMPT_KEY || '/aime/role/screening/prompt',
            },
            assistant: {
                promptKey: process.env.AIME_ASSISTANT_PROMPT_KEY || '/aime/role/assistant/prompt',
            },
            evaluation: {
                timeLimitMinutes: Number(process.env.AIME_EVALUATION_TIME_LIMIT_MINUTES || 5),
            }
        },
        sebu: {
            investor: {
                promptKey: process.env.SEBU_INVESTOR_PROMPT_KEY || '/sebu/role/investor/prompt',
            },
            evaluation: {
                timeLimitMinutes: Number(process.env.SEBU_EVALUATION_TIME_LIMIT_MINUTES || 10),
            }
        },
        aws: {
            region: process.env.AWS_REGION || 'us-east-1',
            sqs: {
                local: {
                    url: process.env.LOCAL_SQS_POST_URL || 'http://localhost:5172/agent/send',
                },
                queues: {
                    agentRunnerQueue: process.env.SQS_AGENT_MESSAGE_QUEUE || 'agent-message-queue',
                }
            }
        },
        coingecko: {
            chainId: process.env.CGECKO_CHAIN_ID || 42161,
            token_network: process.env.COINGECKO_TOKEN_NETWORK || "arbitrum",
            api_key: process.env.COINGECKO_API_KEY
        },
        addresses: {
            usdc: process.env.USDC_ADDRESS,
            weth: process.env.WETH_ADDRESS,
            uniswapV3Factory: process.env.UNIV3_FACTORY_ADDRESS,
            usdc_weth_pool: process.env.USDC_WETH_POOL
        },
        rpc: {
            chainId: Number(process.env.CHAIN_ID||0),
            url: process.env.RPC_URL,
            [44444]: {
                url: process.env.LOCAL_RPC_URL || 'http://localhost:8545',
            }, 
            [84532]: {
                url: process.env.SEPOLIA_RPC_URL,
            }
        },
        contracts: {
            sebuMaster: process.env.SEBU_MASTER_ADDRESS,
            sebuPortfolio: process.env.SEBU_PORTFOLIO_ADDRESS, 
            lpToken: process.env.SEBU_LP_TOKEN_ADDRESS, 
        },
        rounds: {
            durationSeconds: Number(process.env.ROUND_DURATION_SECONDS||86400),
        }
    }
};