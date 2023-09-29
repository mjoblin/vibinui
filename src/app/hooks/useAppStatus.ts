import { useEffect, useState } from "react";

import { useAppSelector } from "./store";
import { RootState } from "../store/store";

// ================================================================================================
// Application status.
//
// This hook exposes transformed application state. It exists to provide centralized state
// transformations to consumers.
//
// TODO: Consider whether useAppGlobals() and useAppStatus() should be separate or not.
// ================================================================================================

export const useAppStatus = () => {
    const currentSource = useAppSelector(
        (state: RootState) => state.system.streamer.sources?.active
    );
    const {
        status: { is_activating_playlist: isActivatingPlaylist },
    } = useAppSelector((state: RootState) => state.storedPlaylists);

    const [haveActivatedPlaylist, setHaveActivatedPlaylist] = useState<boolean>(false);

    useEffect(() => {
        isActivatingPlaylist && setHaveActivatedPlaylist(true);
    }, [isActivatingPlaylist]);

    return {
        haveActivatedPlaylist,
        isLocalMediaActive: currentSource?.class === "stream.media",
    };
};
