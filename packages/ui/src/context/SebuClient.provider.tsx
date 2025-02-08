
import { SebuClient } from '@sebu/client';
import React, { createContext } from 'react';
    
export interface SebuClientContextProps {
    client?: SebuClient;
}

export const SebuClientContext = createContext<SebuClientContextProps>({
    client: undefined,
});

export const SebuClientProvider = (props: { client: SebuClient, children: React.ReactNode }) => {
    return (
        <SebuClientContext.Provider value={{ client: props.client }}>
            {props.children}
        </SebuClientContext.Provider>
    );
}