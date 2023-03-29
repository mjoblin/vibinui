import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Box, ScrollArea, Stack } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import throttle from "lodash/throttle";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState, store } from "../../app/store/store";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { setPlaylistScrollPos } from "../../app/store/internalSlice";
import Playlist from "../playlist/Playlist";
import PlaylistControls from "../playlist/PlaylistControls";
import ScreenHeader from "./ScreenHeader";
import StandbyMode from "../shared/StandbyMode";

type WindowDimensions = {
    height: number;
    width: number;
};

const PlaylistScreen: FC = () => {
    const dispatch = useAppDispatch();
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const {
        HEADER_HEIGHT,
        RENDER_APP_BACKGROUND_IMAGE,
        SCREEN_HEADER_HEIGHT,
        SCROLL_POS_DISPATCH_RATE,
    } = useAppGlobals();
    const playlistViewportRef = useRef<HTMLDivElement>(null);
    const [currentEntryRef, setCurrentEntryRef] = useState<HTMLDivElement>();
    const [playlistHeight, setPlaylistHeight] = useState<number>(300);
    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
        height: window.innerHeight,
        width: window.innerWidth,
    });

    /**
     *
     */
    useEffect(() => {
        const lastScrollPos = store.getState().internal.playlist.scrollPos;

        setTimeout(() => {
            playlistViewportRef.current &&
                playlistViewportRef.current.scrollTo({ top: lastScrollPos });
        }, 1);
    }, []);

    /**
     *
     */
    useEffect(() => {
        const bottomPadding = 20;

        const availableHeight =
            windowDimensions.height - (HEADER_HEIGHT + SCREEN_HEADER_HEIGHT + bottomPadding);

        setPlaylistHeight(availableHeight);
    }, [windowDimensions, HEADER_HEIGHT, SCREEN_HEADER_HEIGHT]);

    /**
     *
     */
    const scrollToCurrent = useCallback(() => {
        // TODO: This is a pretty disappointing way to find the top of the playlist (it assumes
        //  the currentEntryRef is a div wrapping a <td> in the current entry's table row; so it
        //  walks up the hierarchy to the top of the table). The goal is to figure out where in
        //  the playlistViewport to scroll to -- there is (hopefully) a better way to figure that
        //  out.
        const playlistTop =
            currentEntryRef?.parentNode?.parentNode?.parentNode?.parentNode?.parentElement?.getBoundingClientRect()
                .top;
        const entryTop = currentEntryRef?.getBoundingClientRect().top;

        if (playlistViewportRef?.current && playlistTop && entryTop) {
            const offset = 40;

            playlistViewportRef.current.scrollTo({
                top: entryTop - playlistTop - offset,
                behavior: "smooth",
            });
        }
    }, [playlistViewportRef, currentEntryRef]);

    /**
     *
     * @param event
     */
    const windowResizeHandler = (event: UIEvent) =>
        event.target &&
        setWindowDimensions({
            height: (event.target as Window).innerHeight,
            width: (event.target as Window).innerWidth,
        });

    useWindowEvent("resize", windowResizeHandler);

    /**
     *
     */
    const throttledPlaylistPosChange = useCallback(
        throttle(
            (value) => {
                dispatch(setPlaylistScrollPos(value.y));
            },
            SCROLL_POS_DISPATCH_RATE,
            { leading: false }
        ),
        []
    );

    // --------------------------------------------------------------------------------------------

    return streamerPower === "off" ? (
        <StandbyMode />
    ) : (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT} noBackground={RENDER_APP_BACKGROUND_IMAGE}>
                <PlaylistControls scrollToCurrent={scrollToCurrent} />
            </ScreenHeader>

            <Box pt={SCREEN_HEADER_HEIGHT - 17}>
                <ScrollArea
                    h={playlistHeight}
                    viewportRef={playlistViewportRef}
                    onScrollPositionChange={throttledPlaylistPosChange}
                    offsetScrollbars
                >
                    <Playlist onNewCurrentEntryRef={setCurrentEntryRef} />
                </ScrollArea>
            </Box>
        </Stack>
    );
};

export default PlaylistScreen;
