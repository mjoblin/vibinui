import React, { FC, useEffect, useRef, useState } from "react";
import {
    ActionIcon,
    Card,
    Center,
    createStyles,
    Image,
    Loader,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";

import { Preset } from "../../app/services/vibinPresets";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store/store";
import { IconPlayerPlay } from "@tabler/icons";
import { useLazyPlayPresetIdQuery } from "../../app/services/vibinPresets";
import { useAppConstants } from "../../app/hooks/useAppConstants";

const useStyles = createStyles((theme) => ({
    playPreset: {
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0,
        transition:
            "transform .2s ease-in-out, opacity .2s ease-in-out, backgroundColor .1s ease-in-out",
        "&:hover": {
            opacity: 0.95,
            backgroundColor: "rgb(0, 0, 0, 0.20)",
        },
    },
    presetConnecting: {
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgb(0, 0, 0, 0.90)",
    },
}));

type PresetCardProps = {
    preset: Preset;
};

const PresetCard: FC<PresetCardProps> = ({ preset }) => {
    const { classes } = useStyles();
    const { colors } = useMantineTheme();
    const { SELECTED_COLOR } = useAppConstants();
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );
    const playState = useAppSelector((state: RootState) => state.playback.play_status);
    const [playPresetId] = useLazyPlayPresetIdQuery();
    const [waitingForConnection, setWaitingForConnection] = useState<boolean>(false);
    const previousPlayState = useRef(playState);
    const previousIsPlayingState = useRef(preset.is_playing);

    // --------------------------------------------------------------------------------------------
    // The following two effects are in place to ensure that the preset's "active" state (i.e. that
    // it's currently being listened to) is correct. Ideally preset.is_playing could be relied on,
    // and it mostly can *except* for when a new preset is started. When a new preset is started,
    // there's a brief period where the preset's is_playing is true but *before* the playState is
    // "connecting". These two effects prevent a flash of the active border just before the
    // connecting playState is registered.
    //
    // TODO: This still flickers the active border when changing from a non-stream.radio preset
    //  to a stream-radio preset.
    //
    // TODO: When the UI is refreshed, a stream.media.upnp preset will have an is_playing of false,
    //  even if it was playing.

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

    const presetIsActive =
        preset.class === "stream.radio"
            ? preset.is_playing && playState === "play" && !waitingForConnection
            : preset.is_playing;

    const borderSize = 3;
    const overlayWidth = cardSize - borderSize * 2;
    const overlayHeight = cardSize - borderSize * 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        presetCard: {
            width: cardSize,
            border: presetIsActive
                ? `${borderSize}px solid ${SELECTED_COLOR}`
                : `${borderSize}px solid rgb(0, 0, 0, 0)`,
        },
    }))();

    return (
        <Card radius="sm" className={dynamicClasses.presetCard}>
            <Card.Section>
                <Image src={preset.art_url} fit="cover" radius={5} />

                {playState === "connecting" && preset.is_playing ? (
                    <Center w={overlayWidth} h={overlayHeight} className={classes.presetConnecting}>
                        <Stack spacing={5} align="center">
                            <Loader size="md" />
                            <Text>Connecting...</Text>
                        </Stack>
                    </Center>
                ) : !presetIsActive ? (
                    <Center w={overlayWidth} h={overlayHeight} className={classes.playPreset}>
                        <ActionIcon
                            size={80}
                            color={colors.blue[4]}
                            variant="filled"
                            radius={40}
                            onClick={() => {
                                playPresetId(preset.id);
                            }}
                        >
                            <IconPlayerPlay
                                size={50}
                                color={colors.blue[2]}
                                fill={colors.blue[2]}
                            />
                        </ActionIcon>
                    </Center>
                ) : null}

                {showDetails && (
                    <Stack spacing={0} pl={7} pr={7} pt={7} pb={3}>
                        <Text size="sm" weight="bold" sx={{ lineHeight: 1 }}>
                            {preset.name}
                        </Text>
                        <Text size="xs" color={colors.gray[6]}>
                            {preset.type}
                        </Text>
                    </Stack>
                )}
            </Card.Section>
        </Card>
    );
};

export default PresetCard;
