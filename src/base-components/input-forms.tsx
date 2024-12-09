import {
	TextControl,
	__experimentalNumberControl as NumberControl,
	CheckboxControl,
	SelectControl,
	Button,
	ButtonGroup,
	DateTimePicker,
} from "@wordpress/components";
import { useState, useMemo, createContext, useContext } from '@wordpress/element';

import React, { useEffect }  from "react";
import { usePropertyContext } from "./input-forms-property-context";
import { ModalOpenButton } from "./async-dialog-components/buttons-extensions";
import { __ } from "@wordpress/i18n";

type Components = ReturnType<typeof createInputFormComponents>;
const InputComponentsContext = createContext<Components>(null as any);
export const { Provider: InputComponentsContextProvider } = InputComponentsContext;
export const useInputFormContext = () => useContext(InputComponentsContext);




export const safeNaN = (value, x = 0) =>
{
	return Number.isNaN(value) ? x : value;
}

export const toInt = (value, x = 0) =>
{
	return safeNaN(parseInt(value), x);
}

export const toFloat = (value, x = 0.0) =>
{
	return safeNaN(parseFloat(value), x);
}

export interface IPropertiesSetterService
{
	properties: any;
	setProperty: (name: string, value: any) => void;
}

export interface ComponentProps<T>
{
	name: string;
	label?: string;
	onChanged?: (name: string, value: T) => void;
}

export interface SelectComponentProps<T> extends ComponentProps<T>
{
	options: ({value: string, label: string})[];
	message?: string;
}

export interface DateTimeComponentProps<T> extends ComponentProps<T>
{
	//isOpened: boolean;
}


export interface ListComponentProps<T> extends ComponentProps<T>
{
	viewTable?: boolean;
}

export interface ArrayListComponentProps<T> extends ListComponentProps<T>
{
	children?: any;
	buttons?: any;
}
export interface PropertyComponentProps<T> extends ComponentProps<T>
{
	dataType: string;
	dataTypeChanged: (dataType: string) => void;
}
export interface ObjectComponentProps<T> extends ComponentProps<T>
{
	arg: any;
}

export interface MultiDataTypeItem
{
	label: string;
	dataType: string;
	value: any;
}
export interface MultiComponentProps<T> extends ComponentProps<T>
{
	defines: Map<string, MultiDataTypeItem>;
}




const onChangeWrapper = (callbacks: ((name: string, value: any) => void)[]) => (name: string, value: any) =>
{
	for(const callback of callbacks)
	{
		callback?.(name, value);
	}
}
export const createInputFormComponents = () =>
{
	const components = {
		Text: ({name, label=name, onChanged}: ComponentProps<string>) =>
		{
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);
			const pv = properties?.[name] ?? '';
			return <TextControl __nextHasNoMarginBottom={true} label={label} value={pv} onChange={v => wrapper(name, v)} />
		},
		Number: ({name, label=name, onChanged}: ComponentProps<number>) =>
		{
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);
			const pv = '' + properties[name]
			const [value, setValue] = useState(pv);
			
			return (<>
				<div>{pv}</div>
				<TextControl __nextHasNoMarginBottom={true} label={label} value={value} onChange={v => { setValue(v); wrapper(name, toFloat(v)) }} />
			</>)
		},
		Boolean: ({name, label=name, onChanged}: ComponentProps<boolean>) =>
		{
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);
			const pv = properties[name] ?? false;
			return <CheckboxControl __nextHasNoMarginBottom={true} label={label} value={pv} checked={pv} onChange={v => wrapper(name, v)} />
		},
		DateTime: ({name, label=name, onChanged}: DateTimeComponentProps<string>) =>
		{
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);
			const pv = properties[name];
			return (
				<ModalOpenButton label={pv || __('Set the Date time', 'query-search')}>
					<DateTimePicker
						currentDate={pv}
						onChange={v => wrapper(name, v)}
						
						/>
				</ModalOpenButton>

			)
		},
		ArrayList: ({name, label=name, viewTable = false, onChanged, buttons = undefined, children = undefined}: ArrayListComponentProps<string|number>) =>
		{
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);
			const list = properties[name] ?? [];
			return <ModalArrayEditor label={label} list={list} buttons={buttons} viewTable={viewTable} onChange={v => wrapper(name, v)} children={children} />

		},
		Hash: ({name, label=name, viewTable = false, onChanged}: ListComponentProps<string>) =>
		{
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);
			const hash = properties[name] ?? {};
			return <ModalKeyValueEditor label={label} hash={hash} viewTable={viewTable} onChange={v => wrapper(name, v)} />
		},
		Select: ({ name, label=name, onChanged, options, message=__('Select from the following', 'query-search') }: SelectComponentProps<string>) =>
		{
			const newOptions = [{label: message, value: ''}, ...options];
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);

			return <SelectControl
						__nextHasNoMarginBottom={true}
						label={label}
						value={properties[name]}
						options={newOptions}
						onChange={v => wrapper(name, v)}
						/>
		},
		Options: ({name, label=name, options, onChanged}: SelectComponentProps<string[]>) =>
		{
			const { properties, setProperty } = usePropertyContext();
			const wrapper = onChangeWrapper([setProperty, onChanged]);
			const values = properties[name] ?? [];

			return <CheckBoxList
						values={values}
						options={options}
						onChanged={v => wrapper(name, v)} />
		}
	};


	return ({ ...components })
}

