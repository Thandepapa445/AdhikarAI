import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Text } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import QuickSubmitScreen from "./src/screens/QuickSubmitScreen";
import MyChallengesScreen from "./src/screens/MyChallengesScreen";
import PilotVerifyScreen from "./src/screens/PilotVerifyScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="QuickSubmit" component={QuickSubmitScreen} />
            <Stack.Screen name="PilotVerify" component={PilotVerifyScreen} />
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: "#0284c7",
                    tabBarInactiveTintColor: "#64748b",
                    tabBarStyle: {
                        height: 60,
                        paddingBottom: 8,
                        paddingTop: 6,
                        backgroundColor: "#ffffff",
                        borderTopColor: "#e2e8f0"
                    },
                    tabBarIcon: ({ focused }) => {
                        let icon = "🏠";
                        if (route.name === "Home") icon = "🏠";
                        else if (route.name === "Submit") icon = "➕";
                        else if (route.name === "MyChallenges") icon = "📋";
                        return <Text style={{ fontSize: 20 }}>{icon}</Text>;
                    }
                })}
            >
                <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: "Home Feed" }} />
                <Tab.Screen name="Submit" component={QuickSubmitScreen} options={{ tabBarLabel: "Quick Report" }} />
                <Tab.Screen name="MyChallenges" component={MyChallengesScreen} options={{ tabBarLabel: "My Tracked" }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
