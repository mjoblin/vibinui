import React, { FC } from "react";
import { Modal, Stack } from "@mantine/core";

import { Track } from "../../app/types";
import { useAppGlobals } from "../../app/hooks/useAppGlobals";
import MediaSummaryBanner from "../shared/MediaSummaryBanner";
import Waveform from "../nowPlaying/Waveform";

type TrackWaveformModalProps = {
    track: Track;
    opened: boolean;
    onClose?: () => void;
};

const TrackWaveformModal: FC<TrackWaveformModalProps> = ({
    track,
    opened,
    onClose = undefined,
}) => {
    const { APP_MODAL_BLUR } = useAppGlobals();

    return (
        <Modal
            title={track.title}
            centered
            size="xl"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={() => onClose && onClose()}
        >
            <Stack>
                <MediaSummaryBanner media={track} />
                <Waveform trackId={track.id} width={2048} height={700} showProgress={false} />
            </Stack>
        </Modal>
    );
};

export default TrackWaveformModal;
