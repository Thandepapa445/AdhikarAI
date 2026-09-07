import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, UserPlus } from "lucide-react";
import { INDIA_STATES_AND_REGIONS } from "../data/indiaData";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        stateName: "Delhi NCR",
        district: "North West Delhi",
        entityType: "CITIZEN",
        panchayatName: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        localStorage.setItem("adhikar_token", "mock_jwt_token_" + Date.now());
        localStorage.setItem("sankalp_token", "mock_jwt_token_" + Date.now());
        localStorage.setItem("adhikar_user_email", form.email);
        localStorage.setItem("adhikar_user_role", form.entityType);

        setTimeout(() => {
            setLoading(false);
            alert("Registration successful! Welcome to Adhikar AI - National Citizen Innovation & Grievance Portal.");
            navigate("/dashboard");
        }, 300);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.govBadge}>
                    <span>🇮🇳 National Citizen Portal • NEP 2020</span>
                </div>

                <div style={styles.logoBadge}>
                    <Sparkles size={24} color="#ffffff" />
                </div>

                <h1 style={styles.brandTitle}>Create Citizen / Submitter Account</h1>
                <p style={styles.brandSubtitle}>
                    Join the Adhikar AI National Innovation Ecosystem to submit and track community solutions
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name / Submitter Representative Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="e.g. Rajesh Kumar / Priya Sharma"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Entity Classification *</label>
                        <select
                            name="entityType"
                            value={form.entityType}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="CITIZEN">Individual Citizen / Resident</option>
                            <option value="GRAM_PANCHAYAT">Gram Panchayat / PRI (Mukhya / Ward)</option>
                            <option value="COMMUNITY_SHG">Self-Help Group (SHG) / Farmer Producer Org (FPO)</option>
                            <option value="LOCAL_BODY">Urban Local Body (ULB) / Ward Committee</option>
                        </select>
                    </div>

                    <div style={styles.grid2}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>District / City *</label>
                            <input
                                type="text"
                                name="district"
                                value={form.district}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="e.g. North West Delhi / Ghaziabad / Ranchi"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Panchayat / Ward / Area</label>
                            <input
                                type="text"
                                name="panchayatName"
                                value={form.panchayatName}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="e.g. Rohini Sector 16"
                            />
                        </div>
                    </div>

                    <div style={styles.grid2}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="name@domain.com"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        <span>{loading ? "Registering..." : "Register Citizen Account"}</span>
                        <ArrowRight size={17} />
                    </button>
                </form>

                <div style={styles.footerText}>
                    Already have an account?{" "}
                    <Link to="/login" style={styles.link}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "20px"
    },
    card: {
        background: "#ffffff",
        borderRadius: "24px",
        padding: "36px 32px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        textAlign: "center"
    },
    govBadge: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#0369a1",
        background: "#e0f2fe",
        padding: "4px 12px",
        borderRadius: "20px",
        display: "inline-block",
        marginBottom: "14px"
    },
    logoBadge: {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #0284c7 0%, #16a34a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 10px auto",
        boxShadow: "0 6px 16px rgba(2, 132, 199, 0.35)"
    },
    brandTitle: {
        fontSize: "22px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "4px"
    },
    brandSubtitle: {
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "20px"
    },
    form: {
        textAlign: "left"
    },
    grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px"
    },
    inputGroup: {
        marginBottom: "12px"
    },
    label: {
        fontSize: "12px",
        fontWeight: 600,
        color: "#334155",
        display: "block",
        marginBottom: "4px"
    },
    input: {
        width: "100%",
        padding: "9px 12px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        fontSize: "13px",
        color: "#0f172a",
        outline: "none"
    },
    submitBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        color: "#ffffff",
        padding: "12px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 700,
        boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
        marginTop: "10px"
    },
    footerText: {
        marginTop: "16px",
        fontSize: "12.5px",
        color: "#64748b"
    },
    link: {
        color: "#0284c7",
        fontWeight: 700,
        textDecoration: "none"
    }
};
