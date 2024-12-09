import React from "react"
import { useStatePropertiesContextValue } from "../../hooks/use-properties-context";
import { PropertyContextProvider } from "../../base-components/input-forms-property-context";
import { createInputFormComponents, InputComponentsContextProvider, useInputFormContext } from "../../base-components/input-forms";
import { QueryParameter } from "./schema-editors";
import { useBlockProps } from "@wordpress/block-editor";
import { QueryFormBlocksContextProvider, QueryFormComposeProvider, queryFormInspectorBlocksContext } from "../../blocks/blocks-context";
import { __experimentalGrid as Grid } from "@wordpress/components";
import { withAddPostForm, withEditPostForm } from "../../base-components/async-dialog-components/with-entity-components";
import { ModalOpenButton } from "../../base-components/async-dialog-components/buttons-extensions";
import { objectEditorCompose } from "../../blocks/hoc";




const components = createInputFormComponents();

export default () =>
{
    const pv = useStatePropertiesContextValue({});
    const props = useBlockProps();

    return (
        <div {...props}>
            <InputComponentsContextProvider value={components}>
                <PropertyContextProvider value={pv}>
                    <QueryFormBlocksContextProvider value={queryFormInspectorBlocksContext}>
                        <QueryFormComposeProvider value={objectEditorCompose}>
                            <MainForm postType="post" />
                        </QueryFormComposeProvider>
                    </QueryFormBlocksContextProvider>
                </PropertyContextProvider>
            </InputComponentsContextProvider>
        </div>
    )
}

const MainForm = ({ postType }) =>
{
    const metas = ['minPrice', 'maxPrice', 'www'];
    const { Text } = useInputFormContext();


    return (
        <div>
            <h1>{ postType } のアイテム一覧</h1>
            <AddButton />

            { metas.map(meta => <QueryEditor key={meta} meta={meta} />) }
        </div>
    )
}

const QueryEditor = ({meta}) =>
{
    return (
        <div>
            <div>meta: {meta}, date: , expression: </div>

            <EditButton />
        </div>
    )
}

const ExpressionEditor = () =>
{

    return <p>Expression</p>
}



const AddDialogContent = () =>
{
    return (
        <div>
            <h1>ADD FORM</h1>
        </div>
    )
}

const EditorDialogContent = () =>
{

    return (
        <Grid columns={2} >
            <div style={{maxHeight: 300, overflow: 'scroll'}}>
                <QueryParameter />
            </div>
            <div>
                <ExpressionEditor />
            </div>
        </Grid>
    )
}


const AddForm = withAddPostForm(AddDialogContent);
const EditForm = withEditPostForm(EditorDialogContent);

const AddButton = () =>
{
    return (
        <ModalOpenButton label="追加">
            <AddForm kind="postType" name="post" />
        </ModalOpenButton>
    )
}
const EditButton = () =>
{
    return (
        <ModalOpenButton label="編集">
            <EditForm kind="postType" name="post" id={0} />
        </ModalOpenButton>
    )
}
