import { useRouter } from "next/router";
import { FaUser, FaDollarSign, FaUsers, FaArrowUp, FaClock, FaGlobe, FaChevronLeft } from "react-icons/fa";
import Table from "../../../components/Table";
import { postersColumn } from "../../../components/Table/columns/postersColumn";
import useGetData from "../../../hooks/useGetData";
import Loader from "../../../components/common/Loader";
import { useSession } from "next-auth/react";

function AdminDetailsPage() {
  const { back, query } = useRouter();
  const { adminId } = query;

  // Fetch poster users belonging to this admin
  const { data: posterData, isLoading: posterLoading } = useGetData(
    adminId ? `/all/poster/${adminId}` : null
  );

  // Fetch transaction summary statistics for this admin
  const { data: summaryRes, isLoading: summaryLoading } = useGetData(
    adminId ? `/amount/summary/${adminId}` : null
  );

  const adminInfo = posterData?.data?.data?._doc || posterData?.data?.data;
  const postersList = posterData?.data?.data?.posters || [];

  const summary = summaryRes?.data || summaryRes || {};
  const paidAmount = parseFloat(summary.paidAmount || 0);
  const totalAmount = parseFloat(summary.totalAmount || 0);
  const totalWithdrawn = parseFloat(summary.totalWithdrawn || 0);
  const pendingWithdraw = parseFloat(summary.pendingWithdraw || 0);
  const pendingTransactions = Math.max(0, totalAmount - paidAmount);

  const isLoading = posterLoading || summaryLoading;

  return (
    <div className="relative min-h-screen bg-gray-50/50 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-100">
            <FaUser className="text-xl" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Details
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Manage posters and monitor transaction summaries
            </p>
          </div>
        </div>

        <button
          onClick={() => back()}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200/80 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer max-w-max"
        >
          <FaChevronLeft className="text-xs text-gray-500" />
          <span>Go Back</span>
        </button>
      </div>

      <Loader isLoading={isLoading}>
        {adminInfo ? (
          <div className="space-y-8">
            {/* Top Info and Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Information Panel */}
              <div className="lg:col-span-1 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">Information</h3>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-3.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Username:</span>
                      <span className="text-gray-800 font-bold">{adminInfo.username || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Admin ID:</span>
                      <span className="text-gray-800 font-semibold break-all text-right max-w-[150px]">{adminInfo.adminId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Validity:</span>
                      <span className="text-gray-800 font-semibold">{adminInfo.validity ? `${adminInfo.validity} Days` : "Expired / None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Posters Limit:</span>
                      <span className="text-gray-800 font-semibold">
                        {postersList.length} / {adminInfo.numOfPostersPermission || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>Account Active</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards Area */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Amount Received Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg shadow-emerald-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-300">
                    <FaDollarSign className="text-8xl" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-50/90 uppercase tracking-wider">Amount Received</span>
                      <span className="p-2 bg-white/10 rounded-xl text-white">
                        <FaDollarSign className="text-sm" />
                      </span>
                    </div>
                    <h2 className="text-3xl font-extrabold mt-4 tracking-tight">
                      ${paidAmount.toFixed(2)}
                    </h2>
                  </div>
                  <p className="text-xs text-emerald-100/80 font-medium mt-4 border-t border-white/10 pt-3">
                    Successful/paid deposits
                  </p>
                </div>

                {/* Amount Withdrawn Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-300">
                    <FaGlobe className="text-8xl" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-50/90 uppercase tracking-wider">Amount Withdrawn</span>
                      <span className="p-2 bg-white/10 rounded-xl text-white">
                        <FaArrowUp className="text-sm" />
                      </span>
                    </div>
                    <h2 className="text-3xl font-extrabold mt-4 tracking-tight">
                      ${totalWithdrawn.toFixed(2)}
                    </h2>
                  </div>
                  <div className="text-xs text-blue-100/80 font-medium mt-4 border-t border-white/10 pt-3 flex justify-between items-center">
                    <span>Approved withdrawals</span>
                    {pendingWithdraw > 0 && (
                      <span className="bg-yellow-400 text-yellow-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        Pending: ${pendingWithdraw.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount Pending Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg shadow-orange-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-300">
                    <FaClock className="text-8xl" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-amber-50/90 uppercase tracking-wider">Pending Amount</span>
                      <span className="p-2 bg-white/10 rounded-xl text-white">
                        <FaClock className="text-sm" />
                      </span>
                    </div>
                    <h2 className="text-3xl font-extrabold mt-4 tracking-tight">
                      ${pendingTransactions.toFixed(2)}
                    </h2>
                  </div>
                  <p className="text-xs text-amber-100/80 font-medium mt-4 border-t border-white/10 pt-3">
                    Unpaid/pending invoice transactions
                  </p>
                </div>

              </div>
            </div>

            {/* Poster Users Table Card */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-lg text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Poster Users
                  </h2>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                  Total: {postersList.length}
                </span>
              </div>

              {postersList && postersList.length > 0 ? (
                <div className="overflow-x-auto -mt-6">
                  <Table columnsHeading={postersColumn} usersData={postersList} />
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium text-sm">
                    No Poster Users created by this Admin yet.
                  </p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-semibold text-lg">Admin not found.</p>
            <button
              onClick={() => back()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition duration-150"
            >
              Go Back
            </button>
          </div>
        )}
      </Loader>
    </div>
  );
}

export default AdminDetailsPage;
