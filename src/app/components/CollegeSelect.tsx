"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type College = {
  id: string;
  name: string;
};

const colleges: College[] = [
  { id: "science", name: "College of Sciences`" },
  { id: "engineering", name: "College of Engineering" },
  { id: "mhs", name: "College of Medical Health Sciences" },
  { id: "law", name: "College of Law" },
  { id: "sms", name: "College of Social & Management Sciences" },
];

interface CollegeSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function CollegeSelect({ value, onChange }: CollegeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCollege = colleges.find(
    (college) => college.id === value
  );

  return (
    <div className="flex flex-col gap-2">

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="justify-between border-gray-300 text-gray-600 placeholder:text-gray-400 focus:ring-0 font-normal"
          >
            {selectedCollege
              ? selectedCollege.name
              : "Search or select your college"}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Search college..." />
            <CommandEmpty>No college found.</CommandEmpty>

            <CommandGroup>
              {colleges.map((college) => (
                <CommandItem
                  key={college.id}
                  value={college.name}
                  onSelect={() => {
                    onChange(college.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === college.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {college.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

