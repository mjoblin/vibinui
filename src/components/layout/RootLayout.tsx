import React, { FC, useCallback, useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import {
    AppShell,
    Box,
    Center,
    createStyles,
    Flex,
    Loader,
    Overlay,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";

import AppHeader from "./AppHeader";
import AppNav from "./AppNav";
import DebugPanel from "../app/DebugPanel";
import BackgroundImageManager from "../managers/BackgroundImageManager";
import KeyboardShortcutsManager from "../managers/KeyboardShortcutsManager";
import TrackLyricsModal from "../features/tracks/TrackLyricsModal";
import WelcomeMessage from "../app/WelcomeMessage";
import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks/useInterval";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import {
    setCurrentlyPlayingArtUrl,
    setCurrentScreen,
    setShowCurrentTrackLyrics,
} from "../../app/store/internalSlice";
import { setApplicationHaveShownWelcomeMessage } from "../../app/store/userSettingsSlice";

const useStyles = createStyles((theme) => ({
    artBackground: {
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        zIndex: -9999,
    },
    artBackgroundFilters: {
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backdropFilter: "blur(20px) brightness(0.15) saturate(0.8) contrast(0.8)",
        zIndex: -9998,
    },
}));

const RootLayout: FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { classes } = useStyles();
    const { APP_URL_PREFIX, APP_PADDING, RENDER_APP_BACKGROUND_IMAGE } = useAppGlobals();
    const { currentlyPlayingArtUrl, currentScreen, showCurrentTrackLyrics, websocketStatus } =
        useAppSelector((state: RootState) => state.internal.application);
    // const playlist = useAppSelector((state: RootState) => state.playlist);
    const { haveShownWelcomeMessage } = useAppSelector(
        (state: RootState) => state.userSettings.application
    );    
    const trackById = useAppSelector((state: RootState) => state.mediaGroups.trackById);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const [backgroundUniqueKey, setBackgroundUniqueKey] = useState<string>(
        `${window.innerWidth}x${window.innerHeight}`
    );

    const screenName = (): string | undefined => {
        const screenNameMatch = location.pathname.match(new RegExp(`^${APP_URL_PREFIX}\/([^\/]+)`));

        if (!screenNameMatch) {
            return undefined;
        }

        return screenNameMatch[1] || "";
    }

    useEffect(() => {
        dispatch(setCurrentScreen(screenName() || ""));
    }, [location, dispatch, APP_URL_PREFIX]);

    // Create a key unique to the current screen and window dimensions. If any of those things
    // change (e.g. a window resize) then the key is changed. This key then becomes the key prop
    // for the image background element. This ensures that the background image (and its filters)
    // are re-generated when required. If this isn't done then a window resize, or switching
    // between screens where one has a browser scrollbar and one doesn't, can produce undesirable
    // results (some background image areas will not be properly filtered).
    const windowResizeHandler = useCallback(
        (event: UIEvent) =>
            event.target &&
            setBackgroundUniqueKey(`${currentScreen}::${window.innerWidth}x${window.innerHeight}`),
        [currentScreen]
    );

    useWindowEvent("resize", windowResizeHandler);

    return (
        <>
            {RENDER_APP_BACKGROUND_IMAGE && (
                <Box
                    key={backgroundUniqueKey}
                    className={classes.artBackground}
                    sx={
                        currentlyPlayingArtUrl
                            ? {
                                  backgroundImage: `url(${currentlyPlayingArtUrl})`,
                                  backgroundSize: "100% auto",
                              }
                            : {}
                    }
                >
                    <Box className={classes.artBackgroundFilters} />
                </Box>
            )}

            <AppShell
                padding="md"
                navbar={<AppNav noBackground={RENDER_APP_BACKGROUND_IMAGE} />}
                header={<AppHeader noBackground={RENDER_APP_BACKGROUND_IMAGE} />}
                styles={(theme) => ({
                    main: {
                        backgroundColor: RENDER_APP_BACKGROUND_IMAGE
                            ? "rgb(0, 0, 0, 0)"
                            : theme.colorScheme === "dark"
                            ? theme.colors.dark[8]
                            : theme.colors.gray[0],
                    },
                })}
            >
                <Stack pr={APP_PADDING}>
                    {/* The route <Outlet> is the main screen (Albums, Artists, etc) */}
                    <Outlet />
                </Stack>

                {/* NOTE: Scroll restoration doesn't work screens which use components based on
                <VisibilitySensor> (which is most screens, including Artists, Albums, Tracks). */}
                <ScrollRestoration
                    getKey={(location, matches) => {
                        return location.pathname;
                    }}
                />

                <KeyboardShortcutsManager />

                {/* Enable the background image manager for select screens. Enabling it on all
                    screens results in unwanted full renders of those other screens when the
                    current track changes. */}
                {["current", "playlist"].includes(screenName() || "") && <BackgroundImageManager />}

                {/* The Debug pane */}
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        pointerEvents: "none",
                    }}
                >
                    <DebugPanel />
                </Box>

                {/* Overlay the UI when the websocket connection is being re-established */}
                {websocketStatus === "waiting_to_reconnect" && (
                    <Overlay fixed opacity={0.5} blur={3}>
                        <Center h="100%">
                            <Paper p={30} pl={65} pr={65} radius={5} withBorder>
                                <Flex gap={20} justify="center">
                                    <Loader size="md" variant="dots" />
                                    <Text weight="bold" transform="uppercase">
                                        Reconnecting to Vibin server
                                    </Text>
                                </Flex>
                            </Paper>
                        </Center>
                    </Overlay>
                )}

                {/* Welcome message modal */}
                <WelcomeMessage
                    opened={!haveShownWelcomeMessage}
                    onClose={() => dispatch(setApplicationHaveShownWelcomeMessage(true))}
                />

                {/* Handle request to show current track's lyrics */}
                {currentTrackId && trackById[currentTrackId] && (
                    <TrackLyricsModal
                        track={trackById[currentTrackId]}
                        opened={showCurrentTrackLyrics}
                        onClose={() => dispatch(setShowCurrentTrackLyrics(false))}
                    />
                )}
            </AppShell>
        </>
    );
};

export default RootLayout;
