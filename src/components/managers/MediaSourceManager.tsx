import React, { FC, useEffect } from "react";
import { useDispatch } from "react-redux";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import {
    restartPlayhead,
    setCurrentAlbumMediaId,
    setCurrentTrackMediaId,
} from "../../app/store/playbackSlice";

const MediaSourceManager: FC = () => {
    const dispatch = useDispatch();
    const currentSource = useAppSelector((state: RootState) => state.playback.current_audio_source);

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
    }, [dispatch, currentSource]);

    return null;
};

export default MediaSourceManager;
