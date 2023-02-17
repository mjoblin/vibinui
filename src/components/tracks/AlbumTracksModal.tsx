import React, { FC } from "react";
import { Modal } from "@mantine/core";

import { Album } from "../../app/types";
import AlbumTracks from "./AlbumTracks";

type AlbumTracksModalProps = {
    album: Album;
    opened: boolean;
    onClose?: () => void;
};

const AlbumTracksModal: FC<AlbumTracksModalProps> = ({ album, opened, onClose = undefined }) => {
    return (
        <Modal
            title={album.title}
            centered
            size="lg"
            radius={7}
            opened={opened}
            onClose={() => onClose && onClose()}
        >
            <AlbumTracks album={album} />
        </Modal>
    );
};

export default AlbumTracksModal;
