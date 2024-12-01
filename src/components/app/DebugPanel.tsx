import React, { FC } from "react";
import { Box, CloseButton, createStyles, Flex, Stack, Title, useMantineTheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import Draggable from "react-draggable";

import { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks/store";
import { setShowDebugPanel } from "../../app/store/internalSlice";
import FieldValueList from "../shared/dataDisplay/FieldValueList";

// ================================================================================================
// Debug panel. Activated via keyboard shortcut.
//
// The goal for this component to show information which is often useful to see, without having to
// open the browser developer tools.
//
// Contents:
//  - Websocket connection status.
//  - System information (streamer name, media device name, etc).
//  - Playback status (play mode, active transport controls, current track/album ids, etc).
//  - Current Playlist information.
//  - Stored Playlists information.
// ================================================================================================

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

const DebugPanel: FC = () => {
    const dispatch = useAppDispatch();
    const { colors } = useMantineTheme();
    const { classes } = useStyles();
    const system = useAppSelector((state: RootState) => state.system);
    const playback = useAppSelector((state: RootState) => state.playback);
    const activePlaylist = useAppSelector((state: RootState) => state.activePlaylist);
    const storedPlaylists = useAppSelector((state: RootState) => state.storedPlaylists);
    const { showDebugPanel, websocketStatus } = useAppSelector(
        (state: RootState) => state.internal.application,
    );

    useHotkeys([["shift+D", () => dispatch(setShowDebugPanel(!showDebugPanel))]]);

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
                                mediaServerName: system.media_server?.name || "undefined",
                                amplifierName: system.amplifier?.name || "undefined",
                                amplifierPower: system.amplifier?.power || "undefined",
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
                                    system.streamer.sources?.active?.name || "undefined",
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
                                entryCount: activePlaylist.entries?.length || 0,
                                currentTrackIndex:
                                    typeof activePlaylist.current_track_index === "undefined"
                                        ? "undefined"
                                        : activePlaylist.current_track_index,
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
                                    storedPlaylists.status.active_id || "undefined",
                                activeSyncedWithStore: storedPlaylists.status
                                    .is_active_synced_with_store
                                    ? "True"
                                    : "False",
                                activatingStoredPlaylist: storedPlaylists.status
                                    .is_activating_playlist
                                    ? "True"
                                    : "False",
                                count: storedPlaylists.playlists.length,
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

export default DebugPanel;
