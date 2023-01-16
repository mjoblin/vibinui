import React, { FC } from "react";
import { createStyles } from "@mantine/core";

import { useGetAlbumsQuery } from "../../app/services/vibinBase";
import AlbumCard from "./AlbumCard";

const useStyles = createStyles((theme) => ({
    albumWall: {
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit, 250px)",
    },
}));

const AlbumWall: FC = () => {
    const { classes } = useStyles();
    const { data, error, isLoading } = useGetAlbumsQuery();

    return (
        <div className={classes.albumWall}>
            {data && data
                // TODO: Fix "Various" (unknown artist)
                // .sort((a, b) => (a.artist || "Various").localeCompare(b.artist || "Various"))
                .map((album) => (
                    <AlbumCard key={album.id} album={album} />
                ))}
        </div>
    );
};

export default AlbumWall;
