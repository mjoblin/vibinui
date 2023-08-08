import React, { FC } from "react";
import { Image, Modal, Stack, useMantineTheme } from "@mantine/core";

import { Album, Track } from "../../../app/types";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import MediaSummaryBanner from "../textDisplay/MediaSummaryBanner";
import NoArtPlaceholder from "./NoArtPlaceholder";

// ================================================================================================
// Show a Track/Album's art as a modal.
// ================================================================================================

type ArtModalProps = {
    media: Album | Track;
    opened: boolean;
    onClose?: () => void;
};

const ArtModal: FC<ArtModalProps> = ({ media, opened, onClose = undefined }) => {
    const { APP_MODAL_BLUR } = useAppGlobals();
    const { colors } = useMantineTheme();

    const isTrack = "album" in media;

    return (
        <Modal
            title={`${isTrack ? "Track" : "Album"} Art`}
            centered
            size="lg"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={() => onClose && onClose()}
        >
            <Stack>
                <MediaSummaryBanner media={media} showArt={false} />

                <Image
                    src={(media as Track).art_url || media.album_art_uri}
                    radius={5}
                    fit="cover"
                    withPlaceholder={true}
                    placeholder={<NoArtPlaceholder backgroundColor={colors.dark[5]} />}
                />
            </Stack>
        </Modal>
    );
};

export default ArtModal;
