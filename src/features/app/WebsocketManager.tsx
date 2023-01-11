import * as React from "react";

import { useGetMessagesQuery } from "../../services/vibinWebsocket";

export function WebsocketManager() {
    const { data, error, isLoading } = useGetMessagesQuery();

    return <></>;
}
