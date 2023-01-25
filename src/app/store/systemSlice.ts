import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type PowerStatus = "on" | "off" | undefined;

export interface SystemState {
    streamer: {
        name: string;
        power: PowerStatus;
    };
    media_device: {
        name: string;
    };
}

const initialState: SystemState = {
    streamer: {
        name: "",
        power: undefined,
    },
    media_device: {
        name: "",
    },
};

// TODO: Think about ways to distinguish between reducers intended for user-driven use, vs. those
//  intended for infrastructure use. e.g. "setStreamerPower" (and others here) are intended to be
//  used when a power-related message comes in from the backend over a websocket; it's not intended
//  to be used by a user-facing component (which should be using useLazyPowerToggleQuery in the
//  vibinSystem service).

export const systemSlice = createSlice({
    name: "system",
    initialState,
    reducers: {
        setMediaDeviceName: (state, action: PayloadAction<string>) => {
            state.media_device.name = action.payload;
        },
        setStreamerName: (state, action: PayloadAction<string>) => {
            state.streamer.name = action.payload;
        },
        setStreamerPower: (state, action: PayloadAction<PowerStatus>) => {
            state.streamer.power = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setMediaDeviceName, setStreamerName, setStreamerPower } = systemSlice.actions;

export default systemSlice.reducer;
