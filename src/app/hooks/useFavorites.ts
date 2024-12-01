import { useAppSelector } from "./store";
import { RootState } from "../store/store";
import { isAlbum, isTrack, Media, MediaId } from "../types";

// ================================================================================================
// Expose Favorites-related functionality.
// ================================================================================================

export const useFavorites = () => {
    const { favoriteAlbumMediaIds, favoriteTrackMediaIds } = useAppSelector(
        (state: RootState) => state.favorites,
    );
    const isFavoritable = (media: Media) => isAlbum(media) || isTrack(media);

    return {
        isFavoritable,
        isFavoritedMedia: (media: Media): boolean =>
            isFavoritable(media) &&
            (favoriteAlbumMediaIds.includes(media.id as MediaId) ||
                favoriteTrackMediaIds.includes(media.id as MediaId)),
        isFavoritedMediaId: (mediaId: MediaId): boolean =>
            favoriteAlbumMediaIds.includes(mediaId) || favoriteTrackMediaIds.includes(mediaId),
    };
};
