import React, { FC, useEffect } from "react";
import { ActionIcon, createStyles, getStylesRef, useMantineTheme } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";

import { isAlbum, isPreset, isTrack, Media } from "../../../app/types";
import { useAddMediaToPlaylistMutation } from "../../../app/services/vibinActivePlaylist";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import { useLazyPlayPresetIdQuery } from "../../../app/services/vibinPresets";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// ================================================================================================
// Media play button.
// ================================================================================================

type PlayButtonProps = {
    media: Media;
    disabled?: boolean;
    size?: number;
    fill?: boolean;
    onPlay?: () => void;
};

const PlayButton: FC<PlayButtonProps> = ({
    media,
    disabled = false,
    size = 80,
    fill = true,
    onPlay,
}) => {
    const { colors } = useMantineTheme();
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const [playPresetId] = useLazyPlayPresetIdQuery();

    const { classes: dynamicClasses } = createStyles((theme, _params) => ({
        playButtonContainer: {
            backgroundColor: "rgb(255, 255, 255, 0.2)",
            transition: "transform .2s ease-in-out, background-color .2s ease-in-out",
            "&:hover": !disabled && {
                cursor: "pointer",
                backgroundColor: theme.colors.blue,
            },
            [`&:hover .${getStylesRef("button")}`]: !disabled && {
                color: theme.colors.gray[1],
                fill: fill ? theme.colors.gray[1] : undefined,
            },
        },
        button: {
            ref: getStylesRef("button"),
            color: theme.colors.gray[5],
            fill: fill ? theme.colors.gray[5] : undefined,
            transition: "color .2s ease-in-out, fill .2s ease-in-out",
            "&:hover": !disabled && {
                cursor: "pointer",
                color: theme.colors.gray[1],
                fill: fill ? theme.colors.gray[1] : undefined,
            },
        },
    }))();

    /**
     * Notify the user if there was an error playing the Track (playing a Track actually involves
     * replacing the Playlist with the Track).
     */
    useEffect(() => {
        if (addStatus.isError) {
            const { status, data } = addStatus.error as FetchBaseQueryError;

            showErrorNotification({
                title: "Error replacing Playlist",
                message: `[${status}] ${JSON.stringify(data)}`,
            });
        }
    }, [addStatus]);

    return (
        <ActionIcon
            className={dynamicClasses.playButtonContainer}
            disabled={disabled}
            size={size}
            color={colors.blue[4]}
            variant="filled"
            radius={size / 2}
            onClick={(event) => {
                event.stopPropagation();

                if (onPlay) {
                    onPlay();
                    return;
                }

                if (isPreset(media)) {
                    playPresetId(media.id);
                } else if (isAlbum(media) || isTrack(media)) {
                    addMediaToPlaylist({ mediaId: media.id, action: "REPLACE" });

                    showSuccessNotification({
                        title: `Replaced Playlist ${
                            isAlbum(media) ? "with Album" : isTrack(media) ? "with Track" : ""
                        }`,
                        message: media.title,
                    });
                }
            }}
            sx={{ pointerEvents: "all" }}
        >
            <IconPlayerPlay size={size / 2} className={dynamicClasses.button} />
        </ActionIcon>
    );
};

export default PlayButton;
