"use client"
import Loginnav from "../components/Loginnav";
import Sidenav from "../components/Sidenav";
import { Star, Clock } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import Upload from "../components/Upload";
import Create from "../components/Create";
import Fileicon from "../components/Fileicon";

type File = {
  name: string;
  type: string;
  size: string;
  items: string;
}

const recentFiles: File[] = [
  {name: "Python", size: "3.2GB", items: "12 items", type:"folder"},
  {name: "AutoCAD Workbook", size: "320MB", items: "PDF", type:"pdf"},
  {name: "AutoCAD Workbook", size: "320MB", items: "PDF", type:"pdf"},
  {name: "AutoCAD Workbook", size: "320MB", items: "PDF", type:"pdf"},
]


const Dashboard = () => {
  // const [starredFiles, setStarredFiles] = useState<File[]>([]);
  // const [recentFiles, setRecentFiles] = useState<File[]>([]);

  // useEffect(() => {
  //   const fetchFiles = async () => {
  //     try {
  //       const res = await axios.get('/api/files');
  //       const files: File[] = res.data.files;

  //       setStarredFiles(files.filter((file) => file.starred));
  //       setRecentFiles(
  //         files
  //           .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
  //           .slice(0, 10)
  //       );
  //     } catch (error) {
  //       console.error('Error fetching files:', error);
  //     }  
  //   };

  //   fetchFiles()
  // }, [])

  return (
    <>
    <Sidenav>
      <Loginnav />
      <div>
        <h1 className="px-2 lg:px-6 pb-6 font-bold text-xl">Welcome to the hub</h1>
        <div className="flex space-x-2 px-2 lg:px-6 mb-6">
            <Upload />
            <Create />
          </div>
        <div className="pr-6 lg:px-6 space-y-8 mx-auto">
          {/* recent */}
          <section className="border p-4 rounded-xl border-border/100 bg-card">
            <h2 className="text-lg font-bold mb-3 px-2">
              Recent Files
            </h2>
            {recentFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentFiles.map((file, index) => (
                <div
                key={index}
                className="flex flex-col items-start p-4 border  rounded-xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition">
                  <div>
                    <Fileicon type={file.type}/>
                  </div>
                  <h3 className="font-semibold text-sm truncate w-full">{file.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{file.size}<span className="mx-1">.</span>{file.items}</p>
                </div>
                ))}
                </div>):(
                  <p className="text-sm text-muted-foreground">Recent files show here</p>
                )}
            </section>

          {/* starred
          <section>
            <h2 className="text-lg font-bold mb-3 p-2">
              Shared
            </h2>
            {starredFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {starredFiles.map((file) => (
                <div
                key={file.id}
                className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition"
                >
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.type}</p>
                </div> 
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Starred files show here</p>
            )}
          </section>  */}
        </div>
      </div>
    </Sidenav>
    </>
  );
}

export default Dashboard;
