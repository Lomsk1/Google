import { Link, Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <Link to={"/"}>Home</Link>
            </li>
            <li>
              <Link to={"/calendar"}>Calendar</Link>
            </li>
            <li>
              <Link to={"/login"}>Login</Link>
            </li>
            <li>
              <Link to={"/dashboard"}>Dashboard</Link>
            </li>
          </ul>
        </nav>
      </header>

      <Outlet />
    </>
  );
}

export default RootLayout;
