import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { updateIfDifferent } from "./helpers";

// ================================================================================================
// Application state for the status of the vibin backend.
// ================================================================================================

export type ClientWebsocketClient = {
    id: string;
    when_connected: number;
    ip: string;
    port: number;
};

export interface VibinStatusState {
    vibin_version: string;
    start_time: number | undefined;
    system_node: string;
    system_platform: string;
    system_version: string;
    clients: ClientWebsocketClient[];
    lyrics_enabled: boolean;
    waveforms_enabled: boolean;
}

const initialState: VibinStatusState = {
    vibin_version: "",
    start_time: undefined,
    system_node: "",
    system_platform: "",
    system_version: "",
    clients: [],
    lyrics_enabled: false,
    waveforms_enabled: false,
};

export const vibinStatusSlice = createSlice({
    name: "vibinStatus",
    initialState,
    reducers: {
        setVibinStatusState: (state, action: PayloadAction<VibinStatusState>) => {
            updateIfDifferent(state, "vibin_version", action.payload.vibin_version);
            updateIfDifferent(state, "start_time", action.payload.start_time);
            updateIfDifferent(state, "system_node", action.payload.system_node);
            updateIfDifferent(state, "system_platform", action.payload.system_platform);
            updateIfDifferent(state, "system_version", action.payload.system_version);
            updateIfDifferent(state, "clients", action.payload.clients);
            updateIfDifferent(state, "lyrics_enabled", action.payload.lyrics_enabled);
            updateIfDifferent(state, "waveforms_enabled", action.payload.waveforms_enabled);
        },
    },
});

export const { setVibinStatusState } = vibinStatusSlice.actions;

export default vibinStatusSlice.reducer;
