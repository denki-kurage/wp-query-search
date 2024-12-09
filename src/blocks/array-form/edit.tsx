import React from "react"
import { useInputFormContext } from "../../base-components/input-forms";
import { ModalOpenButton } from "../../base-components/async-dialog-components/buttons-extensions";
import { useSelect } from "@wordpress/data";
import { store } from "../../store";
import { useStatePropertiesContextValue } from "../../hooks/use-properties-context";
import { PropertyContextProvider, usePropertyContext } from "../../base-components/input-forms-property-context";
import { Button, ButtonGroup } from "@wordpress/components";
import { useOpenCloseContext } from "../../base-components/async-dialog-components/open-close-context";
import { __ } from "@wordpress/i18n";

const propertyName = 'query';

export default ({ attributes }) =>
{
	const { ArrayList, Boolean } = useInputFormContext();
	const { viewTable = false } = attributes;

	return (
		<>
			<Boolean name="viewTable" label={__('Show list', 'query-search')} />

			<ArrayList name={propertyName} viewTable={viewTable} label={__('Edit list', 'query-search')} buttons={<ListFromEntity />} />
			
		</>
	)
};

export const ListFromEntity = ({}) =>
{
	const resultViews = useSelect(s => s(store).getEnabledResultViews(), []);
	const options = resultViews.map(rv => ({ label: `${rv.attributes.label}(${rv.attributes.uid})`, value: rv.attributes.uid }));
	const { Select } = useInputFormContext();

	const { properties, setProperty } = usePropertyContext();
	const pv = useStatePropertiesContextValue({uid: undefined});

	// @ts-ignore
	const uid = pv?.properties?.uid;
	const rv = useSelect(s => s(store).getResultView(uid), [uid]);
	const ids = rv?.attributes?.checkedIds ?? [];

	const addIds = () =>
	{
		const newIds = [...properties[propertyName], ...ids];
		setProperty(propertyName, newIds);
	}

	const updateIds = () =>
	{
		setProperty(propertyName, [...ids]);
	}
	

	return (
		<ModalOpenButton label={__('Get from results view', 'query-search')}>
			<PropertyContextProvider value={pv}>
				<Select name="uid" label={__('Choose a results view', 'query-search')} options={options} />
			</PropertyContextProvider>
			{
				(ids.length > 0) && <div style={{ overflow: 'scroll', maxHeight: '20em' }}> { ids.map(id => <p key={id}>{id}</p>) } </div>
			}
			{
				(ids.length > 0) && <ResultViewIds onUpdate={updateIds} onAdd={addIds} />
			}
		</ModalOpenButton>
	)
};


const ResultViewIds = ({onUpdate, onAdd}) =>
{
	const { close } = useOpenCloseContext();

	return (
		<ButtonGroup className="buttons-flex-container">
			<Button variant="primary" onClick={ () => { close(); onUpdate() } }>{__('Overwrite list', 'query-search')}</Button>
			<Button variant="primary" onClick={ () => { close(); onAdd() }} >{__('Add to List', 'query-search')}</Button>
		</ButtonGroup>
	)
}