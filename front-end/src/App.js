import "./App.css";
import Globe from "./components/Globe";
import Modal from "react-modal";
Modal.setAppElement("#root"); // or use the ID of your app’s root element

function App() {
  return (
    <div className="App">
      <h1>Vinh's Travel Map</h1>
      <Globe />
    </div>
  );
}

export default App;
