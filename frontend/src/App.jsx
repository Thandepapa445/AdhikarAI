import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewChallenge from "./pages/NewChallenge";
import AdminDashboard from "./pages/AdminDashboard";
import UniversityDashboard from "./pages/UniversityDashboard";
import SocietyResidentPortal from "./pages/SocietyResidentPortal";
import SocietyManagerDashboard from "./pages/SocietyManagerDashboard";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Civic Platform Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/challenges/new" element={<NewChallenge />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/university" element={<UniversityDashboard />} />

                {/* 2. Residential Society Platform Routes (Phase 2) */}
                <Route path="/society/resident" element={<SocietyResidentPortal />} />
                <Route path="/society/submit" element={<SocietyResidentPortal />} />
                <Route path="/society/manager" element={<SocietyManagerDashboard />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Default redirect to Citizen Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
