import { FC } from "react";

import { useGetMessagesQuery } from "../../app/services/vibinWebsocket";

// ================================================================================================
// Initiate the WebSocket connection to the vibin backend.
//
// Note: The actual WebSocket message handling is implemented in app/services/vibinWebsocket.ts
// ================================================================================================

const WebsocketManager: FC = () => {
    useGetMessagesQuery(); // Trigger the websocket connection

    return null;
};

export default WebsocketManager;
