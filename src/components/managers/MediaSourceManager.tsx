import React, { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import {
    restartPlayhead,
    setCurrentAlbumMediaId,
    setCurrentTrackMediaId,
} from "../../app/store/playbackSlice";
import { showSuccessNotification } from "../../app/utils";

const MediaSourceManager: FC = () => {
    const dispatch = useDispatch();
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);
    const [haveIgnoredInitialState, setHaveIgnoredInitialState] = useState<boolean>(false);

    // When the media source changes, some aspects of the application need to be reset:
    //
    // * Restart the playhead. This ensures that (for example) switching to internet radio -- or
    //   some other source where the user can't control the playhead position -- the playhead won't
    //   be stuck at its last position when the source changed.
    // * Reset the current track and album media ids.

    useEffect(() => {
        dispatch(restartPlayhead());
        dispatch(setCurrentTrackMediaId(undefined));
        dispatch(setCurrentAlbumMediaId(undefined));

        // Announce the new media source; but not the very first time a media source is known (to
        // prevent the announcement always appearing when the app is first loaded).
        if (haveIgnoredInitialState) {
            currentSource && showSuccessNotification({
                title: "Media Source changed",
                message: `Media source set to ${currentSource.name}`,
            })
        }
        else {
            currentSource?.name && setHaveIgnoredInitialState(true);
        }
    }, [dispatch, currentSource]);

    return null;
};

export default MediaSourceManager;
