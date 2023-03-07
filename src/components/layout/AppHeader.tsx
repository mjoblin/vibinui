import React, { FC } from "react";
import { Box, Flex, Header, useMantineTheme } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";
import MiniController from "../currentlyPlaying/MiniController";
import VibinLogo from "./VibinLogo";

const AppHeader: FC = () => {
    const { colors } = useMantineTheme();
    const { HEADER_HEIGHT, NAVBAR_PADDING, NAVBAR_WIDTH } = useAppConstants();

    return (
        <Header height={HEADER_HEIGHT} bg={colors.dark[6]}>
            <Flex align="center" sx={{ height: "100%" }}>
                <Box pl={NAVBAR_PADDING} miw={NAVBAR_WIDTH} maw={NAVBAR_WIDTH}>
                    <VibinLogo />
                </Box>
                <Box pl={25}>
                    <MiniController />
                </Box>
            </Flex>
        </Header>
    );
};

export default AppHeader;
