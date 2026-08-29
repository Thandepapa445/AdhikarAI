import React, { useState } from "react";
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Alert
} from "react-native";
import { JHARKHAND_DISTRICTS, THEMATIC_DOMAINS } from "../data/mobileData";
import { mobileApiService } from "../services/mobileApi";

export default function QuickSubmitScreen({ navigation }) {
    const [submitterName, setSubmitterName] = useState("");
    const [district, setDistrict] = useState("Palamu");
    const [block, setBlock] = useState("Satbarwa");
    const [panchayat, setPanchayat] = useState("");
    const [gpsText, setGpsText] = useState("");
    const [isLocating, setIsLocating] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [domain, setDomain] = useState("WATER");
    const [urgency, setUrgency] = useState("HIGH");

    // Camera & YOLO states
    const [isCapturing, setIsCapturing] = useState(false);
    const [yoloResult, setYoloResult] = useState(null);

    // Voice state
    const [isRecording, setIsRecording] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 1-Tap Mobile GPS simulation
    const handleDetectGPS = () => {
        setIsLocating(true);
        setTimeout(() => {
            setIsLocating(false);
            setGpsText("GPS Locked: 23.9241° N, 84.2384° E");
            Alert.alert("📍 GPS Coordinates Acquired", "Lat: 23.9241° N, Lng: 84.2384° E\nDistrict: Palamu | Block: Satbarwa");
        }, 1000);
    };

    // Camera snapshot simulation with YOLO inference
    const handleCameraSnapshot = async () => {
        setIsCapturing(true);
        const result = await mobileApiService.detectHazardWithYOLO("mock_evidence_uri");
        setIsCapturing(false);
        setYoloResult(result);
        if (result.recommendedDomain) {
            setDomain(result.recommendedDomain);
        }
        Alert.alert("🤖 YOLOv8 Evidence Verified", `Detected: ${result.primaryClass} (${result.confidencePercent || "89.4%"})\nDomain auto-set to: ${result.recommendedDomain}`);
    };

    // Vernacular Voice Note simulation
    const handleVoiceRecord = () => {
        if (!isRecording) {
            setIsRecording(true);
            setTimeout(() => {
                setDescription(prev => (prev ? prev + " " : "") + "हमारे पंचायत में पीने के पानी में फ्लोराइड की मात्रा बहुत अधिक है।");
                setIsRecording(false);
            }, 1800);
        } else {
            setIsRecording(false);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert("Missing Fields", "Please enter title and problem description.");
            return;
        }

        setSubmitting(true);
        const newChallenge = {
            title,
            description,
            domain,
            domainName: THEMATIC_DOMAINS.find(d => d.id === domain)?.name || "Water Resources",
            urgency,
            submitterType: "GRAM_PANCHAYAT",
            submitterName: submitterName || "Panchayat Representative",
            district,
            block,
            panchayat: panchayat || `${block} Khurd`,
            affectedPopulation: 1200,
            assignedHei: "BIT Mesra, Ranchi",
            facultyMentor: "Dr. Arvind Sharma (Water & Environmental Engg)",
            industryPartner: "Tata Steel Foundation"
        };

        await mobileApiService.createChallenge(newChallenge);
        setSubmitting(false);
        Alert.alert("🎉 Report Submitted", "Your societal challenge has been routed to the State Innovation Council & University FabLabs.", [
            { text: "OK", onPress: () => navigation.navigate("Home") }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📸 Report Societal Challenge</Text>
                <Text style={styles.headerSub}>3-Step Mobile Submission Wizard</Text>
            </View>

            <ScrollView style={styles.scroll}>
                {/* Step 1: Location */}
                <View style={styles.stepBox}>
                    <Text style={styles.stepHeader}>Step 1: Submitter & Village Location</Text>

                    <Text style={styles.label}>Your Name / Panchayat Representative</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Rajesh Oraon (Mukhya)"
                        value={submitterName}
                        onChangeText={setSubmitterName}
                    />

                    <Text style={styles.label}>District & Block</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="District"
                            value={district}
                            onChangeText={setDistrict}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Block"
                            value={block}
                            onChangeText={setBlock}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.gpsBtn}
                        onPress={handleDetectGPS}
                        disabled={isLocating}
                    >
                        <Text style={styles.gpsBtnText}>
                            {isLocating ? "🛰️ Locking GPS Satellites..." : "📍 1-Tap Auto-Detect GPS Location"}
                        </Text>
                    </TouchableOpacity>

                    {gpsText ? <Text style={styles.gpsSuccessText}>✓ {gpsText}</Text> : null}
                </View>

                {/* Step 2: Camera Capture */}
                <View style={styles.stepBox}>
                    <Text style={styles.stepHeader}>Step 2: Camera Photo Evidence</Text>
                    <TouchableOpacity
                        style={styles.cameraBtn}
                        onPress={handleCameraSnapshot}
                        disabled={isCapturing}
                    >
                        <Text style={styles.cameraIcon}>📸</Text>
                        <Text style={styles.cameraBtnText}>
                            {isCapturing ? "Analyzing with YOLOv8 Vision..." : "Take Camera Snapshot of Hazard"}
                        </Text>
                    </TouchableOpacity>

                    {yoloResult && (
                        <View style={styles.yoloBox}>
                            <Text style={styles.yoloTitle}>✓ YOLOv8 Vision Verified</Text>
                            <Text style={styles.yoloSub}>
                                Hazard: <Text style={{ fontWeight: "700" }}>{yoloResult.primaryClass}</Text> ({yoloResult.confidencePercent || "89.4%"})
                            </Text>
                        </View>
                    )}
                </View>

                {/* Step 3: Description & Voice */}
                <View style={styles.stepBox}>
                    <Text style={styles.stepHeader}>Step 3: Problem Description & Voice Note</Text>

                    <Text style={styles.label}>Problem Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Deep well fluoride contamination"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <View style={styles.descHeader}>
                        <Text style={styles.label}>Problem Details</Text>
                        <TouchableOpacity
                            style={[styles.voiceBtn, isRecording && styles.voiceBtnActive]}
                            onPress={handleVoiceRecord}
                        >
                            <Text style={styles.voiceBtnText}>
                                {isRecording ? "🔴 Listening..." : "🎙️ Speak in Hindi"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="Describe the issue, affected families, seasonal patterns..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Submit to State Innovation Council →</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc"
    },
    header: {
        backgroundColor: "#0f172a",
        padding: 16
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#ffffff"
    },
    headerSub: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 2
    },
    scroll: {
        flex: 1,
        padding: 16
    },
    stepBox: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 14
    },
    stepHeader: {
        fontSize: 13.5,
        fontWeight: "800",
        color: "#0284c7",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        paddingBottom: 6
    },
    label: {
        fontSize: 11,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 4
    },
    input: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 12.5,
        color: "#0f172a",
        marginBottom: 10,
        backgroundColor: "#ffffff"
    },
    textarea: {
        height: 80,
        textAlignVertical: "top"
    },
    row: {
        flexDirection: "row",
        gap: 8
    },
    gpsBtn: {
        backgroundColor: "#e0f2fe",
        borderWidth: 1,
        borderColor: "#bae6fd",
        borderRadius: 8,
        padding: 10,
        alignItems: "center"
    },
    gpsBtnText: {
        color: "#0284c7",
        fontSize: 12,
        fontWeight: "700"
    },
    gpsSuccessText: {
        fontSize: 10.5,
        color: "#16a34a",
        fontWeight: "700",
        marginTop: 4
    },
    cameraBtn: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#cbd5e1",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        backgroundColor: "#f8fafc"
    },
    cameraIcon: {
        fontSize: 24,
        marginBottom: 4
    },
    cameraBtnText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569"
    },
    yoloBox: {
        backgroundColor: "#ecfdf5",
        borderWidth: 1,
        borderColor: "#a7f3d0",
        borderRadius: 8,
        padding: 8,
        marginTop: 8
    },
    yoloTitle: {
        fontSize: 11.5,
        fontWeight: "800",
        color: "#166534"
    },
    yoloSub: {
        fontSize: 11,
        color: "#065f46",
        marginTop: 2
    },
    descHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4
    },
    voiceBtn: {
        backgroundColor: "#f1f5f9",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2
    },
    voiceBtnActive: {
        backgroundColor: "#fee2e2",
        borderColor: "#ef4444"
    },
    voiceBtnText: {
        fontSize: 10.5,
        fontWeight: "700",
        color: "#334155"
    },
    submitBtn: {
        backgroundColor: "#0284c7",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        marginBottom: 30
    },
    submitBtnText: {
        color: "#ffffff",
        fontWeight: "800",
        fontSize: 14
    }
});
