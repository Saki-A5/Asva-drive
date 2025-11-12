"use client"
import Loginnav from "../components/Loginnav";
import Sidenav from "../components/Sidenav";
import { Star, Clock } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import Upload from "../components/Upload";
import Create from "../components/Create";

type File = {
  id: string;
  name: string;
  type: string;
  starred: boolean;
  lastModified: string;
}

const Dashboard = () => {
  const [starredFiles, setStarredFiles] = useState<File[]>([]);
  const [recentFiles, setRecentFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get('/api/files');
        const files: File[] = res.data.files;

        setStarredFiles(files.filter((file) => file.starred));
        setRecentFiles(
          files
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
            .slice(0, 10)
        );
      } catch (error) {
        console.error('Error fetching files:', error);
      }  
    };

    fetchFiles()
  }, [])

  return (
    <>
    <Sidenav>
      <Loginnav />
      <div>
        <h1 className="px-6 pb-6 font-bold text-xl">Welcome to the hub</h1>
        <div className="px-6 space-y-8">
          <div className="flex space-x-2">
            <Upload />
            <Create />
          </div>
          {/* recent */}
          <section>
            <h2 className="text-lg font-bold mb-3 px-2">
              Recent Files
            </h2>
            {recentFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentFiles.map((file) => (
                <div
                key={file.id}
                className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.type}</p>
                </div>
                ))}
                </div>):(
                  <p className="text-sm text-muted-foreground">Recent files show here</p>
                )}
            </section>

          {/* starred */}
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
          </section> 
        </div>
      </div>
    </Sidenav>
    </>
  );
}

export default Dashboard;
