import { useDispatch, useSelect } from '@wordpress/data';
import React from 'react';
import { Button } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { useInputFormContext } from "../base-components/input-forms";
import { PropertyContextProvider } from '../base-components/input-forms-property-context';
import { useStatePropertiesContextValue } from '../hooks/use-properties-context';
import { useEndpointArgsContext } from './endpoint-context';
import { InnerQueryFormHosts } from '../blocks/inner-query-form-hosts';
import { useQueries } from './hooks';
import { QueryFormBlocksContextProvider, QueryFormComposeProvider, queryFormInspectorBlocksContext } from '../blocks/blocks-context';
import { store as noticesStore } from "@wordpress/notices";
import { __ } from '@wordpress/i18n';


import { createBlockBySchema } from '../blocks/utils';
import { useQueryFormBlocks } from '../blocks/hooks';
import { store } from '../store';
import { useResultViewInfoContext } from './context';
import { endpointEditorCompose } from '../blocks/hoc';

const AddSelect = ({ label, clientId, pid }) => {

	const { Select } = useInputFormContext();
	const { queryFormSelection, setQueryFormSelection } = useResultViewInfoContext();
	const blockName = queryFormSelection.selectedQueryForm;

	const pv = useStatePropertiesContextValue({ value: blockName });
	const { insertBlock } = useDispatch('core/block-editor');
	const { generateUniqueId } = useSelect(s => s(store), []);
	const { blocks, blockNames } = useQueryFormBlocks() as any;
	const options = blocks.map(b => ({ label: b.title, value: b.name, description: b.description }));


	const addQueryForm = () =>
	{
		if(blockNames.includes(blockName))
		{
			const block = createBlock(
				blockName,
				{
					pid,
					uid: generateUniqueId()
				}
			)
			if(block)
			{
				insertBlock(block, 0, clientId, false);
			}
		}
	}
	return (
		<PropertyContextProvider value={pv}>
			<Select name="value" label={label} options={options} onChanged={(k, v) => setQueryFormSelection({ ...queryFormSelection, selectedQueryForm: v })} />
			{
				blockName &&
				<Button variant="primary" onClick={addQueryForm}>{__('Add', 'query-search')}</Button>
			}
		</PropertyContextProvider>
	);

};

const EndpointSelect = ({ label, clientId, pid }) =>
{
	const { Select } = useInputFormContext();
	const { queryFormSelection, setQueryFormSelection } = useResultViewInfoContext();
	const field = queryFormSelection.selectedEndpoint;
	const { createErrorNotice } = useDispatch(noticesStore);

	const pv = useStatePropertiesContextValue({ value: field });
	const { options, args, fields  } = useEndpointArgsContext();

	const { insertBlock } = useDispatch('core/block-editor');
	const { generateUniqueId } = useSelect(s => s(store), []);


	const addQueryFormFromEndpoint = () =>
	{
		const arg = args?.[field];
		if(arg)
		{
			try
			{
				const block = createBlockBySchema(pid, field, arg, generateUniqueId as any);
				insertBlock(block, 0, clientId, false);
			}
			catch(ex)
			{
				createErrorNotice(ex.message, { type: 'snackbar' });
			}
		}
	}

	if(!args)
	{
		return <p>Loading</p>
	}
	
	return (
		<PropertyContextProvider value={pv}>
			<Select name="value" label={label} options={options} onChanged={(k, v) => setQueryFormSelection({ ...queryFormSelection, selectedEndpoint: v})} />
			{
				field &&
				<Button variant="primary" onClick={addQueryFormFromEndpoint}>{__('Add', 'query-search')}</Button>
			}
		</PropertyContextProvider>
	)
}

export default ({pid, clientId, kind, name}) =>
{
	const { toplevelBlocks } = useQueries(kind, name, pid) ?? {};


	return (
		<div>
			<div className="query-form-additional">
				<AddSelect label={__('Add query form', 'query-search')} clientId={clientId} pid={pid}  />
			</div>
			<div className="query-form-additional query-form-endpoint">
				<EndpointSelect label={__('Add from endpoint', 'query-search')} clientId={clientId} pid={pid} />
			</div>
			<div>
				<QueryFormBlocksContextProvider value={queryFormInspectorBlocksContext}>
					<QueryFormComposeProvider value={endpointEditorCompose}>
						<InnerQueryFormHosts blocks={toplevelBlocks} />
					</QueryFormComposeProvider>
				</QueryFormBlocksContextProvider>
			</div>
		</div>
	)
}
