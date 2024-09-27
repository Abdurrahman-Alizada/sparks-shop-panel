import React, { useEffect, useState } from "react";
import { db } from "../../../Helpers/Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  shopName: string;
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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-bold text-gray-900">Shop details</h2>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col">
              <label className="text-gray-600">
                <strong>Owner Name:</strong>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData?.name}
                  onChange={handleChange}
                  className="border rounded p-2 w-full mt-2"
                />
              ) : (
                <p className="text-gray-700">{user.name}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600">
                <strong>Shop Name:</strong>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="shopName"
                  value={editData?.shopName}
                  onChange={handleChange}
                  className="border rounded p-2 w-full mt-2"
                />
              ) : (
                <p className="text-gray-700">{user.shopName}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600">
                <strong>Email:</strong>
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                className="border rounded p-2 w-full mt-2 bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600">
                <strong>Phone:</strong>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={editData?.phone}
                  onChange={handleChange}
                  className="border rounded p-2 w-full mt-2"
                />
              ) : (
                <p className="text-gray-700">{user.phone}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600">
                <strong>Address:</strong>
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={editData?.address}
                  onChange={handleChange}
                  className="border rounded p-2 w-full mt-2"
                />
              ) : (
                <p className="text-gray-700">{user.address}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleEditToggle}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ${loadingUpdate ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loadingUpdate}
            >
              {loadingUpdate ? (
                <span className="loader"></span>
              ) : (
                isEditing ? "Cancel Edit" : "Edit shop details"
              )}
            </button>
            {isEditing && (
              <button
                onClick={handleUpdateUser}
                className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${loadingUpdate ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loadingUpdate}
              >
                {loadingUpdate ? (
                  <span className="loader"></span>
                ) : (
                  "Update Shop Details"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .loader {
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
