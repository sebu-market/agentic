import { Pitch } from "@sebu/db-models";
import { PaymentMetadataDTOSchema, PitchMetadata, PitchMetadataDTOSchema } from "@sebu/dto";

export const pitchToDTO = (pitch: Pitch): PitchMetadata => {
    const payMeta = pitch.payment
        ? PaymentMetadataDTOSchema.parse(pitch.payment)
        : undefined;

    const tokenMetadata = pitch.tokenMetadata ? {
        chainId: pitch.tokenMetadata.chain,
        symbol: pitch.tokenMetadata.symbol,
        address: pitch.tokenMetadata.address,
        name: pitch.tokenMetadata.name,
        decimals: pitch.tokenMetadata.decimals,
        volume_usd: pitch.tokenMetadata.volume || 0,
        marketCap: pitch.tokenMetadata.market_cap || 0,
        price: pitch.tokenMetadata.price || 0
    } : undefined;

    const founderInfo = pitch.founderInfo ? {
        name: pitch.founderInfo.name,
        role: pitch.founderInfo.role
    } : undefined;

    const projectSummary = pitch.projectSummary ? {
        description: pitch.projectSummary.description,
        projectName: pitch.projectSummary.projectName,
        duplicateScore: pitch.projectSummary.duplicateScore || 0,
        duplicateName: pitch.projectSummary.duplicateName || undefined,
        duplicateDescription: pitch.projectSummary.duplicateDescription || undefined,
    } : undefined;

    return PitchMetadataDTOSchema.parse({
        id: pitch.id,
        timeRemaining: 0,
        status: pitch.status,
        owner_address: pitch.owner.user_wallet,
        sourceScreeningId: pitch.screeningId,
        payment: payMeta,
        finalEval: pitch.evaluation,
        tokenMetadata,
        founderInfo,
        projectSummary
    });
}