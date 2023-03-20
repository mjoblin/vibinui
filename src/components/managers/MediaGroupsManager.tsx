import React, { FC, useEffect } from "react";
import { useDispatch } from "react-redux";

// TODO: If this approach of munging the infrequently-changing list of albums and tracks and
//  storing the result in application state is preferred, then other consumers of
//  useMediaGroupings() should switch over to using the mediaGroups slice instead.
//  useMediaGroupings() could also set application state itself, although this Manager (or
//  something like it) would still need to exist so that something is using useMediaGroupings().

import {
    setAlbumById,
    setAlbumsByArtistName,
    setArtistByName,
    setTracksByAlbumId,
    setTracksByArtistName,
} from "../../app/store/mediaGroupsSlice";
import { useMediaGroupings } from "../../app/hooks/useMediaGroupings";

const MediaGroupsManager: FC = () => {
    const dispatch = useDispatch();
    const { albumById, albumsByArtistName, artistByName, tracksByAlbumId, tracksByArtistName } =
        useMediaGroupings();

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
        dispatch(setTracksByAlbumId(tracksByAlbumId));
    }, [dispatch, tracksByAlbumId]);

        useEffect(() => {
        dispatch(setTracksByArtistName(tracksByArtistName));
    }, [dispatch, tracksByArtistName]);

    return null;
};

export default MediaGroupsManager;
