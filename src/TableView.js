import React, { useState, useEffect } from "react";
import db from "./firebase";
import * as XLSX from "xlsx";
import "firebase/compat/storage";


const TableView = ({ collectionId }) => {
  const [fieldData, setFieldData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await db.collection(collectionId).get();
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
  }, [collectionId]);


  const handleDeleteField = async (idToDelete) => {
    if (!idToDelete) {
      return;
    }

    try {
      // Delete the document from Firestore
      await db.collection(collectionId).doc(idToDelete).delete();

      // Remove the deleted field from the local state
      setFieldData((prevData) =>
        prevData.filter((field) => field.id !== idToDelete)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleExportToExcel = () => {
    const data = fieldData
      .filter((field) => !field.pdfURL && !field.imageUrl)
      .map((field) => {
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
      <div className="mb-6">
        <div className="overflow-x-auto w-full mb-3">
          <table className="border w-full">
            <thead className="bg-gray-200">
              <tr>
                {fieldData.map((field) => {
                  const keys = Object.keys(field);
                  if (keys.includes("pdfURL") || keys.includes("imageUrl")) {
                    return null; // skip this field
                  }
                  return (
                    <th className="px-4 py-2" key={field.id}>
                      {keys[1]}
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        X
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {fieldData.map((field) => {
                  const keys = Object.keys(field);
                  if (keys.includes("pdfURL") || keys.includes("imageUrl")) {
                    return null; // skip this field
                  }
                  return (
                    <td className="border px-4 py-2" key={field.id}>
                      {Object.values(field)[1]}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
          onClick={handleExportToExcel}
        >
          Export to Excel
        </button>
      </div>

    </div>
  );
};

export default TableView;
