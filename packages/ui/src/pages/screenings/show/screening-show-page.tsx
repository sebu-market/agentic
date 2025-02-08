import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/pages/screenings/features/sidebar";
import { useMakePayment, usePitch } from "@/queries/pitches";
import { queries, useScreening, useScreeningMessages, useSendScreeningMessage } from "@/queries/screenings";
import { SessionType } from "@/queries/utils/dto";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PitchStatus, ScreeningStatus } from "@sebu/dto";
import { AlertCircle } from "lucide-react";
import { ChatRoom, UserInputPermissions } from "../../../components/sebu/chat-room";

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { PaymentModal } from "../features/payment-modal";
import { useState } from "react";

export interface ScreeningShowPageProps {
    id: number;
}

export function ScreeningShowPage(props: ScreeningShowPageProps) {

    const contextType = SessionType.Screening;
    const { id } = props;

    const [refreshInterval, setRefreshInterval] = useState(1_000);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const screeningQuery = useScreening(id);
    const messagesQuery = useScreeningMessages(id);
    const pitchQuery = usePitch(screeningQuery.data?.nextPitchId);
    const makePayment = useMakePayment();
    const sendMessage = useSendScreeningMessage();

    const screening = screeningQuery.data;
    const messages = messagesQuery.data?.messages || [];

    if (screeningQuery.isLoading) {
        return <div>Loading...</div>
    }

    if (screeningQuery.isError) {
        return <div>Error: {screeningQuery.error.message}</div>
    }

    if (!screening) {
        return <div>Screening not found</div>
    }

    // TODO-WS: this logic can go away if we bring back ws support
    // refresh the screening if we've received the last message.
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.last && screening.status === ScreeningStatus.LIVE) {
        queryClient.invalidateQueries({
            queryKey: queries.screenings._def.keys(),
        });
    } else if(lastMessage?.role === 'assistant' && lastMessage?.content.indexOf("::PAYMENT::") >= 0) {
        queryClient.invalidateQueries({
            queryKey: queries.screenings._def.keys(),
        });
    }

    const inputPermissions = screening.status == ScreeningStatus.LIVE || screening.status == ScreeningStatus.PENDING_PAYMENT
        ? UserInputPermissions.Allow
        : UserInputPermissions.Hidden;

    const pitch = pitchQuery.data;

    return (
        <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-3'>
                <Sidebar />
            </div>
            <div className='col-span-9'>
                <div className='flex flex-col items-center pb-4'>
                    <Breadcrumb className='grow' />
                    <h1 className='text-2xl font-bold'>
                        Welcome to Pre-Screening
                    </h1>
                    <p>
                        You must complete a basic pre-screening with Aime before you can pitch your project to Sebu.
                    </p>
                </div>
                <div className='col-span-9'>

                    <ChatRoom
                        inputPermissions={inputPermissions}
                        contextType={contextType}
                        contextId={id}
                        messages={messages}
                        sendMessage={sendMessage}
                    />

                </div>

                <div className="pt-4">

                    {(screening.status == ScreeningStatus.ACCEPTED ||
                        screening.status == ScreeningStatus.PENDING_PAYMENT
                    ) && (
                        pitch && (
                            <Alert variant="default">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>
                                    Success!
                                    <Button
                                        className="float-right"
                                        variant={'secondary'}
                                        size={'sm'}
                                        onClick={() => navigate({ to: `/pitches/${pitch.id}` })}
                                    >
                                        { pitch.status === PitchStatus.LIVE ? 'Start Pitch' : 'View Pitch' }
                                    </Button>

                                </AlertTitle>
                                <AlertDescription>
                                    <p className="py-2">
                                        Your have passed the screening process!
                                    </p>
                                </AlertDescription>
                            </Alert>
                        ) || (
                            <div className="text-center font-bold">
                                Congratulations, You're in! Make payment to secure your spot.
                                <br />

                                <PaymentModal screening={screening}/>
                                
                            </div>
                        )
                    )}

                    {screening.status == ScreeningStatus.REJECTED && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Fail</AlertTitle>
                            <AlertDescription>
                                Your project has not passed the screening process. Please try again.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

        </div>
        // <OrganizationList organizations={organizations} />
    )
}