import React, { FC, useState } from "react";
import { Box, CloseButton, createStyles, Flex, Stack, Text, Title } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";

import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
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
    const system = useAppSelector((state: RootState) => state.system);
    const playback = useAppSelector((state: RootState) => state.playback);
    const [showDebug, setShowDebug] = useState<boolean>(false);
    const { classes } = useStyles();

    useHotkeys([["mod+D", () => setShowDebug(!showDebug)]]);

    const fontSize = 12;

    return showDebug ? (
        <Box className={classes.debugContainer}>
            <Flex justify="space-between" align="center" pb={5}>
                <Title size={13} color="#838383">DEBUG</Title>
                <CloseButton size="md" onClick={() => setShowDebug(false)} />
            </Flex>

            <Stack>
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
            </Stack>
        </Box>
    ) : null;
};

export default Debug;
