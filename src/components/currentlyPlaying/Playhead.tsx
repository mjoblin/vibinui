import React, { FC, useState } from "react";
import { Flex, Slider, Text } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setPlayheadPosition } from "../../app/store/playbackSlice";
import { useSeekMutation } from "../../app/services/vibinTransport";

const leadingZeros = new RegExp("^00:");
const negativeTimeScreenSize = 5;  // Allow for minus sign when end time style is timeRemaining

/**
 * Convert a duration in seconds into "hh:mm:ss", without the hh: if it would have been "00:".
 */
const prettyDuration = (duration: number) =>
    new Date(duration * 1000).toISOString().substring(11, 19).replace(leadingZeros, "");

const Playhead: FC = () => {
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const playhead = useAppSelector((state: RootState) => state.playback.playhead);
    const activeTransportActions = useAppSelector(
        (state: RootState) => state.playback.active_transport_actions
    );
    const [isBeingManuallyUpdated, setIsBeingManuallyUpdated] = useState<boolean>(false);
    const [manualPosition, setManualPosition] = useState<number>(0);
    const [endTimeStyle, setEndTimeStyle] = useState<"totalTime" | "timeRemaining">("totalTime");
    const dispatch = useAppDispatch();
    const [seek] = useSeekMutation();

    return (
        <Flex direction="row" gap={7} align="center" justify="space-between">
            {/* Display the current track time. This will either be the time of the playback head,
                or the selected time when the slider is being manually updated. */}
            <Text size="xs" sx={{ lineHeight: 1.25, fontSize: 10, width: 30 }}>
                {isBeingManuallyUpdated
                    ? prettyDuration(manualPosition)
                    : playhead.position && typeof playhead.position === "number"
                    ? prettyDuration(playhead.position)
                    : "00:00"}
            </Text>

            {/* Display the slider. This can be manually updated, which will result in a playhead
                seek being performed. */}
            <Slider
                disabled={!activeTransportActions.includes("seek")}
                min={0}
                max={currentTrack?.duration || 0}
                step={1}
                value={isBeingManuallyUpdated ? manualPosition : playhead.position}
                onChange={(value) => {
                    !isBeingManuallyUpdated && setIsBeingManuallyUpdated(true);
                    setManualPosition(value);
                }}
                onChangeEnd={(value) => {
                    // Update the backend first (via the seek() API call), then we also dispatch
                    // a local state update. We do the latter as an optimistic update so that the
                    // UI will reflect the new value for the brief period between when the new
                    // value is set and when the new value is pushed to us from the backend (as
                    // part of its regular playhead update announcements over the websocket).
                    dispatch(setPlayheadPosition(value));
                    // dispatch(pauseLocalPlayheadUpdates());
                    seek(value);

                    setIsBeingManuallyUpdated(false);
                }}
                label={null}
                // sx={{ width: endTimeStyle === "totalTime" ? 150 : 150 - negativeTimeScreenSize }}
                sx={{ flexGrow: 1 }}
                size={2}
                styles={(theme) => ({
                    track: {
                        backgroundColor:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[3]
                                : theme.colors.blue[1],
                    },
                    thumb: {
                        height: 8,
                        width: 3,
                        backgroundColor: theme.colorScheme === "dark" ? theme.white : theme.black,
                        borderWidth: 1,
                        boxShadow: theme.shadows.sm,
                    },
                })}
            />

            {/* Display end time. This will either be the total track duration or the time
                remaining (this behavior can be toggled by clicking on the time text). */}
            <Text
                size="xs"
                align="right"
                sx={{
                    lineHeight: 1.25,
                    fontSize: 10,
                    // minWidth: endTimeStyle === "totalTime" ? 30 : 30 + negativeTimeScreenSize,
                    minWidth: endTimeStyle === "totalTime" ? 30 : 30 + negativeTimeScreenSize,
                }}
                onClick={() =>
                    setEndTimeStyle(endTimeStyle === "totalTime" ? "timeRemaining" : "totalTime")
                }
            >
                {currentTrack && typeof currentTrack.duration === "number"
                    ? endTimeStyle === "totalTime"
                        ? prettyDuration(currentTrack.duration)
                        : `-${prettyDuration(currentTrack.duration - playhead.position)}`
                    : "00:00"}
            </Text>
        </Flex>
    );
};

export default Playhead;
