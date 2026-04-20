"use client";

import { useState } from "react";
import Sidenav from "../components/Sidenav";
import Loginnav from "../components/Loginnav";
import Upload from "../components/Upload";
import Create from "../components/Create";
import { FileItem } from "@/types/File";
import useCurrentUser from "@/hooks/useCurrentUser";
import SortFilters, { FilterState } from "../components/SortFilter";

const Shared = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    type: "All",
    modified: "All",
    source: "All",
  });
  const { user } = useCurrentUser();

  const handleCreateFolder = () => {
    console.log("Create folder clicked");
  };

  return (
    <Sidenav>
      <Loginnav searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredItems={0} />
      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex-between gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">Shared</h1>

          <div className="flex space-x-2 gap-y-2">
            {user?.role === "admin" && <Upload />}
            <Create onCreateFolderClick={handleCreateFolder} />
          </div>
        </div>

        <SortFilters
          filters={filters}
          setFilters={setFilters}
        />

        <div className="flex flex-col items-center justify-center flex-1 min-h-0 mt-6">
          <p className="text-gray-500 dark:text-gray-400">No shared files yet</p>
        </div>
      </div>
    </Sidenav>
  );
};

export default Shared;

