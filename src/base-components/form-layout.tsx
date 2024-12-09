import React from "react"

import "./form-layout.scss"

export const InnerBlocksPanel = ({label, children, themeColor}) =>
{
	return (
		<div className="inner-blocks-panel" style={{ borderColor: themeColor }}>
			{ children }
		</div>
	)
}

export const InputFormPanel = ({label, children}) =>
{
	return (
		<div className="input-form-panel">{ children }</div>
	)
}
export const InspectorInputFormPanel = ({label, children}) =>
{
	return (
		
		<GroupBox label={label}>
			<div className="inspector-input-form-panel">{ children }</div>
		</GroupBox>
		
	)
}

export const ComponentArea = ({label, children}) =>
{
	return (
		<fieldset className="component-area">
			<legend className="component-area-label">{label}</legend>
			{children}
		</fieldset>
	)
}

export const GroupBox = ({label, children, title = undefined}) =>
{
	return (
		<fieldset className="group-box">
			<legend className="group-box-label">{label}</legend>
			<div className="group-box-title">{title}</div>
			{children}
		</fieldset>
	)
}

