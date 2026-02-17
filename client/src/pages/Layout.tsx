import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNavbar from "../components/BottomNavbar";

const Layout = () => {
    return (
        <div className="layout-container">
            <Sidebar />

            <div className="flex-1 overflow-y-scroll">
                <Outlet />
            </div>

            <BottomNavbar />
        </div>
    );
};

export default Layout;
