import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { withAddPostForm, withDeletePostButton, withEditPostForm } from "../base-components/async-dialog-components/with-entity-components";
import { useAllEndpointArgs, useEntityConfig } from './hooks';
import { IBlockComposeContext, QueryFormBlocksContextProvider, QueryFormComposeProvider, queryFormInspectorBlocksContext } from '../blocks/blocks-context';
import InnerQueryFormHosts from '../blocks/inner-query-form-hosts';
import { SubRegistryBlocksComponent, withLocalBlockEditorRegistry } from '../base-components/block-editor-registry-provider';
import { useSelect } from '@wordpress/data';
import { store as coreStore, useEntityRecord } from '@wordpress/core-data';
import { getChangedBlockQuery, flatToObject, useSchemaToBlocks } from './edit-entity-buttons-hooks';
import { objectEditorCompose, withEditTable, withEditTableLine, withObjectTable } from '../blocks/hoc';
import { usePropertyContext } from '../base-components/input-forms-property-context';
import { Notice } from '@wordpress/components';
import { ParentQueryFormProvider } from '../blocks/query-form-host';


const useLocalBlocks = (kind: string, name: string, record: any = {}) =>
{
	const { args } = useAllEndpointArgs(kind, name, 'POST');
	// @ts-ignore
	const { config } = useEntityConfig(kind, name);
	const rawAttrs = config?.rawAttributes ?? [];
	const { blocks, trackingBlockData, error } = useSchemaToBlocks(args, record, rawAttrs);
	const { properties, setProperties } = usePropertyContext();
	return { blocks, properties, setProperties, trackingBlockData, error }
}

const useBlockEditorSubscribe = (registry, trackingBlockData, setProperties) =>
{
	useEffect(() => {

		const updateProperties = () =>
		{
			const newBlocks = registry.select('core/block-editor').getBlocks();
			const allChangedMap = getChangedBlockQuery(newBlocks, trackingBlockData);
			const flatAllChangedMap = flatToObject(allChangedMap)
			setProperties(flatAllChangedMap)
		};

		return registry.subscribe(() => {
			updateProperties();
		}, 'core/block-editor')

	}, [])

}

const TopObjectQueryFormComponent = withEditTable(({children}) =>
{
	return (
		<ParentQueryFormProvider value={withEditTableLine}>
			{children}
		</ParentQueryFormProvider>
	)
})

const AddItemForm = withLocalBlockEditorRegistry((props) =>
{
	const { kind, name, registry } = props;
	const { blocks, trackingBlockData, setProperties, error } = useLocalBlocks(kind, name, {});

	useBlockEditorSubscribe(registry, trackingBlockData, setProperties);


	if(error)
	{
		return <Notice status="error" isDismissible={false}>{error}</Notice>
	}

	return (
		<SubRegistryBlocksComponent blocks={blocks}>
			<QueryFormBlocksContextProvider value={queryFormInspectorBlocksContext}>
				<QueryFormComposeProvider value={objectEditorCompose}>
					<TopObjectQueryFormComponent>
						<EndpointEditor  />
					</TopObjectQueryFormComponent>
				</QueryFormComposeProvider>
			</QueryFormBlocksContextProvider>
		</SubRegistryBlocksComponent>
	)
});

const EditItemForm = props =>
{
	const { kind, name, id } = props;
	const { record, hasResolved } = useEntityRecord(kind, name, id);
	return hasResolved ? <EditEditor record={record} {...props} /> : <p>LOADING...</p>;
}
const EditEditor = withLocalBlockEditorRegistry((props) =>
{
	const { kind, name, id, registry, record } = props;
	const { blocks } = useLocalBlocks(kind, name, record);

	// propertiesは参照値として保持されている。
	// setProperties()はpropertiesの参照を変更させない。
	const { properties, setProperties } = usePropertyContext();

	
	useEffect(() => {
		
		return registry.subscribe(
			() => {
				const newBlocks = registry.select('core/block-editor').getBlocks();
				const changedMap = getChangedBlockQuery(newBlocks, properties ?? {});

				if(changedMap.size)
				{
					const editedState = flatToObject(changedMap);
					setProperties(editedState)
				}
			},
			'core/block-editor'
		)
	}, [])

	
	return (
		<SubRegistryBlocksComponent blocks={blocks}>
			<QueryFormBlocksContextProvider value={queryFormInspectorBlocksContext}>
				<QueryFormComposeProvider value={objectEditorCompose}>
					<TopObjectQueryFormComponent>
						<EndpointEditor  />
					</TopObjectQueryFormComponent>
				</QueryFormComposeProvider>
			</QueryFormBlocksContextProvider>
		</SubRegistryBlocksComponent>
	)
})


const RemoveItemForm = ({value}) =>
{
	return <p>本当に削除しますか？</p>
}


const EndpointEditor = props =>
{
	// @ts-ignore
	const blocks = useSelect(s => s('core/block-editor').getBlocks(), []);

	return (
		<InnerQueryFormHosts blocks={blocks} />
	)
};


const AddEntityForm = withAddPostForm(AddItemForm);
const EditEntityForm = withEditPostForm(EditItemForm);
const DeleteEntityForm = withDeletePostButton(RemoveItemForm);

export { AddEntityForm, EditEntityForm, DeleteEntityForm }
