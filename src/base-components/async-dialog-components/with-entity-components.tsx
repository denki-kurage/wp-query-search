import { createHigherOrderComponent } from "@wordpress/compose";
import { DeleteEntityAsyncType, EditEntityAsyncType, SaveEntityAsyncType, useDeleteEntityAsync, useEditEntityAsync, useSaveEntityAsync } from "../../hooks/use-entity-state";
import { useDispatch } from "@wordpress/data";
import { useEffect } from "@wordpress/element";
import { useOpenCloseContext } from "./open-close-context";
import React, { useState } from "react";
import { store as noticesStore } from "@wordpress/notices";
import { PropertyContextProvider } from "../input-forms-property-context";
import { Button, Notice, Spinner } from "@wordpress/components";
import { useReferencePropertyContextValue } from "../../hooks/use-properties-context";
import { __ } from "@wordpress/i18n"

export type FormComponentProps = { value: object, onValueChanged: (value: object) => void }
export type FormComponentType = (props: FormComponentProps) => JSX.Element;

export type InputFormAddArgs = [ name: string, kind: string ];
export type InputFormEditArgs = [id: number|string, ...InputFormAddArgs];

export type InputFormAddProps = { name: string, kind: string };
export type InputFormEditProps = { id: number|string, name: string, kind: string };


export const useErrorNotices = (lastError: any) =>
{
	const { createErrorNotice } = useDispatch(noticesStore);

	useEffect(() => {
		if(lastError)
		{
			createErrorNotice(lastError.message ?? lastError ?? '', { type: 'snackbar' })
		}
	}, [lastError]);
}


export const withDeletePostButton = createHigherOrderComponent((MessageComponent) => (props: InputFormEditProps) =>
{
	const { id, name, kind } = props;
	const delProps = useDeleteEntityAsync(kind, name, id);
	const { lastError } = delProps;

	const buttonProps = convertDeleteAsyncButtonProps(delProps);
	const buttons = <DeleteButtons {...buttonProps} />

	useErrorNotices(lastError);

	return (
		<EntityModalContainer error={lastError} buttons={buttons}>
			<MessageComponent {...props} />
		</EntityModalContainer>
	)
}, 'withDeletePostButton');


export const withAddPostForm = createHigherOrderComponent((FormComponent) => (props: InputFormAddProps) =>
{
	const { name, kind } = props;
	const [ properties, setProperties ] = useState({});
	const pv = useReferencePropertyContextValue(properties, setProperties);
	//const pv = useStatePropertiesContextValue({})

	const { properties: saveProperties } = pv;
	const saveProps = useSaveEntityAsync(kind, name, saveProperties)
	const buttonProps = convertSaveAsyncButtonProps(saveProps);

	const { lastError: error } = saveProps;
	const buttons = <SaveButtons {...buttonProps} />

	useErrorNotices(error);

	return (
		<PropertyContextProvider value={pv}>
			<EntityModalContainer buttons={buttons} error={error}>
				<FormComponent {...props} />
			</EntityModalContainer>	
		</PropertyContextProvider>

	);
}, 'withAddPostForm');

export const withEditPostForm = createHigherOrderComponent((FormComponent) => (props: InputFormEditProps) =>
{
	const { id, name, kind } = props;
	const editProps = useEditEntityAsync(kind, name, id);
	const { editedValue, edit } = editProps;
	const pv = useReferencePropertyContextValue(editedValue, edit);
	const buttonProps = convertEditAsyncButtonProps(editProps);

	const { lastError: error } = editProps;
	const buttons = <EditButtons {...buttonProps} />

	useErrorNotices(error);

	return (
		<PropertyContextProvider value={pv}>
			<EntityModalContainer buttons={buttons} error={error}>
				<FormComponent {...props} />
			</EntityModalContainer>
		</PropertyContextProvider>

	)
}, 'withEditPostForm');

const EntityModalContainer = ({error, buttons, children}) =>
{

	return (
		<div className="modal-content-panel">

			{ error && <Notice status="error" className="modal-content-top">{ error?.message || error?.toString() || 'Error' }</Notice> }

			<div className="modal-content-center">
				{children}
			</div>

			<div className="modal-content-bottom">
				{ buttons }
			</div>
		</div>
	)
}

