import React, { FC } from "react";

import { useGetMessagesQuery } from "../../app/services/vibinWebsocket";

const WebsocketManager: FC = () => {
    const { data } = useGetMessagesQuery(); // Trigger the websocket connection

    return null;
};

export default WebsocketManager;
