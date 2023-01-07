import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// import { isMessage } from "./schemaValidators";
import {
    setAudioSources,
    setPlayStatus,
} from "../features/playback/playbackSlice";

export interface Message {
    // id: number;
    // channel: Channel;
    // userName: string;
    // text: string;

    id: string;
    streamer: string;
    vibin: string;
}

// TODO: Can this be localhost
const HOSTNAME = "192.168.1.30";

export const vibinWebsocket = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (build) => ({
        getMessages: build.query<Message[], void>({
            queryFn: () => ({ data: [] }),
            async onCacheEntryAdded(
                arg,
                {
                    updateCachedData,
                    cacheDataLoaded,
                    cacheEntryRemoved,
                    dispatch,
                }
            ) {
                // create a websocket connection when the cache subscription starts
                const ws = new WebSocket(`ws://${HOSTNAME}:7669/ws`);
                try {
                    // wait for the initial query to resolve before proceeding
                    await cacheDataLoaded;

                    /**
                     * Handle incoming Websocket messages from the Vibin server.
                     */
                    const listener = (event: MessageEvent) => {
                        const data = JSON.parse(event.data);
                        // if (!isMessage(data) || data.channel !== arg) return;

                        // Update query result with the received message.
                        updateCachedData((draft) => {
                            draft.push(data);
                        });

                        // Update the play status.
                        const streamerName = data.streamer_name;
                        if (streamerName) {
                            dispatch({
                                type: setPlayStatus.type,
                                payload:
                                    data.vibin[streamerName]
                                        ?.current_playback_details?.state ||
                                    undefined,
                            });
                        }

                        // Update the audio sources.
                        if (streamerName) {
                            dispatch({
                                type: setAudioSources.type,
                                payload:
                                    data.vibin[streamerName]?.audio_sources ||
                                    {},
                            });
                        }
                    };

                    ws.addEventListener("message", listener);
                } catch {
                    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                    // in which case `cacheDataLoaded` will throw
                }
                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved;
                // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                ws.close();
            },
        }),
    }),
});

export const { useGetMessagesQuery } = vibinWebsocket;
