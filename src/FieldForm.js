import React, { useState, useEffect } from "react";
import db from "./firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { v4 as uuidv4 } from "uuid";

const storage = firebase.storage();

const FieldForm = ({ collectionId }) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [fieldData, setFieldData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrls, setPdfUrls] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await db.collection(collectionId).get();
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFieldData(data);

        const pdfs = data.filter((doc) => doc.pdfURL);
        setPdfUrls(
          pdfs.map((doc) => ({ pdfURL: doc.pdfURL, fileURL: doc.fileURL }))
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [collectionId]);

  const handleAddField = async () => {
    if (!fieldName || !fieldValue) {
      alert("Field name and field value are required");
      return;
    }
    const id = uuidv4();

    try {
      // Add the new field to Firestore using the generated ID
      await db
        .collection(collectionId)
        .doc(id)
        .set({ [fieldName]: fieldValue });

      // Update the state of the form component to display the new field
      setFieldName("");
      setFieldValue("");

      // Add the new field to the end of the fieldData array
      setFieldData((prevData) => [
        ...prevData,
        { id: id, [fieldName]: fieldValue },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }
    try {
      const imageName = selectedFile.name;
      // Create a storage reference
      const storageRef = storage.ref().child(`${collectionId}/${Date.now()}`);

      // Upload the file to storage
      const snapshot = await storageRef.put(selectedFile);

      // Get the download URL
      const downloadURL = await snapshot.ref.getDownloadURL();

      // Create a new document in the Firestore collection with the download URL
      await db
        .collection(collectionId)
        .add({ imageUrl: downloadURL, imageName: imageName });

      // Reset the selected file
      setSelectedFile(null);

      // Refetch the data from Firestore to update the table
      const snapshot2 = await db.collection(collectionId).get();
      const data = snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFieldData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteImage = async (idToDelete) => {
    if (!idToDelete) {
      return;
    }

    try {
      // Delete the image file from storage
      const field = fieldData.find((field) => field.id === idToDelete);
      const imageUrl = field.imageUrl;
      const imageRef = storage.refFromURL(imageUrl);
      await imageRef.delete();

      // Delete the document from Firestore
      await db.collection(collectionId).doc(idToDelete).delete();

      // Remove the deleted image from the local state
      setFieldData((prevData) =>
        prevData.filter((field) => field.id !== idToDelete)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handlePDFUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }
    try {
      const fileName = selectedFile.name;
      // Create a storage reference
      const storageRef = storage.ref().child(`${collectionId}/${Date.now()}`);

      // Upload the file to storage
      const snapshot = await storageRef.put(selectedFile);

      // Get the download URL
      const downloadURL = await snapshot.ref.getDownloadURL();

      // Create a new document in the Firestore collection with the download URL
      await db
        .collection(collectionId)
        .add({ pdfURL: downloadURL, fileURL: fileName });

      // Update the pdfUrls state array with the new PDF file's URL
      setPdfUrls((prevUrls) => [
        ...prevUrls,
        { pdfURL: downloadURL, fileURL: fileName },
      ]);

      // Reset the selected file
      setSelectedFile(null);

      // Refetch the data from Firestore to update the table
      const snapshot2 = await db.collection(collectionId).get();
      const data = snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFieldData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeletePDF = async (indexToDelete) => {
    if (!pdfUrls[indexToDelete]) {
      return;
    }

    try {
      // Delete the file from storage
      const pdfRef = storage.refFromURL(pdfUrls[indexToDelete].pdfURL);
      await pdfRef.delete();

      // Delete the document from Firestore
      const fileName = pdfUrls[indexToDelete].fileURL;
      const snapshot = await db
        .collection(collectionId)
        .where("fileURL", "==", fileName)
        .get();
      const docId = snapshot.docs[0].id;
      await db.collection(collectionId).doc(docId).delete();

      // Remove the deleted PDF from the local state
      setPdfUrls((prevUrls) =>
        prevUrls.filter((pdf, index) => index !== indexToDelete)
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      {/* PDF upload */}
      <div className="mb-4">
        <label
          className="block text-gray-700 font-bold mb-2"
          htmlFor="fieldValue"
        >
          Upload PDF
        </label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="file"
          onChange={handleFileChange}
        />
        <button>
          <label
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded    focus:outline-none focus:shadow-outline mb-3"
            onClick={handlePDFUpload}
          >
            Upload
          </label>
        </button>
        <div>
          {pdfUrls.map((pdf, index) => (
            <div key={index} className="mt-5">
              <a
                href={pdf.pdfURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 mr-2"
              >
                {pdf.fileURL}
              </a>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-2"
                onClick={() => handleDeletePDF(index)}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Image upload */}
      <div className="mb-4">
        <label
          className="block text-gray-700 font-bold mb-2"
          htmlFor="fieldValue"
        >
          Upload Image
        </label>
        <input
          className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="file"
          onChange={handleFileChange}
        />
        <button>
          <label
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
            onClick={handleImageUpload}
          >
            Upload
          </label>
        </button>
        <div className="flex flex-wrap">
          {fieldData
            .filter((field) => field.hasOwnProperty("imageUrl"))
            .map((field) => (
              <div className="w-1/3 p-2" key={field.id}>
                <div className="bg-white rounded shadow">
                  <img className="w-full" src={field.imageUrl} alt="uploaded" />
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleDeleteImage(field.id)}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="mb-6">
        <div className="flex flex-wrap -mx-3 mb-4">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block font-medium text-gray-700 mb-2"
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
          <div className="w-full md:w-1/2 px-3">
            <label
              className="block font-medium text-gray-700 mb-2"
              htmlFor="fieldValue"
            >
              Field Value
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Enter field value"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          </div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
          onClick={handleAddField}
        >
          Add Column
        </button>
      </div>
    </div>
  );
};

export default FieldForm;
