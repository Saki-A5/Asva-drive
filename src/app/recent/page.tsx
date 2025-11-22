"use client";
import Loginnav from "../components/Loginnav";
import Sidenav from "../components/Sidenav";
import FileTable from "../components/FileTable";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Create from "../components/Create";
import Upload from "../components/Upload";

const Recent = () => {
  return (
    <Sidenav>
      <Loginnav />
      <div className="px-6 ">
        <h1 className="font-bold text-xl mb-4">Recent</h1>

        {/* Row: left = sort controls, right = actions */}
        <div className="flex items-center justify-between mb-4">
          <SortFilters />
          <div className="flex items-center gap-2">
            <Upload />
            <Create />
          </div>
        </div>

        <FileTable />
      </div>
    </Sidenav>
  );
};

const SortFilters = () => {
  const sortType: string[] = ["Type", "Modified", "Source", "Shared"];

  return (
    <div className="px-2 my-6 flex gap-2">
      {sortType.map((type) => (
        <Button variant="outline" key={type} className="cursor-pointer">
          <span className="flex gap-2">
            <span className="pl-1">{type}</span>
            <span className="flex items-center">
              <ChevronDown className="h-6 w-6" />
            </span>
          </span>
        </Button>
      ))}
    </div>
  );
};

export default Recent;
