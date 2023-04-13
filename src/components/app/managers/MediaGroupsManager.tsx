import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";

import {
    setAlbumById,
    setAlbumsByArtistName,
    setArtistByName,
    setTrackById,
    setTracksByAlbumId,
    setTracksByArtistName,
} from "../../../app/store/mediaGroupsSlice";
import { useMediaGroupings } from "../../../app/hooks/useMediaGroupings";

// ================================================================================================
// Manage the storage of the various media groupings (exposed by useMediaGroupings()) in
// application state.
//
// TODO: Currently this component is the only consumer of useMediaGroupings(), so perhaps that
//  hook and this manager should be combined.
// ================================================================================================

const MediaGroupsManager: FC = () => {
    const dispatch = useDispatch();
    const {
        albumById,
        albumsByArtistName,
        artistByName,
        trackById,
        tracksByAlbumId,
        tracksByArtistName,
    } = useMediaGroupings();

    useEffect(() => {
        dispatch(setAlbumById(albumById));
    }, [dispatch, albumById]);

    useEffect(() => {
        dispatch(setAlbumsByArtistName(albumsByArtistName));
    }, [dispatch, albumsByArtistName]);

    useEffect(() => {
        dispatch(setArtistByName(artistByName));
    }, [dispatch, artistByName]);

    useEffect(() => {
        dispatch(setTrackById(trackById));
    }, [dispatch, trackById]);

    useEffect(() => {
        dispatch(setTracksByAlbumId(tracksByAlbumId));
    }, [dispatch, tracksByAlbumId]);

    useEffect(() => {
        dispatch(setTracksByArtistName(tracksByArtistName));
    }, [dispatch, tracksByArtistName]);

    return null;
};

export default MediaGroupsManager;
