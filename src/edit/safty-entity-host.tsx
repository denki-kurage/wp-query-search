import React from "react";
import { useEntityConfig } from "./hooks"

export const SaftyEntityHost = ({kind, name, children}) =>
{
    const { hasConfig } = useEntityConfig(kind, name);

    return hasConfig ? children : <></>
}

export default SaftyEntityHost
