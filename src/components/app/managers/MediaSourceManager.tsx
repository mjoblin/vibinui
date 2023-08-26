import { FC, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import {
    restartPlayhead,
    setCurrentAlbumMediaId,
    setCurrentTrackMediaId,
} from "../../../app/store/playbackSlice";
import { showSuccessNotification } from "../../../app/utils";
import { AudioSource } from "../../../app/store/systemSlice";

// ================================================================================================
// Manage the handling of a change to the media source (e.g. AirPlay, Internet Radio, etc).
// ================================================================================================

const MediaSourceManager: FC = () => {
    const dispatch = useDispatch();
    const currentSource = useAppSelector(
        (state: RootState) => state.system.streamer.sources?.active
    );
    const previousSource = useRef<AudioSource | undefined>(currentSource);

    /**
     *  When the media source changes, some aspects of the application need to be reset:
     *
     *  * Restart the playhead. This ensures that (for example) switching to internet radio -- or
     *    some other source where the user can't control the playhead position -- the playhead won't
     *    be stuck at its last position when the source changed.
     *  * Reset the current track and album media ids.
     */
    useEffect(() => {
        if (currentSource?.name && currentSource.name !== previousSource.current?.name) {
            dispatch(restartPlayhead());
            dispatch(setCurrentTrackMediaId(undefined));
            dispatch(setCurrentAlbumMediaId(undefined));

            // Announce the new media source; but not the very first time a media source is known
            // (to prevent the announcement always appearing when the app is first loaded).
            if (previousSource.current !== undefined) {
                showSuccessNotification({
                    title: "Audio Source",
                    message: `Streamer audio source set to ${currentSource?.name}`,
                });
            }
        }

        previousSource.current = currentSource;
    }, [dispatch, currentSource, previousSource]);

    return null;
};

export default MediaSourceManager;
