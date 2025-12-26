import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { DateRange } from "react-day-picker"
import { Portal } from "@radix-ui/react-portal"



interface DateRangePickerProps {
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  setPresetRange: React.Dispatch<React.SetStateAction<"all" | "today" | "7" | "30">>
}

export function DateRangePicker({ dateRange, setDateRange, setPresetRange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  


  return (
      <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-left font-normal w-full sm:w-auto pointer-events-auto overflow-visible"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from && dateRange?.to ? (
            <>
              {format(dateRange.from, "MMM d, yyyy")} —{" "} {format(dateRange.to, "MMM d, yyyy")}
            </>
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 overflow-visible" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            setDateRange(range ?? {from: undefined, to: undefined}) 
            setPresetRange("all")
          }}
          numberOfMonths={2}
          initialFocus
          />
      </PopoverContent>
    </Popover>
  )
}
