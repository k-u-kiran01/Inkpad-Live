
import { Header } from "./Header";
import { WelcomeBoard } from "./WelcomeBoard";
import { DocumentsList } from "./DocumentsList";
import { DocumentActions } from "./DocumentActions";
import { userContext } from "../App";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import type { FC } from "react";
interface user {
  name: string;
  id: string;
  username: string;
}

const HomePage: FC = () => {
  const user:user = useContext(userContext);
 const backend_base_url = import.meta.env.VITE_BACKEND_URL;

 type doc = {
    _id: string;
    docId: string;
    title: string;
    createdAt: string;
  };
  const [docs, setDocs] = useState<doc[]>([]);
  // const getRelativeTime = (isoString: string): string => {
  //   const createdDate = new Date(isoString);
  //   const now = new Date();

  //   const differenceInDays = Math.floor(
  //     (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  //   );

  //   if (differenceInDays === 0) return "Today";
  //   if (differenceInDays === 1) return "Yesterday";
  //   if (differenceInDays < 7) return `${differenceInDays} days ago`;
  //   if (differenceInDays < 30)
  //     return `${Math.floor(differenceInDays / 7)} weeks ago`;
  //   if (differenceInDays < 365)
  //     return `${Math.floor(differenceInDays / 30)} months ago`;

  //   return `${Math.floor(differenceInDays / 365)} years ago`;
  // };

  const getRelativeTime = (isoString: string): string => {
  const createdDate = new Date(isoString);
  const now = new Date();

  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 5) return "Now";
  if (diffInHours < 1) return `${diffInMinutes} minutes ago`;
  if (diffInHours === 1) return "1 hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

  return `${Math.floor(diffInDays / 365)} years ago`;
};


  const fetchDocs = async () => {
      try {
        const response = await axios.get(
          `${backend_base_url}/api/home/md/${user.id}`
        );
        setDocs(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
  useEffect(() => {
    fetchDocs();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={user.name} />
      <main className="container mx-auto px-4 py-8">
        <WelcomeBoard userName={user.name} />
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DocumentsList
              docs={docs.map((doc) => ({
                ...doc,
                createdAt: getRelativeTime(doc.createdAt),
              }))} fetchDocs = {fetchDocs}
            />{" "}
          </div>
          <div className="lg:col-span-1">
            <DocumentActions setDocs={setDocs} user={user} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage