import React from "react"
import { InnerBlocks } from "@wordpress/block-editor";
import InnerQueryFormHosts from "../inner-query-form-hosts";
import { useQueryFormBlocksContext } from "../blocks-context";


export default (props) =>
{
	const { clientId } = props;
	const { useBlockChildren } = useQueryFormBlocksContext() ?? {};
	const blocks = useBlockChildren?.(clientId);

	return (
		!!useBlockChildren ? <InnerQueryFormHosts blocks={blocks} /> : <InnerBlocks />
	)
};
