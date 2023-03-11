import React, { FC, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { useGetMessagesQuery } from "../../app/services/vibinWebsocket";
import { setWebsocketStatus } from "../../app/store/internalSlice";

const WebsocketManager: FC = () => {
    const { data } = useGetMessagesQuery(); // Trigger the websocket connection
    const dispatch = useAppDispatch();

    const vibinWebsocketStatus = useAppSelector((state: RootState) => {
        const websocketQuery =
            state.vibinWebsocket.queries &&
            Object.values(state.vibinWebsocket.queries).find(
                (query: any) => query.endpointName === "getMessages"
            );

        return websocketQuery?.status;
    });

    useEffect(() => {
        dispatch(setWebsocketStatus(vibinWebsocketStatus));
    }, [dispatch, vibinWebsocketStatus]);

    return null;
};

export default WebsocketManager;
