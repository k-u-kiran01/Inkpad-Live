
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import type { ChangeEvent, FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TbPencilCheck } from "react-icons/tb";
import { MdPersonRemoveAlt1 } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import { FaShareAlt, FaFilePdf, FaFileCode, FaBars } from "react-icons/fa";
import { userContext } from "../App";
import { useParams, useNavigate } from "react-router-dom";

type Board = { _id: string; title: string; docId: string };
type Collaborator = { _id: string; name: string };
type Viewer = { userId: string; name: string };
type DocType = {
  title: string;
  docId: string;
  creator: { id: string; name: string };
  collaborators: Collaborator[];
};

type EditDocumentProps = {
  socket: any;
};

const EditDocument: FC<EditDocumentProps> = ({ socket }) => {
  const navigate = useNavigate();
  const { docId } = useParams<{ docId: string }>();
  const user = useContext(userContext);
const backend_base_url = import.meta.env.VITE_BACKEND_URL;
  const [content, setContent] = useState<string>(
    "# Welcome to Inkpad Live\n\nStart collaborating!"
  );
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [doc, setDoc] = useState<DocType | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showMobileDocs, setShowMobileDocs] = useState(false); 

  // Fetch boards
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await axios.get(
          `${backend_base_url}/api/home/md/${user.id}`
        );
        setBoards(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDocs();
  }, [user.id]);

  // Fetch document content & metadata
  useEffect(() => {
    const fetchDocData = async () => {
      try {
        const response = await axios.get(
          `${backend_base_url}/api/docs/md/${docId}`
        );
        const docdetails = response.data.data;
        const collaborators = docdetails.collaborators?.map((c: any) => ({
          _id: c._id.toString(),
          name: c.name,
        }));
        setDoc({
          title: docdetails.title,
          docId: docId!,
          creator: {
            id: docdetails.creator._id.toString(),
            name: docdetails.creator.name,
          },
          collaborators: collaborators,
        });
        socket.connect();
        setContent(response.data.data.content);
      } catch (err) {
        console.error("Failed to fetch document:", err);
      }
    };
    if (docId) fetchDocData();
  }, [docId, socket]);

  useEffect(() => {
    if (!user || user.name === "guest" || !doc) {
      setCanEdit(false);
      return;
    }
    const isCollaborator = doc.collaborators.some(
      (collab) => collab._id === user.id
    );
    setCanEdit(isCollaborator || doc.creator.id === user.id);
    setIsOwner(doc.creator.id === user.id);
  }, [user, doc]);

  const fetchDocData = async () => {
    try {
      const response = await axios.get(
        `${backend_base_url}/api/docs/md/${docId}`
      );
      const docdetails = response.data.data;
      const collaborators = docdetails.collaborators?.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name,
      }));
      setDoc({
        title: docdetails.title,
        docId: docId!,
        creator: {
          id: docdetails.creator._id.toString(),
          name: docdetails.creator.name,
        },
        collaborators: collaborators,
      });
      socket.connect();
      setContent(response.data.data.content);
    } catch (err) {
      console.error("Failed to fetch document:", err);
    }
  };

  // Socket connection
  useEffect(() => {
    if (!user || !docId || !socket) return;
    socket.emit("join-doc", {
      userId: user.id,
      name: user.name,
      docId: docId,
    });
    const handleMarkdownUpdate = (data: string) => setContent(data);
    const handleChangeViewers = (viewers: Viewer[]) => setViewers(viewers);

    socket.on("update-viewers", handleChangeViewers);
    socket.on("receive-markdown", handleMarkdownUpdate);
    socket.on("update-collaborators", fetchDocData);
    return () => {
      socket.emit("leave-doc", { userId: user.id, docId: docId });
      socket.off("receive-markdown");
    };
  }, [docId, user, socket]);

  const handleNewUserEdit = async (userId: string) => {
    await axios.post(
      `${backend_base_url}/api/docs/md/${docId}/contributors`,
      {
        newEditorId: userId,
      }
    );
    socket.emit('add-collaborator', {
      docId: docId
    });
  };

  const handleRemoveEditPermission = async (userId: string) => {
    await axios.delete(
      `${backend_base_url}/api/docs/md/${docId}/contributors`,
      {
        data: {
          userId: userId,
        },
      }
    );
    socket.emit('remove-collaborator', {
      docId: docId
    });
  };

  const handleExport = async (format: "pdf" | "md") => {
    try {
      const response = await axios.get(
        `${backend_base_url}/api/docs/md/${docId}/export/${format}`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleDocChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    socket.emit(
      "markdown-change",
      { docId, content: e.target.value },
      (ack: { status: "ok" | "error" }) => {
        if (ack.status !== "ok") {
          alert("Failed to save changes");
        }
      }
    );
  };

  const handleShare = () => {
    const link = `${window.location.origin}/md/${docId}`;
    navigator.clipboard.writeText(link);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 1800);
  };

  // Get all users (viewers + collaborators) excluding guests and creator
  const getAllUsers = () => {
    const nonGuestViewers = viewers.filter((viewer) => viewer.name !== "guest");
    const collaboratorIds =
      doc?.collaborators.map((collab) => collab._id) || [];
    const creatorId = doc?.creator.id;

    // Combine viewers and collaborators, removing duplicates
    const allUsers = [
      ...nonGuestViewers.map((viewer) => ({
        id: viewer.userId,
        name: viewer.name,
        isCollaborator: collaboratorIds.includes(viewer.userId),
        isCreator: viewer.userId === creatorId,
      })),
      ...(doc?.collaborators
        .filter(
          (collab) =>
            !nonGuestViewers.some((viewer) => viewer.userId === collab._id)
        )
        .map((collab) => ({
          id: collab._id,
          name: collab.name,
          isCollaborator: true,
          isCreator: collab._id === creatorId,
        })) || []),
    ];

    return allUsers;
  };

  // Color palette
  const exportBtn = "bg-[#90e0ef] hover:bg-[#7dcfb6]";
  const shareBtn = "bg-[#ffd500] hover:bg-[#ffca3a]";
  const sidebar = "bg-[#f2f2f2] border-r border-gray-300";
  const boardBtn = "bg-[#caf0f8] hover:bg-[#e0fbfc] text-[#3d5a80]";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#e0e0e0] to-[#f8f8f8] text-gray-800">
      {/* Mobile Docs Button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-[#3d5a80] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        onClick={() => setShowMobileDocs(true)}
        aria-label="Open documents menu"
      >
        <FaBars />
      </button>

      {/* Mobile Docs Modal */}
      {showMobileDocs && (
        <Modal onClose={() => setShowMobileDocs(false)} title="Inkpad Live">
          <div className="flex flex-col gap-3">
            {boards.map((board, index) => (
              <button
                className="p-2 rounded bg-[#caf0f8] hover:bg-[#e0fbfc] text-[#3d5a80] font-semibold transition-colors"
                key={index}
                onClick={() => {
                  navigate(`/md/${board.docId}`);
                  setShowMobileDocs(false);
                }}
              >
                {board.title}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Left Sidebar - Boards (Desktop) */}
      <div className={`hidden md:flex w-[16%] ${sidebar} p-4 flex-col`}>
        <h1 className="text-xl font-bold mb-6 text-[#3d5a80]" onClick={()=>{navigate('/')}}>Inkpad Live</h1>
        <div className="flex flex-col gap-3">
          {boards.map((board, index) => (
            <button
              className={`p-2 rounded ${boardBtn} transition font-semibold`}
              key={index}
              onClick={() => navigate(`/md/${board.docId}`)}
            >
              {board.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Editor & Preview */}
      <div className="flex flex-col md:flex-row flex-1 items-center md:items-stretch justify-center gap-4 md:gap-0">
        {/* Editor Section */}
        <div className="w-[94vw] md:w-[50%] p-4 md:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#3d5a80]">
              {doc?.title || "Editor"}
            </h2>
            <button
              className="bg-[#ee6c4d] hover:bg-[#ff9770] text-white text-sm px-4 py-2 rounded-xl transition flex items-center gap-2 md:block"
              onClick={() => setShowPermissionModal(isOwner)}
            >
              <TbPencilCheck className="md:hidden" />
              <span className="hidden md:inline">Edit Permissions</span>
            </button>
          </div>
          {canEdit ? (
            <textarea
              className="flex-1 min-h-[300px] md:min-h-[500px] p-4 rounded-xl border border-gray-300 bg-white resize-none text-sm leading-6 outline-none shadow-sm"
              value={content}
              onChange={handleDocChange}
              placeholder="Start typing markdown..."
            />
          ) : (
            <textarea
              className="flex-1 min-h-[300px] md:min-h-[500px] p-4 rounded-xl border border-gray-300 bg-white resize-none text-sm leading-6 outline-none shadow-sm"
              value={content}
              readOnly
              placeholder="Start typing markdown..."
            />
          )}
        </div>

        {/* Preview Section */}
        <div className="w-[94vw] md:w-[34%] p-4 md:p-6 flex flex-col border-t md:border-t-0 md:border-l border-gray-300">
          <div className="flex items-center mb-4 gap-2">
            <h2 className="text-lg font-semibold text-[#3d5a80]">Preview</h2>
            <button
              onClick={handleShare}
              className={`ml-auto mr-2 flex items-center gap-2 ${shareBtn} text-gray-800 px-4 py-2 rounded-xl shadow transition font-semibold`}
              title="Share"
            >
              <FaShareAlt /> Share
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className={`flex items-center gap-2 ${exportBtn} text-gray-800 px-4 py-2 rounded-xl shadow transition font-semibold`}
              title="Export"
            >
              <FaFilePdf /> <FaFileCode /> Export
            </button>
          </div>
          <div className="flex-1 overflow-y-auto prose bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-h-[300px] md:max-h-[500px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>

          {/* Viewers Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-[#3d5a80]">Viewers</h3>
            <div className="flex flex-col gap-2 bg-[#e0fbfc] p-3 rounded-lg text-sm">
              {viewers.map((viewer, index) => (
                <span key={index}>
                  👤 {viewer.name ? viewer.name : "guest"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <Modal
          onClose={() => setShowPermissionModal(false)}
          title="Edit Contributors"
        >
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {getAllUsers().map((user, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {user.name ? user.name : "guest"}
                  </span>
                  {user.isCreator && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Creator
                    </span>
                  )}
                  {user.isCollaborator && !user.isCreator && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Collaborator
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {!user.isCollaborator && (
                    <button
                      title="Grant Edit Permission"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleNewUserEdit(user.id)}
                    >
                      <TbPencilCheck />
                    </button>
                  )}
                  {user.isCollaborator && !user.isCreator && (
                    <button
                      title="Remove Edit Permission"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveEditPermission(user.id)}
                    >
                      <MdPersonRemoveAlt1 />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          onClose={() => setShowExportModal(false)}
          title="Export Document"
        >
          <div className="space-y-4">
            <button
              className="w-full py-2 bg-[#90e0ef] text-[#3d5a80] rounded hover:bg-[#7dcfb6] transition font-semibold flex items-center justify-center gap-2"
              onClick={() => handleExport("pdf")}
            >
              <FaFilePdf /> Export as PDF
            </button>
            <button
              className="w-full py-2 bg-[#caf0f8] text-[#3d5a80] rounded hover:bg-[#e0fbfc] transition font-semibold flex items-center justify-center gap-2"
              onClick={() => handleExport("md")}
            >
              <FaFileCode /> Export as Markdown
            </button>
          </div>
        </Modal>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-[#ffd500] text-gray-900 px-6 py-4 rounded-xl shadow-xl font-semibold text-lg animate-bounce">
            Link copied to clipboard!
          </div>
        </div>
      )}
    </div>
  );
};

// Modal component with typing
type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
};
const Modal: FC<ModalProps> = ({ children, onClose, title }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      className="relative bg-white w-[90vw] max-w-lg p-6 rounded-2xl shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-2 right-2 text-xl font-bold hover:text-red-500"
      >
        <ImCancelCircle />
      </button>
      <h2 className="text-lg font-bold mb-4 text-[#3d5a80]" id="modal-title">
        {title}
      </h2>
      {children}
    </div>
  </div>
);

export default EditDocument;
