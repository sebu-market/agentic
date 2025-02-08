import { ChatRoom, UserInputPermissions } from "@/components/sebu/chat-room";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Sidebar } from "@/pages/screenings/features/sidebar";
import { queries, usePitch, usePitchMessages, useSendPitchMessage } from "@/queries/pitches";
import { SessionType } from "@/queries/utils/dto";
import { useQueryClient } from "@tanstack/react-query";
import { PitchStatus } from "@sebu/dto";

export interface PitchShowPageProps {
    id: number;
}

export function PitchShowPage(props: PitchShowPageProps) {

    const queryClient = useQueryClient();

    const contextType = SessionType.Pitch;

    const { id } = props;

    const pitchQuery = usePitch(id);
    const messagesQuery = usePitchMessages(id);
    const sendMessage = useSendPitchMessage();

    if (pitchQuery.isLoading) {
        return <div>Loading...</div>
    }

    if (pitchQuery.isError) {
        return <div>Error: {pitchQuery.error.message}</div>
    }


    const pitch = pitchQuery.data;

    if (!pitch) {
        return <div>Screening not found</div>
    }

    const messages = [
        ...(messagesQuery.data?.messages || []),
    ];

    // FIXME: only allow if logged in user == pitch.user
    const inputPermissions = pitch.status === PitchStatus.LIVE
        ? UserInputPermissions.Allow
        : UserInputPermissions.Hidden;

    // TODO-WS: this logic can go away if we bring back ws support
    // refresh the screening if we've received the last message.
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.last && pitch.status === PitchStatus.LIVE) {
        queryClient.invalidateQueries({
            queryKey: queries.pitches,
        });
    }


    return (
        <div className='grid grid-cols-12'>
            <div className='col-span-3'>
                <Sidebar />
            </div>
            <div className='col-span-9 relative'>
                <h1>
                    Pitch {pitch.id}
                </h1>
                <ChatRoom
                    inputPermissions={inputPermissions}
                    contextType={contextType}
                    contextId={id}
                    messages={messages}
                    sendMessage={sendMessage}
                />

                {
                    (pitch.status === PitchStatus.COMPLETED || pitch.status === PitchStatus.EVALUATED) && (
                        <div className="">
                            <h3 className="font-medium">Final Evaluation</h3>
                            <pre>
                                {JSON.stringify(pitch.finalEval, null, 2)}
                            </pre>
                        </div>
                    )
                }

            </div>
        </div>

        // <OrganizationList organizations={organizations} />
    )
}