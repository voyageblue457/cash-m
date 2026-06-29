import { useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import useDeleteData from "../hooks/useDeleteData";

function DeleteAdmin({ adminInfo }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: session } = useSession();
  const superAdminId = session?.user?.id;

  const { mutate, isLoading } = useDeleteData({
    path: `/admin/delete/${adminInfo._id}/${superAdminId}`,
    revalidate: `/admin/list/${superAdminId}`,
  });

  const handleDelete = () => {
    mutate("", {
      onSuccess: () => {
        toast.success(`Admin ${adminInfo.username} Deleted`);
      },
      onSettled: () => {
        setShowDeleteModal(false);
      },
    });
  };

  return (
    <div className="">
      <button
        className="bg-red-600 hover:bg-red-700 text-xs text-white font-semibold px-2 py-1 rounded"
        onClick={() => setShowDeleteModal(true)}
      >
        Delete
      </button>

      {showDeleteModal && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 h-screen w-full overflow-y-hidden flex justify-center items-center">
          <div className="mx-2 bg-white p-5 lg:p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="pb-4 border-b">
              <p className="text-center text-xl font-bold text-gray-800">
                Delete Admin Account
              </p>
            </div>

            <p className="mt-4 text-gray-600 text-center">
              Are you sure you want to delete Admin <strong className="text-gray-900">"{adminInfo.username}"</strong>?
            </p>

            <p className="mt-2 text-sm text-red-600 text-center font-semibold">
              Warning: This action will delete the admin, all associated posters, and links. This action is irreversible.
            </p>

            <div className="mt-6 flex justify-center gap-4 items-center">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded transition duration-200 disabled:opacity-50"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition duration-200 disabled:opacity-50"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteAdmin;
