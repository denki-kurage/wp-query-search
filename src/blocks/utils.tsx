
import { __ } from "@wordpress/i18n";
import { ArraySchemaType, defaultSchemaResolver, EnumSchemaType, ISchemaResolver, SchemaComponentBuilder } from "../base-components/schema-resolver";
import { createBlock } from "@wordpress/blocks";

type IdGenerator = () => string;


export const createBlockBySchema = (pid: string, field: string, args: any, genId: IdGenerator, schemaResolver?: ISchemaResolver) =>
{
	const builder = new SchemaComponentBuilder<any>(
		defaultSchemaResolver,
		(field, schemaType, level, childrenComponent) =>
		{
			// @ts-ignore
			const description = schemaType?.getDescription() ?? '';
			const readonly = schemaType.isReadonly();
			const required = schemaType.isRequired();
			
			if(readonly)
			{
				return createBlock('core/paragraph', { content: 'read only' });
				// throw new Error(__('Could not determine block type', 'query-search'));
			}

			console.log(schemaType.getArgs())

			const attrs = {
				pid,
				uid: genId(),
				field,
				level,
				description,
				required
			}

			const createComponent = () =>
			{
				const s = schemaType.getSchemaTypeName()
				switch(s ?? '')
				{
					case 'string':
						return createBlock('query-search/string-query-form', attrs);
					case 'integer':
						return createBlock('query-search/number-query-form', attrs);
					case 'boolean':
						return createBlock('query-search/boolean-query-form', attrs);
					case 'date-time':
						return createBlock('query-search/datetime-query-form', attrs);
					case 'enum':
						const enumList = (schemaType as EnumSchemaType).getEnum();
						return createBlock('query-search/enum-query-form', { ...attrs, enumList })
					case 'array':
						const arrSchema = (schemaType as ArraySchemaType);
						const dataType = arrSchema.getDataType();
						const arrayList = arrSchema.getEnum();
			
						if(arrayList)
						{
							return createBlock('query-search/options-query-form', { ...attrs, dataType, enumList: arrayList });
						}
						else
						{
							return createBlock('query-search/array-query-form', { ...attrs, dataType });
						}
			
					case 'hash':
						return createBlock('query-search/hash-query-form', attrs);
					case 'multi':
						return createBlock('query-search/multi-query-form', { ...attrs, mode: 'multi' }, childrenComponent);
					case 'object':
						return createBlock('query-search/object-query-form', { ...attrs, mode: 'object' }, childrenComponent);
				}
				
				return createBlock('core/paragraph', { content: 'query form is null' })
			}

			return createComponent();
		}
	);

	return builder.build(field, args)
}


