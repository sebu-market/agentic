import { Pitch, Screening } from "@sebu/db-models";


export const sessionTimeRemainingSeconds = (state: Pitch| Screening): number => {
    const st = state.startTime;
    if(!st) {
        return 0;
    }
    const elapsedSeconds = (Math.floor(Date.now() - st.getTime())) / 1000.0;
    return Math.max(0, state.timeLimitSeconds - elapsedSeconds);
}