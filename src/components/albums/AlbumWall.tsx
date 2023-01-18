import React, { FC } from "react";
import { Box, createStyles } from "@mantine/core";

import type { RootState } from "../../app/store/store";
import { useAppSelector } from "../../app/hooks";
import { useGetAlbumsQuery } from "../../app/services/vibinBase";
import AlbumCard from "./AlbumCard";

const AlbumWall: FC = () => {
    const filterText = useAppSelector((state: RootState) => state.userSettings.browse.filterText);
    const { coverSize, coverGap } = useAppSelector((state: RootState) => state.userSettings.browse);
    const { data, error, isLoading } = useGetAlbumsQuery();

    const { classes: dynamicClasses } = createStyles((theme) => ({
        albumWall: {
            display: "grid",
            gap: coverGap,
            gridTemplateColumns: `repeat(auto-fit, ${coverSize}px)`,
            paddingBottom: 15,
        },
    }))();

    return (
        <Box className={dynamicClasses.albumWall}>
            {data &&
                data
                    .filter((album) => {
                        if (filterText === "") {
                            return true;
                        }

                        const filterValueLower = filterText.toLowerCase();

                        return (
                            (album.artist || "Various").toLowerCase().includes(filterValueLower) ||
                            album.title.toLowerCase().includes(filterValueLower)
                        );
                    })
                    // TODO: Fix "Various" (unknown artist)
                    .sort((a, b) => (a.artist || "Various").localeCompare(b.artist || "Various"))
                    .map((album) => <AlbumCard key={album.id} album={album} />)}
        </Box>
    );
};

export default AlbumWall;
