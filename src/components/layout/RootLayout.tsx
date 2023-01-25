import React, { FC } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mantine/core";

import NavigationBar from "./NavigationBar";

// TODO: Look into using mantine theme constants for things like padding.

const RootLayout: FC = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflowY: "hidden",
            }}
        >
            <NavigationBar />

            <Box sx={{ overflowY: "auto" }}>
                <Box sx={{ paddingLeft: 15, paddingRight: 15, paddingTop: 10 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default RootLayout;
