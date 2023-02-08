import React, { FC, useState } from "react";
import { Box, CloseButton, createStyles, Flex, Text, Stack } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";

import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import FieldValueList from "../fieldValueList/FieldValueList";

const useStyles = createStyles((theme) => ({
    debugContainer: {
        zIndex: 9999,
        backgroundColor: "rgb(0.15, 0.15, 0.15, 0.9)",
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
    const playback = useAppSelector((state: RootState) => state.playback);
    const [showDebug, setShowDebug] = useState<boolean>(false);
    const { classes } = useStyles();

    useHotkeys([["mod+D", () => setShowDebug(!showDebug)]]);

    return showDebug ? (
        <Box className={classes.debugContainer}>
            <Flex justify="space-between" align="center" pb={5}>
                <Text size="sm">Debug</Text>
                <CloseButton size="md" onClick={() => setShowDebug(false)} />
            </Flex>

            <Stack>
                <FieldValueList
                    fieldValues={{
                        currentTrackMediaId: playback.current_track_media_id || "<none>",
                        currentAlbumMediaId: playback.current_album_media_id || "<none>",
                    }}
                />
            </Stack>
        </Box>
    ) : null;
};

export default Debug;
