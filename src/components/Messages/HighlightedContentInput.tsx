import { forwardRef, useRef, useCallback, useMemo, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import type { InputBaseComponentProps } from "@mui/material/InputBase";
import { parseMessageContent } from "./utils/messageContentParser";
import { useMessageVariables } from "./MessageVariablesContext";
import { HighlightOverlay, VariableHighlight } from "@/styles/catalogos/mensajes.styles";

/** MUI InputBase uses this line-height; mirror must match for alignment. */
const INPUT_LINE_HEIGHT = 1.4375;

/**
 * Custom input component for the message content textarea. Renders a mirror layer
 * behind the textarea that shows the same text with variable tokens highlighted.
 * Mirror and textarea share the same box (inset 0) and identical typography so selection aligns.
 */
const HighlightedContentInput = forwardRef<HTMLTextAreaElement, InputBaseComponentProps>(
    function HighlightedContentInput(props, ref) {
        const theme = useTheme();
        const variableValues = useMessageVariables();
        const mirrorRef = useRef<HTMLDivElement | null>(null);
        const textareaRef = useRef<HTMLTextAreaElement | null>(null);

        const setRefs = useCallback(
            (el: HTMLTextAreaElement | null) => {
                textareaRef.current = el;
                if (typeof ref === "function") ref(el);
                else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
            },
            [ref]
        );

        const syncScroll = useCallback(() => {
            const ta = textareaRef.current;
            const mirror = mirrorRef.current;
            if (ta && mirror) {
                mirror.scrollTop = ta.scrollTop;
                mirror.scrollLeft = ta.scrollLeft;
            }
        }, []);

        const value = typeof props.value === "string" ? props.value : "";
        const segments = useMemo(
            () => parseMessageContent(value, variableValues),
            [value, variableValues]
        );

        useEffect(() => {
            syncScroll();
        }, [value, syncScroll]);

        const { className, style, ...rest } = props;

        const showHighlight = value.length > 0;

        const sharedInputStyles = {
            padding: 0,
            boxSizing: "border-box" as const,
            lineHeight: INPUT_LINE_HEIGHT,
            fontFamily: "inherit",
            fontSize: "inherit",
            letterSpacing: "inherit",
        };

        return (
            <Box
                component="span"
                className={className}
                sx={{
                    position: "relative",
                    display: "block",
                    minHeight: 120,
                    boxSizing: "border-box",
                    "& textarea": {
                        ...sharedInputStyles,
                        ...(showHighlight && {
                            color: "transparent",
                            backgroundColor: "transparent",
                        }),
                        caretColor: theme.palette.primary.main,
                    },
                }}
            >
                <HighlightOverlay
                    ref={mirrorRef}
                    sx={{
                        ...sharedInputStyles,
                        minHeight: 120,
                        overflow: "auto",
                        scrollbarGutter: "stable",
                    }}
                >
                    {segments.map((seg, i) =>
                        seg.type === "variable" ? (
                            <VariableHighlight key={`v-${i}-${seg.value}`}>
                                {seg.value}
                            </VariableHighlight>
                        ) : (
                            <span key={`t-${i}`}>{seg.value}</span>
                        )
                    )}
                </HighlightOverlay>
                <textarea
                    {...rest}
                    ref={setRefs}
                    onScroll={syncScroll}
                    value={value}
                    rows={props.rows ?? 6}
                    style={{
                        ...style,
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        resize: "none",
                        margin: 0,
                        border: "none",
                        outline: "none",
                        overflow: "auto",
                        scrollbarGutter: "stable",
                        ...sharedInputStyles,
                    }}
                />
            </Box>
        );
    }
);

export default HighlightedContentInput;
