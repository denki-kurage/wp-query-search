// import './config-blocks/meta-query-builder';

import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit/edit';
import save from './save';

import { store } from './store';
import { dispatch } from '@wordpress/data';
import blockNames from './blocks/block-names';
import './blocks';
import './base-components';
import './filters';
import metadata from './block.json';


dispatch(store).setResultViewName('query-search/result-view');
blockNames.map(bn => dispatch(store).addQueryFormName(bn));

//@ts-ignore
registerBlockType( metadata.name, {
	edit: Edit,
	save
} );


/*

*/

