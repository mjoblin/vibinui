import React, { FC } from "react";
import { Anchor, Button, Flex, Image, Stack, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

import { useGetLinksQuery } from "../../../app/services/vibinTracks";
import LoadingDataMessage from "../textDisplay/LoadingDataMessage";
import SadLabel from "../textDisplay/SadLabel";
import DiscogsLogoImage from "../../../assets/images/discogs_logo.svg";
import GeniusLogoImage from "../../../assets/images/genius_logo.png";
import RateYourMusicImage from "../../../assets/images/rateyourmusic_logo.png";

// ================================================================================================
// Show buttons to external sources relevant to the provided Track.
//
// Accepts either a track id (for local media) or an artist/title pair (for alternate sources like
// AirPlay). Lyrics can be marked as invalid, or can be re-retrieved from the backend.
// ================================================================================================

// TODO: Fix these logos in Firefox.

const DiscogsLogo: FC = () => {
    return <Image src={DiscogsLogoImage} width="fit-content" height={20} radius={3} />;
};

const GeniusLogo: FC = () => {
    return <Image src={GeniusLogoImage} width="fit-content" height={25} radius={3} />;
};

const RateYourMusicLogo: FC = () => {
    return (
        <Flex gap={7}>
            <Image src={RateYourMusicImage} width="fit-content" height={25} radius={3} />
            <Text size="sm" weight="bold">RYM</Text>
        </Flex>
    );
};

const WikipediaLogo: FC = () => {
    return (
        <Flex gap={7}>
            <Image
                src="https://en.wikipedia.org/static/images/icons/wikipedia.png"
                width="fit-content"
                height={25}
                radius={3}
            />
            <Text size="sm">Wikipedia</Text>
        </Flex>
    );
};

type ServiceName = string;

type Services = {
    [key: ServiceName]: {
        logo: FC;
    };
};

const services: Services = {
    Discogs: {
        logo: DiscogsLogo,
    },
    Genius: {
        logo: GeniusLogo,
    },
    RateYourMusic: {
        logo: RateYourMusicLogo,
    },
    Wikipedia: {
        logo: WikipediaLogo,
    },
};

type TrackLinksProps = {
    trackId?: string;
    artist?: string;
    album?: string;
    title?: string;
};

const TrackLinks: FC<TrackLinksProps> = ({ trackId, artist, album, title }) => {
    const { data, isFetching } = useGetLinksQuery({ trackId, artist, album, title, allTypes: true });

    if (isFetching) {
        return <LoadingDataMessage message="Retrieving links..." />;
    }

    if (!data || Object.keys(data).length <= 0) {
        return <SadLabel label="No links found" labelSize={14} weight="normal" />;
    }

    return (
        <Stack spacing="xl" align="flex-start">
            {Object.entries(data)
                .filter(([service, links]) => links.length > 0)
                .sort(([serviceA], [serviceB]) =>
                    // Sort alphabetically by service name
                    serviceA < serviceB ? -1 : serviceA > serviceB ? 1 : 0
                )
                .map(([service, links], index) => (
                    <Stack key={service} spacing="sm" align="flex-start">
                        {services[service]?.logo({}) || <Text>{service}</Text>}

                        <Flex gap={8} align="center">
                            {links.map((link) => (
                                <Anchor
                                    key={`${service}::${link.name}`}
                                    href={link.url}
                                    target="_blank"
                                    underline={false}
                                    sx={{ lineHeight: 1 }}
                                >
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        leftIcon={<IconExternalLink size={14} />}
                                    >
                                        {link.name}
                                    </Button>
                                </Anchor>
                            ))}
                        </Flex>
                    </Stack>
                ))}
        </Stack>
    );
};

export default TrackLinks;
