import { useDispatch, useSelect } from "@wordpress/data"
import { store } from "../store"
import { Button } from "@wordpress/components";
import React from "react";
import { __ } from "@wordpress/i18n";



export const ExtensionButton = ({}) =>
{
    const { setExtensionMode } = useDispatch(store);
    const enabledExtension = useSelect(s => s(store).getExtensionMode(), []);

    const changeExtension = () =>
    {
        setExtensionMode(!enabledExtension);
    }

    
    return (
        <>
            <p>{ __('Select whether to enable features that are currently under development and therefore unstable', 'query-search') }</p>

            <p style={{color: 'red'}}>{ enabledExtension ? __('Enabled', 'query-search') : __('Disabled', 'query-search') }</p>

            <Button variant="primary" onClick={changeExtension}>
                { __('Toggle extension validity', 'query-search') }
            </Button>
        </>
    )
}
