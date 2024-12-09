import React from "react"
import { ColorPalette } from '@wordpress/components';
import { usePropertyContext } from "../base-components/input-forms-property-context";

const names = 'red:f44336,pink:e91e63,blue:2196f3,lightBlue:03a9f4,cyan:00bcd4,teal:009688,grean:4caf50,orange:ff9800,brown:795548,gray:9e9e9e,blueGray:607d8b,black:000000';

// @ts-ignore
const colors = names.split(',').map(n => n.split(':')).reduce( (prv, [k, v]) => ([ ...prv, { name: k, color: `#${v}` }]), [] ) as any;

const useColors = () =>
{
	return colors;
}

export const ThemeColor = props =>
{
	const { properties, setProperty } = usePropertyContext();
	const { themeColor } = properties;
	const colors = useColors();

	const changeColor = color =>
	{
		setProperty('themeColor', color);
	}

	return (
		<ColorPalette
			colors={colors}
			value={themeColor}
			onChange={changeColor} />
	)
}
