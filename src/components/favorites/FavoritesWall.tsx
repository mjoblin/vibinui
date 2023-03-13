import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";

import TrackCard from "../tracks/TrackCard";
import { useGetFavoriteTracksQuery } from "../../app/services/vibinFavorites";
import { Favorite } from "../../app/services/vibinFavorites";
import { Track } from "../../app/types";

const FavoritesWall: FC = () => {
    const { data: allFavorites, error: allError, isLoading: allIsLoading } = useGetFavoriteTracksQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        presetsWall: {
            display: "grid",
            gap: 10,
            gridTemplateColumns: `repeat(auto-fit, ${100}px)`,
            // gap: cardGap,
            // gridTemplateColumns: `repeat(auto-fit, ${cardSize}px)`,
            paddingBottom: 15,
        },
    }))();

    if (!allFavorites) {
        return null;
    }

    return (
        <Box className={dynamicClasses.presetsWall}>
            {allFavorites.map((favorite: Favorite) => (
                <TrackCard key={favorite.media_id} track={favorite.media as Track}/>
            ))}
        </Box>
    );
};

export default FavoritesWall;
