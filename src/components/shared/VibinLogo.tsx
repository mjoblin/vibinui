import React, { FC } from "react";
import { Center, Flex, Text, ThemeIcon, createStyles } from "@mantine/core";
import { IconPlant2 } from "@tabler/icons";

import CustomFonts from "../app/customFonts/CustomFonts";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";

const useStyles = createStyles((theme) => ({
    outline: {
        border: "1px solid green",
        borderRadius: 12,
        width: 25,
        height: 25,
    },
}));

type VibinLogoProps = {
    compact?: boolean;
    outline?: boolean;
};

const VibinLogo: FC<VibinLogoProps> = ({ compact = false, outline = false }) => {
    const { classes } = useStyles();
    const { APP_ALT_FONTFACE } = useAppGlobals();

    if (compact) {
        if (outline) {
            return (
                <Center className={classes.outline}>
                    <IconPlant2 size="1rem" />
                </Center>
            );
        } else {
            return (
                <ThemeIcon size={24} color="green" radius="xl">
                    <IconPlant2 size="1rem" />
                </ThemeIcon>
            );
        }
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
