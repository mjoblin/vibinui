import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const DEFAULT_BROWSE_FILTER_TEXT = "";
const DEFAULT_BROWSE_COVER_SIZE = 200;
const DEFAULT_BROWSE_COVER_GAP = 25;
const DEFAULT_BROWSE_SHOW_DETAILS = true;

export interface UserSettingsState {
    browse: {
        filterText: string;
        coverSize: number;
        coverGap: number;
        showDetails: boolean;
    };
}

const initialState: UserSettingsState = {
    browse: {
        filterText: DEFAULT_BROWSE_FILTER_TEXT,
        coverSize: DEFAULT_BROWSE_COVER_SIZE,
        coverGap: DEFAULT_BROWSE_COVER_GAP,
        showDetails: DEFAULT_BROWSE_SHOW_DETAILS,
    },
};

export const userSettingsSlice = createSlice({
    name: "userSettings",
    initialState,
    reducers: {
        setFilterText: (state, action: PayloadAction<string>) => {
            state.browse.filterText = action.payload;
        },
        setBrowseCoverSize: (state, action: PayloadAction<number>) => {
            state.browse.coverSize = action.payload;
        },
        setBrowseCoverGap: (state, action: PayloadAction<number>) => {
            state.browse.coverGap = action.payload;
        },
        setBrowseShowDetails: (state, action: PayloadAction<boolean>) => {
            state.browse.showDetails = action.payload;
        },
        resetBrowseToDefaults: (state) => {
            state.browse.filterText = DEFAULT_BROWSE_FILTER_TEXT;
            state.browse.coverSize = DEFAULT_BROWSE_COVER_SIZE;
            state.browse.coverGap = DEFAULT_BROWSE_COVER_GAP;
            state.browse.showDetails = DEFAULT_BROWSE_SHOW_DETAILS;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setFilterText,
    setBrowseCoverSize,
    setBrowseCoverGap,
    setBrowseShowDetails,
    resetBrowseToDefaults,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
