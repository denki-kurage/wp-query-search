import { combineReducers } from "@wordpress/data";


export interface IBlockDefines2
{
	resultViewName: string;
	queryFormNames: string[];
}

const defaultState =
{
	resultViewName: '',
	queryFormNames: [] as string[],
	enabledExtension: false
}

export type IBlockDefines = typeof defaultState
const blockDefines = (state: IBlockDefines = defaultState, action) =>
{
	switch(action.type)
	{
		case "SET_RESULT_VIEW_NAME":
			return ({ ...state, resultViewName: action.name })
		case "ADD_QUERY_FORM_NAME":
			const name = action.name;
			const forms = state.queryFormNames;
			if(!forms.includes(name))
			{
				return ({ ...state, queryFormNames: [...forms, name]});
			}
		case "SET_EXTENSION_MODE":
			return ({ ...state, enabledExtension: action.enabled })
	}

	return state;
}


interface ISchemas
{
	options: {[key: string]: any}
}
const schemas = (state: ISchemas = { options: [] }, action) =>
{
	switch(action.type)
	{
		case 'SET_ENDPOINT_OPTION':
			const { options } = state;
			const { kind, name, option } = action;
			options[[kind, name].join(':')] = option;
			return ({...state, options})
	}

	return state;
}




interface IParameterSchema
{
	dataType: "integer" | "string"
	required: boolean;
}

interface IQueryItem
{
	postType: string;
	queryParameter: string;
	parameterSchema: IParameterSchema;
	metaExpressions: any;
}
interface IQueryBuilder
{
	items: IQueryItem[];
}

const queries = (state: IQueryBuilder = { items: [] }, action) =>
{
	switch(action.type)
	{
		case 'ADD_QUERY_ITEM':
			return { ...state, items: [...state.items, action.item]};
	}

	return state;
}

const reducer = combineReducers({ blockDefines, schemas, queries });
export type StateType = ReturnType<typeof reducer>;
export default reducer;



