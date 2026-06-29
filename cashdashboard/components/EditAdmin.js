import { useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { Form, Formik, FieldArray, Field } from "formik";
import * as Yup from "yup";
import { FaPlus, FaMinus, FaEdit } from "react-icons/fa";
import usePostData from "../hooks/usePostData";
import { TextField } from "./common/InputField";
import Modal from "./Modal";

function EditAdmin({ adminInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const superAdminId = session?.user?.id;

  const { mutate, isLoading } = usePostData({
    path: `/admin/update/${adminInfo._id}/${superAdminId}`,
    revalidate: `/admin/list/${superAdminId}`,
    successMessage: "Admin updated successfully!",
  });

  const initialValues = {
    username: adminInfo.username || "",
    password: adminInfo.password || "",
    adminId: adminInfo.adminId || "",
    numOfPostersPermission: adminInfo.numOfPostersPermission || 0,
    validity: adminInfo.validity ? Math.round(adminInfo.validity / 30) : 0,
    links: adminInfo.links && adminInfo.links.length > 0 ? adminInfo.links : [""],
  };

  const validate = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
    adminId: Yup.string().required("Admin ID is required"),
    numOfPostersPermission: Yup.number()
      .min(0, "Posters permission cannot be negative")
      .required("Posters permission is required"),
    validity: Yup.number()
      .min(1, "Validity must be at least 1 month")
      .required("Validity is required"),
  });

  const handleSubmit = (values) => {
    const linksArray = values.links
      ? values.links.map((link) => link.trim()).filter((link) => link.length > 0)
      : [];

    const submitValues = {
      username: values.username,
      password: values.password,
      adminId: values.adminId,
      links: linksArray,
      numOfPostersPermission: Number(values.numOfPostersPermission),
      validity: Number(values.validity),
    };

    mutate(submitValues, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-custom-blue2 hover:bg-custom-blue5 text-xs text-white font-semibold px-2 py-1 rounded flex items-center gap-1 transition duration-200"
        title="Edit Admin"
      >
        <FaEdit className="text-xs" />
        Edit
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="text-left max-h-[80vh] overflow-y-auto pr-1">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
            Edit Admin Details
          </h3>

          <Formik
            initialValues={initialValues}
            validationSchema={validate}
            onSubmit={handleSubmit}
          >
            {(formik) => (
              <Form className="space-y-4">
                <TextField label="Username *" name="username" type="text" />
                <TextField label="Password *" name="password" type="text" />
                <TextField label="Admin ID (unique) *" name="adminId" type="text" />
                <TextField label="Number of Posters Permission *" name="numOfPostersPermission" type="number" />
                <TextField label="Validity (months) *" name="validity" type="number" />

                <div>
                  <p className="font-semibold text-gray-600 mb-2">Links</p>
                  <FieldArray name="links">
                    {({ push, remove }) => (
                      <div className="space-y-2">
                        {(formik.values.links || [""]).map((link, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              <Field
                                name={`links.${index}`}
                                type="text"
                                className="p-2.5 w-full outline-none text-sm bg-gray-50 border border-gray-200 focus:border-gray-300 focus:shadow rounded"
                                placeholder="https://cash-online.py-cash.online/yesnow"
                              />
                            </div>
                            {index === (formik.values.links || [""]).length - 1 ? (
                              <button
                                type="button"
                                onClick={() => push("")}
                                className="p-3 bg-custom-blue2 text-white hover:bg-custom-blue4 rounded active:scale-95 transition duration-300"
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-3 bg-red-600 text-white hover:bg-red-700 rounded active:scale-95 transition duration-300"
                              >
                                <FaMinus className="text-xs" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded text-sm transition duration-200"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-custom-blue5 hover:bg-custom-blue text-white font-semibold px-4 py-2 rounded text-sm transition duration-200 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </div>
  );
}

export default EditAdmin;
