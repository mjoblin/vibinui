import React, { FC } from "react";
import { Flex, Modal, Stack } from "@mantine/core";

import { isAlbum, isPreset, isTrack, Media } from "../../../app/types";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import MediaArt from "./MediaArt";
import MediaSummaryBanner from "../textDisplay/MediaSummaryBanner";

// ================================================================================================
// Show a Media item's art as a modal.
// ================================================================================================

type ArtModalProps = {
    media: Media;
    opened: boolean;
    onClose?: () => void;
};

const ArtModal: FC<ArtModalProps> = ({ media, opened, onClose = undefined }) => {
    const { APP_MODAL_BLUR } = useAppGlobals();

    const title = isAlbum(media)
        ? "Album Art"
        : isTrack(media)
        ? "Track Art"
        : isPreset(media)
        ? "Preset Art"
        : "Art";

    return (
        <Modal
            title={title}
            centered
            size="lg"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={() => onClose && onClose()}
        >
            <Stack>
                <MediaSummaryBanner media={media} showArt={false} />
                <Flex>
                    <MediaArt media={media} showControls={false} />
                </Flex>
            </Stack>
        </Modal>
    );
};

export default ArtModal;
