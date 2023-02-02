import React, { FC } from "react";
import { Box, Loader } from "@mantine/core";

import { useGetLinksQuery } from "../../app/services/vibinTracks";

type TrackLinksProps = {
    trackId: string;
};

const TrackLinks: FC<TrackLinksProps> = ({ trackId }) => {
    const { data, error, isFetching } = useGetLinksQuery({ trackId: trackId, allTypes: true });

    if (!data) {
        return <></>;
    }

    if (isFetching) {
        return <Loader />;
    }

    return (
        <Box>
            {Object.entries(data).map(([service, links]) =>
                links.map((link) => <Box>{`${service}::${link.name}`}</Box>)
            )}
        </Box>
    );
};

export default TrackLinks;
