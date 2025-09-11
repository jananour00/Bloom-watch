import Header from "./Header/Header.jsx";
import Card from "./Card/Card.jsx";
import BloomWatchForm from "./form/form.jsx";
function App() {
  return (
    <>
      <div className="mainApp">
        <Header />
      </div>
      {/* <Land/> */}
      <div className="cardsPage">
        <Card
          src="./src\assets\TestCardimg.png"
          title="Mission & Solution"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        />
        <Card
          src="./src\assets\TestCardimg.png"
          title="Mission & Solution"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        />
      </div>
      <BloomWatchForm />
    </>
  );
}

export default App;
