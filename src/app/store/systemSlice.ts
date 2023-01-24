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
