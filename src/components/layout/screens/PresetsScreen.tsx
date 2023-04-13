import React, { FC, useEffect } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import { useAppDispatch, useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useWindowScroll } from "../../../app/hooks/useWindowScroll";
import { setPresetsScrollPosition } from "../../../app/store/internalSlice";
import PresetsControls from "../../features/presets/PresetsControls";
import PresetsWall from "../../features/presets/PresetsWall";
import ScreenHeader from "../ScreenHeader";

// ================================================================================================
// Presets screen top-level layout.
// ================================================================================================

const PresetsScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const { scrollPosition } = useAppSelector((state: RootState) => state.internal.presets);
    const [scroll, scrollTo] = useWindowScroll({ delay: 500 });

    useEffect(() => {
        setTimeout(() => scrollTo({ y: scrollPosition }), 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        dispatch(setPresetsScrollPosition(scroll.y));
    }, [scroll, dispatch]);

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <PresetsControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <PresetsWall />
            </Box>
        </Stack>
    );
};

export default PresetsScreen;
