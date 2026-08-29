import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { THEMATIC_DOMAINS, JHARKHAND_DISTRICTS, PARTICIPATING_HEIS } from "../data/jharkhandData";
import { MapPin, Building, Eye, Users, Award, Filter } from "lucide-react";

// Fix Leaflet Default Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [23.6102, 85.2799]; // Jharkhand Center

// Custom Map Marker Icons
function createChallengeIcon(domain, status) {
    const isResolved = status === "RESOLVED";
    const isPilot = status === "PILOT";
    const bg = isResolved ? "#16a34a" : isPilot ? "#ea580c" : "#0284c7";
    const symbol = isResolved ? "✓" : isPilot ? "🚀" : "💡";

    return L.divIcon({
        className: "custom-map-pin",
        html: `
            <div style="
                background: ${bg};
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 2px solid #ffffff;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <span style="
                    transform: rotate(45deg);
                    font-size: 13px;
                    color: #ffffff;
                    font-weight: bold;
                ">${symbol}</span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

function createHeiIcon() {
    return L.divIcon({
        className: "hei-map-pin",
        html: `
            <div style="
                background: #7c3aed;
                width: 30px;
                height: 30px;
                border-radius: 8px;
                border: 2px solid #ffffff;
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 14px;
            ">
                🎓
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
}

function MapAutoFit({ challenges }) {
    const map = useMap();
    useEffect(() => {
        const valid = challenges.filter(c => c.lat && c.lng);
        if (valid.length > 0) {
            const bounds = L.latLngBounds(valid.map(c => [Number(c.lat), Number(c.lng)]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
    }, [challenges, map]);
    return null;
}

export default function CommunityInnovationMap({ challenges = [], onSelectChallenge }) {
    const [selectedDomain, setSelectedDomain] = useState("ALL");
    const [selectedDistrict, setSelectedDistrict] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [showHeis, setShowHeis] = useState(true);

    const filteredChallenges = challenges.filter(c => {
        const matchDomain = selectedDomain === "ALL" || c.domain === selectedDomain;
        const matchDistrict = selectedDistrict === "ALL" || c.district === selectedDistrict;
        const matchStatus = selectedStatus === "ALL" || c.status === selectedStatus;
        const hasCoords = c.lat && c.lng;
        return matchDomain && matchDistrict && matchStatus && hasCoords;
    });

    return (
        <div style={styles.container}>
            {/* Map Filter Toolbar */}
            <div style={styles.filterBar}>
                <div style={styles.filterGroup}>
                    <Filter size={15} color="#475569" />
                    <span style={styles.filterLabel}>GIS Filters:</span>

                    <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">All 9 Thematic Domains</option>
                        {THEMATIC_DOMAINS.map(d => (
                            <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">All 24 Districts</option>
                        {JHARKHAND_DISTRICTS.map(d => (
                            <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">All Lifecycle Stages</option>
                        <option value="SUBMITTED">1. Submitted</option>
                        <option value="VALIDATED">2. Validated</option>
                        <option value="RESEARCH">4. In Research & Design</option>
                        <option value="PROTOTYPE">5. Prototyping</option>
                        <option value="TESTING">6. Lab Testing</option>
                        <option value="PILOT">7. Community Field Pilot</option>
                        <option value="RESOLVED">8. Deployed & Verified</option>
                    </select>
                </div>

                <div style={styles.filterGroupRight}>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={showHeis}
                            onChange={(e) => setShowHeis(e.target.checked)}
                            style={{ marginRight: 6 }}
                        />
                        <span>Show University Campuses (HEIs)</span>
                    </label>

                    <span style={styles.countBadge}>
                        {filteredChallenges.length} Geotagged Challenges
                    </span>
                </div>
            </div>

            {/* Leaflet Map */}
            <div style={styles.mapWrapper}>
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={8}
                    scrollWheelZoom={true}
                    style={{ width: "100%", height: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapAutoFit challenges={filteredChallenges} />

                    {/* Challenge Markers */}
                    {filteredChallenges.map(challenge => (
                        <Marker
                            key={challenge.id}
                            position={[Number(challenge.lat), Number(challenge.lng)]}
                            icon={createChallengeIcon(challenge.domain, challenge.status)}
                        >
                            <Popup>
                                <div style={styles.popup}>
                                    <div style={styles.popupTag}>
                                        {challenge.domainName || challenge.domain} • {challenge.id}
                                    </div>
                                    <h4 style={styles.popupTitle}>{challenge.title}</h4>
                                    <p style={styles.popupMeta}>
                                        📍 {challenge.panchayat || "Panchayat"}, {challenge.block}, {challenge.district}
                                    </p>
                                    <div style={styles.popupImpact}>
                                        <Users size={13} color="#16a34a" />
                                        <span>Affects <strong>{challenge.affectedPopulation ? challenge.affectedPopulation.toLocaleString() : "500+"} villagers</strong></span>
                                    </div>
                                    {challenge.assignedHei && (
                                        <div style={styles.popupHei}>
                                            🎓 <strong>Assigned HEI:</strong> {challenge.assignedHei}
                                        </div>
                                    )}
                                    <div style={styles.popupStatus}>
                                        Status: <strong>{challenge.status}</strong>
                                    </div>
                                    <button
                                        onClick={() => onSelectChallenge(challenge)}
                                        style={styles.popupBtn}
                                    >
                                        <Eye size={13} /> View 8-Stage Progress
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Participating HEIs Markers */}
                    {showHeis && PARTICIPATING_HEIS.map(hei => (
                        <Marker
                            key={hei.id}
                            position={[hei.lat, hei.lng]}
                            icon={createHeiIcon()}
                        >
                            <Popup>
                                <div style={styles.popup}>
                                    <div style={{ ...styles.popupTag, background: "#ede9fe", color: "#7c3aed" }}>
                                        PARTICIPATING UNIVERSITY (HEI)
                                    </div>
                                    <h4 style={styles.popupTitle}>{hei.name}</h4>
                                    <p style={styles.popupMeta}>📍 {hei.district}, Jharkhand</p>
                                    <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px" }}>
                                        <strong>Specialized Labs:</strong>
                                        <ul style={{ paddingLeft: "16px", marginTop: "3px" }}>
                                            {hei.specializedLabs.slice(0, 2).map((lab, i) => (
                                                <li key={i}>{lab}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
        overflow: "hidden"
    },
    filterBar: {
        padding: "14px 20px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
    },
    filterGroup: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
    },
    filterGroupRight: {
        display: "flex",
        alignItems: "center",
        gap: "14px"
    },
    filterLabel: {
        fontSize: "13px",
        fontWeight: 700,
        color: "#475569"
    },
    select: {
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "12.5px",
        background: "#ffffff",
        color: "#0f172a"
    },
    checkboxLabel: {
        fontSize: "12.5px",
        color: "#475569",
        display: "flex",
        alignItems: "center",
        cursor: "pointer"
    },
    countBadge: {
        background: "#e0f2fe",
        color: "#0369a1",
        fontSize: "12px",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: "12px"
    },
    mapWrapper: {
        width: "100%",
        height: "560px"
    },
    popup: {
        minWidth: "220px",
        maxWidth: "280px"
    },
    popupTag: {
        fontSize: "10px",
        fontWeight: 700,
        color: "#0284c7",
        background: "#e0f2fe",
        padding: "2px 6px",
        borderRadius: "4px",
        display: "inline-block",
        marginBottom: "4px"
    },
    popupTitle: {
        fontSize: "13.5px",
        fontWeight: 700,
        color: "#0f172a",
        margin: "0 0 4px 0",
        lineHeight: 1.3
    },
    popupMeta: {
        fontSize: "11.5px",
        color: "#64748b",
        margin: "0 0 6px 0"
    },
    popupImpact: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11.5px",
        color: "#16a34a",
        marginBottom: "4px"
    },
    popupHei: {
        fontSize: "11.5px",
        color: "#7c3aed",
        marginBottom: "6px",
        background: "#f5f3ff",
        padding: "4px 6px",
        borderRadius: "6px"
    },
    popupStatus: {
        fontSize: "11.5px",
        color: "#475569",
        marginBottom: "8px"
    },
    popupBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        background: "#0284c7",
        color: "#ffffff",
        padding: "6px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600
    }
};
