
export default async (): Promise<any> => {

    return {
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
        coingecko: {
            chainId: process.env.CGECKO_CHAIN_ID || 42161,
            token_network: process.env.COINGECKO_TOKEN_NETWORK || "arbitrum",
            api_key: process.env.COINGECKO_API_KEY
        },
        rpc: {
            chainId: Number(process.env.CHAIN_ID||0),
            url: process.env.RPC_URL
        },
        rounds: {
            durationSeconds: Number(process.env.ROUND_DURATION_SECONDS||86400),
        }
    }
};