import React, { useState } from "react";
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    SafeAreaView, Alert, ActivityIndicator
} from "react-native";
import { mobileApiService } from "../services/mobileApi";

export default function PilotVerifyScreen({ route, navigation }) {
    const { challenge } = route.params || {
        challenge: {
            id: "JH-2026-0101",
            title: "High Fluoride & Arsenic in Village Drinking Water Handpumps",
            panchayat: "Satbarwa Khurd",
            district: "Palamu",
            assignedHei: "BIT Mesra, Ranchi",
            prototypeDetails: "Gravity-Fed Nano-Activated Alumina Adsorption Filter Column."
        }
    };

    const [feedback, setFeedback] = useState(
        "Field pilot tested on ground in Satbarwa Khurd. Water output is clear and safe for community consumption."
    );
    const [submitting, setSubmitting] = useState(false);

    const handleConfirmSignoff = async () => {
        setSubmitting(true);
        await mobileApiService.verifyPilot(challenge.id, feedback);
        setSubmitting(false);

        Alert.alert(
            "✓ Field Pilot Signed Off!",
            `Challenge #${challenge.id} marked as DEPLOYED & VERIFIED.\nCitizen verification recorded for State Innovation Council.`,
            [{ text: "Done", onPress: () => navigation.navigate("Home") }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⚡ Citizen Field Verification</Text>
                <Text style={styles.headerSub}>Official Sign-off for Deployed Village Pilot</Text>
            </View>

            <ScrollView style={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.badge}>STAGE 7: COMMUNITY FIELD PILOT</Text>
                    <Text style={styles.title}>{challenge.title}</Text>
                    <Text style={styles.loc}>📍 Location: {challenge.panchayat}, {challenge.district}</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Deployed by University:</Text>
                        <Text style={styles.val}>🎓 {challenge.assignedHei}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Installed Technology:</Text>
                        <Text style={styles.val}>🛠️ {challenge.prototypeDetails || "Hardware Prototype Unit"}</Text>
                    </View>
                </View>

                {/* Verification Checklist */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Verification Checklist</Text>
                    <View style={styles.checkItem}>
                        <Text style={styles.checkIcon}>✓</Text>
                        <Text style={styles.checkText}>Hardware unit physically installed in target village.</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Text style={styles.checkIcon}>✓</Text>
                        <Text style={styles.checkText}>Water / Output tested and operational under village usage.</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Text style={styles.checkIcon}>✓</Text>
                        <Text style={styles.checkText}>Panchayat representatives and community members trained.</Text>
                    </View>
                </View>

                {/* Feedback Input */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Citizen / Panchayat Sign-off Remarks</Text>
                    <TextInput
                        style={styles.textarea}
                        value={feedback}
                        onChangeText={setFeedback}
                        multiline
                        numberOfLines={4}
                        placeholder="Enter ground feedback..."
                    />
                </View>

                <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleConfirmSignoff}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.confirmBtnText}>✓ Confirm & Sign-off Field Pilot Deployment</Text>
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
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 14
    },
    badge: {
        backgroundColor: "#e0f2fe",
        color: "#0369a1",
        fontSize: 10,
        fontWeight: "800",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: "flex-start",
        marginBottom: 6
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4
    },
    loc: {
        fontSize: 11.5,
        color: "#64748b",
        marginBottom: 10
    },
    infoRow: {
        marginTop: 6
    },
    label: {
        fontSize: 10,
        color: "#64748b",
        fontWeight: "700"
    },
    val: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0f172a",
        marginTop: 1
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: "800",
        color: "#0f172a",
        marginBottom: 8
    },
    checkItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6
    },
    checkIcon: {
        color: "#16a34a",
        fontWeight: "800",
        fontSize: 14
    },
    checkText: {
        fontSize: 11.5,
        color: "#334155",
        flex: 1
    },
    textarea: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 8,
        padding: 10,
        fontSize: 12,
        color: "#0f172a",
        height: 70,
        textAlignVertical: "top"
    },
    confirmBtn: {
        backgroundColor: "#16a34a",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        marginBottom: 30
    },
    confirmBtnText: {
        color: "#ffffff",
        fontWeight: "800",
        fontSize: 13.5
    }
});
