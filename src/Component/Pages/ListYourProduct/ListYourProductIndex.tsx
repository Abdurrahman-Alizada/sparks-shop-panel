import { useEffect, useState } from "react";
import { storage, firestore, auth } from "../../../Helpers/Firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

function ListYourProductIndex() {
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesOptions, setCategoriesOptios] = useState([
    {
      lable: "Chocolate",
      value: "chocolate",
    },
    {
      lable: "Flowers",
      value: "flowers",
    },
  ]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [isLoading, setLoading] = useState(false); // State to track loading state
  const [error, setError] = useState<string | null>(null); // State to track errors
  const [userId, serUserId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        serUserId(user.uid);
      } else {
        alert("first login then add product");
      }
    });
    return unsubscribe;
  }, []);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImageFiles(selectedFiles);
    }
  };

  const generateUniqueFileName = (
    originalName: string,
    productName: string
  ): string => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7); // Generate a random string
    const fileExtension = originalName.split(".").pop(); // Get file extension
    const uniqueFileName = `${productName}-${timestamp}-${randomString}.${fileExtension}`;
    return uniqueFileName;
  };

  const uploadImages = async (
    imageFiles: File[],
    productName: string
  ): Promise<string[]> => {
    try {
      const urls: string[] = [];

      for (const imageFile of imageFiles) {
        const uniqueFileName = generateUniqueFileName(
          imageFile.name,
          productName
        );
        const storageRef = ref(storage, `product_images/${uniqueFileName}`);
        const snapshot = await uploadBytesResumable(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        urls.push(downloadURL);
      }

      return urls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload images. Please try again.");
    }
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];


  const formatTime = (hour: any, minute: any, amPm: any) => {
    return `${hour || "8"}:${minute || "00"} ${amPm || "AM"}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true); // Start loading state

    try {
     
      // Upload images
      const uploadedImageUrls = await uploadImages(imageFiles, productName);

      await addDoc(collection(firestore, "products"), {
        name: productName,
        category: category,
        price: price,
        description: description,
        imagesUrl: uploadedImageUrls,
        userId: userId,
      });

      console.log("Product created successfully!");

      // Clear form fields and state
      setProductName("");
      setCategory("");
      setPrice("");
      setDescription("");
      setImageFiles([]);
      navigate("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      setError("Failed to create product. Please try again."); // Set error message
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="p-5 shadow-lg">
      <p className="text-lg font-bold mb-10">List Product</p>
      <form className="max-w-6xl" onSubmit={handleSubmit}>
        <div className="flex flex-wrap justify-between items-center">
        
          <div className="mb-5 w-[49%]">
            <label className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
              Choose product category
            </label>
            <select
              id="category"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoriesOptions.map((item, index) => (
                <option key={index} value={item?.value}>
                  {item?.lable}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5 w-[49%]">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Product Name
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 w-[48%]">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Price
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>


          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Description
            </label>
            <textarea
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 w-7/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Upload Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={onImageChange}
            />
          </div>

        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}

export default ListYourProductIndex;
