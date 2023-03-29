import React, { FC } from "react";
import { List, Modal, Paper, Stack } from "@mantine/core";

import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import VibinLogo from "./VibinLogo";

type WelcomeMessageProps = {
    opened: boolean;
    onClose: () => void;
}

const WelcomeMessage: FC<WelcomeMessageProps> = ({ opened, onClose }) => {
    const { APP_MODAL_BLUR } = useAppGlobals();

    return (
        <Modal
            opened={opened}
            centered
            title="Welcome to Vibin"
            overlayProps={{ blur: APP_MODAL_BLUR }}
            withCloseButton
            size={"30rem"}
            onClose={() => onClose && onClose()}
        >
            <Stack spacing={0} pt={20}>
                <Paper withBorder p={25}>
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

                <Paper p={25}>
                    <List icon={<VibinLogo compact />} styles={{ item: { paddingTop: 5 } }}>
                        <List.Item>
                            <b>Browse Local Media</b> by Artist, Album, Track.
                        </List.Item>
                        <List.Item>
                            <b>View Lyrics</b>, Waveforms, and External links.
                        </List.Item>
                        <List.Item>
                            <b>Filter</b> by Title, Genre, Year, Lyrics, and more.
                        </List.Item>
                        <List.Item>
                            <b>Presets</b> and <b>Favorites</b>.
                        </List.Item>
                        <List.Item>
                            <b>Other sources</b> like AirPlay and Internet Radio.
                        </List.Item>
                    </List>
                </Paper>
            </Stack>
        </Modal>
    );
};

export default WelcomeMessage;
