import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import {
    restartPlayhead,
    setCurrentAlbumMediaId,
    setCurrentTrackMediaId,
} from "../../../app/store/playbackSlice";
import { showSuccessNotification } from "../../../app/utils";

// ================================================================================================
// Manage the handling of a change to the media source (e.g. AirPlay, Internet Radio, etc).
// ================================================================================================

const MediaSourceManager: FC = () => {
    const dispatch = useDispatch();
    const currentSource = useAppSelector((state: RootState) => state.system.streamer.sources?.active);
    const [haveIgnoredInitialState, setHaveIgnoredInitialState] = useState<boolean>(false);

    /**
     *  When the media source changes, some aspects of the application need to be reset:
     *
     *  * Restart the playhead. This ensures that (for example) switching to internet radio -- or
     *    some other source where the user can't control the playhead position -- the playhead won't
     *    be stuck at its last position when the source changed.
     *  * Reset the current track and album media ids.
     */
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

        // TODO: Figure out how to not require eslint-disable-next-line. It's there because this
        //  component does not want to notify the user of the media source whenever the app is
        //  first loaded, which doesn't work when haveIgnoredInitialState is in the dependency list.
        //
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, currentSource]);

    return null;
};

export default MediaSourceManager;
