import React, { FC } from "react";
import { Flex, Text, ThemeIcon } from "@mantine/core";
import { IconPlant2 } from "@tabler/icons";

import CustomFonts from "../customFonts/CustomFonts";

const VibinLogo: FC = () => {
    return (
        <Flex align="center" gap={8}>
            <CustomFonts />
            <ThemeIcon size="lg" radius="xl" color="green">
                <IconPlant2 size="20" />
            </ThemeIcon>
            <Text size="lg" weight={600} sx={{ fontFamily: "Kanit" }}>
                vibin
            </Text>
        </Flex>
    );
};

export default VibinLogo;
