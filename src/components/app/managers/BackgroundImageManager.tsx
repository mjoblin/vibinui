import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";

import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../../app/hooks/store";
import { setCurrentlyPlayingArtUrl } from "../../../app/store/internalSlice";
import { useAppStatus } from "../../../app/hooks/useAppStatus";

// ================================================================================================
// Manage the setting of the currently-playing art URL in application state, based on whatever is
// currently playing.
//
// Note: The actual background image rendering is done in <RootLayout>. This manager renders null.
// ================================================================================================

const BackgroundImageManager: FC = () => {
    const dispatch = useDispatch();
    const { isLocalMediaActive } = useAppStatus();
    const activePlaylist = useAppSelector((state: RootState) => state.activePlaylist);
    const trackById = useAppSelector((state: RootState) => state.mediaGroups.trackById);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id
    );
    const { current_track: currentPlaybackTrack } = useAppSelector((state: RootState) => state.playback);

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
            isLocalMediaActive &&
            activePlaylist &&
            activePlaylist.entries &&
            activePlaylist.current_track_index !== undefined &&
            activePlaylist.current_track_index !== -1
        ) {
            dispatch(
                setCurrentlyPlayingArtUrl(
                    activePlaylist.entries[activePlaylist.current_track_index]?.albumArtURI
                )
            );
        } else if (currentPlaybackTrack?.art_url) {
            dispatch(setCurrentlyPlayingArtUrl(currentPlaybackTrack.art_url));
        }
    }, [
        dispatch,
        isLocalMediaActive,
        currentTrackId,
        trackById,
        activePlaylist,
        currentPlaybackTrack,
    ]);

    return null;
};

export default BackgroundImageManager;
