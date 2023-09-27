import React, { FC, useEffect, useRef, useState } from "react";
import {
    Box,
    Card,
    Center,
    ColorSwatch,
    createStyles,
    Flex,
    Loader,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";

import { Preset } from "../../../app/types";
import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import { useLazyPlayPresetIdQuery } from "../../../app/services/vibinPresets";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import MediaArt from "../../shared/mediaDisplay/MediaArt";

// ================================================================================================
// A card representing a single Preset.
//
// Preset cards are different from Album/Track/Artist cards. Preset cards a simpler. They show the
// Preset art along with some details and a play button. Since Preset cards also represent
// non-local sources (such as Internet Radio), they're aware of the "connecting" state when preset
// play is initiated.
// ================================================================================================

const useStyles = createStyles((theme) => ({
    presetConnecting: {
        position: "absolute",
        zIndex: 9, // TODO: Remove reliance on zIndex when MediaArt no longer uses zIndex
        top: 0,
        left: 0,
        backgroundColor: "rgb(0, 0, 0, 0.90)",
    },
}));

type PresetCardProps = {
    preset: Preset;
    size?: number;
    showDetails?: boolean;
    showLoading?: boolean;
};

const PresetCard: FC<PresetCardProps> = ({
    preset,
    size = 50,
    showDetails = true,
    showLoading = true,
}) => {
    const theme = useMantineTheme();
    const { classes } = useStyles();
    const { CURRENTLY_PLAYING_COLOR } = useAppGlobals();
    const playState = useAppSelector((state: RootState) => state.playback.play_status);
    const [playPresetId] = useLazyPlayPresetIdQuery();
    const [waitingForConnection, setWaitingForConnection] = useState<boolean>(false);
    const previousPlayState = useRef(playState);
    const previousIsPlayingState = useRef(preset.is_playing);

    /**
     * The following two effects are in place to ensure that the Preset's "active" state (i.e. that
     * it's currently being listened to) is correct. Ideally preset.is_playing could be relied on,
     * and it mostly can *except* for when a new Preset is started. When a new Preset is started,
     * there's a brief period where the Preset's is_playing is true but *before* the playState is
     * "connecting". These two effects prevent a flash of the active border just before the
     * connecting playState is registered.
     *
     * TODO: This still flickers the active border when changing from a non-stream.radio preset
     *  to a stream-radio preset.
     *
     * TODO: When the UI is refreshed, a stream.media.upnp preset will have an is_playing of false,
     *  even if it was playing.
     */
    useEffect(() => {
        if (preset.is_playing !== previousIsPlayingState.current) {
            setWaitingForConnection(preset.is_playing);
            previousIsPlayingState.current = preset.is_playing;
        }
    }, [preset.is_playing]);

    useEffect(() => {
        if (playState !== previousPlayState.current) {
            if (previousPlayState.current === "connecting") {
                setWaitingForConnection(false);
            }
            previousPlayState.current = playState;
        }
    }, [playState]);

    // --------------------------------------------------------------------------------------------

    const presetIsCurrentlyPlaying =
        preset.class === "stream.radio"
            ? preset.is_playing && playState === "play" && !waitingForConnection
            : preset.is_playing;

    const borderSize = 3;

    const artWidth = size - borderSize * 2;
    const artHeight = size - borderSize * 2;

    const overlayWidth = artWidth;
    const overlayHeight = artHeight;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        presetCard: {
            width: size,
            border: presetIsCurrentlyPlaying
                ? `${borderSize}px solid ${CURRENTLY_PLAYING_COLOR}`
                : `${borderSize}px solid rgb(0, 0, 0, 0)`,
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[3],
        },
    }))();

    return (
        <Card radius="sm" className={dynamicClasses.presetCard}>
            <Card.Section>
                <MediaArt
                    media={preset}
                    showLoading={showLoading}
                    showActions={false}
                    showFavoriteIndicator={false}
                    showPlayButton={true}
                    centerPlayButton={true}
                    onPlay={() => playPresetId(preset.id)}
                />

                {playState === "connecting" && preset.is_playing && (
                    <Center w={overlayWidth} h={overlayHeight} className={classes.presetConnecting}>
                        <Stack spacing={5} align="center">
                            <Loader size="md" />
                            <Text>connecting...</Text>
                        </Stack>
                    </Center>
                )}

                {showDetails && (
                    <Flex justify="space-between" gap={5}>
                        {/* Preset number */}
                        <Box pl={3} pt={4}>
                            <ColorSwatch size={20} color={theme.colors.dark[4]}>
                                <Text size="xs" weight="bold" color={theme.colors.gray[6]}>
                                    {preset.id}
                                </Text>
                            </ColorSwatch>
                        </Box>

                        {/* Preset details */}
                        <Stack spacing={0} pr={7} pt={7} pb={3} sx={{ flexGrow: 1 }}>
                            <Text size="sm" weight="bold" sx={{ lineHeight: 1 }}>
                                {preset.name}
                            </Text>
                            <Text size="xs" color={theme.colors.gray[6]}>
                                {preset.type}
                            </Text>
                        </Stack>
                    </Flex>
                )}
            </Card.Section>
        </Card>
    );
};

export default PresetCard;
