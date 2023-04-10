import React, { FC } from "react";
import { Box, Flex, Header, useMantineTheme } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks/useInterval";
import PlaybackControls from "../app/playbackControls/PlaybackControls";
import StylizedLabel from "../shared/textDisplay/StylizedLabel";
import VibinLogo from "../shared/VibinLogo";
import StreamerOffWarning from "../shared/textDisplay/StreamerOffWarning";

type AppHeaderProps = {
    noBackground?: boolean;
};

const AppHeader: FC<AppHeaderProps> = ({ noBackground = false }) => {
    const theme = useMantineTheme();
    const { HEADER_HEIGHT, APP_PADDING, NAVBAR_WIDTH } = useAppGlobals();
    const { power: streamerPower } = useAppSelector((state: RootState) => state.system.streamer);
    const currentScreen = useAppSelector(
        (state: RootState) => state.internal.application.currentScreen
    );

    return (
        <Header
            w="100%"
            height={HEADER_HEIGHT}
            pl={APP_PADDING}
            pr={APP_PADDING}
            styles={{
                root: {
                    backgroundColor: noBackground
                        ? "rgb(0, 0, 0, 0)"
                        : theme.colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.white,
                },
            }}
        >
            <Flex align="center" sx={{ height: "100%" }}>
                <Box miw={NAVBAR_WIDTH} maw={NAVBAR_WIDTH}>
                    <VibinLogo />
                </Box>

                <Flex gap={20} align="center" sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box miw={150} maw={150}>
                        <StylizedLabel>{currentScreen}</StylizedLabel>
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <PlaybackControls />
                    </Box>
                </Flex>

                {streamerPower === "off" && <StreamerOffWarning />}
            </Flex>
        </Header>
    );
};

export default AppHeader;
