import React, { FC, useEffect } from "react";
import { Box, Stack } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { RootState } from "../../app/store/store";
import { useWindowScroll } from "../../app/hooks/useWindowScroll";
import { setFavoritesScrollPosition } from "../../app/store/internalSlice";
import FavoritesControls from "./favorites/FavoritesControls";
import FavoritesWall from "./favorites/FavoritesWall";
import ScreenHeader from "../app/layout/ScreenHeader";

// ================================================================================================
// Favorites screen top-level layout.
//
// Contains a <ScreenHeader>, <FavoritesControls>, and <FavoritesWall>.
// ================================================================================================

const FavoritesScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { SCREEN_HEADER_HEIGHT } = useAppGlobals();
    const { scrollPosition } = useAppSelector((state: RootState) => state.internal.favorites);
    const [scroll, scrollTo] = useWindowScroll({ delay: 500 });

    useEffect(() => {
        setTimeout(() => scrollTo({ y: scrollPosition }), 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        dispatch(setFavoritesScrollPosition(scroll.y));
    }, [scroll, dispatch]);

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT}>
                <FavoritesControls />
            </ScreenHeader>
            <Box pt={SCREEN_HEADER_HEIGHT}>
                <FavoritesWall />
            </Box>
        </Stack>
    );
};

export default FavoritesScreen;
