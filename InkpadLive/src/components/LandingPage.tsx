
import { Link, useNavigate } from "react-router-dom";
import { BsFillArrowRightSquareFill } from "react-icons/bs";
import {
  FaUsers,
  FaMarkdown,
  FaShareAlt,
  FaFilePdf,
  FaFileCode,
} from "react-icons/fa";
import { useState } from "react";
import type { FC, ReactNode, FormEvent } from "react";

// FeatureCard Props
type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

// Modal Props
type ModalProps = {
  children: ReactNode;
  onClose: () => void;
};

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => (
  <article className="flex flex-col items-start gap-4 p-6 bg-white/90 rounded-3xl shadow-md border border-indigo-100 hover:shadow-indigo-200 transition">
    <div>{icon}</div>
    <h4 className="text-xl font-semibold text-indigo-600">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </article>
);

const Modal: FC<ModalProps> = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    onClick={onClose}
  >
    <div
      className="relative bg-white rounded-3xl max-w-md w-[90vw] p-8 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-4 right-4 text-gray-300 hover:text-indigo-500 text-3xl font-bold focus:outline-none"
      >
        &times;
      </button>
      {children}
    </div>
  </div>
);

const LandingPage: FC = () => {
  const [joinRoom, setJoinRoom] = useState<boolean>(false);
  const [docId, setDocId] = useState<string>("");
  const navigate = useNavigate();
  const handleJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (docId.trim()) {
      const id = docId;
      setJoinRoom(false);
      setDocId("");
      navigate(`/md/${id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-indigo-50 to-gray-100 text-gray-900">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 bg-white/90 shadow-md sticky top-0 z-50 backdrop-blur">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-500 select-none cursor-default">
          Inkpad Live
        </h1>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => setJoinRoom(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-400 text-white rounded-xl shadow-md hover:bg-indigo-500 transition focus:outline-none focus:ring-4 focus:ring-indigo-200"
            aria-label="Get Started"
          >
            Get Started <BsFillArrowRightSquareFill size={22} />
          </button>
          <Link
            to="/sign-in"
            className="px-5 py-3 rounded-xl border border-indigo-300 text-indigo-500 font-semibold hover:bg-indigo-50 transition focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            Log In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 py-20 text-center max-w-6xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-300 to-gray-500 select-none drop-shadow-md">
          Collaborate. Write. Share.
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mb-12 text-gray-600">
          Inkpad Live is a real-time collaborative Markdown editor. Write, edit,
          and share documents seamlessly with your team or friends.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button
            onClick={() => setJoinRoom(true)}
            className="px-8 py-4 bg-indigo-400 text-white rounded-2xl font-semibold shadow-md hover:bg-indigo-500 transition focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            Get Started
          </button>
          <Link
            to="/sign-in"
            className="px-8 py-4 rounded-2xl border-2 border-indigo-300 text-indigo-500 font-semibold hover:bg-indigo-50 transition focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            Log In
          </Link>
        </div>

        {/* Features Section */}
        <section className="mt-20 w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          <FeatureCard
            icon={<FaUsers className="text-indigo-400 w-9 h-9" />}
            title="Collaborate Instantly"
            description="Work together in real time, wherever you are."
          />
          <FeatureCard
            icon={<FaMarkdown className="text-indigo-300 w-9 h-9" />}
            title="Markdown Magic"
            description="Write with easy, familiar Markdown syntax."
          />
          <FeatureCard
            icon={<FaShareAlt className="text-gray-400 w-9 h-9" />}
            title="Effortless Sharing"
            description="Share your docs with a single link—no hassle."
          />
          <FeatureCard
            icon={
              <div className="flex gap-2">
                <FaFileCode
                  className="text-indigo-400 w-7 h-7"
                  title="Export as Markdown"
                />
                <FaFilePdf
                  className="text-gray-400 w-7 h-7"
                  title="Export as PDF"
                />
              </div>
            }
            title="Export as Markdown & PDF"
            description="Download your work in clean .md or ready-to-share .pdf format with a single click."
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 border-t border-indigo-100 text-center py-6 text-sm text-indigo-300 select-none backdrop-blur">
        &copy; {new Date().getFullYear()} Inkpad Live. All rights reserved.
      </footer>

      {/* Modal for Document ID Input */}
      {joinRoom && (
        <Modal onClose={() => setJoinRoom(false)}>
          <h3 className="text-2xl font-bold text-indigo-500 mb-3">
            Join a Room
          </h3>
          <p className="mb-6 text-gray-500">
            Enter your Document ID to start collaborating!
          </p>
          <form className="w-full flex flex-col gap-5" onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Enter Document ID"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              className="px-5 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 text-lg"
              autoFocus
              required
              aria-label="Document ID"
            />
            <button
              type="submit"
              className="py-3 bg-indigo-400 text-white rounded-xl font-semibold hover:bg-indigo-500 transition focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Join Room
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-400">
            Don’t have a Document ID?{" "}
            
            <Link
              onClick={() => setJoinRoom(false)}
              to="/sign-in"
              className="text-indigo-500 underline hover:text-indigo-700 focus:outline-none"
            >
              Create one|
            </Link>
          </p>
        </Modal>
      )}
    </div>
  );
};

export default LandingPage;
