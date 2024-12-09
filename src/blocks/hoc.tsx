import { store as blockEditorStore, InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { compose, createHigherOrderComponent } from "@wordpress/compose";
import React from "react";
import { PropertyContextProvider, usePropertyContext } from "../base-components/input-forms-property-context";
import { useMemo, useState } from "@wordpress/element";
import { Button, ButtonGroup, PanelBody, TextControl } from "@wordpress/components";
import { useDispatch, useSelect } from "@wordpress/data";
import { GroupBox } from "../base-components/form-layout";
import { getQueryFormTitle } from "./hooks";
import { store } from "../store";
import { useInputFormContext } from "../base-components/input-forms";
import { useUniqueId } from "../hooks/use-unique-id";
import { useStatePropertiesContextValue } from "../hooks/use-properties-context";
import { __ } from "@wordpress/i18n";
import { IBlockComposeContext, useQueryFormBlocksContext } from "./blocks-context";

/************************
 * クエリフォームのコンポーネント作成支援。
 * インスペクタでのレンダリングのため、共通の限定部分と
 * ブロックとしてフル機能する追加の部分に分ける。
 * 
 * 
 */


const useCurrentResultView = pid =>
{
	return useSelect(s => s(store).getResultView(pid), [pid]);
}

const useResultViewsWithUID = () =>
{
	return useSelect(s => s(store).getEnabledResultViews(), []);
}

const useParentBlock = (clientId: string) =>
{
	return useSelect(s => {
		const { getBlockParents, getBlock } = s('core/block-editor') as any;
		const p = getBlockParents(clientId, true)?.[0];
		return p ? getBlock(p) : undefined;
	}, [clientId]);

}
const ResultViewLabel = ({ themeColor, label}) =>
{
	const style = themeColor ? { borderColor: themeColor, color: themeColor } : {};

	return (
		<div className="result-view-label" style={style}>
			{__('@ Result View', 'query-search')} : {label}
		</div>
	)
}


const withFieldInputComponent = createHigherOrderComponent(BlockEdit => props =>
{
	const { attributes = {}, clientId } = props;
	const { field, uid } = attributes;
	const getUid = useUniqueId();

	const { parentResultView } = useSelect(select => {
		const s = select(store);
		return ({
			parentResultView: s.getParentResultView(clientId)
		})
	}, [clientId]);

	const { setProperty } = usePropertyContext();

	const [fieldName, setFieldName] = useState('');
	const hasField = !!field;



	const setField = () =>
	{
		setProperty('field', fieldName);
		if(!uid)
		{
			const parentUID = parentResultView?.uid ?? '';

			const newUid = getUid() + "-uid";
			setProperty('uid', newUid)
			setProperty('pid', parentUID)
		}
	}

	
	return hasField ? <BlockEdit {...props} /> 
		:
		(
			<>
				<h2>{__('Please enter a query name', 'query-search')}</h2>

				<TextControl
					label="fieldName"
					value={fieldName}
					__nextHasNoMarginBottom={true}
					onChange={setFieldName} />
				<Button
					disabled={fieldName.length === 0}
					variant="primary"
					onClick={setField}>
						{__('Decide on a field name (%s)', 'query-search').replace('%s', fieldName)}
				</Button>
			</>
		)

}, 'withFieldInputComponent');







const ResultViewsSelect = ({ resultViews, label }) =>
{
	const { Select } = useInputFormContext();

	const options = useMemo(
		() => resultViews.map(rv => ({ label: `${rv.attributes.label}(${rv.attributes.uid})`, value: rv.attributes.uid })), [resultViews.map(rv => rv.uid).join(',')])


	return <Select name="pid" label={label} options={options} />
}

const withResultViewAttachement = createHigherOrderComponent(BlockEdit => props => {

	const { attributes } = props;
	const { pid } = attributes;

	const resultViews = useResultViewsWithUID();
	const currentResultView = useCurrentResultView(pid);
	
	const hasPid = !!pid;

	if(!resultViews.length)
	{
		return (
			<>
				<div className="query-form-warning">
					<p>{__('This post has no result views. Create a results view.', 'query-search')}</p>
				</div>
				<BlockEdit {...props} />
			</>
		)
	}


	if(!currentResultView)
	{
		const msg = hasPid ?
			__('The currently set result view (%s) does not exist', 'query-search').replace('%s', pid) : 
			__('Does not currently belong to a particular results view. Please select a result view below', 'query-search');
		
		return (
			<>
				<div className="query-form-warning">
					<p>{msg}</p>
					<ResultViewsSelect label={__('Select result view', 'query-search')} resultViews={resultViews} />
				</div>
				<BlockEdit {...props} />
			</>
		)
	}

	return <BlockEdit {...props} />

}, 'withResultViewAttachement')


export const withQueryFormInternal = createHigherOrderComponent(BlockEdit => props =>
{

	const { description, required } = props.attributes;

	return (
		<div className="with-query-form-internal">
			{ description && <p>{description}</p> }
			{ required && <p style={{color: 'red'}}>{__('* required', 'query-search')}</p> }
			<BlockEdit {...props} />
		</div>
	)

}, 'withQueryFormInternal')


const withSwitchMultiBlocks = createHigherOrderComponent(BlockEdit => props =>
{
	const { clientId, attributes = {}, name } = props;
	const { uid } = attributes;
	const parentBlock = useParentBlock(clientId);

	const parentIsMultiForm = parentBlock?.name === 'query-search/multi-query-form';

	// マルチフォームの子要素は自ら対象じゃない場合は非表示になる。
	// 親がマルチフォームで、そこから選択されたUIDを取得。
	const isVisible = !parentIsMultiForm || parentBlock?.attributes?.selectedUid === uid;

	return isVisible ? <BlockEdit {...props} /> : null;
}, 'withSwitchMultiBlocks');

const withGroupBox = createHigherOrderComponent(BlockEdit => props =>
{

	const { clientId, attributes = {}, name } = props;
	const { field = '', uid } = attributes;
	const parentBlock = useParentBlock(clientId);

	const parentIsMultiForm = parentBlock?.name === 'query-search/multi-query-form';

	// 親がマルチフォームで(ただし自身がマルチフォームだと表示)、それ以外なら　 なおかつ自身もマルチフォーム以外
	const showGroupBox = parentIsMultiForm ? name === 'query-search/multi-query-form' : true;

	const fm = getQueryFormTitle(name) as any;
	const title = field;

	return showGroupBox ?
		<GroupBox label={title} title={fm}><BlockEdit {...props} /></GroupBox> :
		<BlockEdit {...props} />

}, 'withGroupBox')

const withShowLabelComponent = createHigherOrderComponent(BlockEdit => props => {

	const { clientId, attributes = {}, isBlock } = props;
	const { pid = '' } = attributes;
	const parentBlock = useParentBlock(clientId);

	// このクエリフォームがトップレベルかを調べる。親がリスト系の場合、自身はすでにトップレベルではない。
	// これらリスト系は直属の子にのみ子のクエリフォームを置くことになっている。
	const parentHasChildren =
		['query-search/multi-query-form', 'query-search/object-query-form']
		.includes(parentBlock?.name);

	const currentResultView = useCurrentResultView(pid);

	// ブロックであり、親が子持ちタイプではない
	const showLabel = isBlock && !parentHasChildren;

	return (
		<>
			{ showLabel &&
				<ResultViewLabel
					themeColor={currentResultView?.attributes?.themeColor}
					label={currentResultView?.attributes?.label} />
			}

			<BlockEdit {...props} />
		</>
	)

}, 'withShowLabelComponent');


export const withEditTableLine = createHigherOrderComponent(BlockEdit => props =>
{
	const { name, attributes } = props;
	const { field } = attributes;
	const fn = getQueryFormTitle(name);

	return (
		<tr>
			<td>
				<div><b>{field}</b></div>
				<div style={{color: "gray"}}><small>({ fn })</small></div>
			</td>
			<td><BlockEdit {...props} /></td>
		</tr>
	)
}, 'withEditTableLine');



export const withEditTable = createHigherOrderComponent(BlockEdit => props =>
{
	const { name } = props;

	return (
		<table className='endpoint-edit-editor'>
			<thead>
				<tr>
					<th>{__('Field name', 'query-search')}</th>
					<th>{__('Editor', 'query-search')}</th>
				</tr>
			</thead>
			<tbody>
				<BlockEdit {...props} />
			</tbody>
		</table>
	)
}, 'withEditTable');



// フィルターによりクエリフォームすべてに適用される。
// ブロックとしてレンダリングされるもので、インスペクタでは適用させない(二重になる)。
export const withQueryFormBlock = createHigherOrderComponent(BlockEdit => (props) => {
	
	const { clientId, attributes, setAttributes } = props;
	const { uid, field, query, pid } = attributes;
	const { Text } = useInputFormContext();

	const usPv = useStatePropertiesContextValue({field}) as any;
	const fieldValue = usPv.properties?.field ?? '';

	const parentResultView = useSelect(s => s(store).getParentResultView(clientId), [clientId]);

	const currentResultView = useCurrentResultView(pid);
	const resultViews = useResultViewsWithUID();
	
	const { selectBlock, toggleBlockHighlight, moveBlockToPosition } = useDispatch(blockEditorStore);
	const blockProps = useBlockProps();

	const { label, kind, name } = currentResultView?.attributes ?? {};


	const canMoveToHiddenBlocks = currentResultView && (parentResultView !== currentResultView);

	const moveToHiddenBlocks = () =>
	{
		if(canMoveToHiddenBlocks)
		{
			const fromId = parentResultView?.clientId;
			const movetoId = currentResultView.clientId;
			moveBlockToPosition(
				clientId,
				fromId,
				movetoId,
				0
			);

		}
	}

	const focusResultView = () =>
	{
		if(currentResultView)
		{
			const cid = currentResultView.clientId;
			selectBlock(cid);
			toggleBlockHighlight(cid, true);
		}
	}


	return (
		<div {...blockProps}>

			<BlockEdit {...props} isBlock={true} />

			<InspectorControls>
				<PanelBody title={__('Query form info', 'query-search')}>
					<p>ID: {uid}</p>
					<p>field: {field}</p>
					<p>query: {JSON.stringify(query, undefined, 4)}</p>

					<PropertyContextProvider value={usPv}>
						<Text name="field" />
						<div className="buttons-flex-container">
							<Button variant="primary" disabled={field === fieldValue || fieldValue.length === 0} onClick={() => setAttributes({field: usPv.properties?.field})}>
								{__('Overwrite', 'query-search')}
							</Button>
							<Button variant="primary" onClick={moveToHiddenBlocks} disabled={!canMoveToHiddenBlocks}>
								{__('Move to hidden blocks', 'query-search')}
							</Button>
						</div>
					</PropertyContextProvider>
					
				</PanelBody>
				<PanelBody title={__('Result view info', 'query-search')}>
					<p>ID: {pid}</p>
					<p>label: {label}</p>
					<p>kind: {kind}</p>
					<p>name: {name}</p>
					<ResultViewsSelect label={__('Change result view', 'query-search')} resultViews={resultViews} />

					<Button variant="primary" onClick={focusResultView}>
						{__('Choose a result view', 'query-search')}
					</Button>

				</PanelBody>
			</InspectorControls>
		</div>
	)
	

}, 'withQueryFormBlock');


// フィルタにより通常のブロックに適用される
export const withQueryBlockCompose = compose(
	withQueryFormBlock,
	withGroupBox,
	withShowLabelComponent,
	withFieldInputComponent,
	withResultViewAttachement,
	withQueryFormInternal,
	withSwitchMultiBlocks,
)

// インスペクタで表示するブロックで共通の機能。
export const withEndpointFormCompose = compose(
	withGroupBox,
	withFieldInputComponent,
	withResultViewAttachement,
	withQueryFormInternal,
	withSwitchMultiBlocks,
);


// 編集ブロック・グループボックス
export const withEditFormCompose = compose(
	withSwitchMultiBlocks,
	// TODO: クエリフォームブロックに大きく依存しているため、依存前提にするか再設計するかを決める
	withGroupBox,
	withQueryFormInternal,
)


export const withObjectTable = compose(
	withSwitchMultiBlocks,
	withEditTable,
)

export const withNomalCompose = compose(
	withSwitchMultiBlocks,
	withQueryFormInternal,
);




const useQueryFormBlock = (clientId?: string) =>
{
	const { useBlock } = useQueryFormBlocksContext();
	return clientId ? useBlock(clientId) : undefined;
}

const getBlockName = (block) =>
{
	if(block?.name === 'query-search/multi-query-form')
	{
		return 'multi';
	}

	if(block?.name === 'query-search/object-query-form')
	{
		return 'object';
	}

	return 'other';
}

export const endpointEditorCompose: IBlockComposeContext = (clientId?: string) =>
{
	return { selfCompose: withEndpointFormCompose, childrenCompose: null }
}

export const objectEditorCompose: IBlockComposeContext = (clientId?: string) =>
{
	const block = useQueryFormBlock(clientId);
	const blockName = getBlockName(block);

	const c = blockName === 'object' ?
		[withObjectTable, withEditTableLine] :
		[withNomalCompose, null];

	
	const [ selfCompose, childrenCompose ] = c;

	return { selfCompose, childrenCompose } as any;
}


