import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    SafeAreaView, StatusBar, RefreshControl
} from "react-native";
import { THEMATIC_DOMAINS, STAGES_OF_INNOVATION } from "../data/mobileData";
import { mobileApiService } from "../services/mobileApi";

export default function HomeScreen({ navigation }) {
    const [challenges, setChallenges] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState("ALL");

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

    const pendingPilot = challenges.find(c => c.status === "PILOT" && c.citizenVerificationRequested);

    const filtered = selectedDomain === "ALL"
        ? challenges
        : challenges.filter(c => c.domain === selectedDomain);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Top Brand Banner */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoText}>✨</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Sankalp <Text style={{ color: "#38bdf8" }}>AI</Text></Text>
                        <Text style={styles.headerSub}>Jharkhand Citizen Innovation Portal</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.newReportBtn}
                    onPress={() => navigation.navigate("QuickSubmit")}
                >
                    <Text style={styles.newReportBtnText}>+ Report</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Urgent Pilot Verification Alert Banner if active */}
                {pendingPilot && (
                    <TouchableOpacity
                        style={styles.alertBanner}
                        onPress={() => navigation.navigate("PilotVerify", { challenge: pendingPilot })}
                    >
                        <Text style={styles.alertIcon}>⚡</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.alertTitle}>Action Required: Field Pilot Ready</Text>
                            <Text style={styles.alertSub}>
                                BIT Mesra deployed water filter in {pendingPilot.panchayat}. Tap to verify.
                            </Text>
                        </View>
                        <Text style={styles.alertArrow}>→</Text>
                    </TouchableOpacity>
                )}

                {/* Impact Counters */}
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiVal}>{challenges.length}</Text>
                        <Text style={styles.kpiLabel}>Crowdsourced</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={[styles.kpiVal, { color: "#7c3aed" }]}>
                            {challenges.filter(c => ["RESEARCH", "PROTOTYPE", "TESTING", "PILOT"].includes(c.status)).length}
                        </Text>
                        <Text style={styles.kpiLabel}>In University R&D</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={[styles.kpiVal, { color: "#16a34a" }]}>
                            {challenges.filter(c => c.status === "RESOLVED").length}
                        </Text>
                        <Text style={styles.kpiLabel}>Verified Solved</Text>
                    </View>
                </View>

                {/* 9 Thematic Domain Carousel */}
                <Text style={styles.sectionTitle}>Explore by 9 Thematic Domains</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.domainScroll}>
                    <TouchableOpacity
                        style={[styles.domainPill, selectedDomain === "ALL" && styles.domainPillActive]}
                        onPress={() => setSelectedDomain("ALL")}
                    >
                        <Text style={[styles.domainPillText, selectedDomain === "ALL" && styles.domainPillTextActive]}>
                            All ({challenges.length})
                        </Text>
                    </TouchableOpacity>
                    {THEMATIC_DOMAINS.map(d => (
                        <TouchableOpacity
                            key={d.id}
                            style={[styles.domainPill, selectedDomain === d.id && styles.domainPillActive]}
                            onPress={() => setSelectedDomain(d.id)}
                        >
                            <Text style={[styles.domainPillText, selectedDomain === d.id && styles.domainPillTextActive]}>
                                {d.icon} {d.name.split(" ")[0]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recent Challenges Feed */}
                <Text style={styles.sectionTitle}>Community Problems in Progress</Text>
                {filtered.map(item => {
                    const stageIndex = STAGES_OF_INNOVATION.findIndex(s => s.key === item.status);
                    const stageObj = STAGES_OF_INNOVATION[stageIndex >= 0 ? stageIndex : 0];

                    return (
                        <View key={item.id} style={styles.challengeCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.challengeId}>{item.id}</Text>
                                <View style={[
                                    styles.urgencyBadge,
                                    item.urgency === "CRITICAL" ? styles.urgencyCrit : styles.urgencyHigh
                                ]}>
                                    <Text style={styles.urgencyText}>{item.urgency}</Text>
                                </View>
                            </View>

                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                            <Text style={styles.locText}>📍 {item.panchayat || item.block}, {item.district}</Text>

                            {/* Stage Stepper Mini Bar */}
                            <View style={styles.stageBarWrap}>
                                <Text style={styles.stageLabel}>
                                    Stage {stageObj.step}/8: <Text style={{ fontWeight: "700" }}>{stageObj.label}</Text>
                                </Text>
                                <View style={styles.stageProgressBg}>
                                    <View style={[styles.stageProgressFill, { width: `${(stageObj.step / 8) * 100}%` }]} />
                                </View>
                            </View>

                            {item.assignedHei && (
                                <Text style={styles.heiText}>🎓 {item.assignedHei.split(",")[0]}</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    logoBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#0284c7",
        justifyContent: "center",
        alignItems: "center"
    },
    logoText: {
        fontSize: 18
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#ffffff"
    },
    headerSub: {
        fontSize: 10.5,
        color: "#94a3b8"
    },
    newReportBtn: {
        backgroundColor: "#0284c7",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    newReportBtnText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 12
    },
    scroll: {
        flex: 1,
        padding: 16
    },
    alertBanner: {
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 14
    },
    alertIcon: {
        fontSize: 20
    },
    alertTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#dc2626"
    },
    alertSub: {
        fontSize: 11,
        color: "#991b1b",
        marginTop: 2
    },
    alertArrow: {
        fontSize: 16,
        fontWeight: "700",
        color: "#dc2626"
    },
    kpiGrid: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 16
    },
    kpiCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        alignItems: "center"
    },
    kpiVal: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0f172a"
    },
    kpiLabel: {
        fontSize: 9.5,
        color: "#64748b",
        marginTop: 2,
        textAlign: "center"
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#0f172a",
        marginVertical: 8
    },
    domainScroll: {
        marginBottom: 14
    },
    domainPill: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8
    },
    domainPillActive: {
        backgroundColor: "#0284c7",
        borderColor: "#0284c7"
    },
    domainPillText: {
        fontSize: 11.5,
        color: "#475569",
        fontWeight: "600"
    },
    domainPillTextActive: {
        color: "#ffffff"
    },
    challengeCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginBottom: 12
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4
    },
    challengeId: {
        fontSize: 11,
        fontWeight: "800",
        color: "#0284c7"
    },
    urgencyBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    urgencyCrit: {
        backgroundColor: "#fee2e2"
    },
    urgencyHigh: {
        backgroundColor: "#ffedd5"
    },
    urgencyText: {
        fontSize: 9.5,
        fontWeight: "800",
        color: "#b91c1c"
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4
    },
    cardDesc: {
        fontSize: 12,
        color: "#64748b",
        lineHeight: 16,
        marginBottom: 6
    },
    locText: {
        fontSize: 11,
        color: "#334155",
        fontWeight: "600",
        marginBottom: 8
    },
    stageBarWrap: {
        backgroundColor: "#f1f5f9",
        borderRadius: 6,
        padding: 6,
        marginBottom: 6
    },
    stageLabel: {
        fontSize: 10,
        color: "#475569",
        marginBottom: 4
    },
    stageProgressBg: {
        height: 4,
        backgroundColor: "#cbd5e1",
        borderRadius: 2,
        overflow: "hidden"
    },
    stageProgressFill: {
        height: "100%",
        backgroundColor: "#0284c7"
    },
    heiText: {
        fontSize: 10.5,
        color: "#7c3aed",
        fontWeight: "700"
    }
});
