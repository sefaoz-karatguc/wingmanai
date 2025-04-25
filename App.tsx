import "./global.css";
import { Provider } from "react-redux";
import store from "./src/Redux/store";
import Main from "./Main";

export default function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
