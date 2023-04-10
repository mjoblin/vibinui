import React, { FC } from "react";
import { Modal, ScrollArea, Stack } from "@mantine/core";

import { Track } from "../../../app/types";
import { useAppGlobals } from "../../../app/hooks/useAppGlobals";
import MediaSummaryBanner from "../../shared/textDisplay/MediaSummaryBanner";
import TrackLyrics from "../currentTrack/TrackLyrics";

type TrackLyricsModalProps = {
    track: Track;
    opened: boolean;
    onClose?: () => void;
};

const TrackLyricsModal: FC<TrackLyricsModalProps> = ({ track, opened, onClose = undefined }) => {
    const { APP_MODAL_BLUR } = useAppGlobals();

    return (
        <Modal
            title={track.title}
            centered
            size="lg"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={() => onClose && onClose()}
        >
            <Stack>
                <MediaSummaryBanner media={track} />

                <ScrollArea h={`calc(80vh - 275px)`}>
                    <TrackLyrics trackId={track.id} />
                </ScrollArea>
            </Stack>
        </Modal>
    );
};

export default TrackLyricsModal;
