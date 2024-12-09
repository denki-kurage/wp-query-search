import React from "react"
import { useDispatch, } from '@wordpress/data';
import { Button, CheckboxControl, Modal, RadioControl, TextareaControl, ToggleControl } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { blocksToGroupByField, createQueryFormNestedObject, useQueries } from "./hooks";
import { usePropertyContext } from "../base-components/input-forms-property-context";

import { __ } from "@wordpress/i18n";



export const QueryFilters = ({kind, name, uid}) =>
{
	const { properties, setProperty } = usePropertyContext();
	const { minimum } = properties;
	const { toplevelBlocks, queryString } = useQueries(kind, name, uid) ?? {};

	return (
		<div className="query-filters">

			<ToggleControl
				label={__('Enable space saving', 'query-search')}
				checked={minimum}
				__nextHasNoMarginBottom={true}
				onChange={b => setProperty('minimum', b)} />
			
			<ButtonOrModal expanded={!minimum}>
				<TextareaControl __nextHasNoMarginBottom={true} value={queryString} onChange={e => {}} />
				<TextareaControl __nextHasNoMarginBottom={true} value={decodeURI(queryString)} onChange={e => {}} />

				<QueryItems blocks={toplevelBlocks} />
			</ButtonOrModal>

		</div>
	)
}

const ButtonOrModal = ({children, expanded}) =>
{
	if(expanded)
	{
		return children;
	}
	else
	{
		return <ModalOpen>{ children }</ModalOpen>
	}
}

const ModalOpen = ({children}) =>
{
	const [open, setOpen] = useState(false);

	if(open)
	{
		return (
			<Modal title={__('Query list', 'query-search')} onRequestClose={() => setOpen(false)} size="fill">
				{ children }
			</Modal>
		)
	}

	return (
		<Button variant="primary" onClick={() => setOpen(true)}>
			{ __('Open the query list', 'query-search') }
		</Button>
	)
}

const QueryItems = ({blocks}) =>
{
	const map = blocksToGroupByField(blocks) as any;

	return (
		<>
			{
				map.entries(([field]) => <h2>{field}</h2>)
			}

			{
				(Object.entries(map) as any).map(([field, blocks]) => {
					return blocks.length === 1 ?
					<CheckItem key={field} field={field} block={blocks[0]}  /> :
					<CheckItems key={field} field={field} blocks={blocks} />
				})
			}
			
		</>
	)
}


const toLabel = block =>
{
	const field = block.attributes?.field ?? '';
	const query = createQueryFormNestedObject(block);
	const queryText = typeof query === "object" ? JSON.stringify(query, undefined, 4) : query;
	return `${field}: ${queryText}`;
}

const CheckItems = ({field, blocks, }) =>
{
	const options = blocks.map((block) => ({ label: toLabel(block), value: block.attributes?.uid }));
	const { updateBlockAttributes } = useDispatch('core/block-editor');
	const [ selected, setSelected ] = useState(blocks.find(b => b.attributes?.enabled)?.attributes?.uid);

	const clear = () =>
	{
		const clientIds = blocks.map(item => item.clientId);
		updateBlockAttributes(clientIds, { enabled: false });
		setSelected(undefined);
	}

	const change = u =>
	{
		const clientIds = blocks.map(item => item.clientId);
		const block = blocks.find(item => item.attributes?.uid === u);
		const cid = block?.clientId;
		updateBlockAttributes(clientIds, { enabled: false});
		updateBlockAttributes(cid, {enabled: true});
		setSelected(u);
	}
	
	return (
		<div className="query-form-select query-form-select-radio">
			<RadioControl
				label={field}
				selected={selected}
				onChange={change}
				options={options}
				/>
			<Button style={{width: '100%'}} disabled={!selected} variant="secondary" onClick={clear}>
				クリア
			</Button>
		</div>
	);
}

const CheckItem = ({field, block, }) =>
{
	const { attributes, clientId } = block;
	const { enabled } = attributes;
	const { updateBlockAttributes } = useDispatch('core/block-editor');
	const queryText = toLabel(block);

	const change = c =>
	{
		updateBlockAttributes(clientId, { enabled: !enabled });
	}

	return (
		<div className="query-form-select query-form-select-check">
			<CheckboxControl
				style={{width: '100%', whiteSpace: 'pre' }}
				checked={enabled}
				onChange={change}
				label={`${queryText}`}
				__nextHasNoMarginBottom={true}
				/>
		</div>
	)
}




