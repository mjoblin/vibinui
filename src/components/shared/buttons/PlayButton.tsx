import React, { FC, useEffect, useState } from "react";
import { ActionIcon, createStyles, getStylesRef, useMantineTheme } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";

import { isAlbum, isPreset, isTrack, Media } from "../../../app/types";
import { useAddMediaToPlaylistMutation } from "../../../app/services/vibinActivePlaylist";
import { showErrorNotification, showSuccessNotification } from "../../../app/utils";
import { useLazyPlayPresetIdQuery } from "../../../app/services/vibinPresets";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { usePauseMutation, usePlayMutation } from "../../../app/services/vibinTransport";

// ================================================================================================
// Media play button.
//
// If the given media is active (meaning it's what is currently being played, or is current but
// paused), then the button will adopt a transport-playback-toggle behavior.
// ================================================================================================

type PlayButtonProps = {
    media: Media;
    disabled?: boolean;
    size?: number;
    fill?: boolean;
    onPlay?: () => void;
    onPause?: () => void;
};

const PlayButton: FC<PlayButtonProps> = ({
    media,
    disabled = false,
    size = 80,
    fill = true,
    onPlay,
    onPause,
}) => {
    const { colors } = useMantineTheme();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentAlbumMediaId = useAppSelector(
        (state: RootState) => state.playback.current_album_media_id
    );
    const currentTrackMediaId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const presets = useAppSelector((state: RootState) => state.presets.presets);
    const [addMediaToPlaylist, addStatus] = useAddMediaToPlaylistMutation();
    const [playPresetId] = useLazyPlayPresetIdQuery();
    const [pausePlayback] = usePauseMutation();
    const [playPlayback] = usePlayMutation();
    const [mediaIsActive, setMediaIsActive] = useState<boolean>(false);

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
     * Determine whether the media is currently playing.
     */
    useEffect(() => {
        if (isAlbum(media)) {
            setMediaIsActive(media.id === currentAlbumMediaId);
        } else if (isTrack(media)) {
            setMediaIsActive(media.id === currentTrackMediaId);
        } else if (isPreset(media)) {
            setMediaIsActive(media.id === presets.find((preset) => preset.is_playing)?.id);
        }
    }, [media, currentAlbumMediaId, currentTrackMediaId, presets]);

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

    if (!mediaIsActive) {
        // Media is not active, so behave like a play button to initiate media playback.
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

                    if (isAlbum(media) || isTrack(media)) {
                        addMediaToPlaylist({ mediaId: media.id, action: "REPLACE" });

                        showSuccessNotification({
                            title: `Replaced Playlist ${
                                isAlbum(media) ? "with Album" : isTrack(media) ? "with Track" : ""
                            }`,
                            message: media.title,
                        });
                    }
                    else if (isPreset(media)) {
                        playPresetId(media.id);
                    }
                }}
            >
                <IconPlayerPlay size={size / 2} className={dynamicClasses.button} />
            </ActionIcon>
        );
    } else {
        // Media is active, so behave like a transport play/pause button.
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

                    if (onPlay && playStatus !== "play") {
                        onPlay();
                        return;
                    } else if (onPause && playStatus === "play") {
                        onPause();
                        return;
                    }

                    if (playStatus === "play") {
                        pausePlayback();
                    }
                    else {
                        playPlayback();
                    }
                }}
            >
                {playStatus === "play" ? (
                    <IconPlayerPause size={size / 2} className={dynamicClasses.button} />
                ) : (
                    <IconPlayerPlay size={size / 2} className={dynamicClasses.button} />
                )}
            </ActionIcon>
        );
    }
};

export default PlayButton;
