import React, { FC, useState } from "react";
import { Image, Modal, Skeleton, Stack, useMantineTheme } from "@mantine/core";

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
    const [isLoadingArt, setIsLoadingArt] = useState<boolean>(true);

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

                {/* TODO: Consider merging AlbumArt and TrackArt into a single component,
                        which could then be used here. */}
                <Skeleton visible={isLoadingArt} miw="100%" sx={{ aspectRatio: "1.0" }}>
                    <Image
                        src={(media as Track).art_url || media.album_art_uri}
                        radius={5}
                        fit="cover"
                        withPlaceholder={true}
                        placeholder={<NoArtPlaceholder backgroundColor={colors.dark[5]} />}
                        onLoad={() => setIsLoadingArt(false)}
                    />
                </Skeleton>
            </Stack>
        </Modal>
    );
};

export default ArtModal;
