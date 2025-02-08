// FIXME: move to dto
export enum MessageRole {
    Assistant = "assistant",
    User = "user",
};

export enum MessageSender {
    Sebu = "sebu",
    Aime = "aime",
    User = "user",
};

// only used client side
export enum SessionType {
    Screening = "screening",
    Pitch = "pitch",
};