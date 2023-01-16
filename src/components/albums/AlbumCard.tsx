import React, { FC } from "react";
import { Card, Image } from "@mantine/core";

import { Album } from "../../app/types";

type AlbumProps = {
    album: Album;
    showDetails?: boolean;
}

const AlbumCard: FC<AlbumProps> = ({ album, showDetails = false }) => {
    return (
        <Card shadow="sm" p="sm" radius="sm" sx={{ width: 200 }} withBorder>
            <Image
                src={album.album_art_uri}
                height={160}
                alt={`${album.artist} / ${album.title}`}
                radius="sm"
                fit="contain"
            />
        </Card>
    );
}

export default AlbumCard;
