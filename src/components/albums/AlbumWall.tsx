import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";

import { useGetAlbumsQuery } from "../../app/services/vibinBase";
import AlbumCard from "./AlbumCard";

const useStyles = createStyles((theme) => ({
    albumWall: {
        display: "grid",
        gap: 15,
        gridTemplateColumns: "repeat(auto-fit, 200px)",
        paddingBottom: 15,
    },
}));

const AlbumWall: FC = () => {
    const { classes } = useStyles();
    const { data, error, isLoading } = useGetAlbumsQuery();

    return (
        <Box className={classes.albumWall}>
            {data && data
                // TODO: Fix "Various" (unknown artist)
                // .sort((a, b) => (a.artist || "Various").localeCompare(b.artist || "Various"))
                .map((album) => (
                    <AlbumCard key={album.id} album={album} />
                ))}
        </Box>
    );
};

export default AlbumWall;
