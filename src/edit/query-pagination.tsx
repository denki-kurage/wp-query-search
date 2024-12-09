import { useEntityBlockEditor } from "@wordpress/core-data";
import { useDispatch, useRegistry, useSelect } from "@wordpress/data";
import { createContext, useCallback, useEffect, useMemo } from "@wordpress/element";
import React from "react";
import { store } from "../store";
import { Button } from "@wordpress/components";


export default ({totalItems, totalPages, page, onPageChanged}) =>
{
	const msg = `全部で「${totalItems}」件ありました。1-${totalPages}ページまでを表示します。`;

	return (
		<div>
			{msg}
		</div>
	)

}

