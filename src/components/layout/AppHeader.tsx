import React, { FC } from "react";
import { Box, createStyles, Flex, Header, Text, useMantineTheme } from "@mantine/core";

import { useAppConstants } from "../../app/hooks/useAppConstants";
import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import MiniController from "../currentlyPlaying/MiniController";
import VibinLogo from "./VibinLogo";

const AppHeader: FC = () => {
    const { colors } = useMantineTheme();
    const { APP_ALT_FONTFACE, HEADER_HEIGHT, NAVBAR_PADDING, NAVBAR_WIDTH } = useAppConstants();
    const currentScreen = useAppSelector(
        (state: RootState) => state.internal.application.currentScreen
    );

    const { classes: dynamicClasses } = createStyles(({ colors }) => ({
        screenName: {
            fontFamily: APP_ALT_FONTFACE,
            textTransform: "lowercase",
        },
    }))();

    return (
        <Header height={HEADER_HEIGHT} bg={colors.dark[6]}>
            <Flex align="center" sx={{ height: "100%" }}>
                <Box pl={NAVBAR_PADDING} miw={NAVBAR_WIDTH} maw={NAVBAR_WIDTH}>
                    <VibinLogo />
                </Box>
                <Flex pl={NAVBAR_PADDING} gap={20} align="center">
                    <Box miw={150} maw={150}>
                        <Text size={30} weight="bold" className={dynamicClasses.screenName}>
                            {currentScreen}
                        </Text>
                    </Box>
                    <MiniController />
                </Flex>
            </Flex>
        </Header>
    );
};

export default AppHeader;
