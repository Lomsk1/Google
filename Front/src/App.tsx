import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import HomePage from "./pages/home";
import DashboardPage from "./pages/dashboard";
import RootLayout from "./components/rootLayout";
import LoginPage from "./pages/login";
import PrivateRoute from "./hoc/protectedRoute";
import GoogleSuccess from "./pages/successGoogle";
import CalendarPage from "./pages/calendar";

const route = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />

        <Route
          path="/login"
          // loader={loginLoader}
          element={<LoginPage />}
        />
        <Route path="/login/success" element={<GoogleSuccess />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Route>
    </>
  )
);

function App() {
  return <RouterProvider router={route} />;
}

export default App;
