import React, { useState } from "react";
import { BrowserRouter, Route, Switch , Link } from "react-router-dom";
import TableView from "./TableView";
import FieldForm from "./FieldForm";


function App() {
  const [numClones, setNumClones] = useState(1);

  const handleAddClone = () => {
    setNumClones(numClones + 1);
  };

  const renderClones = () => {
    const clones = [];
    for (let i = 0; i < numClones; i++) {
      clones.push(
        <div key={i}>
          <FieldForm collectionId={`collection-${i}`} />
          <Link to={`/tableView/${i}`}>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-3"
            >
              View Table
            </button>
          </Link>
        </div>
      );
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
        <Switch>
          <Route exact path="/">
            {renderClones()}
          </Route>
          <Route path="/tableView/:id">
            {({ match }) => {
              const collectionId = `collection-${match.params.id}`;
              return <TableView collectionId={collectionId} />;
            }}
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}



export default App;