import React from "react";
import { Flex, useMantineTheme } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

// ================================================================================================
// Warning banner with an alert icon.
// ================================================================================================

type WarningBannerProps = {
    children?: any;
};

const WarningBanner = React.forwardRef<HTMLDivElement, WarningBannerProps>(({ children }, ref) => {
    const { colors } = useMantineTheme();

    return (
        <Flex ref={ref} align="center" justify="center" gap={10} bg="#444411" p={15} mb={10}>
            <IconAlertCircle size={20} color={colors.yellow[4]} />
            {children}
        </Flex>
    );
});

export default WarningBanner;
