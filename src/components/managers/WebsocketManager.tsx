import React, { FC } from "react";

import { useGetMessagesQuery } from "../../app/services/vibinWebsocket";

const WebsocketManager: FC = () => {
    const { data, error, isLoading } = useGetMessagesQuery();

    return <></>;
}

export default WebsocketManager;
