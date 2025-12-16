import { createContext, useContext, useState } from "react";

interface SelectionContextValue {
  selectedItems: string[];
  toggleItem: (id: string) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedItems([]);

  return (
    <SelectionContext.Provider
      value={{ selectedItems, toggleItem, clearSelection }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used inside SelectionProvider");
  }
  return context;
}