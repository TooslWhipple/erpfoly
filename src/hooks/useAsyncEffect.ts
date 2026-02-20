import { useEffect } from "react";

export function useAsyncEffect(
    asyncFn: (isCancelled: () => boolean) => Promise<void>,
    deps: React.DependencyList
): void {
    useEffect(() => {
        let cancelled = false;
        const isCancelled = () => cancelled;
        void asyncFn(isCancelled);
        return () => {
            cancelled = true;
        };
    }, deps);
}
