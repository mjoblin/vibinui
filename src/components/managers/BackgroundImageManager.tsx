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
    const currentPlaybackTrack = useAppSelector((state: RootState) => state.playback.current_track);

    /**
     * Set the background image URL. This will change whenever the current track changes. If
     * there's no current track then attempt to fall back on the current playlist entry and finally
     * the currentPlaybackTrack (e.g. AirPlay).
     *
     * The currentlyPlayingArtUrl is used by <RootLayout> to render the background image div.
     */
    useEffect(() => {
        if (currentTrackId && trackById[currentTrackId]) {
            dispatch(setCurrentlyPlayingArtUrl(trackById[currentTrackId].album_art_uri));
        } else if (
            playlist &&
            playlist.entries &&
            playlist.current_track_index !== undefined &&
            playlist.current_track_index !== -1
        ) {
            dispatch(
                setCurrentlyPlayingArtUrl(
                    playlist.entries[playlist.current_track_index]?.albumArtURI
                )
            );
        } else if (currentPlaybackTrack?.art_url) {
            dispatch(setCurrentlyPlayingArtUrl(currentPlaybackTrack.art_url));
        }
    }, [dispatch, currentTrackId, trackById, playlist, currentPlaybackTrack]);

    return null;
};

export default BackgroundImageManager;
