
export interface ISchemaResolver
{
	resolve(args: any): SchemaType;
}


const isArray = (v: any) => Array.isArray(v);
const isObject = (v: any) => !!v && typeof v === "object" && !isArray(v);
const isString = (v: any) => typeof v === "string";


export abstract class SchemaType
{
	private isNull: boolean = false;

	public isReadonly(): boolean
	{
		return this.args?.readonly ?? false;
	}

	public isRequired(): boolean
	{
		return this.args?.required ?? false;
	}

	public isNullable(): boolean
	{
		return this.isNull;
	}

    public getArgs(): any
    {
        return this.args;
    }

	public getSchemaTypeName()
	{
		return this.schemaTypeName;
	}

    public getDescription(): string
    {
        const { description, label, type } = this.args;
        return description ?? label ?? type ?? '';
    }

	// このargsが正当なものかをチェック
	public abstract check(): boolean;

	public constructor(
		private readonly schemaTypeName: string|string[],
		protected readonly args: any)
	{

		let dataType = args.type;

		if(Array.isArray(dataType))
		{
			if(dataType.includes('null'))
			{

				this.isNull = true;
				const types = new Set(dataType);
				types.delete('null');
				dataType = [...types.values()]
				if(dataType.length === 1)
				{
					dataType = dataType[0];
					args.type = dataType;
				}
			}
		}



	}
}

export abstract class EnumerableSchemaType extends SchemaType
{

}






export class NullSchemaType extends SchemaType
{
	public check(): boolean
	{
		return true;
	}
}

export class StringSchemaType extends SchemaType
{
	public check(): boolean
	{
		const { type, format, enum: enumerable } = this.args;
		return type === 'string' && !format && !enumerable;
	}
}

export class IntegerSchemaType extends SchemaType
{
	public check(): boolean
	{
		const { type, format } = this.args;
		return type === 'integer';
	}
}

export class BooleanSchemaType extends SchemaType
{
	public check(): boolean
	{
		const { type } = this.args;
		return type === 'boolean';
	}
}

export class DateTimeSchemaType extends SchemaType
{
	public getType(): string
	{
		return 'date-time';
	}

	public check(): boolean
	{
		const { type, format } = this.args;
		return type === 'string' && format === 'date-time';
	}
}

export class EnumSchemaType extends SchemaType
{
	public getType(): string
	{
		return 'enum';
	}

	public check(): boolean
	{
		const { type, enum: a } = this.args;
		return type === 'string' && (isArray(a) || isObject(a));
	}

	public getEnum(): Array<any>|Object
	{
		return this.args.enum;
	}
}


export class ArraySchemaType extends SchemaType
{
	public getDataType(): string
	{
		const { type, enum: a } = this.args?.items;
		
		if(type === 'string')
		{
			return 'string';
		}

		if(type === 'integer')
		{
			return 'integer';
		}

		return '';
	}

	public check(): boolean
	{
		const { type, items } = this.args;

		return type === 'array' && !!this.getDataType();
	}

	public getEnum(): any[]
	{
		return this.args?.items?.enum;
	}
}

/**
 * TODO: 仕様未定のため無効。
 */
export class HashSchemaType extends SchemaType
{
	private readonly st: ArraySchemaType;
	public constructor(type: string, args: any)
	{
		super(type, args);
		this.st = new ArraySchemaType(type, args);
	}

	public check(): boolean
	{
		const { type, items } = this.args;

		return false;

		// return this.st.check() && isObject(items?.enum); 
	}

	public getEnum(): any[]
	{
		return this.st.getEnum();
	}
}


export class ObjectSchemaType extends EnumerableSchemaType
{
	public getChildArgs(): {[key: string]: object}
	{
		const { properties } = this.args;
		return properties
	}

	public check(): boolean
	{
		const { type, properties } = this.args;
		return type === 'object';
	}
}

export class MultiSchemaType extends EnumerableSchemaType
{
	public getChildArgs(): any[]
	{
		const { oneOf, items, type: types } = this.args;
		
		if(isArray(oneOf))
		{
			return oneOf;
		}
		
		return types.map(type => ({ ...this.args, type }));
	}
	
	public check(): boolean
	{
		const { type } = this.args;
		if(Array.isArray(type))
		{
			return true;
		}
		return false;
	}
}





export class SchemaResolver implements ISchemaResolver
{
	public constructor(
		private readonly schemaTypeFactory: ReadonlyArray<(args: any) => SchemaType>
	)
	{

	}

	public resolve(args: any): SchemaType
	{
		const schemaType = this.schemaTypeFactory
			.map(factory => factory(args))
			.find(type => type.check());
		
		return schemaType ?? new NullSchemaType('null', args);
	}

}




export const defaultSchemaResolver = new SchemaResolver([
	(args) => new StringSchemaType('string', args),
	(args) => new IntegerSchemaType('integer', args),
	(args) => new BooleanSchemaType('boolean', args),
	(args) => new DateTimeSchemaType('date-time', args),
	(args) => new EnumSchemaType('enum', args),
	(args) => new HashSchemaType('hash', args),
	(args) => new ArraySchemaType('array', args),
	(args) => new ObjectSchemaType('object', args),
	(args) => new MultiSchemaType('multi', args)
])




interface DConverter<T>
{
	(field: string, schemaType: SchemaType, level: number, childrenComponents?: T[]): T;
}

export class SchemaComponentBuilder<T>
{
	public constructor(
		private readonly schemaResolver: SchemaResolver,
		private readonly converter: DConverter<T>
	)
	{

	}

	public build(field: string, args: any, level: number = 1): T
	{
		const schemaType = this.schemaResolver.resolve(args);
		
		if(schemaType instanceof EnumerableSchemaType)
		{
			const entries: [string, any][] =
				(schemaType instanceof MultiSchemaType) ? schemaType.getChildArgs().map(args => [field, args]) :
				(schemaType instanceof ObjectSchemaType) ? [...Object.entries(schemaType.getChildArgs())] :
				[];
			
			const children = entries.map(([childField, childArgs]) => this.build(childField, childArgs, level + 1));

			return this.converter(field, schemaType, level, children);
		}

		return this.converter(field, schemaType, level);
	}
}
