import { useState } from "react";
import {
  FileTextIcon,
  ClockIcon,
  Trash2,
  SearchIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

type doc = {
  _id: string;
  docId: string;
  title: string;
  createdAt: string;
};

interface DocumentsListProps {
  docs: doc[];
  fetchDocs : ()=>void
}
export const DocumentsList = ({ docs ,fetchDocs}: DocumentsListProps) => {
  const backend_base_url = import.meta.env.VITE_BACKEND_URL;
  const handleDelete = async (docId: string) => {
    try {
      await axios.delete(`${backend_base_url}/api/home/md/${docId}`);
      fetchDocs()
    } catch (error) {
      console.log(error);
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [displayCount, setDisplayCount] = useState(6);
  const filteredDocs = docs
    .filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }

      return a.createdAt.includes("Now") ? -1 : 1;
    });
  const visibleDocs = filteredDocs.slice(0, displayCount);
  const hasMore = displayCount < filteredDocs.length;
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Documents</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSortBy("recent")}
              className={`text-sm ${
                sortBy === "recent"
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Recent
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setSortBy("name")}
              className={`text-sm ${
                sortBy === "name"
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              Name
            </button>
          </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      {visibleDocs.length === 0 ? (
        <div className="text-center py-8">
          <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No docs found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleDocs.map((doc) => (
              <div
                key={doc._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <Link to={`/md/${doc.docId}`}>
                    <div className="flex space-x-3">
                      <FileTextIcon className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-800 group-hover:text-blue-600">
                          {doc.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>Created {doc.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDelete(doc.docId)}
                    className="text-gray-400 hover:text-yellow-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setDisplayCount((prev) => prev + 6)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Load More
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
