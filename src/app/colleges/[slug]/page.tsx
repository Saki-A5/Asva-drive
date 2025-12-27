"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { COLLEGE_META } from "@/lib/college";

type FileNode = {
  _id: string;
  filename: string;
  isFolder: boolean;
  children: FileNode[];
};

function FileTree({ nodes }: { nodes: FileNode[] }) {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul className="ml-4">
      {nodes.map((node) => (
        <li key={node._id}>
          <span>{node.isFolder ? "📁" : "📄"} {node.filename}</span>
          {node.children && node.children.length > 0 && (
            <FileTree nodes={node.children} />
          )}
        </li>
      ))}
    </ul>
  );
}

const CollegeFiles = () => {
  const { slug } = useParams();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Find the collegeId from the slug
  const collegeId = Object.entries(COLLEGE_META).find(
    ([, meta]) => meta.slug === slug
  )?.[0];

  useEffect(() => {
  if (!collegeId) return;

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await axios.get<{ tree: FileNode[] }>(`/api/colleges/${collegeId}/tree`);
      setTree(res.data.tree);
    } catch (err) {
      console.error("Error fetching tree:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTree();
}, [collegeId]);


  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        Files for {collegeId && COLLEGE_META[collegeId as keyof typeof COLLEGE_META]?.label || slug}
      </h1>
      {loading ? <div>Loading...</div> : <FileTree nodes={tree} />}
    </div>
  );
}

export default CollegeFiles