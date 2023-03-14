import React, { FC, useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { AppShell, Box, Stack } from "@mantine/core";

import AppHeader from "./AppHeader";
import AppNav from "./AppNav";
import Debug from "./Debug";
import KeyboardShortcutsManager from "./KeyboardShortcutsManager";
import { useAppDispatch } from "../../app/hooks";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { setCurrentScreen } from "../../app/store/internalSlice";

const RootLayout: FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { APP_URL_PREFIX, NAVBAR_PADDING } = useAppConstants();

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
        </AppShell>
    );
};

export default RootLayout;
