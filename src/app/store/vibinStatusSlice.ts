import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { updateIfDifferent } from "./helpers";

export type ClientWebsocketClient = {
    id: string;
    when_connected: number;
    ip: string;
    port: number;
};

export interface VibinStatusState {
    start_time: number | undefined;
    system_node: string;
    system_platform: string;
    system_version: string;
    clients: ClientWebsocketClient[];
}

const initialState: VibinStatusState = {
    start_time: undefined,
    system_node: "",
    system_platform: "",
    system_version: "",
    clients: [],
};

export const vibinStatusSlice = createSlice({
    name: "vibinStatus",
    initialState,
    reducers: {
        setVibinStatusState: (state, action: PayloadAction<VibinStatusState>) => {
            updateIfDifferent(state, "start_time", action.payload.start_time);
            updateIfDifferent(state, "system_node", action.payload.system_node);
            updateIfDifferent(state, "system_platform", action.payload.system_platform);
            updateIfDifferent(state, "system_version", action.payload.system_version);
            updateIfDifferent(state, "clients", action.payload.clients);
        },
    },
});

export const { setVibinStatusState } = vibinStatusSlice.actions;

export default vibinStatusSlice.reducer;
