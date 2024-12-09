import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";
import { InnerBlocks, store as blockEditorStore } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import InnerQueryFormHosts from "../inner-query-form-hosts";
import { store as blockStore } from "@wordpress/blocks";
import { useMemo } from "@wordpress/element";
import { queryFormInspectorBlocksContext, useQueryFormBlocksContext } from "../blocks-context";
import { __ } from "@wordpress/i18n";

export default (props) =>
{
	const { clientId } = props;
	const { useBlockChildren } = useQueryFormBlocksContext() ?? {}
	const blocks = useBlockChildren?.(clientId) ?? queryFormInspectorBlocksContext.useBlockChildren(clientId);
	const Component = useMemo( () => InnerQueryFormHosts, []);
	const options = useBlocksOptions(blocks);
	
	return (
		<div>
			<SelectForm clientId={clientId} options={options} />

			<div>
				{ !!useBlockChildren ? <InnerQueryFormHosts blocks={blocks} /> : <InnerBlocks /> }
			</div>
		</div>
	)
}

const useBlocksOptions = (blocks) =>
{
	return useSelect(s => {
		const { getBlockType  } = s(blockStore) as any;
		const { getBlockAttributes } = s(blockEditorStore) as any;
		return blocks.map(block => ({
			value: block.attributes.uid,
			label: getBlockAttributes(block.clientId)?.description ?? getBlockType(block.name)?.title ?? '???'
		}))
	}, [blocks])
}

const SelectForm = ({ clientId, options }) =>
{
	const { Select } = useInputFormContext();


	if(options.length === 0)
	{
		return <h2>{__('Query type is missing', 'query-search')}</h2>
	}

	return (
		<>
			<Select name="selectedUid" options={options} label={__('Select the query type to use', 'query-search')} />
		</>
	)
}
