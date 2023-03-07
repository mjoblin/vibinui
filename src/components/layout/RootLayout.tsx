import React, { FC } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { AppShell, Box, Stack } from "@mantine/core";

import AppHeader from "./AppHeader";
import AppNav from "./AppNav";
import Debug from "./Debug";
import KeyboardShortcutsManager from "./KeyboardShortcutsManager";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const RootLayout: FC = () => {
    const { NAVBAR_PADDING } = useAppConstants();

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

            <ScrollRestoration />
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
