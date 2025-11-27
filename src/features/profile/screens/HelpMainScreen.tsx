import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import Header from "../../../components/Header";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;


const { width, height } = Dimensions.get("window");

const HelpAllInOne: React.FC = () => {
  const [screen, setScreen] = useState<"main" | "section" | "detail">("main");
    const navigation = useNavigation<NavigationProp>();
      const handleBackPress = () => {
    navigation.goBack();
  };


  return (
    <View style={styles.container}>
   <Header
  title={screen === "main" ? "Help" : screen === "section" ? "Help" : "What is ADRYD?"}
  onBackPress={() => {
    if (screen === "detail") setScreen("section");
    else if (screen === "section") setScreen("main");
    else navigation.goBack(); // ← add this for main screen
  }}
/>


      {/* ---------------------- MAIN SCREEN ---------------------- */}
      {screen === "main" && (
        <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#70737D" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#70737D"
              style={styles.searchInput}
            />
          </View>

          {/* Title */}
          <Text style={styles.rightTitle}> 8 Collections</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Big Card */}
          <TouchableOpacity
            style={styles.bigCard}
            onPress={() => setScreen("section")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bigCardTitle}>Campaign</Text>
              <Text style={styles.bigCardDesc}>
                Open the Tradebase app to get started and follow the steps.
                Tradebase doesn’t charge a fee to create or maintain your
                Tradebase account.
              </Text>
              <Text style={{fontSize:10,fontWeight:"400", marginTop:10, color:"#70737D"}}>9 articles</Text>
            </View>

            <Ionicons name="chevron-forward" size={15} color="#70737D" style={{alignSelf:"center"}} />
          </TouchableOpacity>
             <View style={styles.divider} />
                  <TouchableOpacity
            style={styles.bigCard}
            onPress={() => setScreen("section")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bigCardTitle}>Campaign</Text>
              <Text style={styles.bigCardDesc}>
                Open the Tradebase app to get started and follow the steps.
                Tradebase doesn’t charge a fee to create or maintain your
                Tradebase account.
              </Text>
                 <Text style={{fontSize:10,fontWeight:"400", marginTop:10, color:"#70737D"}}>9 articles</Text>
            </View>

            <Ionicons name="chevron-forward" size={15} color="#70737D" style={{alignSelf:"center"}} />
          </TouchableOpacity>
                   <View style={styles.divider} />
                              <TouchableOpacity
            style={styles.bigCard}
            onPress={() => setScreen("section")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bigCardTitle}>Campaign</Text>
              <Text style={styles.bigCardDesc}>
                Open the Tradebase app to get started and follow the steps.
                Tradebase doesn’t charge a fee to create or maintain your
                Tradebase account.
              </Text>
                 <Text style={{fontSize:10,fontWeight:"400", marginTop:10, color:"#70737D"}}>9 articles</Text>
            </View>

            <Ionicons name="chevron-forward" size={15} color="#70737D" style={{alignSelf:"center"}} />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ---------------------- SECTION SCREEN ---------------------- */}
      {screen === "section" && (
        <View style={{ paddingTop: 20 }}>
              <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#70737D" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#70737D"
              style={styles.searchInput}
            />
          </View>
                <View style={{ padding:20}}>
              <Text style={styles.bigCardTitle}>Campaign</Text>
              <Text style={styles.bigCardDesc}>
                Open the Tradebase app to get started and follow the steps.
                Tradebase doesn’t charge a fee to create or maintain your
                Tradebase account.
              </Text>
            </View>
          
 
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => setScreen("detail")}
          >
            <Text style={styles.cardText}>What is ADRYD?</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
          
        </View>
      )}

      {/* ---------------------- DETAIL SCREEN ---------------------- */}
      {screen === "detail" && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.mainTitle}>What is ADRYD?</Text>
          <Text style={styles.subtitle}>About Adryd</Text>

          {/* Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.profileCircle} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.infoText}>Written by ADRYD</Text>
              <Text style={styles.infoSub}>Updated over 3 years ago</Text>
            </View>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle2}>Campaign</Text>

          {/* Description */}
          <Text style={styles.desc}>
            Open the Tradebase app to get started and follow the steps. Tradebase
            doesn’t charge a fee to create or maintain your Tradebase account.
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

export default HelpAllInOne;

/* ---------------------- STYLES ---------------------- */


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },

  /* MAIN */
  searchBar: {
    width: width * 0.897, 
    height: height * 0.050, // 35 / 844
    borderRadius: width * 0.018, // 7 / 390
    borderWidth: 0.7,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.025, // 10 / 390
    alignSelf: "center",
    gap: width * 0.013, // 5 / 390
    backgroundColor: "#fff",
  },

  searchInput: { flex: 1, fontSize: 12, color: "#000" },

  rightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    alignSelf: "flex-start",
    marginLeft: width * 0.090, 
    marginTop: height * 0.018, 
  },

  divider: {
    width: width * 0.897, 
    height: 0,
    borderWidth: 0.4,
    borderColor: "#E5E7EB",
    alignSelf: "center",
    marginVertical: height * 0.019, 
  },

  bigCard: {
    width: width * 0.897, 
    minHeight: height * 0.167,

    alignSelf: "center",
    padding: width * 0.051, 
    flexDirection: "row",
    gap: width * 0.051, 
  
  },

  bigCardTitle: { fontSize: 14, fontWeight: "500", marginBottom: height * 0.009, color:"#18181B", }, 
  bigCardDesc: { fontSize: 12, color: "#18181B", lineHeight: height * 0.021 }, 

  /* SECTION */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: width * 0.051,
    marginBottom: height * 0.024, 
  },

  smallCard: {
    width: width * 0.897, 
    height: height * 0.040, 
    borderBottomWidth: 0.3,
    borderColor: "#E5E7EB",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    
  },

  cardText: { fontSize: 12, fontWeight: "500" },

  /* DETAIL */
  mainTitle: { fontSize: 22, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#70737D", marginTop: height * 0.006 }, 

  infoRow: { flexDirection: "row", alignItems: "center", marginTop: height * 0.024 }, 

  profileCircle: {
    width: width * 0.072,
    height: width * 0.072,
    borderRadius: width * 0.036,
    borderWidth: 0.39,
    borderColor: "#E5E7EB",
  },

  infoText: { fontSize: 8, fontWeight: "400", color:"#70737D" },
  infoSub: { fontSize: 8, color: "#70737D" },

  sectionTitle2: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: height * 0.035,
    marginBottom: height * 0.012, 
  },

  desc: { fontSize: 12, lineHeight: height * 0.024, color: "#70737D" }, 
});