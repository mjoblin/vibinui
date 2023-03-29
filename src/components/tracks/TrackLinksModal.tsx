import React, { FC } from "react";
import { Box, Modal, Stack } from "@mantine/core";

import { Track } from "../../app/types";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import MediaSummaryBanner from "../shared/MediaSummaryBanner";
import TrackLinks from "../nowPlaying/TrackLinks";

type TrackLinksModalProps = {
    track: Track;
    opened: boolean;
    onClose?: () => void;
};

const TrackLinksModal: FC<TrackLinksModalProps> = ({ track, opened, onClose = undefined }) => {
    const { APP_MODAL_BLUR } = useAppGlobals();

    return (
        <Modal
            title={track.title}
            centered
            size="md"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={() => onClose && onClose()}
        >
            <Stack>
                <MediaSummaryBanner media={track} />
                <Box pt={10} pb={10}>
                    <TrackLinks trackId={track.id} />
                </Box>
            </Stack>
        </Modal>
    );
};

export default TrackLinksModal;
