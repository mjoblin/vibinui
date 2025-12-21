import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Box, ScrollArea, Stack, Text } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import throttle from "lodash/throttle";

import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { RootState, store } from "../../app/store/store";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { useAppStatus } from "../../app/hooks/useAppStatus";
import { setPlaylistScrollPosition } from "../../app/store/internalSlice";
import { setPlaylistFollowCurrentlyPlaying } from "../../app/store/userSettingsSlice";
import MediaSourceBadge from "../shared/dataDisplay/MediaSourceBadge";
import Queue from "./queue/Queue";
import QueueControls from "./queue/QueueControls";
import ScreenHeader from "../app/layout/ScreenHeader";
import WarningBanner from "../shared/textDisplay/WarningBanner";

// ================================================================================================
// Queue screen top-level layout.
//
// Contains a <ScreenHeader>, <QueueControls>, and <Queue>.
// ================================================================================================

type WindowDimensions = {
    height: number;
    width: number;
};

const QueueScreen: FC = () => {
    const dispatch = useAppDispatch();
    const {
        HEADER_HEIGHT,
        RENDER_APP_BACKGROUND_IMAGE,
        SCREEN_HEADER_HEIGHT,
        SCROLL_POS_DISPATCH_RATE,
    } = useAppGlobals();
    const { isLocalMediaActive } = useAppStatus();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const playlistViewportRef = useRef<HTMLDivElement>(null);
    const [currentEntryRef, setCurrentEntryRef] = useState<HTMLDivElement>();
    const [playlistHeight, setPlaylistHeight] = useState<number>(300);
    const inactiveBannerRef = useRef<HTMLDivElement>(null);
    const [inactiveBannerHeight, setInactiveBannerHeight] = useState<number>(0);
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
     * Get the height of the <PlaylistInactiveBanner> component.
     */
    useEffect(() => {
        if (inactiveBannerRef.current) {
            const height = inactiveBannerRef.current.clientHeight;
            setInactiveBannerHeight(height);
        } else {
            setInactiveBannerHeight(0);
        }
    }, [playStatus, streamerPower]);

    /**
     * Scroll to the currently-playing Playlist Entry.
     */
    const scrollToCurrent = useCallback(
        (options?: { offset?: number }) => {
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
        },
        [playlistViewportRef, currentEntryRef],
    );

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
        { leading: false },
    );

    // When the streamer is powered on and functioning, but the current audio source is not local
    // media, then playlist is being ignored by the streamer (due to another source like AirPlay
    // being active). We want to inform the user of this.
    const showingInactivePlaylistBanner =
        streamerPower === "on" && playStatus !== "not_ready" && !isLocalMediaActive;

    // --------------------------------------------------------------------------------------------

    return (
        <Stack spacing={0}>
            <ScreenHeader height={SCREEN_HEADER_HEIGHT} noBackground={RENDER_APP_BACKGROUND_IMAGE}>
                <Stack spacing={10}>
                    {/*<PlaylistControls scrollToCurrent={scrollToCurrent} />*/}
                    <QueueControls scrollToCurrent={scrollToCurrent} />

                    {showingInactivePlaylistBanner && (
                        <WarningBanner ref={inactiveBannerRef}>
                            <Text>
                                Playlist is currently not being used for playback. Active streamer
                                source is{" "}
                            </Text>
                            <MediaSourceBadge showSource={true} />
                        </WarningBanner>
                    )}
                </Stack>
            </ScreenHeader>

            <Box
                pt={
                    SCREEN_HEADER_HEIGHT -
                    17 +
                    (showingInactivePlaylistBanner ? inactiveBannerHeight : 0)
                }
            >
                <ScrollArea
                    h={playlistHeight - inactiveBannerHeight}
                    viewportRef={playlistViewportRef}
                    onScrollPositionChange={throttledPlaylistPositionChange}
                    offsetScrollbars
                >
                    {/*<Playlist*/}
                    {/*    onNewCurrentEntryRef={setCurrentEntryRef}*/}
                    {/*    onPlaylistModified={() =>*/}
                    {/*        // When the Playlist gets modified, disabling the follow feature avoids*/}
                    {/*        // weird-feeling UI updates while modifying. Although this requires the*/}
                    {/*        // user to be aware that they might want to re-enable Follow once*/}
                    {/*        // finished modifying.*/}
                    {/*        dispatch(setPlaylistFollowCurrentlyPlaying(false))*/}
                    {/*    }*/}
                    {/*/>*/}

                    <Queue
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

export default QueueScreen;
