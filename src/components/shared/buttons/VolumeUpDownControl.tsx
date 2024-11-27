// ================================================================================================
// Allows the user to nudge the amplifier's volume up and down.
// ================================================================================================

import { FC } from "react";
import { ActionIcon, Flex, useMantineTheme } from "@mantine/core";
import { useAppSelector } from "../../../app/hooks/store";
import { RootState } from "../../../app/store/store";
import {
    useAmplifierVolumeDownMutation,
    useAmplifierVolumeUpMutation,
} from "../../../app/services/vibinSystem";
import { IconSquareRoundedMinusFilled, IconSquareRoundedPlusFilled } from "@tabler/icons-react";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";

const VolumeUpDownControl: FC = () => {
    const theme = useMantineTheme();
    const { STYLE_DISABLEABLE } = useAppGlobals();
    const system = useAppSelector((state: RootState) => state.system);
    const [amplifierVolumeUp] = useAmplifierVolumeUpMutation();
    const [amplifierVolumeDown] = useAmplifierVolumeDownMutation();

    const amplifier = system.amplifier;
    const isAmpOn =
        amplifier && (amplifier.power ? amplifier.power === "on" : system.power === "on");
    const colorStandard =
        theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.dark[3];

    return (
        <Flex gap={1} align="center">
            <ActionIcon
                disabled={!isAmpOn}
                sx={STYLE_DISABLEABLE}
                onClick={() => amplifierVolumeDown()}
            >
                <IconSquareRoundedMinusFilled style={{ color: colorStandard }} />
            </ActionIcon>
            <ActionIcon
                disabled={!isAmpOn}
                sx={STYLE_DISABLEABLE}
                onClick={() => amplifierVolumeUp()}
            >
                <IconSquareRoundedPlusFilled style={{ color: colorStandard }} />
            </ActionIcon>
        </Flex>
    );
};

export default VolumeUpDownControl;
