import { useRef } from "react";
import { useSelection } from "@/context/SelectionContext";

export function useHighlightable(id: string, delay = 500) {
  const { selectedItems, toggleItem } = useSelection();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isSelected = selectedItems.includes(id);
  const selectionModeActive = selectedItems.length > 0;

  const startPress = () => {
    if (selectionModeActive) {
      toggleItem(id);
      return;
    }

    timerRef.current = setTimeout(() => {
      toggleItem(id);
    }, delay);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    isSelected,
    eventHandlers: {
      onPointerDown: startPress,
      onPointerUp: cancelPress,
      onPointerLeave: cancelPress,
      onPointerCancel: cancelPress,
    },
  };
}
