import type { z } from "zod";

/**
 * Builds a TanStack Form validator from a Zod schema.
 * Used internally by useFormWithZod.
 */
export function zodFormValidator<T extends z.ZodTypeAny>(schema: T) {
    return (
        props: { value: z.input<T> },
    ): { form?: never; fields: Partial<Record<string, string[]>> } | undefined => {
        const result = schema.safeParse(props.value);
        if (result.success) return undefined;

        const fields: Partial<Record<string, string[]>> = {};
        for (const issue of result.error.issues) {
            const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
            if (!fields[key]) fields[key] = [];
            fields[key].push(issue.message);
        }
        return { fields };
    };
}
