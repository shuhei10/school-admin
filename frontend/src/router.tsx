import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RequireAuth from "./auth/RequireAuth";
import AppShell from "./layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          {
            element: <RequireAuth allowedRoles={["admin", "instructor"]} />,
            children: [
              { path: "students", element: <Students /> },
              { path: "courses", element: <Courses /> },
              { path: "courses/:id", element: <CourseDetail /> },
            ],
          },
        ],
      },
    ],
  },
]);