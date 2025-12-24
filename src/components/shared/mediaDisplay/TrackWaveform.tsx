import React, { FC, useEffect, useRef, useState } from "react";
import {
    Badge,
    Box,
    createStyles,
    Flex,
    Image,
    Skeleton,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import Draggable, { DraggableData } from "react-draggable";

import { MediaId } from "../../../app/types";
import { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import { useSeekMutation } from "../../../app/services/vibinTransport";
import { useGetRMSQuery } from "../../../app/services/vibinTracks";

// ================================================================================================
// Display a waveform for a Track. Optionally displays the current playhead progress over the
// waveform, which can be dragged to seek into the track.
// ================================================================================================

// TODO: This component could perform optimistic playhead display updates to ensure that dropping
//  a new playhead position doesn't result in a brief delay before the update is displayed.

const useStyles = createStyles((theme) => ({
    waveformProgress: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        opacity: 0.35,
        background: "#000000",
        borderRadius: 5,
    },
    dragHandle: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        cursor: "col-resize",
        borderLeft: "1px solid #a0a0a0",
        "&:hover": {
            borderLeft: "3px solid #ffffff",
        },
    },
}));

const TrackWaveformProgress: FC = () => {
    const { classes } = useStyles();
    const [seek] = useSeekMutation();
    const { position_normalized } = useAppSelector((state: RootState) => state.playback.playhead);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragHandleXAtDragStart, setDragHandleXAtDragStart] = useState<number>(0);
    const [dragHandleRightOffset, setDragHandleRightOffset] = useState<string>("100%");
    const [dragHandleKey, setDragHandleKey] = useState<number>(Math.random());
    const nodeRef = useRef(null);

    /**
     * Set the position of the drag handle, relative to the far right of the waveform. This gets
     * done whenever the playhead position updates (unless the user is dragging the handle).
     */
    useEffect(() => {
        if (!isDragging) {
            setDragHandleRightOffset(`${(1 - position_normalized) * 100}%`);
        }
    }, [isDragging, position_normalized]);

    return (
        <>
            <Box
                className={classes.waveformProgress}
                sx={{ right: `${(1 - position_normalized) * 100}%` }}
            />
            <Draggable
                key={dragHandleKey}
                nodeRef={nodeRef}
                axis="x"
                bounds="parent"
                defaultPosition={{ x: 0, y: 0 }}
                onStart={(e, data) => {
                    // TODO: Determine the proper approach to keeping TS happy.
                    // @ts-ignore
                    setDragHandleXAtDragStart(e.target?.offsetLeft || 0);
                    setIsDragging(true);
                }}
                // @ts-ignore
                onStop={(event: Event, data: DraggableData) => {
                    setIsDragging(false);

                    // @ts-ignore
                    const waveformWidthInPixels = event.target?.parentElement?.offsetWidth;
                    const pixelsFromHandleXAtDragStart = data.x;

                    if (isNaN(waveformWidthInPixels) || isNaN(pixelsFromHandleXAtDragStart)) {
                        return;
                    }

                    const newPlayheadPosition =
                        (dragHandleXAtDragStart + pixelsFromHandleXAtDragStart) /
                        waveformWidthInPixels;

                    seek(newPlayheadPosition);

                    // This key set is a hack to work around <Draggable> setting a transform on the
                    // draggable div, which throws things off here due to the handle constantly
                    // moving as the track progresses. Setting a new key forces React to create a
                    // new <Draggable> every time onStop() is invoked.
                    //
                    // TODO: Investigate a better way to achieve <Draggable> behavior on an element
                    //  (the drag handle) which is also moving based on track playhead updates.
                    setDragHandleKey(Math.random());
                }}
            >
                <div
                    ref={nodeRef}
                    className={classes.dragHandle}
                    style={{ right: dragHandleRightOffset }}
                />
            </Draggable>
        </>
    );
};

// ------------------------------------------------------------------------------------------------

type TrackWaveformProps = {
    trackId?: MediaId;
    width?: number;
    height?: number;
    showProgress?: boolean;
};

const TrackWaveform: FC<TrackWaveformProps> = ({
    trackId,
    width = 800,
    height = 250,
    showProgress = true,
}) => {
    const { colors } = useMantineTheme();
    const { waveforms_enabled: waveformsEnabled } = useAppSelector(
        (state: RootState) => state.vibinStatus
    );
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const { data: rms, isSuccess: haveRMS } = useGetRMSQuery(trackId!, {
        skip: !trackId || !waveformsEnabled,
    });
    const [isLoadingWaveform, setIsLoadingWaveform] = useState<boolean>(true);

    // The waveform container needs to maintain an aspect ratio based on the given width:height.
    const { classes: dynamicClasses } = createStyles((theme) => ({
        waveformContainer: {
            position: "relative",
            width: "100%",
            aspectRatio: `${width / height}`,
            opacity: 0.35,
            borderRadius: 5,
        },
    }))();

    useEffect(() => {
        setIsLoadingWaveform(true);
    }, [trackId]);

    if (!trackId) {
        return (
            <Text size={14} color={colors.dark[2]}>
                Waveforms require local media playback.
            </Text>
        );
    }

    if (!waveformsEnabled) {
        return (
            <Text size={14} color={colors.dark[2]}>
                Waveforms are not enabled in the Vibin backend.
            </Text>
        );
    }

    return (
        <Stack spacing={10}>
            <Box className={dynamicClasses.waveformContainer}>
                <Skeleton visible={isLoadingWaveform}>
                    <Image
                        src={`/api/tracks/${trackId}/waveform.png?width=${width}&height=${height}`}
                        radius={5}
                        sx={{
                            filter: "sepia(70%) saturate(100%) brightness(85%) hue-rotate(110deg)",
                        }}
                        onLoad={() => setIsLoadingWaveform(false)}
                    />
                    {showProgress && playStatus && ["play", "pause"].includes(playStatus) && (
                        <TrackWaveformProgress />
                    )}
                </Skeleton>
            </Box>

            {haveRMS && (
                <Flex sx={{ alignSelf: "flex-end" }}>
                    <Badge>{`rms to peak: ${Math.round(rms.rms_to_peak * 100)}`}</Badge>
                </Flex>
            )}
        </Stack>
    );
};

export default TrackWaveform;
