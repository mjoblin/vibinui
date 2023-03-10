import React, { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Box,
    createStyles,
    getStylesRef,
    Flex,
    Navbar,
    rem,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import {
    IconDeviceSpeaker,
    IconDisc,
    IconMicrophone2,
    IconPlaylist,
    IconRadio,
    IconUser,
    TablerIcon,
} from "@tabler/icons";

import Settings from "./Settings";
import BackgroundComputeIndicator from "../shared/BackgroundComputeIndicator";
import WaitingOnAPIIndicator from "../shared/WaitingOnAPIIndicator";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import MediaSourceBadge from "../shared/MediaSourceBadge";
import PlayStateIndicator from "../shared/PlayStateIndicator";
import StandbyMode from "../shared/StandbyMode";

// Taken from: https://ui.mantine.dev/category/navbars

const useStyles = createStyles((theme) => ({
    header: {
        // paddingBottom: theme.spacing.md,
        paddingBottom: 18,
        marginBottom: `calc(${theme.spacing.md} * 1.5)`,
        borderBottom: `${rem(1)} solid ${
            theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },

    footer: {
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.md,
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },

    link: {
        ...theme.fn.focusStyles(),
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        fontSize: theme.fontSizes.sm,
        color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7],
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.radius.sm,
        fontWeight: 500,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
            color: theme.colorScheme === "dark" ? theme.white : theme.black,

            [`& .${getStylesRef("icon")}`]: {
                color: theme.colorScheme === "dark" ? theme.white : theme.black,
            },
        },
    },

    linkIcon: {
        ref: getStylesRef("icon"),
        color: theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.colors.gray[6],
        marginRight: theme.spacing.sm,
    },

    linkActive: {
        "&, &:hover": {
            backgroundColor: theme.fn.variant({ variant: "light", color: theme.primaryColor })
                .background,
            color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
            [`& .${getStylesRef("icon")}`]: {
                color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
            },
        },
    },

    statusTable: {
        tableLayout: "fixed",
        "td:first-of-type": {
            width: 70,
            textAlign: "end",
            paddingRight: 10,
        },
        "td:last-of-type": {
            textAlign: "start",
        },
        tr: {
            verticalAlign: "center",
        },
    }
}));

const AppNav: FC = () => {
    const { colors } = useMantineTheme();
    const { pathname } = useLocation();
    const { classes, cx } = useStyles();
    const { APP_URL_PREFIX, NAVBAR_PADDING, NAVBAR_WIDTH } = useAppConstants();

    const routeInfo: Record<string, { link: string; label: string; icon: TablerIcon }[]> = {
        "Now Playing": [
            { link: `${APP_URL_PREFIX}/current`, label: "Current Track", icon: IconDeviceSpeaker },
            { link: `${APP_URL_PREFIX}/playlists`, label: "Playlists", icon: IconPlaylist },
        ],
        Browse: [
            { link: `${APP_URL_PREFIX}/artists`, label: "Artists", icon: IconUser },
            { link: `${APP_URL_PREFIX}/albums`, label: "Albums", icon: IconDisc },
            { link: `${APP_URL_PREFIX}/tracks`, label: "Tracks", icon: IconMicrophone2 },
            { link: `${APP_URL_PREFIX}/presets`, label: "Presets", icon: IconRadio },
        ],
    };

    const getLinks = (key: string) =>
        routeInfo[key].map((item) => (
            <Box
                component={Link}
                className={cx(classes.link, { [classes.linkActive]: item.link === pathname })}
                to={item.link}
                key={item.label}
            >
                <item.icon className={classes.linkIcon} stroke={1.5} />
                <span>{item.label}</span>
            </Box>
        ));

    return (
        <Navbar width={{ sm: NAVBAR_WIDTH }} p={NAVBAR_PADDING}>
            <Navbar.Section grow>
                <Stack spacing={15}>
                    <Stack spacing={10}>
                        <Text size="xs" weight="bold" transform="uppercase" color={colors.dark[3]}>
                            Now Playing
                        </Text>
                        <Box>{getLinks("Now Playing")}</Box>
                    </Stack>
                    <Stack spacing={10}>
                        <Text size="xs" weight="bold" transform="uppercase" color={colors.dark[3]}>
                            Browse
                        </Text>
                        <Box>{getLinks("Browse")}</Box>
                    </Stack>
                </Stack>
            </Navbar.Section>

            <Navbar.Section>
                <Stack spacing="sm">
                    <table className={classes.statusTable}>
                        <tbody>
                            <tr>
                                <td>
                                    <Text size="xs" color={colors.dark[3]}>
                                        play state
                                    </Text>
                                </td>
                                <td>
                                    <PlayStateIndicator />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Text size="xs" color={colors.dark[3]}>
                                        source
                                    </Text>
                                </td>
                                <td>
                                    <MediaSourceBadge />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Stack>
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
                <Flex justify="space-between" align="center">
                    <Settings />
                    <Flex gap={10} align="center">
                        <BackgroundComputeIndicator />
                        <WaitingOnAPIIndicator />
                        <StandbyMode type="compact" />
                    </Flex>
                </Flex>
            </Navbar.Section>
        </Navbar>
    );
};

export default AppNav;
