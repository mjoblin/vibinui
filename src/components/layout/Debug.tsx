import React, { FC } from "react";
import { Box, CloseButton, createStyles, Flex, Stack, Title, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import Draggable from "react-draggable";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setShowDebugPanel } from "../../app/store/internalSlice";
import FieldValueList from "../fieldValueList/FieldValueList";

const useStyles = createStyles((theme) => ({
    debugContainer: {
        pointerEvents: "all",
        zIndex: 999,
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
    dragHandle: {
        backgroundImage: `radial-gradient(${theme.colors.dark[4]} 20%, ${theme.colors.dark[7]} 20%)`,
        backgroundPosition: "0 0",
        backgroundSize: "3px 3px",
        "&:hover": {
            cursor: "grab",
        },
    },
}));

const Debug: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { classes } = useStyles();
    const system = useAppSelector((state: RootState) => state.system);
    const playback = useAppSelector((state: RootState) => state.playback);
    const playlist = useAppSelector((state: RootState) => state.playlist);
    const storedPlaylists = useAppSelector((state: RootState) => state.storedPlaylists);
    const { showDebugPanel, websocketStatus } = useAppSelector(
        (state: RootState) => state.internal.application
    );

    useHotkeys([["D", () => dispatch(setShowDebugPanel(!showDebugPanel))]]);

    const fontSize = 12;

    return showDebugPanel ? (
        <Draggable bounds="parent" handle=".dragHandle">
            <Box className={classes.debugContainer}>
                <Flex justify="space-between" align="center" pb={5}>
                    <Title
                        size={13}
                        color={colors.dark[1]}
                        w="100%"
                        className={`dragHandle ${classes.dragHandle}`}
                        transform="uppercase"
                    >
                        Debug
                    </Title>
                    <CloseButton size="md" onClick={() => dispatch(setShowDebugPanel(false))} />
                </Flex>

                <Stack>
                    {/* Application */}
                    <Stack spacing={0}>
                        <Title size={fontSize} transform="uppercase">
                            Application
                        </Title>
                        <FieldValueList
                            fieldValues={{
                                websocketStatus: websocketStatus || "undefined",
                            }}
                            keySize={fontSize}
                            valueSize={fontSize}
                        />
                    </Stack>

                    {/* System */}
                    <Stack spacing={0}>
                        <Title size={fontSize} transform="uppercase">
                            System
                        </Title>
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
                        <Title size={fontSize} transform="uppercase">
                            Playback
                        </Title>
                        <FieldValueList
                            fieldValues={{
                                playStatus: playback.play_status || "undefined",
                                playhead: `${playback.playhead.position} [${playback.playhead.position_normalized.toFixed(3)}]`,
                                activeTransportActions:
                                    playback.active_transport_actions.length > 0
                                        ? playback.active_transport_actions.join(", ")
                                        : "<none>",
                                currentAudioSourceName:
                                    playback.current_audio_source?.name || "undefined",
                                currentTrackMediaId: playback.current_track_media_id || "<none>",
                                currentAlbumMediaId: playback.current_album_media_id || "<none>",
                            }}
                            keySize={fontSize}
                            valueSize={fontSize}
                        />
                    </Stack>

                    {/* Playlist */}
                    <Stack spacing={0}>
                        <Title size={fontSize} transform="uppercase">
                            Current Playlist
                        </Title>
                        <FieldValueList
                            fieldValues={{
                                entryCount: playlist.entries?.length || 0,
                                currentTrackIndex:
                                    typeof playlist.current_track_index === "undefined"
                                        ? "undefined"
                                        : playlist.current_track_index,
                            }}
                            keySize={fontSize}
                            valueSize={fontSize}
                        />
                    </Stack>

                    {/* Stored Playlists */}
                    <Stack spacing={0}>
                        <Title size={fontSize} transform="uppercase">
                            Stored Playlists
                        </Title>
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
