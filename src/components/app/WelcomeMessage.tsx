import React, { FC } from "react";
import { createStyles, Flex, List, Modal, Paper, Stack, Text } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import VibinLogo from "../shared/VibinLogo";

const useStyles = createStyles((theme) => ({
    sky: {
        paddingLeft: 35,
        paddingRight: 35,
        // Create a green-to-blue (grass-to-sky) background gradiant.
        background: "linear-gradient(0deg, #2ab810 0%, #3ac13d 10%, #7de9ff 40%, #3774ff 100%)",
        borderRadius: 5,
    },
}));

type WelcomeMessageProps = {
    opened: boolean;
    onClose: () => void;
};

const WelcomeMessage: FC<WelcomeMessageProps> = ({ opened, onClose }) => {
    const { classes } = useStyles();
    const { APP_MODAL_BLUR } = useAppGlobals();

    return (
        <Modal
            opened={opened}
            centered
            title="Welcome to Vibin"
            overlayProps={{ blur: APP_MODAL_BLUR }}
            withCloseButton
            size={"33rem"}
            onClose={() => onClose && onClose()}
        >
            <Stack spacing={0} pt={0}>
                {/* Header of a chipmunk spying some nuts on a nice sunny day */}
                <Flex justify="space-between" mb={20} className={classes.sky}>
                    <Text
                        size={30}
                        sx={{ transform: "scale(-1, 1)", textShadow: "0 0 2px #ccc, 0 0 5px #ccc" }}
                    >
                        🐿️
                    </Text>
                    <Text
                        size={30}
                        sx={{
                            transform: "scale(-1, 1)",
                            textShadow: "0 0 7px #fff, 0 0 10px #fff",
                        }}
                    >
                        🥜️
                    </Text>
                </Flex>

                <Stack spacing={20}>
                    <Paper withBorder p={25} pt={20} pb={20}>
                        <List icon={<VibinLogo compact />}>
                            <List.Item>
                                Vibin is <b>Playlist Oriented</b>.
                            </List.Item>
                            <List withPadding>
                                <List.Item>
                                    Music is listened to by <b>replacing the Playlist</b>.
                                </List.Item>
                                <List.Item>
                                    Music can be <b>added</b> to an existing Playlist.
                                </List.Item>
                                <List.Item>
                                    Playlists can be <b>edited</b> and <b>saved</b>.
                                </List.Item>
                            </List>
                        </List>
                    </Paper>

                    <Paper withBorder p={25} pt={20} pb={20}>
                        <List icon={<VibinLogo compact />} styles={{ item: { paddingTop: 5 } }}>
                            <List.Item>
                                See what's playing under <b>Now Playing</b>.
                            </List.Item>
                            <List.Item>
                                Browse Local Media under <b>Browse</b>.
                            </List.Item>
                        </List>
                    </Paper>
                </Stack>

                <Paper p={25}>
                    <List icon={<VibinLogo compact outline />} styles={{ item: { paddingTop: 5 } }}>
                        <List.Item>
                            <b>View Lyrics</b> and Waveforms.
                        </List.Item>
                        <List.Item>
                            <b>Filter</b> by Title, Genre, Year, Lyrics, and more.
                        </List.Item>
                        <List.Item>
                            Access <b>Presets</b> and <b>Favorites</b>.
                        </List.Item>
                        <List.Item>
                            <b>Play other sources</b> like AirPlay and Internet Radio.
                        </List.Item>
                    </List>
                </Paper>
            </Stack>
        </Modal>
    );
};

export default WelcomeMessage;
