import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useAdvanceRound, useSetRanking } from "@/queries/guardian";
import React from "react";

export interface GuardianIndexPageProps {
    id?: number;
}

export function GuardianIndexPage(_: GuardianIndexPageProps) {

    const [logMessage, setLogMessage] = React.useState<string>('');
    const advanceRound = useAdvanceRound();
    const setRanking = useSetRanking();


    async function handleAdvanceRound() {
        const response = await advanceRound.mutateAsync();
        setLogMessage(response.content);
    }

    async function handleSetRanking() {
        const response = await setRanking.mutateAsync();
        setLogMessage(response.content);
    }

    return (
        <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-12'>
                <div className='p-4'>
                    <Breadcrumb className='grow' />
                    <h1 className='text-2xl'>Guardian</h1>

                    <h2 className='text-md py-4'>Actions</h2>
                    <ul>
                        <li>
                            <Button onClick={handleAdvanceRound}>Advance Round</Button>
                        </li>
                        <li>
                            <Button onClick={handleSetRanking}>Set Ranking</Button>
                        </li>
                    </ul>



                    <h2 className='text-md py-4'>Logs</h2>
                    <pre>
                        {logMessage}
                    </pre>


                </div>
            </div>


        </div>
    )
}