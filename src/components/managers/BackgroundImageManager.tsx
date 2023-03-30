import React, { FC, useEffect } from "react";
import { useDispatch } from "react-redux";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import { setCurrentlyPlayingArtUrl } from "../../app/store/internalSlice";

const BackgroundImageManager: FC = () => {
    const dispatch = useDispatch();
    const playlist = useAppSelector((state: RootState) => state.playlist);
    const trackById = useAppSelector((state: RootState) => state.mediaGroups.trackById);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );

    /**
     * Set the background image URL. This will change whenever the current track changes. If
     * there's no current track then attempt to fall back on the current playlist entry.
     */
    useEffect(() => {
        if (currentTrackId && trackById[currentTrackId]) {
            dispatch(setCurrentlyPlayingArtUrl(trackById[currentTrackId].album_art_uri));
        } else if (playlist && playlist.entries && playlist.current_track_index !== undefined) {
            dispatch(
                setCurrentlyPlayingArtUrl(
                    playlist.entries[playlist.current_track_index]?.albumArtURI
                )
            );
        }
    }, [dispatch, currentTrackId, trackById, playlist]);

    return null;
};

export default BackgroundImageManager;
