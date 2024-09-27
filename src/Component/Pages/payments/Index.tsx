import React, { useEffect, useState } from "react";
import { db } from "../../../Helpers/Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserIdFromLocalStorage = () => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? storedUserId : "";
  };

  const uid = getUserIdFromLocalStorage();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const docSnap = await getDoc(doc(db, "shopOwners", uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as User;
          setUser(data);
          setEditData(data);
        } else {
          setError("No such user document!");
        }
      } catch (error) {
        console.error("Error fetching user profile: ", error);
        setError("Failed to fetch user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [uid]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prevData) => (prevData ? { ...prevData, [name]: value } : null));
  };

  const handleUpdateUser = async () => {
    if (!editData) return;
    setLoadingUpdate(true);

    try {
      await updateDoc(doc(db, "shopOwners", uid), {
        ...editData,
      });
      setUser(editData); // Update the state with the edited data
      setIsEditing(false); // Close edit form
    } catch (error) {
      console.error("Error updating user profile: ", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="max-w-6xl w-full px-8">
        Under construction
      </div>
     
    </div>
  );
};

export default UserProfile;
