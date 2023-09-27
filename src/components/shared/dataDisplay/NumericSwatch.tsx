import React, { FC } from "react";
import { ColorSwatch, Text, useMantineTheme } from "@mantine/core";

// ================================================================================================
// Displays a number in a color swatch.
// ================================================================================================

type NumericSwatchProps = {
    number: number;
    size?: number;
};

const NumericSwatch: FC<NumericSwatchProps> = ({ number, size = 20 }) => {
    const theme = useMantineTheme();

    return (
        <ColorSwatch size={size} color={theme.colors.dark[4]}>
            <Text size="xs" weight="bold" color={theme.colors.gray[6]}>
                {number}
            </Text>
        </ColorSwatch>
    );
};

export default NumericSwatch;
