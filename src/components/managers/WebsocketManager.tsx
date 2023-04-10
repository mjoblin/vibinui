import { FC } from "react";

import { useGetMessagesQuery } from "../../app/services/vibinWebsocket";

const WebsocketManager: FC = () => {
    useGetMessagesQuery(); // Trigger the websocket connection

    return null;
};

export default WebsocketManager;
