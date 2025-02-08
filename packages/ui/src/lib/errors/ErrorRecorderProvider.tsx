import React from "react";
import { ErrorRecorder } from "./ErrorRecorder";

export const ErrorRecorderContext = React.createContext<ErrorRecorder | undefined>(undefined);

export const useErrorRecorder = () => {
    const recorder = React.useContext(ErrorRecorderContext);
    if (!recorder) {
        throw new Error('useErrorRecorder must be used within a ErrorRecorderProvider');
    }
    return recorder;
}

export type ErrorRecorderProviderProps = {
    recorder: ErrorRecorder;
    children: React.ReactNode;
}

export const ErrorRecorderProvider = ({
  recorder,
  children,
}: ErrorRecorderProviderProps): React.JSX.Element => {
  return (
    <ErrorRecorderContext.Provider value={recorder}>
      {children}
    </ErrorRecorderContext.Provider>
  )
}