import React, { FC, useState } from "react";
import {
    ActionIcon,
    Box,
    createStyles,
    Flex,
    Menu,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { IconCircleOff, IconPlayerPlay } from "@tabler/icons-react";

import { MediaId } from "../../../app/types";
import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useSetPlaylistMediaIdsMutation } from "../../../app/services/vibinActivePlaylist";
import { showSuccessNotification } from "../../../app/utils";

// ================================================================================================
// Button to replace the current Playlist with the provided mediaIds.
// ================================================================================================

const darkEnabled = "#C1C2C5";
const lightEnabled = "#000";

const useMenuStyles = createStyles((theme) => ({
    item: {
        fontSize: 12,
        padding: "7px 12px",
        "&[data-hovered]": {
            backgroundColor: theme.colors[theme.primaryColor][theme.fn.primaryShade()],
            color: theme.white,
        },
    },
}));

type PlayMediaIdsButtonProps = {
    mediaIds: MediaId[];
    disabled?: boolean;
    tooltipLabel?: string;
    menuItemLabel?: string;
    notificationLabel?: string;
    maxToPlay?: number;
};

const PlayMediaIdsButton: FC<PlayMediaIdsButtonProps> = ({
    mediaIds,
    disabled = false,
    tooltipLabel = "Replace Playlist with filtered results",
    menuItemLabel = "Replace Playlist with filtered items",
    notificationLabel = "Playlist replaced with filtered results",
    maxToPlay = 10,
}) => {
    const theme = useMantineTheme();
    const menuStyles = useMenuStyles();
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const [setPlaylistIds] = useSetPlaylistMediaIdsMutation();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const isInStandbyMode = streamerPower === "off";

    // TODO: Investigate ways to clearly and consistently let the user know when capabilities are
    //  unavailable due to the streamer being in standby.
    const label = isInStandbyMode ? (
        <Flex gap={5} align="center">
            <IconCircleOff size={14} />
            <Text>Streamer is in standby</Text>
        </Flex>
    ) : (
        tooltipLabel
    );

    return (
        <Tooltip label={label} disabled={menuOpen} position="bottom">
            <Box sx={{ alignSelf: "center" }}>
                <Menu
                    withArrow
                    arrowPosition="center"
                    position="bottom"
                    withinPortal={true}
                    classNames={menuStyles.classes}
                    onOpen={() => setMenuOpen(true)}
                    onClose={() => setMenuOpen(false)}
                >
                    <Menu.Target>
                        <ActionIcon
                            variant="light"
                            color={theme.primaryColor}
                            disabled={disabled || mediaIds.length === 0 || isInStandbyMode}
                        >
                            <IconPlayerPlay size="1rem" />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Modify Playlist</Menu.Label>
                        <Menu.Item
                            icon={
                                <IconPlayerPlay
                                    size={14}
                                    fill={theme.colorScheme === "dark" ? darkEnabled : lightEnabled}
                                />
                            }
                            onClick={() => {
                                setPlaylistIds({ mediaIds, maxCount: maxToPlay });

                                showSuccessNotification({
                                    title: "Playlist replaced",
                                    message: notificationLabel,
                                });
                            }}
                        >
                            {menuItemLabel}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Box>
        </Tooltip>
    );
};

export default PlayMediaIdsButton;
