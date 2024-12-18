import React, { FC, useEffect } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { RootState } from "../../app/store/store";
import { useWindowScroll } from "../../app/hooks/useWindowScroll";
import { setPresetsScrollPosition } from "../../app/store/internalSlice";
import PresetsControls from "./presets/PresetsControls";
import PresetsWall from "./presets/PresetsWall";
import ScreenHeader from "../app/layout/ScreenHeader";

// ================================================================================================
// Presets screen top-level layout.
//
// Contains a <ScreenHeader>, <PresetsControls>, and <PresetsWall>.
// ================================================================================================

const PresetsScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const { scrollPosition } = useAppSelector((state: RootState) => state.internal.presets);
    const { cardSize, cardGap, filterText, showDetails, wallViewMode } = useAppSelector(
        (state: RootState) => state.userSettings.presets,
    );
    const [scroll, scrollTo] = useWindowScroll({ delay: 500 });

    /**
     * Scroll to last-known scroll position when the screen mounts.
     */
    useEffect(() => {
        setTimeout(() => scrollTo({ y: scrollPosition }), 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Update the last-known scroll position when the window scrolls.
     */
    useEffect(() => {
        dispatch(setPresetsScrollPosition(scroll.y));
    }, [scroll, dispatch]);

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <PresetsControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <PresetsWall
                    filterText={filterText}
                    viewMode={wallViewMode}
                    cardSize={cardSize}
                    cardGap={cardGap}
                    showDetails={showDetails}
                />
            </Box>
        </Stack>
    );
};

export default PresetsScreen;