const SaveButtons = (props: ExecAsyncButtonProps) =>
{ 
	const { close, isOpened } = useOpenCloseContext();
	const { executing, execute } = props;
	const wExec = wrapExecute(execute, close)

	return (
		<div className="buttons-flex-container">
			<ExecButton {...props} execute={wExec}>{ executing ? __('Saving', 'query-search') : __('Save', 'query-search') }</ExecButton>
			<CancelButton cancel={close} cancelling={false} disabled={false}>{__('Close', 'query-search')}</CancelButton>
		</div>
	)
}

const EditButtons = (props: ExecAsyncButtonProps) =>
{
	const { close, isOpened } = useOpenCloseContext();
	const { executing, execute } = props;
	const wExec = wrapExecute(execute, close)

	return (
		<div className="buttons-flex-container">
			<ExecButton {...props} execute={wExec}>{ executing ? __('Updating', 'query-search') : __('Update', 'query-search') }</ExecButton>
			<CancelButton cancel={close} cancelling={false} disabled={false}>{__('Close', 'query-search')}</CancelButton>
		</div>
	)
}

const DeleteButtons = (props: ExecAsyncButtonProps) =>
{
	const { close, isOpened } = useOpenCloseContext();
	const { executing, execute } = props;
	const wExec = wrapExecute(execute, close)

	return (
		<div className="buttons-flex-container">
			<ExecButton {...props} execute={wExec}>{ executing ? __('Deleting', 'query-search') : __('Delete', 'query-search') }</ExecButton>
			<CancelButton cancel={close} cancelling={false} disabled={false}>{__('Close', 'query-search')}</CancelButton>
		</div>
	)
}

const wrapExecute = (exec: () => Promise<any>, onExec?: () => void) =>
{
	if(onExec)
	{
		return async () =>
		{
			if(await exec())
			{
				onExec();
			}
		}
	}

	return exec;
}



export const convertSaveAsyncButtonProps = (props: SaveEntityAsyncType) =>
{
	const { save, isExecuting } = props;

	return ({
		execute: () => save(),
		executing: isExecuting,
		disabled: false,
		children: 'Save'
	}) as ExecAsyncButtonProps
}

export const convertEditAsyncButtonProps = (props: EditEntityAsyncType) =>
{
	const { save, isExecuting, hasEdits } = props;
	
	return ({
		execute: save,
		executing: isExecuting,
		disabled: !hasEdits,
		children: 'Update'
	}) as ExecAsyncButtonProps;
}

export const convertDeleteAsyncButtonProps = (props: DeleteEntityAsyncType) =>
{
	const { del, isExecuting } = props;

	return ({
		execute: del,
		executing: isExecuting,
		disabled: false,
		children: 'Delete'
	}) as ExecAsyncButtonProps;
}




export const withExecAsyncButton = createHigherOrderComponent(Edit => (props: ExecAsyncButtonProps) => <Edit {...props} />, '');
export const withCancelAsyncButton = createHigherOrderComponent(Edit => (props: CancelAsyncButtonProps) => <Edit {...props} />, '');


const ExecButton = withExecAsyncButton(({execute, disabled, executing, children}) => {
	return (
		<Button variant="primary" onClick={execute} disabled={disabled || executing}>
			{ executing ? <><Spinner />{children}</> : children }
		</Button>
	)
});

const CancelButton = withCancelAsyncButton(({cancel, disabled, cancelling, children}) => {
	return cancel ? <Button variant="tertiary" onClick={cancel} disabled={disabled || cancelling}>{children}</Button> : <></>;
});


interface AsyncButtonProps
{
	disabled: boolean;
	children: any;
}

interface ExecAsyncButtonProps extends AsyncButtonProps
{
	executing: boolean;
	execute: () => Promise<any>;
}
interface CancelAsyncButtonProps extends AsyncButtonProps
{
	cancelling: boolean;
	cancel?: () => void;
}

