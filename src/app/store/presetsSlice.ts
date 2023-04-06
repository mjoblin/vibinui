import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Preset } from "../services/vibinPresets";
import { updateIfDifferent } from "./helpers";

export interface PresetsState {
    start: number;
    end: number;
    max_presets: number;
    presets: Preset[];
    haveReceivedInitialState: boolean;
}

const initialState: PresetsState = {
    start: 1,
    end: 99,
    max_presets: 99,
    presets: [],
    haveReceivedInitialState: false,
};

export const presetsSlice = createSlice({
    name: "presets",
    initialState,
    reducers: {
        setPresetsState: (state, action: PayloadAction<PresetsState>) => {
            updateIfDifferent(state, "start", action.payload.start);
            updateIfDifferent(state, "end", action.payload.end);
            updateIfDifferent(state, "max_presets", action.payload.max_presets);
            updateIfDifferent(state, "presets", action.payload.presets);
            state.haveReceivedInitialState = true;
        },
    },
});

export const { setPresetsState } = presetsSlice.actions;

export default presetsSlice.reducer;
