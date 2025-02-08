import { allBlockchainTools } from './blockchain';
import { allDuplicationTools } from './duplication';
import { allSocialTools } from './social';
import { allTokenMetaTools } from './token-meta';

export * from './blockchain';
export * from './token-meta';

export const allTools = [
    ...allBlockchainTools,
    ...allTokenMetaTools,
    ...allDuplicationTools,
    ...allSocialTools
]