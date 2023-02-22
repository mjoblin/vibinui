import React, { FC } from "react";
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
    const { cardSize, showDetails } = useAppSelector(
        (state: RootState) => state.userSettings.presets
    );
    const { play_status: playState } = useAppSelector((state: RootState) => state.playback);
    const [playPresetId] = useLazyPlayPresetIdQuery();

    const presetIsActive = preset.is_playing && playState === "play";
    const borderSize = 3;
    const overlayWidth = cardSize - borderSize * 2;
    const overlayHeight = cardSize - borderSize * 2;

    const { classes: dynamicClasses } = createStyles((theme) => ({
        presetCard: {
            width: cardSize,
            border: presetIsActive
                ? `${borderSize}px solid ${colors.yellow[4]}`
                : `${borderSize}px solid rgb(0, 0, 0, 0)`,
        },
    }))();

    return (
        <Card radius="sm" p={7} className={dynamicClasses.presetCard}>
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
