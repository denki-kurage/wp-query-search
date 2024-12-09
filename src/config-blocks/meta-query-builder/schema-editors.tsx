import React, { useMemo } from 'react';
import { BlcoksContextHost } from '../../base-components/block-editor-registry-provider';
import InnerQueryFormHosts from '../../blocks/inner-query-form-hosts';
import { useSchemaToBlocks } from '../../edit/edit-entity-buttons-hooks';
import json from './query-parameter-schema.json';
import { useSelect } from '@wordpress/data';


export const QueryParameter = ({}) =>
{
    const { blocks, error } = useSchemaToBlocks({dataType: json}, {}, []);
    //const blocks = useMemo(() => getBlocks(), []);
    

	return (
		<BlcoksContextHost blocks={blocks}>
            <EndpointEditor />
        </BlcoksContextHost>
	)
}


const EndpointEditor = props =>
{
    // @ts-ignore
    const blocks = useSelect(s => s('core/block-editor').getBlocks(), []);

    return (
        <InnerQueryFormHosts blocks={blocks} />
    )
}
