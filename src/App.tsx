import React from "react";
import logo from "./logo.svg";
import "./App.css";
import CustomComponent from "./CustomComponent";

function App() {
  return (
    <div className="App">
      <header className="App-header">This the app header</header>
      <main>
        <CustomComponent />
      </main>
    </div>
  );
}

export default App;
