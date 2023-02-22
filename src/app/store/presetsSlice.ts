import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Preset } from "../services/vibinPresets";

export interface PresetsState {
    start: number;
    end: number;
    max_presets: number;
    presets: Preset[];
}

const initialState: PresetsState = {
    start: 1,
    end: 99,
    max_presets: 99,
    presets: [],
};

export const presetsSlice = createSlice({
    name: "presets",
    initialState,
    reducers: {
        setPresetsState: (state, action: PayloadAction<PresetsState>) => {
            state.start = action.payload.start;
            state.end = action.payload.end;
            state.max_presets = action.payload.max_presets;
            state.presets = action.payload.presets;
        },
    },
});

export const { setPresetsState } = presetsSlice.actions;

export default presetsSlice.reducer;
