import React, { FC } from "react";
import { Modal } from "@mantine/core";

import { Album } from "../../app/types";
import AlbumTracks from "./AlbumTracks";
import { useAppConstants } from "../../app/hooks/useAppConstants";

type AlbumTracksModalProps = {
    album: Album;
    opened: boolean;
    onClose?: () => void;
};

const AlbumTracksModal: FC<AlbumTracksModalProps> = ({ album, opened, onClose = undefined }) => {
    const { APP_MODAL_BLUR } = useAppConstants();

    return (
        <Modal
            title={album.title}
            centered
            size="lg"
            radius={7}
            overlayProps={{ blur: APP_MODAL_BLUR }}
            opened={opened}
            onClose={() => onClose && onClose()}
        >
            <AlbumTracks album={album} />
        </Modal>
    );
};

export default AlbumTracksModal;
