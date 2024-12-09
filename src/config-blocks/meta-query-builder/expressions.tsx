import { useState } from "@wordpress/element";
import { useInputFormContext } from "../../base-components/input-forms";
import React from "react";


type Operators = '=' | '>=' | '>' | '<=' | '<';

interface IExpression
{
    parameter: string;
    meta: string;
    operator: Operators;
}

interface IExpressionGroup
{
    relation: 'AND' | 'OR';
    expressions: Array<IExpression | IExpressionGroup>;
}

const relations = ['AND', 'OR'].map(r => ({value: r, label: r}))

const ExpressionGroupForm = ({relation, expressions}: IExpressionGroup) =>
{
    const { Select } = useInputFormContext();

    return (
        <div>
            <Select name="relation" options={relations} />

            {
                // @ts-ignore
                expressions.map(expression => expression?.relation ? <ExpressionGroupForm {...expression} /> : <ExpressionForm {...expression} />)
            }
        </div>
    )
}

const ExpressionForm = ({}) =>
{


    return (
        <div>

        </div>
    )
}