const saftyText = (str: any) =>
{
	if(!!str && typeof str === "object")
	{
		return JSON.stringify(str);
	}

	return str;
}

const ModalArrayEditor = ({ list, onChange, label, viewTable, buttons, children = undefined }) =>
{
	const behavior = useMemo(
		() => new ArrayBehavior([...list], list => onChange(list)),
		[list, onChange]
	);

	const { add, clear, edit } = behavior;
	
	const [ key, setKey ] = useState('');


	return (
		<div className="modal-key-value-editor-container">
			
			{ (viewTable && list.length > 0) && (
				<table className="table table-striped modal-key-value-editor">
					<thead>
						<tr>
							<th>{__('Value', 'query-search')}</th>
						</tr>
					</thead>
					<tbody>
						{ list.map((o, i) => <tr key={i}><td>{ saftyText(o) ?? ''}</td></tr> ) }
					</tbody>
				</table>
			)}

			<div className="buttons-flex-container">
				<ModalOpenButton label={label}>
					<table className="key-value-editor">
						<thead>
							<tr>
								<th className="key-value-editor-th-value">{__('Value', 'query-search')}</th>
								<th className="key-value-editor-th-command">{__('Commands', 'query-search')}</th>
							</tr>				
						</thead>

						<tbody>
							<tr>
								<td><TextControl __nextHasNoMarginBottom={true} name="key" value={key} onChange={setKey} /></td>
								<td>
									<ButtonGroup style={{width: '100%'}}>
										<Button variant="primary" onClick={() => add(key)} className="key-value-editor-add">{__('Add', 'query-search')}</Button>
									</ButtonGroup>
								</td>
							</tr>
							{
								list.map((key, index) => (
									<tr key={index}>
										<td><TextControl __nextHasNoMarginBottom={true} value={key} onChange={k => edit(index, k)} /></td>
										<td>
											<Actions behavior={behavior} index={index} />
										</td>
									</tr>
								))
							}				
						</tbody>
					</table>

					<Button variant="primary" onClick={clear}>{__('Clear selection', 'query-search')}</Button>


					{ children }
				</ModalOpenButton>
				{ buttons }
			</div>

		</div>
	)
}

const toHash = (list: [string, any][]) =>
{
	return list.reduce((pre, [key, value]) => ({ ...pre, [key]: value}), {});
}

