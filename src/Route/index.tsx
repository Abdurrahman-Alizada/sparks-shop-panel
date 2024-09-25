import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../Layout/AuthLayout";
import Login from "../Auth/Login";
import Signup from "../Auth/Signup";
import ForgotPassword from "../Auth/ForgotPassword";
import MobileNumberLogin from "../Auth/MobileNumberLogin";
import DefaultLayout from "../Layout/DefaultLayout";
import Products from "../Component/Pages/Products/Products"
import NotFound from "../Component/Pages/NotFound/NotFound";
import ListYourProductIndex from "../Component/Pages/ListYourProduct/ListYourProductIndex";
import ProductDetails from "../Component/Pages/Products/ProductDetails/ProductDetailsIndex";
import OrderHistoryIndex from "../Component/Pages/OrdersHistory/OrdersHistoryIndex";
import UserProfile from "../Component/Pages/UserProfile/Index";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
  },
  {
    path: "/",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      // {
      //   path: "signup",
      //   element: <Signup />,
      // },
      // {
      //   path: "forgotpassword",
      //   element: <ForgotPassword />,
      // },
      // {
      //   path: "phone-login",
      //   element: <MobileNumberLogin />,
      // },
    ],
  },
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "list-your-product",
        element: <ListYourProductIndex />,
      },
      {
        path: "orders-history",
        element: <OrderHistoryIndex />,
      },
      {
        path: "product-detail/:productId",
        element: <ProductDetails />,
      },
      {
        path: "profile",
        element: <UserProfile />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
export default routes;
