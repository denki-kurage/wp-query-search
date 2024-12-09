import { createHigherOrderComponent } from "@wordpress/compose";
import { createContext, useContext } from "@wordpress/element";
import { useAllEndpointArgs } from "./hooks";
import React from "react";

type Type = ReturnType<typeof useAllEndpointArgs>;
const EndpointArgsContext = createContext<Type>(undefined as any);
export const { Provider: EndpointArgsContextProvider } = EndpointArgsContext;
export const useEndpointArgsContext = () => useContext(EndpointArgsContext)
