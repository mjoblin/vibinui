import React, { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, createStyles, Group, Header } from "@mantine/core";

import VibinLogo from "./VibinLogo";
import CurrentlyPlaying from "../currentlyPlaying/CurrentlyPlaying";
import TransportControls from "../currentlyPlaying/TransportControls";

const NAV_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
    link: {
        display: "flex",
        alignItems: "center",
        height: "100%",
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        textDecoration: "none",
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
        fontWeight: 500,
        fontSize: theme.fontSizes.sm,

        [theme.fn.smallerThan("sm")]: {
            height: 42,
            display: "flex",
            alignItems: "center",
            width: "100%",
        },

        ...theme.fn.hover({
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        }),
    },

    active: {
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
    },
}));

type NavItemProps = {
    title: string;
    target: string;
    active?: boolean;
};

const NavItem: FC<NavItemProps> = ({ title, target }) => {
    const { pathname } = useLocation();
    const { classes } = useStyles();

    return (
        <Box
            component={Link}
            to={`/${target}`}
            className={`${classes.link} ${pathname === `/${target}` ? classes.active : ""}`}
        >
            {title}
        </Box>
    );
};

const NavigationBar: FC = () => {
    return (
        <Box pb={NAV_HEIGHT} sx={{ zIndex: 999 }}>
            <Header
                fixed={true}
                height={NAV_HEIGHT}
                px="md"
                sx={{
                    borderBottom: "1px solid #282828",
                    boxShadow: "0px 5px 10px 0px rgb(0 0 0 / 20%)", // TODO: Make this look better
                }}
            >
                <Group position="apart" sx={{ height: "100%" }}>
                    <VibinLogo />

                    <Group sx={{ height: "100%", flexGrow: 1, gap: 75, paddingLeft: 50, paddingRight: 50 }}>
                        <Group sx={{ height: "100%" }} spacing={0}>
                            <NavItem title="Browse" target="browse" />
                            <NavItem title="Playlist" target="playlist" />
                            <NavItem title="Currently Playing" target="current" />
                        </Group>

                        <Group spacing="lg" sx={{ flexGrow: 1 }}>
                            <TransportControls />
                            <CurrentlyPlaying />
                        </Group>
                    </Group>

                    <Group>Controls</Group>
                </Group>
            </Header>
        </Box>
    );
};

export default NavigationBar;
