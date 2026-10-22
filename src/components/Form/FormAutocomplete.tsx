import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type UIEvent,
} from "react";
import {
  alpha,
  Autocomplete,
  autocompleteClasses,
  type AutocompleteRenderInputParams,
  styled,
  Typography,
} from "@mui/material";
import {
  FieldLabel,
  FieldWrapper,
  StyledTextField,
} from "./FormTextField.styles";
import type { SelectOption } from "./FormSelect";

const VIRTUAL_ITEM_HEIGHT = 36;
const VIRTUAL_MAX_VISIBLE = 8;
const VIRTUAL_OVERSCAN = 4;

export interface FormAutocompleteProps {
  label?: string;
  options: SelectOption[];
  value?: string | number | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  noOptionsText?: string;
  /** Renders only the visible window of options (for large catalogs). */
  virtualized?: boolean;
}

type ListboxOptionElement = ReactElement<HTMLAttributes<HTMLLIElement>>;

function getOptionClassName(element: ListboxOptionElement): string {
  return String(element.props.className ?? "");
}

const OPTION_INSET_X = 8;

const VirtualizedListboxRoot = styled("ul")(({ theme }) => ({
  listStyle: "none",
  [`& .${autocompleteClasses.option}`]: {
    cursor: "pointer",
    borderRadius: 6,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    [`&.${autocompleteClasses.focused}`]: {
      backgroundColor: theme.palette.action.hover,
    },
    '&[aria-selected="true"]': {
      backgroundColor: alpha(
        theme.palette.primary.main,
        theme.palette.action.selectedOpacity,
      ),
      [`&.${autocompleteClasses.focused}, &:hover`]: {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
      },
    },
  },
}));

const VirtualizedListbox = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLElement>
>(function VirtualizedListbox(props, ref) {
  const { children, style, onScroll, ...other } = props;
  const items = useMemo(
    () =>
      Children.toArray(children).filter((child): child is ListboxOptionElement =>
        isValidElement(child),
      ),
    [children],
  );
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef<HTMLUListElement | null>(null);

  const highlightedIndex = useMemo(
    () =>
      items.findIndex((item) => getOptionClassName(item).includes("Mui-focused")),
    [items],
  );

  useEffect(() => {
    setScrollTop(0);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [items.length]);

  useEffect(() => {
    if (highlightedIndex < 0) return;
    const list = listRef.current;
    if (!list) return;

    const itemTop = highlightedIndex * VIRTUAL_ITEM_HEIGHT;
    const itemBottom = itemTop + VIRTUAL_ITEM_HEIGHT;
    const viewTop = list.scrollTop;
    const viewBottom = viewTop + list.clientHeight;

    if (itemTop < viewTop) {
      list.scrollTop = itemTop;
      setScrollTop(itemTop);
    } else if (itemBottom > viewBottom) {
      const next = itemBottom - list.clientHeight;
      list.scrollTop = next;
      setScrollTop(next);
    }
  }, [highlightedIndex]);

  const setRefs = (node: HTMLUListElement | null) => {
    listRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    onScroll?.(event);
  };

  const maxHeight =
    Math.min(Math.max(items.length, 1), VIRTUAL_MAX_VISIBLE) *
    VIRTUAL_ITEM_HEIGHT;
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / VIRTUAL_ITEM_HEIGHT) - VIRTUAL_OVERSCAN,
  );
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + maxHeight) / VIRTUAL_ITEM_HEIGHT) + VIRTUAL_OVERSCAN,
  );

  return (
    <VirtualizedListboxRoot
      {...other}
      ref={setRefs}
      onScroll={handleScroll}
      style={{
        ...style,
        height: maxHeight,
        maxHeight,
        overflow: "auto",
        position: "relative",
        padding: 0,
        margin: 0,
      }}
    >
      <li
        role="presentation"
        aria-hidden
        style={{
          display: "block",
          height: items.length * VIRTUAL_ITEM_HEIGHT,
          width: "100%",
          padding: 0,
          margin: 0,
          listStyle: "none",
          pointerEvents: "none",
        }}
      />
      {items.slice(startIndex, endIndex).map((item, offset) => {
        const index = startIndex + offset;
        const itemStyle = (item.props.style ?? {}) as CSSProperties;
        return cloneElement(item, {
          style: {
            ...itemStyle,
            position: "absolute",
            top: index * VIRTUAL_ITEM_HEIGHT,
            left: OPTION_INSET_X,
            width: `calc(100% - ${OPTION_INSET_X * 2}px)`,
            height: VIRTUAL_ITEM_HEIGHT,
            boxSizing: "border-box",
            margin: 0,
            padding: "0 12px",
            cursor: "pointer",
            zIndex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          },
        });
      })}
    </VirtualizedListboxRoot>
  );
});

export const FormAutocomplete = forwardRef<HTMLDivElement, FormAutocompleteProps>(
  (
    {
      label,
      options,
      value = "",
      onChange,
      onBlur,
      placeholder = "Seleccione",
      required,
      error,
      helperText,
      disabled,
      noOptionsText = "Sin resultados",
      virtualized = false,
    },
    ref,
  ) => {
    const hasError = Boolean(error);

    const selectedOption = useMemo(() => {
      if (value === "" || value == null) return null;
      return options.find((option) => String(option.value) === String(value)) ?? null;
    }, [options, value]);

    return (
      <FieldWrapper ref={ref}>
        {label && (
          <FieldLabel sx={{ display: "flex", alignItems: "center" }}>
            {label}
            {required && (
              <Typography component="span" sx={{ color: "error.main", ml: 0.5 }}>
                *
              </Typography>
            )}
          </FieldLabel>
        )}
        <Autocomplete<SelectOption, false, false, false>
          fullWidth
          size="small"
          disabled={disabled}
          options={options}
          value={selectedOption}
          onChange={(_, option) => {
            onChange(option ? String(option.value) : "");
          }}
          onBlur={onBlur}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, current) =>
            String(option.value) === String(current.value)
          }
          noOptionsText={noOptionsText}
          slots={virtualized ? { listbox: VirtualizedListbox } : undefined}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <StyledTextField
              {...params}
              placeholder={placeholder}
              error={hasError}
              helperText={helperText}
            />
          )}
        />
      </FieldWrapper>
    );
  },
);

FormAutocomplete.displayName = "FormAutocomplete";
