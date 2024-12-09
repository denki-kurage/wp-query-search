import { ButtonGroup } from "@wordpress/components"
import React from "react"
import { DeleteEntityForm, EditEntityForm } from "./edit-entity-buttons"
import { ModalOpenButton } from "../base-components/async-dialog-components/buttons-extensions"
import { __ } from "@wordpress/i18n"



export const ListViewCommands = ({kind, name, id}) =>
{
	return (
		<ButtonGroup>
			<ModalOpenButton label={__('Edit', 'query-search')}>
				<EditEntityForm kind={kind} name={name} id={id} />
			</ModalOpenButton>
			<ModalOpenButton label={__('Delete', 'query-search')}>
				<DeleteEntityForm kind={kind} name={name} id={id} />
			</ModalOpenButton>
		</ButtonGroup>
	)
}
