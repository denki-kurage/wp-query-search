import React, { useMemo } from "react";
import QueryFormHost from "./query-form-host";
import { useQueryFormBlocksContext, useQueryFormComposeContext } from "./blocks-context";
import { withNomalCompose } from "./hoc";

// blocksは現在のレジストリで取得できるブロックでなければいけません。
export const InnerQueryFormHosts = ({ blocks }) =>
{
    return (
        <>
        { blocks.map(block => 
            <InputForm
                key={block.attributes.uid}
                name={block.name}
                clientId={block.clientId} />
        ) }
        </>
    )
}


const InputForm = ({name, clientId}) =>
{
    const { useAttributesSet } = useQueryFormBlocksContext();
    const [ attributes, setAttributes ] = useAttributesSet(clientId);

    return (
        <QueryFormHost
            name={name}
            clientId={clientId}
            attributes={attributes}
            setAttributes={setAttributes} />
    );
}

export default InnerQueryFormHosts;




