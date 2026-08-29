import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    SafeAreaView, RefreshControl
} from "react-native";
import { STAGES_OF_INNOVATION } from "../data/mobileData";
import { mobileApiService } from "../services/mobileApi";

export default function MyChallengesScreen({ navigation }) {
    const [challenges, setChallenges] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const data = await mobileApiService.getChallenges();
        setChallenges(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📋 My Submissions & Pilots</Text>
                <Text style={styles.headerSub}>Track 8-Stage Progression to Deployed Tech</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {challenges.map(item => {
                    const stageIndex = STAGES_OF_INNOVATION.findIndex(s => s.key === item.status);
                    const stageObj = STAGES_OF_INNOVATION[stageIndex >= 0 ? stageIndex : 0];
                    const isPilotReady = item.status === "PILOT" && item.citizenVerificationRequested;

                    return (
                        <View key={item.id} style={[styles.card, isPilotReady && styles.cardHighlight]}>
                            <View style={styles.cardTop}>
                                <Text style={styles.cardId}>{item.id}</Text>
                                <Text style={styles.cardDomain}>💧 {item.domainName || item.domain}</Text>
                            </View>

                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardLoc}>📍 {item.panchayat || item.block}, {item.district}</Text>

                            {/* 8-Stage Progress Meter */}
                            <View style={styles.stageBox}>
                                <View style={styles.stageRow}>
                                    <Text style={styles.stageStepText}>
                                        Stage {stageObj.step}/8: <Text style={{ fontWeight: "700" }}>{stageObj.label}</Text>
                                    </Text>
                                    <Text style={styles.stageDescText}>{stageObj.desc}</Text>
                                </View>
                                <View style={styles.progressTrack}>
                                    <View style={[
                                        styles.progressFill,
                                        {
                                            width: `${(stageObj.step / 8) * 100}%`,
                                            backgroundColor: stageObj.step === 8 ? "#16a34a" : "#0284c7"
                                        }
                                    ]} />
                                </View>
                            </View>

                            {/* University Team info */}
                            <View style={styles.teamBox}>
                                <Text style={styles.teamLabel}>Assigned HEI & Faculty Mentor:</Text>
                                <Text style={styles.teamVal}>🎓 {item.assignedHei}</Text>
                                <Text style={styles.mentorVal}>👨‍🏫 {item.facultyMentor}</Text>
                            </View>

                            {/* Citizen Pilot Sign-off Action if in Stage 7 */}
                            {isPilotReady && (
                                <TouchableOpacity
                                    style={styles.verifyBtn}
                                    onPress={() => navigation.navigate("PilotVerify", { challenge: item })}
                                >
                                    <Text style={styles.verifyBtnText}>⚡ Confirm & Verify Field Pilot →</Text>
                                </TouchableOpacity>
                            )}

                            {item.status === "RESOLVED" && (
                                <View style={styles.resolvedBadge}>
                                    <Text style={styles.resolvedText}>✓ Community Pilot Signed-Off & Deployed</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
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
    cardHighlight: {
        borderColor: "#f87171",
        backgroundColor: "#fffafa"
    },
    cardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
    },
    cardId: {
        fontSize: 11,
        fontWeight: "800",
        color: "#0284c7"
    },
    cardDomain: {
        fontSize: 10.5,
        color: "#64748b",
        fontWeight: "600"
    },
    cardTitle: {
        fontSize: 14.5,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4
    },
    cardLoc: {
        fontSize: 11,
        color: "#475569",
        marginBottom: 10
    },
    stageBox: {
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
        padding: 8,
        marginBottom: 10
    },
    stageRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4
    },
    stageStepText: {
        fontSize: 10.5,
        color: "#0f172a"
    },
    stageDescText: {
        fontSize: 10,
        color: "#64748b"
    },
    progressTrack: {
        height: 6,
        backgroundColor: "#cbd5e1",
        borderRadius: 3,
        overflow: "hidden"
    },
    progressFill: {
        height: "100%",
        borderRadius: 3
    },
    teamBox: {
        backgroundColor: "#f8fafc",
        padding: 8,
        borderRadius: 6,
        marginBottom: 10
    },
    teamLabel: {
        fontSize: 9.5,
        color: "#64748b",
        fontWeight: "700"
    },
    teamVal: {
        fontSize: 11.5,
        fontWeight: "700",
        color: "#7c3aed",
        marginTop: 2
    },
    mentorVal: {
        fontSize: 10.5,
        color: "#334155"
    },
    verifyBtn: {
        backgroundColor: "#dc2626",
        padding: 10,
        borderRadius: 8,
        alignItems: "center"
    },
    verifyBtnText: {
        color: "#ffffff",
        fontWeight: "800",
        fontSize: 12
    },
    resolvedBadge: {
        backgroundColor: "#ecfdf5",
        padding: 6,
        borderRadius: 6,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#a7f3d0"
    },
    resolvedText: {
        color: "#166534",
        fontWeight: "700",
        fontSize: 11
    }
});
