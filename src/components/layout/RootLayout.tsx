import React, { FC, useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { AppShell, Box, Center, Flex, Loader, Overlay, Paper, Stack, Text } from "@mantine/core";

import AppHeader from "./AppHeader";
import AppNav from "./AppNav";
import Debug from "./Debug";
import KeyboardShortcutsManager from "./KeyboardShortcutsManager";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { setCurrentScreen } from "../../app/store/internalSlice";
import { RootState } from "../../app/store/store";

const RootLayout: FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { APP_URL_PREFIX, NAVBAR_PADDING } = useAppConstants();
    const { websocketStatus } = useAppSelector((state: RootState) => state.internal.application);

    useEffect(() => {
        const screenNameMatch = location.pathname.match(new RegExp(`^${APP_URL_PREFIX}\/([^\/]+)`));
        screenNameMatch && dispatch(setCurrentScreen(screenNameMatch[1] || ""));
    }, [location, dispatch]);

    return (
        <AppShell
            padding="md"
            navbar={<AppNav />}
            header={<AppHeader />}
            styles={(theme) => ({
                main: {
                    backgroundColor:
                        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
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
    );
};

export default RootLayout;
