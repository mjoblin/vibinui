import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Draft } from "immer";

// import { isMessage } from "./schemaValidators";
import {
    setAudioSources,
    setCurrentAudioSource,
    setCurrentFormat,
    setCurrentTrack,
    setPlayStatus,
} from "../features/playback/playbackSlice";
import { RootState } from "../app/store";

// TODO: Consider how to more clearly handle vaguely-defined incoming message payloads. These
//  payloads can contain nested objects with arbitrary key/value pairs.
type SimpleObject = { [key: string | number]: any };

// TODO: Fully define the vibin backend message format.
export interface VibinMessage {
    id: string;
    streamer_name: string;
    media_source_name: string;
    streamer: SimpleObject;
    vibin: SimpleObject;
}

type ComparableMessageChunk = Draft<{ [key: number | string]: string }> | Map<any, any>;

/**
 * Compare the provided Draft object o1 with the provided o2. Return true if they appear to be
 * identical.
 *
 * Warning: This uses JSON.stringify() on the two inputs to determine equivalence, which can in
 * some situations return false negatives (say if the object key order has changed).
 *
 * @param o1
 * @param o2
 */
const quickObjectMatch = (o1: ComparableMessageChunk, o2: ComparableMessageChunk): boolean =>
    JSON.stringify(o1) === JSON.stringify(o2);

/**
 * Take some arbitrary input (scalar or SimpleObject) and purify it. Purify in this context means
 * checking if the input has any keys which contain a "-" (replaced with "_") or a "@" (removed).
 *
 * TODO: This is a simple attempt to take some weird-looking data shapes from the backend and make
 *  it more friendly to the application. This idea might need to be enhanced in the future.
 *
 * @param input
 */
const purifyData = (
    input: SimpleObject | string | number | undefined | null
): SimpleObject | string | number | undefined | null => {
    if (typeof input !== "object" || input === null) {
        return input;
    }

    const purified: SimpleObject = {};

    Object.keys(input).forEach((key) => {
        const purifiedKey = key.replaceAll("-", "_").replaceAll("@", "");
        purified[purifiedKey] = purifyData(input[key]);
    });

    return purified;
};

/**
 * Handle an incoming Websocket message from the vibin backend.
 *
 * @param updateCachedData
 * @param getState
 * @param dispatch
 *
 *  * Add the message to the message stream.
 *  * Extract the following information (if present in the message) and, if the data has changed
 *    from the current application state then dispatch redux actions to update the state:
 *      * Playback state (paused, playing, etc.)
 *      * List of audio sources.
 *      * Current audio source.
 *
 * TODO: updateCachedData is coming from the QueryArg type, defined somewhere in Redux Toolkit. It
 *  would be nice to figure out how to access the proper type and not fall back on "any".
 *  messageHandler() might also benefit at some point from having the entire QueryArg object rather
 *  than just updateCachedData.
 */
function messageHandler(
    updateCachedData: any,
    getState: () => any, // TODO: The return type here is really RootState
    dispatch: ThunkDispatch<any, any, any>
): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
        const data = purifyData(JSON.parse(event.data)) as VibinMessage;
        // if (!isMessage(data) || data.channel !== arg) return;

        // TODO: Consider adding message validation before attempting to process it.

        // Update query result with the received message.
        updateCachedData((draft: VibinMessage[]) => {
            draft.push(data);
        });

        const streamerName = data.streamer_name;

        if (!streamerName) {
            return;
        }

        const appState = getState();

        /**
         * Update application state to newValue if newValue is different from the current state for
         * the given stateType. If newValue is undefined then set the application state to the
         * given defaultValue.
         *
         * @param stateType
         * @param newValue
         * @param defaultValue
         */
        const updateAppStateIfChanged = (
            stateType: string,
            newValue: any,
            defaultValue: any = undefined
        ): void => {
            // TODO: Not sure how to keep TS happy here if appState is explicitly of type RootState
            //  (which is why the return type of getState() is defined above as "any").
            const existingStateValue = appState[stateType];

            if (!quickObjectMatch(existingStateValue, newValue)) {
                dispatch({
                    type: stateType,
                    payload: newValue === undefined ? defaultValue : newValue,
                });
            }
        };

        // Update the various pieces of the playback details application state if this message
        // contains new/updated playback information.

        updateAppStateIfChanged(
            setPlayStatus.type,
            data.vibin[streamerName]?.current_playback_details?.state
        );

        updateAppStateIfChanged(setAudioSources.type, data.vibin[streamerName]?.audio_sources, {});

        updateAppStateIfChanged(
            setCurrentAudioSource.type,
            data.vibin[streamerName]?.current_audio_source
        );

        updateAppStateIfChanged(
            setCurrentTrack.type,
            data.vibin[streamerName]?.current_playback_details?.playlist_entry
        );

        updateAppStateIfChanged(
            setCurrentFormat.type,
            data.vibin[streamerName]?.current_playback_details?.format
        );
    };
}

// ------------------------------------------------------------------------------------------------

export const vibinWebsocket = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (build) => ({
        getMessages: build.query<VibinMessage[], void>({
            // The vibin backend currently doesn't have an endpoint to retrieve the initial state
            // for the message stream data (this information is instead sent in the first message
            // immediately on connection). We instead just initialize with an empty Message array.
            queryFn: () => ({ data: [] }),
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState, dispatch }
            ) {
                // create a websocket connection when the cache subscription starts
                const ws = new WebSocket(`ws://${window.location.hostname}:7669/ws`);

                try {
                    // Wait for the initial query to resolve before proceeding.
                    await cacheDataLoaded;

                    const listener = messageHandler(updateCachedData, getState, dispatch);
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
