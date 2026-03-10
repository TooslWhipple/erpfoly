import { createContext, useContext } from "react";

const MessageVariablesContext = createContext<string[]>([]);

export const MessageVariablesProvider = MessageVariablesContext.Provider;

export function useMessageVariables(): string[] {
    return useContext(MessageVariablesContext);
}
