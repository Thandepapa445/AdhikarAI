import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewChallenge from "./pages/NewChallenge";
import AdminDashboard from "./pages/AdminDashboard";
import UniversityDashboard from "./pages/UniversityDashboard";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Citizen & Gram Panchayat Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Submit New Societal Challenge */}
                <Route path="/challenges/new" element={<NewChallenge />} />

                {/* State Nodal Officer & Admin Command Center */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Higher Education Institutions (HEIs) & Faculty Portal */}
                <Route path="/university" element={<UniversityDashboard />} />

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
