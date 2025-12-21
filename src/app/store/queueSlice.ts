import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Queue } from "../types";
import { updateIfDifferent } from "./helpers";

// ================================================================================================
// Application state for the streamer Queue.
// ================================================================================================

const initialState: Queue = {
    count: 0,
    items: [],
    play_id: null,
    play_position: null,
    presettable: false,
    start: 0,
    total: 0,
    haveReceivedInitialState: false,
};

export const queueSlice = createSlice({
    name: "queue",
    initialState,
    reducers: {
        setQueue: (state, action: PayloadAction<Queue>) => {
            updateIfDifferent(state, "count", action.payload.count);
            updateIfDifferent(state, "items", action.payload.items);
            updateIfDifferent(state, "play_id", action.payload.play_id);
            updateIfDifferent(state, "play_position", action.payload.play_position);
            updateIfDifferent(state, "presettable", action.payload.presettable);
            updateIfDifferent(state, "start", action.payload.start);
            updateIfDifferent(state, "total", action.payload.total);

            state.haveReceivedInitialState = true;
        },
        setHaveReceivedInitialState: (state, action: PayloadAction<boolean>) => {
            state.haveReceivedInitialState = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setQueue, setHaveReceivedInitialState } = queueSlice.actions;

export default queueSlice.reducer;
