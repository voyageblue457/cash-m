import {
  FaHome,
  FaEnvelope,
  FaUsers,
  FaGlobe,
  FaQrcode,
  FaDollarSign,
  FaLink,
} from "react-icons/fa";

export const dashboardLinks = [
  // {
  //   name: "Dashboard",
  //   link: "/",
  //   icon: <FaHome />,
  // },
  {
    name: "Admin",
    link: "/admins",
    icon: <FaUsers />,
  },
  {
    name: "Collections",
    link: "/collections",
    icon: <FaEnvelope />,
  },
  {
    name: "Transaction ",
    link: "/amount",
    icon: <FaDollarSign />,
  },
  {
    name: "Users",
    link: "/posters",
    icon: <FaUsers />,
  },
  {
    name: "Payment Links",
    link: "/payment-links",
    icon: <FaLink />,
  },
  {
    name: "Withdraw",
    link: "/withdraw",
    icon: <FaGlobe />,
  },
  {
    name: "Create QR",
    link: "/create-qr",
    icon: <FaQrcode />,
  }
];
