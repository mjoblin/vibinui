import React, { FC } from "react";
import { Anchor, Button, Flex, Image, Stack, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons";

import { useGetLinksQuery } from "../../app/services/vibinTracks";
import SadLabel from "../shared/SadLabel";
import SimpleLoader from "../shared/SimpleLoader";
import DiscogsLogoImage from "../../assets/images/discogs_logo.svg";
import GeniusLogoImage from "../../assets/images/genius_logo.png";

const DiscogsLogo: FC = () => {
    return <Image src={DiscogsLogoImage} width="fit-content" height={20} radius={3} />;
};

const GeniusLogo: FC = () => {
    return <Image src={GeniusLogoImage} width="fit-content" height={20} radius={3} />;
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
    Wikipedia: {
        logo: WikipediaLogo,
    },
};

type TrackLinksProps = {
    trackId: string;
};

const TrackLinks: FC<TrackLinksProps> = ({ trackId }) => {
    const { data, error, isFetching } = useGetLinksQuery({ trackId: trackId, allTypes: true });

    if (isFetching) {
        return <SimpleLoader label="Retrieving links..." />;
    }

    if (!data || Object.keys(data).length <= 0) {
        return <SadLabel label="No lyrics found." />;
    }

    return (
        <Stack spacing="xl" align="flex-start">
            {Object.entries(data)
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
