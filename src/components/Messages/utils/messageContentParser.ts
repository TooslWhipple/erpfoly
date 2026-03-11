/**
 * Parses message content into segments so known variable tokens
 * (e.g. *fecha_limite*) can be highlighted separately from plain text.
 * Uses longest-match ordering so overlapping variable patterns are handled correctly.
 */

export type ContentSegment =
    | { type: "text"; value: string }
    | { type: "variable"; value: string };

const escapeRegex = (s: string): string =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Splits content into text and variable segments.
 * @param content - Raw message text
 * @param variableValues - Exact variable tokens to recognize (e.g. ["*fecha_limite*"])
 * @returns Ordered segments; variable segments are only those in variableValues
 */
export function parseMessageContent(
    content: string,
    variableValues: string[]
): ContentSegment[] {
    if (variableValues.length === 0) return [{ type: "text", value: content }];

    const ordered = [...variableValues].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(
        `(${ordered.map(escapeRegex).join("|")})`,
        "g"
    );
    const parts = content.split(pattern);
    const set = new Set(variableValues);

    return parts.map((part): ContentSegment =>
        set.has(part)
            ? { type: "variable", value: part }
            : { type: "text", value: part }
    );
}
