import { useState } from "react";
import { useSession } from "next-auth/react";
import { FaUsers } from "react-icons/fa";
import Loader from "../components/common/Loader";
import AdminForm from "../components/Form/AdminForm";
import Table from "../components/Table";
import Tabs from "../components/Tabs";
import useGetData from "../hooks/useGetData";
import { getTimeDistance } from "../utils/getTimeDistance";
import DeleteAdmin from "../components/DeleteAdmin";
import Modal from "../components/Modal";
import EditAdmin from "../components/EditAdmin";
import Link from "next/link";

function ViewLinksCell({ links }) {
  const [isOpen, setIsOpen] = useState(false);
  const displayLinks = links || [];

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-cyan-600 hover:bg-cyan-700 text-xs text-white font-semibold px-2 py-1 rounded transition duration-200"
      >
        View Links ({displayLinks.length})
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
            Assigned Links
          </h3>
          {displayLinks.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No links assigned.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {displayLinks.map((link, idx) => (
                <li key={idx} className="text-sm break-all bg-gray-50 p-2 rounded border border-gray-100 hover:bg-gray-100 transition duration-150">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded text-sm transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const adminsColumn = [
  {
    Header: "Username",
    accessor: "username",
  },
  {
    Header: "Admin ID",
    accessor: "adminId",
  },
  {
    Header: "Num of Posters",
    accessor: "numOfPostersPermission",
  },
  {
    Header: "Validity (Days)",
    accessor: "validity",
  },
  {
    Header: "Links",
    accessor: "links",
    disableSortBy: true,
    Cell: ({ value }) => <ViewLinksCell links={value} />,
  },
  {
    Header: "Time",
    accessor: "createdAt",
    disableSortBy: true,
    Cell: ({ row }) => (
      <div className="flex justify-center items-center">
        {row.original.createdAt && getTimeDistance(row.original.createdAt)}
      </div>
    ),
  },
  {
    Header: "View User",
    accessor: (row) => row,
    id: "viewUser",
    disableSortBy: true,
    Cell: ({ value }) => (
      <div className="flex justify-center items-center">
        <Link href={`/admins/details/${value._id}`}>
          <span className="bg-blue-600 hover:bg-blue-700 text-xs text-white font-semibold px-2 py-1 rounded transition duration-200 cursor-pointer">
            View User
          </span>
        </Link>
      </div>
    ),
  },
  {
    Header: "Options",
    accessor: "_id",
    disableSortBy: true,
    Cell: ({ row }) => (
      <div className="flex justify-center items-center gap-2">
        <EditAdmin adminInfo={row.original} />
        <DeleteAdmin adminInfo={row.original} />
      </div>
    ),
  },
];

function AdminsPage() {
  const { data: session } = useSession();
  const id = session?.user?.id;

  const {
    data: fetchedData,
    isLoading,
  } = useGetData(id ? `/admin/list/${id}` : null);

  const adminsData = fetchedData?.data?.data || [];

  const table = adminsData && (
    <Table columnsHeading={adminsColumn} usersData={adminsData} />
  );

  const form = <AdminForm id={id} />;

  const tabsData = [
    {
      label: "All Admins",
      content: table,
    },
    {
      label: "Add Admin",
      content: form,
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaUsers />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Admins</h1>
      </div>

      <Loader isLoading={isLoading}>
        <div className="mt-7 bg-white p-4 lg:p-8 rounded shadow-md">
          <Tabs tabsData={tabsData} />
        </div>
      </Loader>
    </div>
  );
}

export default AdminsPage;
