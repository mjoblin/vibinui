import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import { useInterval } from "../../../app/hooks/useInterval";
import { setPlayheadPositionNormalized } from "../../../app/store/playbackSlice";

// ================================================================================================
// Manage the normalized (0-1) position of the playback head.
//
// This component exists only to set the normalized playhead position in application state and
// does not render anything to the DOM.
//
// Note: Once-per-second playhead position updates are already coming in from vibin websocket,
// which is already setting playhead.position in application state. That is considered to be the
// source of truth for the playhead position, although once-per-second updates are too coarse for
// the UI, so:
//
// This component does two things:
//
//  1. Calculates playhead.position_normalized.
//  2  Calculates the normalized position more frequently than the per-second updates from the
//     vibin Websocket. The idea is to have more fine-grained playhead position information
//     available to the UI, but resync it with updates from the backend as they come in.
// ================================================================================================

const PLAYHEAD_UPDATE_INTERVAL = 250;

/**
 * Return the current position in the track, between 0 and 1.
 */
export const normalizePosition = (currentPosition: number, trackDuration: number) =>
    Math.min(currentPosition / trackDuration, 1);

const PlayheadManager: FC = () => {
    const dispatch = useDispatch();
    const playStatus = useAppSelector((state: RootState) => state.playback.play_status);
    const currentTrack = useAppSelector((state: RootState) => state.playback.current_track);
    const position = useAppSelector((state: RootState) => state.playback.playhead.position);
    const [lastBackendSyncTime, setLastBackendSyncTime] = useState<number>(Date.now());

    // Resync to updates coming in from the backend.
    useEffect(() => {
        setLastBackendSyncTime(Date.now());

        position &&
            currentTrack?.duration &&
            dispatch(
                setPlayheadPositionNormalized(normalizePosition(position, currentTrack.duration))
            );
    }, [dispatch, position, currentTrack]);

    // Perform more fine-grained updates in between updates from the backend.
    useInterval(() => {
        if (playStatus !== "play") {
            return;
        }

        const secondsSinceLastBackendSync = (Date.now() - lastBackendSyncTime) / 1000;

        currentTrack?.duration &&
            dispatch(
                setPlayheadPositionNormalized(
                    normalizePosition(position + secondsSinceLastBackendSync, currentTrack.duration)
                )
            );
    }, PLAYHEAD_UPDATE_INTERVAL);

    return null;
}

export default PlayheadManager;
