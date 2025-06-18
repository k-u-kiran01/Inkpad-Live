import { useState } from "react";
import { PlusIcon, FilePlus, FileSearch2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export const DocumentActions = ({ setDocs, user }: any) => {
  type doc = {
    _id: string;
    docId: string;
    title: string;
    createdAt: string;
  };
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const backend_base_url = import.meta.env.VITE_BACKEND_URL;
  const handleCreateBoard = async () => {
    if (showCreateDoc) {
      setShowCreateDoc(!showCreateDoc);
      try {
        const response = await axios.post(
          `${backend_base_url}/api/home/md/${user.id}`,
          { doctitle: newDocTitle }
        );
        // console.log(response);
        const newDoc = response.data.data;

        setDocs((prevDocs: doc[]) => [
          ...prevDocs,
          {
            _id: newDoc._id?.toString(),
            docId: newDoc.docId,
            title: newDoc.title,
          },
        ]);
        setNewDocTitle("");
      } catch (error) {
        console.log(error);
        setShowCreateDoc(!showCreateDoc);
      }
    }else setShowCreateDoc(true)
  };

  const handleJoinDocument = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/md/${joinCode}`);
    setJoinCode("");
  };
  return (
    <div className="space-y-6">
      {/* Create Document Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Create Document
        </h2>
        <p className="text-gray-600 mb-4">Start a new document from scratch</p>
        {showCreateDoc && (
          <div>
            <label htmlFor="newDocTitle" className="sr-only">
              Document Title
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FilePlus className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="newDocTitle"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border-gray-300 rounded-lg"
                placeholder="Enter document Title"
                required
              />
            </div>
          </div>
        )}
        <button
          onClick={
            handleCreateBoard
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Document
        </button>
      </div>
      {/* Join Document Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Join Document</h2>
        <p className="text-gray-600 mb-4">
          Enter a code to collaborate on a shared document
        </p>
        <form onSubmit={handleJoinDocument}>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="joinCode" className="sr-only">
                Document Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileSearch2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border-gray-300 rounded-lg"
                  placeholder="Enter document code"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg"
            >
              Join Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
