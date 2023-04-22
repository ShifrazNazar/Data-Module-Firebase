import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import FieldForm from "./FieldForm";

function App() {
  const [numClones, setNumClones] = useState(1);

  const handleAddClone = () => {
    setNumClones(numClones + 1);
  };

  const renderClones = () => {
    const clones = [];
    for (let i = 0; i < numClones; i++) {
      clones.push(<FieldForm key={i} collectionId={`collection-${i}`} />);
    }
    return clones;
  };

  return (
    <BrowserRouter>
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
          onClick={handleAddClone}
        >
          Add Module
        </button>
        {renderClones()}
      </div>
    </BrowserRouter>
  );
}

export default App;


