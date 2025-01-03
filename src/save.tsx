
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import React from 'react';



export default function save() {
	const blockProps = useBlockProps.save();
	const innerBlockProps = useInnerBlocksProps.save(blockProps);
	return (
			<div {...innerBlockProps} />
	);
}

