import React, { FC, useState } from "react";
import { ActionIcon, Box, createStyles, Menu, Tooltip, useMantineTheme } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

import { MediaId } from "../../../app/types";
import { useAppSelector } from "../../../app/hooks/useInterval";
import { RootState } from "../../../app/store/store";
import { useSetPlaylistMediaIdsMutation } from "../../../app/services/vibinPlaylist";
import { showSuccessNotification } from "../../../app/utils";

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
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);
    const [setPlaylistIds, setPlaylistIdsStatus] = useSetPlaylistMediaIdsMutation();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const isLocalMedia = currentSource ? currentSource.class === "stream.media" : false;

    return (
        <Tooltip label={tooltipLabel} disabled={menuOpen} position="bottom">
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
                            disabled={disabled || !isLocalMedia || mediaIds.length === 0}
                        >
                            <IconPlayerPlay size="1rem" />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Playlist</Menu.Label>
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
