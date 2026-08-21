import { useCallback, useEffect, useRef, useState } from "react";
import { IconButton, Skeleton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductSuggestionCard } from "@/components/ProductSuggestionCard";
import type { ProductSuggestion } from "@/types/suggestions.types";
import { CarouselRoot, CarouselControls, CarouselTrack } from "./styles";

/** Matches ProductSuggestionCard min/max width + theme spacing(2) gap */
const CARD_WIDTH_PX = 272;
const CARD_GAP_PX = 16;
const SCROLL_STEP_PX = CARD_WIDTH_PX + CARD_GAP_PX;

export interface SuggestionsCarouselProps {
  suggestions: ProductSuggestion[];
  loading?: boolean;
  onAdd?: (product: ProductSuggestion) => void;
}

export function SuggestionsCarousel({
  suggestions,
  loading = false,
  onAdd,
}: SuggestionsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollPrev(scrollLeft > 2);
    setCanScrollNext(maxScroll > 2 && scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(track);

    track.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState, suggestions, loading]);

  const scrollByStep = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: "smooth" });
  };

  const showControls = canScrollPrev || canScrollNext;

  return (
    <CarouselRoot>
      {showControls && (
        <CarouselControls>
          <IconButton
            size="small"
            onClick={() => scrollByStep(-1)}
            disabled={!canScrollPrev}
            aria-label="Sugerencia anterior"
          >
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => scrollByStep(1)}
            disabled={!canScrollNext}
            aria-label="Siguiente sugerencia"
          >
            <ChevronRight size={20} />
          </IconButton>
        </CarouselControls>
      )}
      <CarouselTrack ref={trackRef}>
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                style={{
                  borderRadius: "12px",
                  flex: `0 0 ${CARD_WIDTH_PX}px`,
                  minWidth: `${CARD_WIDTH_PX}px`,
                  maxWidth: `${CARD_WIDTH_PX}px`,
                  height: "304px",
                }}
              />
            ))
          : suggestions.map((suggestion) => (
              <ProductSuggestionCard
                key={suggestion.id}
                product={suggestion}
                onAdd={onAdd}
              />
            ))}
      </CarouselTrack>
    </CarouselRoot>
  );
}