const ModalKeyValueEditor = ({ hash, onChange, label, viewTable }) =>
{
	const behavior = useMemo(
		() => new KeyValueBehavior([...Object.entries(hash)], list => onChange(toHash(list))),
		[hash, onChange]
	);

	const items = behavior.toList();
	const { add, clear, edit } = behavior;

	const [ key, setKey ] = useState('');
	const [ value, setValue ] = useState('');


	return (
		<div className="modal-key-value-editor-container">

			<ModalOpenButton label={label}>
				<table className="key-value-editor">
					<thead>
						<tr>
							<th className="key-value-editor-th-value">{__('Value', 'query-search')}</th>
							<th className="key-value-editor-th-label">{__('Label', 'query-search')}</th>
							<th className="key-value-editor-th-command">{__('Commands', 'query-search')}</th>
						</tr>				
					</thead>

					<tbody>
						<tr>
							<td><TextControl __nextHasNoMarginBottom={true} name="key" value={key} onChange={setKey} /></td>
							<td><TextControl __nextHasNoMarginBottom={true} name="value" value={value} onChange={setValue} /></td>
							<td>
								<ButtonGroup style={{width: '100%'}}>
									<Button variant="primary" onClick={() => add([key, value])} className="key-value-editor-add">{__('Add', 'query-search')}</Button>
								</ButtonGroup>
							</td>
						</tr>
						{
							items.map(([k, v], index) => (
								<tr key={index}>
									<td>{k}</td>
									<td><TextControl __nextHasNoMarginBottom={true} value={v} onChange={v2 => edit(index, [k, v2])} /></td>
									<td>
										<Actions behavior={behavior} index={index} />
									</td>
								</tr>
							))
						}				
					</tbody>
				</table>

				<Button variant="primary" onClick={clear}>{__('Clear selection', 'query-search')}</Button>
			</ModalOpenButton>


			{ (viewTable) && (
				<table className="table table-striped modal-key-value-editor">
					<thead>
						<tr>
							<th>{__('Value', 'query-search')}</th>
							<th>{__('Label', 'query-search')}</th>
						</tr>
					</thead>
					<tbody>
						{ items.map(([k, v], i) => <tr key={i}><td>{saftyText(k)}</td><td>{saftyText(v)}</td></tr> )}
					</tbody>
				</table>
			)}

		</div>
	)
}


const Actions = ({behavior, index}: { behavior: ArrayBehavior<[string, any]>, index: number }) =>
{
	const { move, range, remove } = behavior;

	return (
		<ButtonGroup>
			<Button variant="primary" onClick={() => move(index, index - 1)} disabled={!range(index - 1)}>(↑){__('Up', 'query-search')}</Button>
			<Button variant="primary" onClick={() => move(index, index + 1)} disabled={!range(index + 1)}>{__('Down', 'query-search')}(↓)</Button>
			<Button variant="primary" onClick={() => remove(index)}>{__('Remove', 'query-search')}</Button>
		</ButtonGroup>
	)
}


class ArrayBehavior<TValue>
{
	private readonly list: TValue[];

	public toList = () =>
	{
		return [...this.list]
	}

	public constructor(defaultList: Array<TValue>, private readonly onChange: (items: TValue[]) => void)
	{
		this.list = [...defaultList];
	}

	public range = (index: number) =>
	{
		return index >= 0 && index < this.count();
	}

	public canAdd = (item: TValue) =>
	{
		return true;
	}

	public add = (item: TValue) =>
	{
		this.list.push(item);
		this.onChanged();
	}

	public move = (index: number, toIndex: number) =>
	{
		if(this.range(toIndex))
		{
			const po = this.list[index]
			const to = this.list[toIndex];
			this.list[index] = to;
			this.list[toIndex] = po;
			this.onChanged();
		}
	}

	public remove = (index: number) =>
	{
		if(this.range(index))
		{
			this.list.splice(index, 1);
			this.onChanged();
		}
	}

	public edit = (index: number, value: TValue) =>
	{
		if(this.range(index))
		{
			this.list[index] = value;
			this.onChanged();
		}
	}

	public count = () =>
	{
		return this.list.length;
	}

	public clear = () =>
	{
		this.list.splice(0);
		this.onChanged();
	}

	protected onChanged = () =>
	{
		this.onChange(this.toList());
	}
}

class KeyValueBehavior extends ArrayBehavior<[string, any]>
{
	override canAdd = (item: [string, any]) =>
	{
		return !this.toList().some(([key, value]) => key === item[0]);
	}
}


const CheckBoxList = ({ values, options, onChanged }) =>
{
	const [ lastCheck, setLastCheck ] = useState<[string, boolean]>(['', false]);

	useEffect(() => {
		const [val, flag] = lastCheck;
		const newValues = options.filter(({ value }) => value === val ? flag : values.includes(value)).map(o => o.value);
		onChanged(newValues);
	}, [options.map(o => o.value).join(','), lastCheck]);

	return (
		<div>
			{ options.map(o => <div key={o.value}><CheckboxControl __nextHasNoMarginBottom={true} name={o.value} label={o.label} checked={values.includes(o.value)} onChange={flag => setLastCheck([o.value, flag])} /></div>) }
		</div>
	)
}
