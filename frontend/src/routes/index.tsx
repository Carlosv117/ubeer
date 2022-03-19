import Login from "../pages/Login/index";
import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Signup from "../pages/Signup";
import DashBoard from "../pages/Dashboard";
import Sobre from "../pages/Sobre";
import Carteira from "../pages/Carteira";
import Preferences from "../pages/Preferences";

const RoutesPages = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Sobre />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashBoard />
          </PrivateRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <PrivateRoute>
            <Carteira />
          </PrivateRoute>
        }
      />
      <Route
        path="/preferences"
        element={
          <PrivateRoute>
            <Preferences />
          </PrivateRoute>
        }
      />
      <Route path="/history" element={<PrivateRoute>historico</PrivateRoute>} />
    </Routes>
  );
};

export default RoutesPages;
