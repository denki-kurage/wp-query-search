import { usePropertyContext } from "../base-components/input-forms-property-context";
import React from "react";
import { Button, TextControl, } from "@wordpress/components";
import { GroupBox } from "../base-components/form-layout";
import { useState } from "@wordpress/element";
import { useUniqueId } from "../hooks/use-unique-id";
import { __ } from "@wordpress/i18n";

export const EditWrapper = ({ uid, label, children }) =>
{
	const getUid = useUniqueId();
	const hasField = !!uid && !!label;
	
	const { properties, setProperty } = usePropertyContext();
	const [title, setTitle] = useState('');

	const setField = () =>
	{
		if(!uid)
		{
			const newUid = getUid();
			setProperty('uid', newUid);
		}

		setProperty('label', title);
	}

	return hasField ? children :
	(
		<GroupBox label={__('Setting labels for results views', 'query-search')}>
			<TextControl __nextHasNoMarginBottom={true} value={title} onChange={setTitle} label={__('Label', 'query-search')} />
			<Button variant="primary" onClick={setField}>
				{__('After setting the label, select the kind and name from the inspector', 'query-search')}
			</Button>
		</GroupBox>
	)
}

export default EditWrapper;

