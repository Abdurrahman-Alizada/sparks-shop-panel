import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../Helpers/Firebase"; // Adjust the path to your firebaseConfig file
import { collection, getDocs, where, query } from "firebase/firestore";

const Products = () => {
  const [products, setProducts] = useState<any[]>([]); // Define state to hold products

  useEffect(() => {
    // Function to get userId from localStorage
    const getUserIdFromLocalStorage = () => {
      const storedUserId = localStorage.getItem("userId");
      return storedUserId ? storedUserId : "";
    };

    // Fetch products when component mounts
    const fetchProducts = async () => {
      try {
        const userId = getUserIdFromLocalStorage();
        const q = query(collection(db, "products"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts(); // Call the async function

  }, []); // Empty dependency array ensures this effect runs only once

  const getSlug = (inputString: string) => {
    return inputString.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My products</h1>
        {/* <Link to="/list-your-product">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
            Add product
          </button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {
        products.length ? 
        products.map((product) => (
          <Link
            to={{ pathname: `/product-detail/${product._id}` }}
            state={{ menuURL: product.menuURL, fileName: product.name }}
            key={product._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
          >
            <img
              className="object-cover h-40 w-full"
              src={product?.imagesUrl[0]}
              alt="Product"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-2">{product.address}</p>
              <p className="text-gray-700 mb-4">{product.description}</p>
            </div>
          </Link>
        ))
        :
        <p>No product found</p>
        }
      </div>
    </div>
  );
};

export default Products;
