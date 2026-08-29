import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect } from "react";


// =====================================================
// FIX DEFAULT LEAFLET MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// =====================================================
// MAP CENTER
// =====================================================

const DEFAULT_CENTER = [28.6692, 77.4538];


// =====================================================
// FIT MAP TO COMPLAINTS
// =====================================================

function MapBounds({ complaints }) {

    const map = useMap();

    useEffect(() => {

        const validComplaints = complaints.filter(
            (complaint) =>
                complaint.latitude !== null &&
                complaint.latitude !== undefined &&
                complaint.longitude !== null &&
                complaint.longitude !== undefined
        );

        if (validComplaints.length === 0) {
            return;
        }

        const bounds = L.latLngBounds(
            validComplaints.map((complaint) => [
                Number(complaint.latitude),
                Number(complaint.longitude),
            ])
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
        });

    }, [complaints, map]);

    return null;
}


// =====================================================
// PRIORITY MARKER COLORS
// =====================================================

function getMarkerColor(priority) {

    switch (priority) {

        case "HIGH":
            return "#ef4444";

        case "MEDIUM":
            return "#f59e0b";

        case "LOW":
            return "#22c55e";

        default:
            return "#2563eb";
    }
}


// =====================================================
// CUSTOM MARKER
// =====================================================

function createMarkerIcon(priority) {

    const color = getMarkerColor(priority);

    return L.divIcon({

        className: "",

        html: `
            <div
                style="
                    width: 30px;
                    height: 30px;
                    background: ${color};
                    border: 3px solid white;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                "
            >
                <div
                    style="
                        width: 8px;
                        height: 8px;
                        background: white;
                        border-radius: 50%;
                    "
                ></div>
            </div>
        `,

        iconSize: [30, 30],

        iconAnchor: [15, 30],

        popupAnchor: [0, -30],
    });
}


// =====================================================
// MAIN COMPONENT
// =====================================================

function ComplaintMap({ complaints = [] }) {

    const validComplaints = complaints.filter(
        (complaint) =>
            complaint.latitude !== null &&
            complaint.latitude !== undefined &&
            complaint.longitude !== null &&
            complaint.longitude !== undefined
    );


    return (

        <div
            style={{
                width: "100%",
                height: "500px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                boxShadow:
                    "0 8px 30px rgba(15, 23, 42, 0.08)",
            }}
        >

            <MapContainer
                center={DEFAULT_CENTER}
                zoom={12}
                scrollWheelZoom={true}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >

                {/* =====================================
                    OPEN STREET MAP
                ===================================== */}

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {/* =====================================
                    AUTO FIT
                ===================================== */}

                <MapBounds
                    complaints={validComplaints}
                />


                {/* =====================================
                    COMPLAINT MARKERS
                ===================================== */}

                {validComplaints.map((complaint) => (

                    <Marker
                        key={complaint.id}
                        position={[
                            Number(complaint.latitude),
                            Number(complaint.longitude),
                        ]}
                        icon={createMarkerIcon(
                            complaint.priority
                        )}
                    >

                        <Popup>

                            <div
                                style={{
                                    minWidth: "220px",
                                    fontFamily:
                                        "Arial, sans-serif",
                                }}
                            >

                                <h3
                                    style={{
                                        margin:
                                            "0 0 8px 0",
                                        fontSize:
                                            "17px",
                                        color:
                                            "#0f172a",
                                    }}
                                >
                                    {complaint.title ||
                                        "Civic Complaint"}
                                </h3>


                                <p
                                    style={{
                                        margin:
                                            "0 0 8px 0",
                                        color:
                                            "#64748b",
                                        fontSize:
                                            "13px",
                                    }}
                                >
                                    Complaint #
                                    {complaint.id}
                                </p>


                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gap:
                                            "5px",
                                        fontSize:
                                            "13px",
                                    }}
                                >

                                    <div>
                                        <strong>
                                            Category:
                                        </strong>{" "}
                                        {complaint.aiCategory ||
                                            complaint.category ||
                                            "N/A"}
                                    </div>


                                    <div>
                                        <strong>
                                            Priority:
                                        </strong>{" "}
                                        <span
                                            style={{
                                                color:
                                                    getMarkerColor(
                                                        complaint.priority
                                                    ),
                                                fontWeight:
                                                    "700",
                                            }}
                                        >
                                            {complaint.priority ||
                                                "N/A"}
                                        </span>
                                    </div>


                                    <div>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {complaint.status ||
                                            "N/A"}
                                    </div>


                                    <div>
                                        <strong>
                                            Location:
                                        </strong>{" "}
                                        {complaint.location ||
                                            "N/A"}
                                    </div>

                                </div>


                                {complaint.description && (

                                    <p
                                        style={{
                                            margin:
                                                "10px 0 0 0",
                                            paddingTop:
                                                "10px",
                                            borderTop:
                                                "1px solid #e2e8f0",
                                            color:
                                                "#475569",
                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        {complaint.description}
                                    </p>

                                )}

                            </div>

                        </Popup>

                    </Marker>

                ))}

            </MapContainer>

        </div>
    );
}


export default ComplaintMap;