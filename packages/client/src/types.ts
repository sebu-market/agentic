import { Type, type Static } from '@sinclair/typebox';

export enum UserRoles {
    ADMIN = "admin",
    USER = "user",
    PITCH = "pitch",
}

export enum RoundStatus {
    PENDING = "pending",
    IN_PROGRESS = "in-progress",
    COMPLETE = "complete",
}

export enum PitchStatus {
    PENDING = "pending",
    IN_PROGRESS = "in-progress",
    COMPLETE = "complete",
}

export const IContactDTOSchema = Type.Object({
    id: Type.Integer(),
    name: Type.Optional(Type.String()),
    address: Type.String(),
    chainId: Type.Number(),
    roles: Type.Array(Type.Enum(UserRoles)),
});

export type IContactDTO = Static<typeof IContactDTOSchema>;


export const IPitchOverviewSchema = Type.Object({
    id: Type.Integer(),
    name: Type.String(),
    status: Type.Enum(PitchStatus),
    startedAt: Type.String({
        format: 'date-time',
    }),
    endedAt: Type.String({
        format: 'date-time',
    }),
    lastUpdated: Type.String({
        format: 'date-time',
    }),
});

export type IPitchOverview = Static<typeof IPitchOverviewSchema>;

export const IRoundDTOSchema = Type.Object({
    id: Type.Integer(),
    number: Type.Integer(),
    valueUSD: Type.Number(),
    name: Type.String(),
    startsAt: Type.String({
        format: 'date-time',
    }),
    lastUpdated: Type.String({
        format: 'date-time',
    }),
    endsAt: Type.String({
        format: 'date-time',
    }),
    status: Type.Enum(RoundStatus),
});

export type IRoundDTO = Static<typeof IRoundDTOSchema>;