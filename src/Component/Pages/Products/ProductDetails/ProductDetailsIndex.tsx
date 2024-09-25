import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../../Helpers/Firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

interface Product {
  name: string;
  address: string;
  price: string;
  category: string;
  description: string;
  imagesUrl: string[];
  details: string;
  menuURL: string;
  additionalInfo: string;
  saftyInstruction: string;
  openingTime: { day: string; from: string; to: string }[];
}

interface Order {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: string;
  status: string;
  deliverToName: string;
  deliverToAddress: string;
  deliverToPhone: string;
}

const ProductDetailsIndex: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Product | null>(null);
  const [categoriesOptions, setCategoriesOptions] = useState([
    {
      label: "Chocolate",
      value: "chocolate",
    },
    {
      label: "Flowers",
      value: "flowers",
    },
  ]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const docSnap = await getDoc(doc(db, "products", productId || ""));
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct(data);
          setEditData(data);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product details: ", error);
      }
    };

    const fetchOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("productId", "==", productId)
        );
        const querySnapshot = await getDocs(ordersQuery);
        const ordersList: Order[] = querySnapshot.docs.map((doc1) => ({
          id: doc1.id,
          ...(doc1.data() as Order),
        }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    if (productId) {
      fetchProductDetails();
      fetchOrders();
    }
  }, [productId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData((prevData) => (prevData ? { ...prevData, [name]: value } : null));
  };

  const handleUpdateProduct = async () => {
    if (!editData || !productId) return;
    try {
      await updateDoc(doc(db, "products", productId), {
        ...editData,
      });
      setProduct(editData); // Update the state with the edited data
      setIsEditing(false); // Close edit form
      navigate(`/product-detail/${productId}`); // Optionally navigate back to the product details view
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500 bg-yellow-100";
      case "Canceled":
        return "text-red-500 bg-red-100";
      case "Delivered":
        return "text-green-500 bg-green-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="max-w-6xl w-full px-8">
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row items-center">
          <div className="h-40 w-40 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              className="object-cover h-full w-full"
              src={product?.imagesUrl[0] || "/products.png"}
              alt="Product"
            />
          </div>
          <div className="md:ml-6 flex-grow">
            <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
            <p className="mt-2 text-gray-700">{product.description}</p>
            <p className="mt-2 text-gray-700">Category: "{product.category}"</p>
            <p className="text-gray-700 mt-4 font-bold">Price: ${product.price}</p>
            <button
              onClick={handleEditToggle}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              {isEditing ? "Cancel Edit" : "Edit Product"}
            </button>
          </div>
        </div>

        {isEditing && editData && (
          <div className="mt-4 bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="w-full border rounded p-2 mb-4"
              placeholder="Product Name"
            />
            <textarea
              name="description"
              value={editData.description}
              onChange={handleChange}
              className="w-full border rounded p-2 mb-4"
              placeholder="Product Description"
            />
            <select
              name="category"
              value={editData.category}
              onChange={handleChange}
              className="w-full border rounded p-2 mb-4"
            >
              {categoriesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="price"
              value={editData.price}
              onChange={handleChange}
              className="w-full border rounded p-2 mb-4"
              placeholder="Price"
            />
            <button
              onClick={handleUpdateProduct}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Product
            </button>
          </div>
        )}

        <div className="mt-6 w-full">
          <h3 className="text-xl font-bold mb-4">Orders for this Product</h3>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-bold">Order ID: {order.id}</p>
                  <p>Status: <span className={`font-bold ${getStatusColor(order.status)}`}>{order.status}</span></p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Total Price: ${order.totalPrice}</p>
                  <p>Deliver To: {order.deliverToName}</p>
                  <p>Address: {order.deliverToAddress}</p>
                  <p>Phone: {order.deliverToPhone}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsIndex;
