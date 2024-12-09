import edit from './edit';
import metadata from './block.json';
import { registerBlockType } from '@wordpress/blocks';
import React from 'react';

registerBlockType(
    metadata.name,
    {
        ...metadata,
        icon: "smiley",
        edit,
        save: () => <p>w</p>
    }
)

