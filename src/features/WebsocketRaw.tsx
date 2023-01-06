import * as React from "react";
import { useGetMessagesQuery } from "../services/vibinWebsocket";

export function WebsocketRaw() {
    const { data, error, isLoading } = useGetMessagesQuery();

    return (
        <div className="WebsocketRaw">
            Messages: {data?.length || 0}
            <p />
            <div>
                {data?.map((message) => (
                    <div key={message.id}>{JSON.stringify(message)}</div>
                ))}
            </div>
        </div>
    );
}
