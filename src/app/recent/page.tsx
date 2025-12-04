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
      <div>
        <div className="flex-between">
          <h1 className="px-6 font-bold text-xl">Recent</h1>
          <div className="flex space-x-2">
            <Upload />
            <Create />
          </div>
        </div>
        <SortFilters />
        <div className="px-6 space-y-8">
          <div>
            <FileTable />
          </div>
        </div>
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
