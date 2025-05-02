import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Provider } from "react-redux";
import { Store } from "./redux/store";
import HomePage from "./pages/HomePage";
import { ToastContainer } from "react-toastify";

function App() {
    useEffect(() => {
        const setHights = () => {
            const innderHight = window.innerHeight;
            const actualVh = innderHight - 30;
            document.documentElement.style.setProperty("--vh", `${actualVh}px`);

            const actualvw = `${window.innerWidth - 50}px`;
            document.documentElement.style.setProperty("--vw", `${actualvw}px`);

            const fileExploreHeadHight = 65;
            const fileExploreContentHight = innderHight - fileExploreHeadHight;

            document.documentElement.style.setProperty(
                "--avh",
                `${innderHight}px`
            );
            document.documentElement.style.setProperty(
                "--flhvh",
                `${fileExploreHeadHight}px`
            );
            document.documentElement.style.setProperty(
                "--flcvh",
                `${fileExploreContentHight}px`
            );
        };

        setHights();
        window.addEventListener("resize", setHights);

        return () => {
            window.removeEventListener("resize", setHights);
        };
    }, []);

    const [count, setCount] = useState(0);
    const IconBoxRef = useRef(null);
    if (IconBoxRef.current) {
        console.log(IconBoxRef.current);
    }
    return (
        <Provider store={Store}>
            <ToastContainer></ToastContainer>
            <HomePage></HomePage>
        </Provider>
    );
}

export default App;
