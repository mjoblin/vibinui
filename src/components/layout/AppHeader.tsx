import React, { FC } from "react";
import { Box, Flex, Header, useMantineTheme } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";
import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import MiniController from "../currentlyPlaying/MiniController";
import StylizedLabel from "../shared/StylizedLabel";
import VibinLogo from "./VibinLogo";

const AppHeader: FC = () => {
    const { colors } = useMantineTheme();
    const { HEADER_HEIGHT, NAVBAR_PADDING, NAVBAR_WIDTH } = useAppConstants();
    const currentScreen = useAppSelector(
        (state: RootState) => state.internal.application.currentScreen
    );

    return (
        <Header height={HEADER_HEIGHT} bg={colors.dark[6]}>
            <Flex align="center" sx={{ height: "100%" }}>
                <Box pl={NAVBAR_PADDING} miw={NAVBAR_WIDTH} maw={NAVBAR_WIDTH}>
                    <VibinLogo />
                </Box>
                <Flex pl={NAVBAR_PADDING} gap={20} align="center">
                    <Box miw={150} maw={150}>
                        <StylizedLabel>{currentScreen}</StylizedLabel>
                    </Box>
                    <MiniController />
                </Flex>
            </Flex>
        </Header>
    );
};

export default AppHeader;
