import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import { db } from "../../../Helpers/Firebase";
import moment from "moment";

interface Order {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: string;
  status: string;
  deliverToName: string;
  deliverToAddress: string;
  deliverToPhone: string;
  date: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  productName: string;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<{ [key: string]: { name: string } }>({});
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Function to get userId from localStorage
  const getUserIdFromLocalStorage = () => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? storedUserId : "";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const userId = getUserIdFromLocalStorage(); // Get user ID from local storage
        const q = query(
          collection(db, "orders"),
          where("sellerId", "==", userId)
        ); // Fetch orders with sellerId matching userId
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setOrders([]);
        } else {
          const fetchedOrders: Order[] = querySnapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Order)
          );
          setOrders(fetchedOrders);

          const userIds = fetchedOrders.map((res) => res?.buyerId);

          const userPromises = userIds.map(async (userId) => {
            const userDocRef = doc(db, "users", userId);
            const userDocSnapshot = await getDoc(userDocRef);
            return userDocSnapshot;
          });

          const userDocs = await Promise.all(userPromises);
          const usersData: { [key: string]: { name: string } } = {};

          userDocs.forEach((userDoc) => {
            if (userDoc.exists()) {
              usersData[userDoc.id] = userDoc.data() as { name: string };
            }
          });

          setUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    const ordersRef = doc(db, "orders", id);
    await updateDoc(ordersRef, { status: "delivered" });
    setOrders((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: "delivered" } : res))
    );
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    const ordersRef = doc(db, "orders", id);
    await updateDoc(ordersRef, { status: "rejected" });
    setOrders((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: "rejected" } : res))
    );
    setLoadingId(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Orders history</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Orders history</h1>
        <p>No orders yet</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Orders history</h1>
      <table className="table-auto overflow-x-scroll w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Product</th>
            <th className="border border-gray-300 px-4 py-2">Order By</th>
            <th className="border border-gray-300 px-4 py-2">Delivered To</th>
            <th className="border border-gray-300 px-4 py-2">
              Delivery Address
            </th>
            <th className="border border-gray-300 px-4 py-2">Phone</th>
            <th className="border border-gray-300 px-4 py-2">Quantity</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">
                {order.productName || "Not available..."}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.buyerName || "Not available..."}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.deliverToName}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.deliverToAddress}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.deliverToPhone}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.quantity}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <span
                  className={`font-medium ${
                    order.status?.toLowerCase() === "pending"
                      ? "text-yellow-500"
                      : order.status?.toLowerCase() === "delivered"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.status?.toLowerCase() === "pending" && (
                  <div className="flex justify-center">
                    <button
                      className="bg-green-500 text-white px-4 py-2 mr-2 rounded hover:bg-green-700"
                      onClick={() => handleAccept(order.id)}
                      disabled={loadingId === order.id}
                    >
                      {loadingId === order.id ? "Loading..." : "Accept"}
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                      onClick={() => handleReject(order.id)}
                      disabled={loadingId === order.id}
                    >
                      {loadingId === order.id ? "Loading..." : "Reject"}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
