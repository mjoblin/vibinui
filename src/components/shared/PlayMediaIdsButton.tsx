import React, { FC } from "react";
import { ActionIcon, Box, Tooltip, useMantineTheme } from "@mantine/core";

import { MediaId } from "../../app/types";
import { IconPlayerPlay } from "@tabler/icons";
import { useSetPlaylistMediaIdsMutation } from "../../app/services/vibinPlaylist";
import { showSuccessNotification } from "../../app/utils";
import { useAppConstants } from "../../app/hooks/useAppConstants";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";

type PlayMediaIdsButtonProps = {
    mediaIds: MediaId[];
    tooltipLabel?: string;
    notificationLabel?: string;
    maxToPlay?: number;
};

const PlayMediaIdsButton: FC<PlayMediaIdsButtonProps> = ({
    mediaIds,
    tooltipLabel = "Replace Playlist with filtered results",
    notificationLabel = "Playlist replaced with filtered results",
    maxToPlay = 10,
}) => {
    const theme = useMantineTheme();
    const [setPlaylistIds, setPlaylistIdsStatus] = useSetPlaylistMediaIdsMutation();
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);

    const isLocalMedia = currentSource ? currentSource.class === "stream.media" : false;

    return (
        <Tooltip label={tooltipLabel} position="bottom">
            <Box sx={{ alignSelf: "center" }}>
                <ActionIcon
                    variant="light"
                    color={theme.primaryColor}
                    disabled={
                        !isLocalMedia ||
                        mediaIds.length === 0 ||
                        mediaIds.length > maxToPlay
                    }
                    onClick={() => {
                        setPlaylistIds({ mediaIds });

                        showSuccessNotification({
                            title: "Playlist replaced",
                            message: notificationLabel,
                        });
                    }}
                >
                    <IconPlayerPlay size="1rem" />
                </ActionIcon>
            </Box>
        </Tooltip>
    );
};

export default PlayMediaIdsButton;
