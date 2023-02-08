import React, { FC } from "react";
import { Tooltip } from "@mantine/core";

type VibinTooltipProps = {
    label: string;
    disabled?: boolean;
    children: React.ReactNode;
};

// TODO: Mantine's <Tooltip> supports forwarded refs, which are sometimes needed -- such as
//  in <PlaylistEntryActionsButton>.

const VibinTooltip: FC<VibinTooltipProps> = ({ label, disabled = false, children }) => {
    return (
        <Tooltip
            label={label}
            color="blue"
            disabled={disabled}
            openDelay={500}
            withArrow
            arrowSize={8}
            styles={{ tooltip: { fontSize: 12 } }}
        >
            {children}
        </Tooltip>
    );
};

export default VibinTooltip;
