import React, { FC } from "react";
import { Outlet } from "react-router-dom";

import NavigationBar from "./NavigationBar";

const RootLayout: FC = () => {
    return (
        <div>
            <NavigationBar />
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default RootLayout;
