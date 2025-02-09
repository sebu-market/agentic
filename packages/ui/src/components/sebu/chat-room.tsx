"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatBubble, ChatBubbleAction, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { MessageRole, MessageSender } from "@/queries/utils/dto";
import { Message, MessageResponseDTO, MessageSendRequest } from '@sebu/dto';

import sebuAvatarUrl from '@/assets/images/avatars/sebu.png';
import aimeAvatarUrl from '@/assets/images/avatars/aime.png';
import userAvatarUrl from '@/assets/images/avatars/human.png';

const Avatars: Record<MessageSender, string> = {
    [MessageSender.Aime]: aimeAvatarUrl,
    [MessageSender.Sebu]: sebuAvatarUrl,
    [MessageSender.User]: userAvatarUrl,
} as const;

console.log({
    Avatars,
})

import { AnimatePresence, motion } from "framer-motion";
import {
    CopyIcon,
    CornerDownLeft,
    RefreshCcw,
    Volume2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSendPitchMessage } from "@/queries/pitches";
import { UseMutationResult } from "@tanstack/react-query";
import Markdown from 'react-markdown'

const ChatAiIcons: Array<{ icon: any; label: string }> = [
    // {
    //     icon: CopyIcon,
    //     label: "Copy",
    // },
    // {
    //     icon: RefreshCcw,
    //     label: "Refresh",
    // },
    // {
    //     icon: Volume2,
    //     label: "Volume",
    // },
];

export enum UserInputPermissions {
    Allow = "allow",
    Disabled = "disabled",
    Hidden = "hidden",
}

export type ChatRoomProps = {
    contextType: string;
    contextId: number;
    messages: Array<Message>;
    inputPermissions: UserInputPermissions;
    sendMessage: UseMutationResult<MessageResponseDTO, Error, MessageSendRequest, unknown>;
};

export function ChatRoom({ contextType, contextId, messages, inputPermissions, sendMessage }: ChatRoomProps) {

    console.log(`rendering ${contextType} chat room with ${messages.length} messages`);
    // const send = useReactQuerySubscription();

    const [input, setInput] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    }

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const getMessageVariant = (role: string) =>
        role === MessageRole.Assistant ? "received" : "sent";
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;

        const req: MessageSendRequest = {
            sessionId: contextId,
            content: input,
            lastId: 0,
        };

        console.log("Sending message", req);

        sendMessage.mutate(req);

        setInput("");
        formRef.current?.reset();
    };

    return (
        <div className="flex w-full flex-col h-[500px]">
            <div className="flex-1 w-full bg-muted/40 overflow-y-auto">
                <ChatMessageList ref={messagesContainerRef}  >
                    {/* Chat messages */}
                    <AnimatePresence>
                        {messages.filter((it) => it.isInjected == false).map((message, index) => {
                            const variant = getMessageVariant(message.role);
                            const isLoading = message.content === ""
                                && message.role === MessageRole.Assistant
                                && index === messages.length - 1;
                            return (
                                <motion.div
                                    key={message.id}
                                    layout
                                    initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                    exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                                    transition={{
                                        opacity: { duration: 0.1 },
                                        layout: {
                                            type: "spring",
                                            bounce: 0.3,
                                            duration: index * 0.05 + 0.2,
                                        },
                                    }}
                                    style={{ originX: 0.5, originY: 0.5 }}
                                    className="flex flex-col gap-2 p-4"
                                >
                                    <ChatBubble key={message.id} variant={variant}>
                                        <Avatar>
                                            <AvatarImage
                                                src={Avatars[message.sender as MessageSender] || ""}
                                                alt="Avatar"
                                                className={message.role === MessageRole.Assistant ? "dark:invert" : ""}
                                            />
                                            <AvatarFallback>
                                                {message.role === MessageRole.Assistant ? "" : "USER"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChatBubbleMessage isLoading={isLoading}>
                                            <Markdown>
                                            {message.content}
                                            </Markdown>
                                            {message.role === MessageRole.Assistant && (
                                                <div className="flex items-center mt-1.5 gap-1">
                                                    {!isLoading && (
                                                        <>
                                                            {ChatAiIcons.map((icon, index) => {
                                                                const Icon = icon.icon;
                                                                return (
                                                                    <ChatBubbleAction
                                                                        variant="outline"
                                                                        className="size-6"
                                                                        key={index}
                                                                        icon={<Icon className="size-3" />}
                                                                        onClick={() =>
                                                                            console.log(
                                                                                "Action " +
                                                                                icon.label +
                                                                                " clicked for message " +
                                                                                index,
                                                                            )
                                                                        }
                                                                    />
                                                                );
                                                            })}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </ChatBubbleMessage>
                                    </ChatBubble>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </ChatMessageList>
            </div>
            <div className="px-4 pb-4 bg-muted/40">
                {inputPermissions !== UserInputPermissions.Hidden && (
                    <form
                        ref={formRef}
                        onSubmit={handleSendMessage}
                        className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
                    >
                        <ChatInput
                            disabled={inputPermissions === UserInputPermissions.Disabled}
                            ref={inputRef}
                            onKeyDown={handleKeyDown}
                            onChange={handleInputChange}
                            placeholder="Type your message here..."
                            className="min-h-12 resize-none rounded-none bg-background border-0 p-2 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex items-center p-3 pt-0">
                            {/* <Button variant="ghost" size="icon">
                            <Paperclip className="size-4" />
                            <span className="sr-only">Attach file</span>
                        </Button>

                        <Button variant="ghost" size="icon">
                            <Mic className="size-4" />
                            <span className="sr-only">Use Microphone</span>
                        </Button> */}

                            <Button
                                disabled={!input.trim() || inputPermissions === UserInputPermissions.Disabled}
                                type="submit"
                                size="sm"
                                className="ml-auto gap-1.5"
                            >
                                Send Message
                                <CornerDownLeft className="size-3.5" />
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}