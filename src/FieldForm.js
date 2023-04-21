import React, { useState, useEffect } from "react";
import db from "./firebase";
import * as XLSX from "xlsx";

const FieldForm = () => {
  const [fieldName, setFieldName] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [fieldData, setFieldData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await db.collection("fields").get();
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFieldData(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleAddField = async () => {
    if (!fieldName || !fieldValue) {
      alert("Field name and field value are required");
      return;
    }

    try {
      await db.collection("fields").add({ [fieldName]: fieldValue });
      // Update the state of the form component to display the new field
      setFieldName("");
      setFieldValue("");

      // Refetch the data from Firestore to update the table
      const snapshot = await db.collection("fields").get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFieldData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteField = async (idToDelete) => {
    try {
      await db.collection("fields").doc(idToDelete).delete();

      // Refetch the data from Firestore to update the table
      const snapshot = await db.collection("fields").get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFieldData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleExportToExcel = () => {
    const data = fieldData.map((field) => {
      const key = Object.keys(field)[1];
      const value = Object.values(field)[1];
      return {
        Field: key,
        Answer: value,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fields");
    XLSX.writeFile(workbook, "fields.xlsx");
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Seeding Module</h2>
      <div className="mb-4">
        <label
          className="block text-gray-700 font-bold mb-2"
          htmlFor="fieldName"
        >
          Field Name
        </label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Enter field name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 font-bold mb-2"
          htmlFor="fieldValue"
        >
          Field Value
        </label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline "
          type="text"
          placeholder="Enter field value"
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
        />
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
        onClick={handleAddField}
      >
        Add Column
      </button>
      <div className="overflow-x-auto w-full mb-3">
        <table className="border">
          <thead className="bg-gray-200">
            <tr>
              {fieldData.map((field) => (
                <th className="px-4 py-2" key={field.id}>
                  {Object.keys(field)[1]}
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
                    onClick={() => handleDeleteField(field.id)}
                  >
                    X
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {fieldData.map((field) => (
                <td className="border px-4 py-2" key={field.id}>
                  {Object.values(field)[1]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
        onClick={handleExportToExcel}
      >
        Export as Excel
      </button>
    </div>
  );
};

export default FieldForm;
