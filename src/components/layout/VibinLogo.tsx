import React, { FC } from "react";
import { Flex, Text, ThemeIcon } from "@mantine/core";
import { IconPlant2 } from "@tabler/icons";

import CustomFonts from "../customFonts/CustomFonts";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";

type VibinLogoProps = {
    compact?: boolean;
};

const VibinLogo: FC<VibinLogoProps> = ({ compact = false }) => {
    const { APP_ALT_FONTFACE } = useAppGlobals();

    if (compact) {
        return (
            <ThemeIcon size={24} color="green" radius="xl">
                <IconPlant2 size="1rem" />
            </ThemeIcon>
        );
    }

    return (
        <Flex align="center" gap={8}>
            <CustomFonts />
            <ThemeIcon size="lg" radius="xl" color="green">
                <IconPlant2 size="20" />
            </ThemeIcon>
            <Text size={23} weight={600} sx={{ fontFamily: APP_ALT_FONTFACE }}>
                vibin
            </Text>
        </Flex>
    );
};

export default VibinLogo;
