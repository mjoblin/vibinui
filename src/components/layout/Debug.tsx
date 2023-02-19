import React, { FC } from "react";
import { Box, CloseButton, createStyles, Flex, Stack, Title } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import Draggable from "react-draggable";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setShowDebugPanel } from "../../app/store/internalSlice";
import FieldValueList from "../fieldValueList/FieldValueList";

const useStyles = createStyles((theme) => ({
    debugContainer: {
        zIndex: 9999,
        backgroundColor: "rgb(0.15, 0.15, 0.15, 0.85)",
        position: "absolute",
        bottom: 10,
        right: 20,
        paddingTop: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        border: `1px solid ${theme.colors.gray[8]}`,
        borderRadius: 5,
    },
}));

const Debug: FC = () => {
    const dispatch = useAppDispatch();
    const { classes } = useStyles();
    const system = useAppSelector((state: RootState) => state.system);
    const playback = useAppSelector((state: RootState) => state.playback);
    const storedPlaylists = useAppSelector((state: RootState) => state.storedPlaylists);
    const { showDebugPanel } = useAppSelector((state: RootState) => state.internal.application);

    useHotkeys([["D", () => dispatch(setShowDebugPanel(!showDebugPanel))]]);

    const fontSize = 12;

    return showDebugPanel ? (
        <Draggable bounds="parent">
            <Box className={classes.debugContainer}>
                <Flex justify="space-between" align="center" pb={5}>
                    <Title size={13} color="#838383">
                        DEBUG
                    </Title>
                    <CloseButton size="md" onClick={() => dispatch(setShowDebugPanel(false))} />
                </Flex>

                <Stack>
                    {/* System */}
                    <Stack spacing={0}>
                        <Title size={fontSize}>SYSTEM</Title>
                        <FieldValueList
                            fieldValues={{
                                streamerName: system.streamer.name || "undefined",
                                streamerPower: system.streamer.power || "undefined",
                                mediaDeviceName: system.media_device.name || "undefined",
                            }}
                            keySize={fontSize}
                            valueSize={fontSize}
                        />
                    </Stack>

                    {/* Playback */}
                    <Stack spacing={0}>
                        <Title size={fontSize}>PLAYBACK</Title>
                        <FieldValueList
                            fieldValues={{
                                playStatus: playback.play_status || "undefined",
                                currentAudioSource: playback.current_audio_source || "undefined",
                                currentTrackMediaId: playback.current_track_media_id || "<none>",
                                currentAlbumMediaId: playback.current_album_media_id || "<none>",
                            }}
                            keySize={fontSize}
                            valueSize={fontSize}
                        />
                    </Stack>

                    {/* Stored Playlists */}
                    <Stack spacing={0}>
                        <Title size={fontSize}>STORED PLAYLISTS</Title>
                        <FieldValueList
                            fieldValues={{
                                activeStoredPlaylistId:
                                    storedPlaylists.active_stored_playlist_id || "undefined",
                                activeSyncedWithStore: storedPlaylists.active_synced_with_store
                                    ? "True"
                                    : "False",
                                activatingStoredPlaylist: storedPlaylists.activating_stored_playlist
                                    ? "True"
                                    : "False",
                                count: storedPlaylists.stored_playlists.length,
                            }}
                            keySize={fontSize}
                            valueSize={fontSize}
                        />
                    </Stack>
                </Stack>
            </Box>
        </Draggable>
    ) : null;
};

export default Debug;
