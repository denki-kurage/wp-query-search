import { Button, Modal, ToolbarButton } from "@wordpress/components";
import React from "react";
import { useOpenCloseContext, withOpenCloseDefaultProvider } from "./open-close-context";


export const ModalOpenButton = withOpenCloseDefaultProvider(({ label="???", children }) =>
{
	const { open, close, isOpened } = useOpenCloseContext();
	
	return (
		<>
			<Button className="modal-open-button" label={label} variant="secondary" onClick={open} disabled={isOpened}>{label}</Button>
			{ isOpened && <Modal onRequestClose={close} title={label}>{children}</Modal> }
		</>
	)
});


export const ModalToolbarButton = withOpenCloseDefaultProvider(({ icon, label, children }) =>
{
	const { isOpened, close, open } = useOpenCloseContext();

	return (
		<>
			<ToolbarButton icon={icon} onClick={open} label={label} disabled={isOpened} />
			{ isOpened && <Modal onRequestClose={close} title={label}>{ children }</Modal> }
		</>
	)
});


