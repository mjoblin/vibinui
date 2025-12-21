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
    const queue = useAppSelector((state: RootState) => state.queue);
    const trackById = useAppSelector((state: RootState) => state.mediaGroups.trackById);
    const currentTrackId = useAppSelector(
        (state: RootState) => state.playback.current_track_media_id,
    );
    const { current_track: currentPlaybackTrack } = useAppSelector(
        (state: RootState) => state.playback,
    );

    /**
     * Set the background image URL. This will change whenever the current track changes. If
     * there's no current track then attempt to fall back on the current queue item and finally
     * the currentPlaybackTrack (e.g. AirPlay).
     *
     * The currentlyPlayingArtUrl is used by <RootLayout> to render the background image div.
     */
    useEffect(() => {
        if (currentTrackId && trackById[currentTrackId]) {
            dispatch(setCurrentlyPlayingArtUrl(trackById[currentTrackId].album_art_uri));
        } else if (
            isLocalMediaActive &&
            queue &&
            queue.items &&
            queue.play_position !== null &&
            queue.play_position !== undefined &&
            queue.play_position >= 0
        ) {
            const currentItem = queue.items[queue.play_position];
            dispatch(
                setCurrentlyPlayingArtUrl(currentItem?.metadata?.art_url || undefined),
            );
        } else if (currentPlaybackTrack?.art_url) {
            dispatch(setCurrentlyPlayingArtUrl(currentPlaybackTrack.art_url));
        }
    }, [
        dispatch,
        isLocalMediaActive,
        currentTrackId,
        trackById,
        queue,
        currentPlaybackTrack,
    ]);

    return null;
};

export default BackgroundImageManager;
