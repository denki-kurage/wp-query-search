import React, {  } from "react";
import { useInputFormContext } from "../base-components/input-forms";
import { useEffect } from "@wordpress/element";
import { Button, PanelBody } from "@wordpress/components";
import { getEntityRenderInfo, useColumns, useEntityConfigOptions } from "./hooks";
import { useStatePropertiesContextValue } from "../hooks/use-properties-context";
import { PropertyContextProvider } from "../base-components/input-forms-property-context";
import { ListView } from "./list-view";
import { InspectorControls } from "@wordpress/block-editor";
import { useLoadEntityState } from "../hooks/use-entity-state";
import { useResultViewInfoContext } from "./context";
import { __ } from "@wordpress/i18n";


const defaultSelectionColumns = ['id', 'name', 'name.raw', 'title', 'title.raw', 'slug', 'description', 'description.raw'];

/**
 * kind, name に対するエンティティ設定情報が無い場合にこちらが表示されます。
 */
export const ChooseEntityEditor = ({uid, setAttributes}) =>
{
	const pv = useStatePropertiesContextValue({kind: 'postType', name: ''});
	const { kind, name } = pv.properties as any;
	const { Select } = useInputFormContext();
	const { kindOptions, postTypeOptions, hasConfig, config } = useEntityConfigOptions(kind, name);

	const { changeColumns, changeIds } = useResultViewInfoContext();


	const { primaryKey } = getEntityRenderInfo(config);
	const { items } = useLoadEntityState(name, kind);
	const { flatColumns } = useColumns(items);

	const raws = config?.rawAttributes?.map(r => `${r}.raw`) ?? [];
	const fields = [...defaultSelectionColumns, ...raws]

	const change = () =>
	{
		if(hasConfig)
		{
			setAttributes({ kind, name });
		}
	}

	useEffect(() => {
		changeIds([])
		changeColumns([])
	}, [kind, name])


	useEffect(() => {
		const selectedColumns = flatColumns.filter(fc => fields.includes(fc) || fc === primaryKey);
		changeColumns(selectedColumns);
	}, [items])


	return (
		<>
		
			<InspectorControls>
				<PropertyContextProvider value={pv}>
					<PanelBody title={__('Select entity', 'query-search')}>
						<Select name="kind" label="kind" options={kindOptions} />
						<Select name="name" label="name" options={postTypeOptions} />
						<Button variant="primary" disabled={!hasConfig} onClick={change}>{__('Determine the entity', 'query-search')}</Button>				
					</PanelBody>
				</PropertyContextProvider>
			</InspectorControls>

			<ListView
				kind={kind}
				name={name}
				uid={uid}
				/>
			
		</>
	)

}

// @ts-ignore
export const EntityInfoView = ({ kind, name }) =>
{
	const { config } = useEntityConfigOptions(kind, name);

	return (
		<InspectorControls>
			<PanelBody title={__('Entity info', 'query-search')}>
				<div>
					<table>
						<tbody>
							<tr>
								<td>kind</td>
								<td>{config?.kind}</td>
							</tr>
							<tr>
								<td>name</td>
								<td>{config?.name}</td>
							</tr>
							<tr>
								<td>baseURL</td>
								<td>{config?.baseURL}</td>
							</tr>
							<tr>
								<td>label</td>
								<td>{config?.label}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</PanelBody>
		</InspectorControls>
	);
};


export const EntityEditor = ({kind, name, uid, setAttributes }) =>
{
	const { hasConfig } = useEntityConfigOptions(kind, name);

	return (
		<div>
			{ hasConfig ?
				<EntityInfoView kind={kind} name={name} /> :
				<ChooseEntityEditor uid={uid} setAttributes={setAttributes} />
			}
		</div>
	) 
}

