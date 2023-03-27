import React, { FC, useEffect } from "react";
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
    useMantineTheme,
} from "@mantine/core";

import AppHeader from "./AppHeader";
import AppNav from "./AppNav";
import Debug from "./Debug";
import KeyboardShortcutsManager from "./KeyboardShortcutsManager";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { setCurrentScreen } from "../../app/store/internalSlice";
import { RootState } from "../../app/store/store";

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
        backdropFilter: "blur(20px) brightness(0.25) saturate(0.8)",
        zIndex: -9998,
    },
}));

const RootLayout: FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const theme = useMantineTheme();
    const { classes } = useStyles();
    const { APP_URL_PREFIX, NAVBAR_PADDING } = useAppConstants();
    const { currentlyPlayingArtUrl, currentScreen, websocketStatus } = useAppSelector(
        (state: RootState) => state.internal.application
    );
    const { useImageBackground } = useAppSelector(
        (state: RootState) => state.userSettings.application
    );
    const trackById = useAppSelector((state: RootState) => state.mediaGroups.trackById);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );

    useEffect(() => {
        const screenNameMatch = location.pathname.match(new RegExp(`^${APP_URL_PREFIX}\/([^\/]+)`));
        screenNameMatch && dispatch(setCurrentScreen(screenNameMatch[1] || ""));
    }, [location, dispatch]);

    // Prepare for rendering a blurred album art background behind the entire application. This is
    // only done if art exists, the user is in the "current" screen, and the app theme is in dark
    // mode. Rendering the background entails creating some divs outside the <AppShell> which hold
    // the image and its filters. When displaying the art background, the NavBar, Header, and Main
    // section all need to render a transparent background (i.e. rgb(0, 0, 0, 0)).
    //
    // NOTE: Because the AppNav background will be transparent, the main content panel will be
    //  visible underneath it if the main panel needs to scroll vertically. There's a few
    //  solutions to this: prevent the main content pane from scrolling at the window level;
    //  don't make the AppNav transparent; have the AppNav use the top of the same image background
    //  that the app is using (rather than being transparent and showing the app's background).
    //
    // TODO: Can this approach benefit from "top layer":
    //  https://developer.chrome.com/blog/what-is-the-top-layer/

    const renderAppBackgroundImage = !!(
        useImageBackground &&
        theme.colorScheme === "dark" &&
        currentScreen === "current" &&
        currentlyPlayingArtUrl
    );

    return (
        <>
            {renderAppBackgroundImage && (
                <Box
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
                navbar={<AppNav noBackground={renderAppBackgroundImage} />}
                header={<AppHeader noBackground={renderAppBackgroundImage} />}
                styles={(theme) => ({
                    main: {
                        backgroundColor: renderAppBackgroundImage
                            ? "rgb(0, 0, 0, 0)"
                            : theme.colorScheme === "dark"
                            ? theme.colors.dark[8]
                            : theme.colors.gray[0],
                    },
                })}
            >
                <Stack pr={NAVBAR_PADDING}>
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
                    <Debug />
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
            </AppShell>
        </>
    );
};

export default RootLayout;
