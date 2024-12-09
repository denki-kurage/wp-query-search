import { BlockControls, InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import './editor.scss';
import { useState } from '@wordpress/element';
import React, { useMemo } from 'react';
import { Button, Modal, PanelBody, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import QueryForms from './query-forms';
import { QueryFilters } from './query-filters';
import { ListView } from './list-view';
import { AddEntityForm } from './edit-entity-buttons';
import { InnerBlocksPanel } from '../base-components/form-layout';
import { EditWrapper } from './edit-wrapper';
import { EntityEditor } from './query-entity-editor';
import { ThemeColor } from './theme-color';
import { useInputFormContext } from '../base-components/input-forms';
import { PropertyContextProvider } from '../base-components/input-forms-property-context';
import { useStatePropertiesContextValue } from '../hooks/use-properties-context';
import { ModalToolbarButton } from '../base-components/async-dialog-components/buttons-extensions';
import { EndpointArgsContextProvider } from './endpoint-context';
import { useAllEndpointArgs } from './hooks';
import SaftyEntityHost from './safty-entity-host';

// <Button icon="edit" /> がいつの間にか使えなくなってた
import Edit from "@mui/icons-material/Edit";
import Add from "@mui/icons-material/Add";
import PreviewOutlined from "@mui/icons-material/PreviewOutlined"
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined"
import { ListViewInspector } from './list-view-inspector';
import { ResultViewContextInfo, ResultViewInfoContextProvider } from './context';
import { ExtensionButton } from './extension-button';
import { useSelect } from '@wordpress/data';
import { store } from '../store';
import { __ } from '@wordpress/i18n';



const HeaderControl = ({kind, name, display, setDisplay}) =>
{
	const hasEntity = kind && name;
	const enabledExtension = useSelect(s => s(store).getExtensionMode(), []);

	const label = display ? __('Hide hidden inner blocks', 'query-search') : __('Show hidden inner blocks', 'query-search') //"隠しブロックを非表示にする" : "隠しブロックを表示";

	return (
		<BlockControls>
			<ToolbarGroup>
				{ hasEntity && enabledExtension &&
					<ModalToolbarButton label={__('Add entity item', 'query-search')} icon={<Add />}>
						<AddEntityForm kind={kind} name={name} />
					</ModalToolbarButton>
				}
				
				<ToolbarButton
					icon={ display ? <PreviewOutlined /> : <VisibilityOffOutlined />}
					onClick={() => setDisplay(!display)}
					label={label} />
			</ToolbarGroup>
		</BlockControls>
	)
}


const ResultViewLabelEditor = ({ label, onLabelChanged }) =>
{
	const [ isEdit, setIsEdit ] = useState(false);
	const { Text } = useInputFormContext();
	const pv = useStatePropertiesContextValue({label}) as any;

	const l = isEdit ? __('Edit', 'query-search') : __('Apply edits', 'query-search')
	const inputText = pv.properties.label;

	const onChange = () =>
	{
		onLabelChanged(inputText);
		setIsEdit(false);
	}


	return (
		<div className="result-view-label result-view-label-main">
			{label} <Button icon={<Edit />} label={l} onClick={() => setIsEdit(!isEdit)} />
			{ isEdit &&
				<Modal onRequestClose={() => setIsEdit(false)} title={__('Edit label', 'query-search')}>
					<PropertyContextProvider value={pv}>
						<Text name="label" />
						<Button disabled={inputText.length === 0} variant="primary" onClick={onChange}>
							{__('Edit label', 'query-search')}
						</Button>
					</PropertyContextProvider>
				</Modal>
			}
		</div>
	)
}




export default ({attributes, setAttributes, clientId, isSelected}) =>
{
	const { label, uid, kind, name, checkedIds, selectedColumns, themeColor, showBlocks, listviewHeight } = attributes;
	const [ queryFormSelection, setQueryFormSelection ] = useState({ selectedQueryForm: '', selectedEndpoint: '' })

	const blockProps = useBlockProps({className: 'result-view-panel'})
	const ep = useAllEndpointArgs(kind, name);

	const setShowBlocks = ( showBlocks ) =>
	{
		setAttributes({ showBlocks })
	}

	const infoContext: ResultViewContextInfo = useMemo(() => {
		return ({
			checkedIds,
			listviewHeight,
			selectedColumns,
			queryFormSelection,

			changeIds: (ids) => setAttributes({ checkedIds: ids }),
			setListViewHeight: (listviewHeight = 400) => setAttributes({ listviewHeight }),
			changeColumns: (columns) => setAttributes({ selectedColumns: columns }),
			setQueryFormSelection: setQueryFormSelection

		})
	}, [listviewHeight, checkedIds, selectedColumns, queryFormSelection]);

	

	return (
		<EndpointArgsContextProvider value={ep}>
		<ResultViewInfoContextProvider value={infoContext}>
			<div { ...blockProps } style={{ borderColor: themeColor }}>
				<EditWrapper uid={uid} label={label}>

					<InspectorControls key="extension-box">
						<PanelBody title={__('Use Extensions', 'query-search')}>
							<ExtensionButton />
						</PanelBody>
					</InspectorControls>
					

					<EntityEditor kind={kind} name={name} uid={uid} setAttributes={setAttributes} />

					<SaftyEntityHost kind={kind} name={name}>

						<InspectorControls key="searchbar">
							<PanelBody title={__('Query filter', 'query-search')}>
								<QueryFilters kind={kind} name={name} uid={uid} />
							</PanelBody>
							<PanelBody title={__('Query forms', 'query-search')}>
								<QueryForms kind={kind} name={name} pid={uid} clientId={clientId} />
							</PanelBody>
						</InspectorControls>
						

						<ResultViewLabelEditor label={label} onLabelChanged={label => setAttributes({label})}/>

						<HeaderControl
							kind={kind}
							name={name}
							display={showBlocks}
							setDisplay={setShowBlocks} />

						<ListView
							kind={kind}
							name={name}
							uid={uid}
							/>

						
						<div style={{display: showBlocks ? "block" : "none"}}>
							<InnerBlocksPanel label={__('Hidden Inner blocks', 'query-search')} themeColor={themeColor}>
								<InnerBlocks />
							</InnerBlocksPanel>
						</div>						


						<InspectorControls>
							<PanelBody title={__('Theme Color', 'query-search')}>
								<ThemeColor />
							</PanelBody>
							<PanelBody title={__('DataGrid settings', 'query-search')}>
								<ListViewInspector />
							</PanelBody>
						</InspectorControls>

					</SaftyEntityHost>

					
				</EditWrapper>
			</div>
		</ResultViewInfoContextProvider>
		</EndpointArgsContextProvider>
	);
};



