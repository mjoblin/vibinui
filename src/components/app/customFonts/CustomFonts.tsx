import React, { FC } from "react";
import { Global } from "@mantine/core";

// ================================================================================================
// Custom fonts.
//
// Note: These get preloaded in the public/index.html to ensure they're available before the
//  application renders.
// ================================================================================================

// @ts-ignore
import extraLight from "./kanit-v12-latin-200.woff2";
// @ts-ignore
import light from "./kanit-v12-latin-300.woff2";
// @ts-ignore
import regular from "./kanit-v12-latin-regular.woff2";
// @ts-ignore
import medium from "./kanit-v12-latin-500.woff2";
// @ts-ignore
import semiBold from "./kanit-v12-latin-600.woff2";

const CustomFonts: FC = () => {
    return (
        <Global
            styles={[
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${extraLight}') format("woff2")`,
                        fontWeight: 200,
                        fontStyle: "extralight",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${light}') format("woff2")`,
                        fontWeight: 300,
                        fontStyle: "light",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${regular}') format("woff2")`,
                        fontWeight: 400,
                        fontStyle: "regular",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${medium}') format("woff2")`,
                        fontWeight: 500,
                        fontStyle: "medium",
                    },
                },
                {
                    "@font-face": {
                        fontFamily: "Kanit",
                        src: `url('${semiBold}') format("woff2")`,
                        fontWeight: 600,
                        fontStyle: "semibold",
                    },
                },
            ]}
        />
    );
};

export default CustomFonts;
