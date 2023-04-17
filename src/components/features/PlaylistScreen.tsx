import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Box, ScrollArea, Stack } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import throttle from "lodash/throttle";

import { useAppDispatch } from "../../app/hooks/store";
import { store } from "../../app/store/store";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { setPlaylistScrollPosition } from "../../app/store/internalSlice";
import { setPlaylistFollowCurrentlyPlaying } from "../../app/store/userSettingsSlice";
import Playlist from "./playlist/Playlist";
import PlaylistControls from "./playlist/PlaylistControls";
import ScreenHeader from "../app/layout/ScreenHeader";

// ================================================================================================
// Playlist screen top-level layout.
//
// Contains a <ScreenHeader>, <PlaylistControls>, and <Playlist>.
// ================================================================================================

type WindowDimensions = {
    height: number;
    width: number;
};

const PlaylistScreen: FC = () => {
    const dispatch = useAppDispatch();
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
     * Scroll to last-known scroll position when the screen mounts.
     */
    useEffect(() => {
        const lastScrollPos = store.getState().internal.playlist.scrollPosition;

        setTimeout(() => {
            playlistViewportRef.current &&
                playlistViewportRef.current.scrollTo({ top: lastScrollPos });
        }, 1);
    }, []);

    /**
     * Whenever the window dimensions change, re-calculate the height available to display the
     * Playlist contents.
     */
    useEffect(() => {
        const bottomPadding = 20;

        const availableHeight =
            windowDimensions.height - (HEADER_HEIGHT + SCREEN_HEADER_HEIGHT + bottomPadding);

        setPlaylistHeight(availableHeight);
    }, [windowDimensions, HEADER_HEIGHT, SCREEN_HEADER_HEIGHT]);

    /**
     * Scroll to the currently-playing Playlist Entry.
     */
    const scrollToCurrent = useCallback((options?: { offset?: number }) => {
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
            const offset = 40 + (options?.offset || 0);

            playlistViewportRef.current.scrollTo({
                top: entryTop - playlistTop - offset,
                behavior: "smooth",
            });
        }
    }, [playlistViewportRef, currentEntryRef]);

    /**
     * Keep track of the window dimensions if the window is resized.
     */
    const windowResizeHandler = (event: UIEvent) =>
        event.target &&
        setWindowDimensions({
            height: (event.target as Window).innerHeight,
            width: (event.target as Window).innerWidth,
        });

    useWindowEvent("resize", windowResizeHandler);

    /**
     * Keep track of the last-known Playlist scroll position.
     */
    const throttledPlaylistPositionChange = throttle(
        (value) => {
            dispatch(setPlaylistScrollPosition(value.y));
        },
        SCROLL_POS_DISPATCH_RATE,
        { leading: false }
    );

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT} noBackground={RENDER_APP_BACKGROUND_IMAGE}>
                <PlaylistControls scrollToCurrent={scrollToCurrent} />
            </ScreenHeader>

            <Box pt={SCREEN_HEADER_HEIGHT - 17}>
                <ScrollArea
                    h={playlistHeight}
                    viewportRef={playlistViewportRef}
                    onScrollPositionChange={throttledPlaylistPositionChange}
                    offsetScrollbars
                >
                    <Playlist
                        onNewCurrentEntryRef={setCurrentEntryRef}
                        onPlaylistModified={() =>
                            // When the Playlist gets modified, disabling the follow feature avoids
                            // weird-feeling UI updates while modifying. Although this requires the
                            // user to be aware that they might want to re-enable Follow once
                            // finished modifying.
                            dispatch(setPlaylistFollowCurrentlyPlaying(false))
                        }
                    />
                </ScrollArea>
            </Box>
        </Stack>
    );
};

export default PlaylistScreen;