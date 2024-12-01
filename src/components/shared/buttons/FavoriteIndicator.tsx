import React, { FC, SVGAttributes, useEffect, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ActionIcon, Box, Tooltip, useMantineTheme } from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";

import { isAlbum, Media, MediaId } from "../../../app/types";
import {
    useAddFavoriteMutation,
    useDeleteFavoriteMutation,
} from "../../../app/services/vibinFavorites";
import { useFavorites } from "../../../app/hooks/useFavorites";
import { showErrorNotification } from "../../../app/utils";

// ================================================================================================
// A heart toggle to set the favorited state of a media item.
// ================================================================================================

type FavoriteIndicatorProps = {
    media: Media;
    size?: SVGAttributes<SVGElement>["width"];
    highContrast?: boolean;
};

const FavoriteIndicator: FC<FavoriteIndicatorProps> = ({
    media,
    size = "1rem",
    highContrast = false,
}) => {
    const theme = useMantineTheme();
    const { isFavoritable, isFavoritedMedia } = useFavorites();
    const [addFavorite, addFavoriteStatus] = useAddFavoriteMutation();
    const [deleteFavorite, deleteFavoriteStatus] = useDeleteFavoriteMutation();
    const [updateInProgress, setUpdateInProgress] = useState<boolean>(false);

    const isFavorite = isFavoritedMedia(media);

    const favoritedColor = theme.colors.red[6];
    const unfavoritedColor = theme.colors.dark[3];

    const paintBorderColor = highContrast
        ? "rgb(255, 255, 255, 0.5)"
        : isFavorite
          ? favoritedColor
          : unfavoritedColor;

    const paintFillColor = highContrast
        ? isFavorite
            ? theme.colors.red[8]
            : "rgb(0, 0, 0, 0.6)"
        : isFavorite
          ? favoritedColor
          : "rgb(0, 0, 0, 0)";

    /**
     * Inform the user if there was an error while attempting to favorite/unfavorite the media.
     */
    useEffect(() => {
        setUpdateInProgress(addFavoriteStatus.isLoading || deleteFavoriteStatus.isLoading);

        if (addFavoriteStatus.isError || deleteFavoriteStatus.isError) {
            const { status, data } = addFavoriteStatus.isError
                ? (addFavoriteStatus.error as FetchBaseQueryError)
                : (deleteFavoriteStatus.error as FetchBaseQueryError);

            showErrorNotification({
                title: "Error updating Favorite status",
                message: `[${status}] ${JSON.stringify(data)}`,
            });
        }
    }, [addFavoriteStatus, deleteFavoriteStatus]);

    if (!isFavoritable(media)) {
        return null;
    }

    return (
        <Tooltip
            label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            position="top"
            withinPortal
        >
            <Box>
                <ActionIcon
                    variant="transparent"
                    loading={updateInProgress}
                    onClick={(event) => {
                        event.stopPropagation();

                        if (isFavorite) {
                            deleteFavorite({ mediaId: media.id as MediaId });
                        } else {
                            addFavorite({
                                type: isAlbum(media) ? "album" : "track",
                                mediaId: media.id as MediaId,
                            });
                        }
                    }}
                    sx={{
                        "&[data-loading]": { opacity: highContrast ? 1.0 : 0.5 },
                    }}
                >
                    <IconHeart
                        size={size}
                        stroke={1}
                        color={paintBorderColor}
                        fill={paintFillColor}
                    />
                </ActionIcon>
            </Box>
        </Tooltip>
    );
};

export default FavoriteIndicator;
