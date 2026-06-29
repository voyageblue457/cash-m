import * as Yup from "yup";
import { Form, Formik, FieldArray, Field } from "formik";
import usePostData from "../../hooks/usePostData";
import { TextField } from "../common/InputField";
import { FaPlus, FaMinus } from "react-icons/fa";

function AdminForm({ id }) {
  const { mutate, isLoading } = usePostData({
    path: "/signup",
    revalidate: `/admin/list/${id}`,
    successMessage: "Admin created successfully!",
  });

  const initialValues = {
    username: "",
    password: "",
    adminId: "",
    numOfPostersPermission: 10,
    validity: 12, // default 12 months
    links: [""], // start with one empty link field
  };

  const validate = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
    adminId: Yup.string().required("Admin ID is required"),
    numOfPostersPermission: Yup.number()
      .min(1, "At least 1 poster permission is required")
      .required("Posters permission is required"),
    validity: Yup.number()
      .min(1, "Validity must be at least 1 month")
      .required("Validity is required"),
  });

  const handleSubmit = (values, formik) => {
    // Filter out empty links
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
        formik.resetForm();
      },
    });
  };

  return (
    <div className="mt-7">
      <Formik
        initialValues={initialValues}
        validationSchema={validate}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className="space-y-6">
            <h1 className="text-xl font-bold text-gray-800 border-b pb-2">Add New Admin</h1>
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <TextField label="Username *" name="username" type="text" />
              <TextField label="Password *" name="password" type="text" />
              <TextField label="Admin ID (unique) *" name="adminId" type="text" />
              <TextField label="Number of Posters Permission *" name="numOfPostersPermission" type="number" />
              <TextField label="Validity (months) *" name="validity" type="number" />
              
              <div className="md:col-span-2">
                <p className="font-semibold text-gray-600 mb-2">Links</p>
                <FieldArray name="links">
                  {({ push, remove }) => (
                    <div className="space-y-3">
                      {(formik.values.links || [""]).map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <Field
                              name={`links.${index}`}
                              type="text"
                              className="p-2.5 w-full outline-none text-sm bg-gray-50 border border-gray-200 focus:border-gray-300 focus:shadow"
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
            </div>
            <div className="mt-8 flex justify-start">
              <button
                type="submit"
                className="px-9 py-4 text-white text-xs tracking-widest font-bold rounded bg-custom-blue5 hover:bg-custom-blue active:scale-95 transition duration-300 uppercase disabled:bg-opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AdminForm;
