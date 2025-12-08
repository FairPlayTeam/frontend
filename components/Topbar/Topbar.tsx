import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import {styles} from './Topbar.module'

const TextFr = {
  idleSearchBar: "Rechercher des vidéos",
  submitSearchBar: "Rechercher",
  login: "Se Connecter",
  signUp: "S'Inscrire",
  logout: "Se Déconnecter",
};

export const Topbar: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [TEXT, setTEXT] = useState({
    idleSearchBar: "Search videos",
    submitSearchBar: "Search",
    login: "Login",
    signUp: "Sign Up",
    logout: "Log Out",
  });

  const router = useRouter();

  useEffect(() => {
    const deviceLang = Intl?.DateTimeFormat().resolvedOptions().locale || "en";
    if (deviceLang.startsWith("fr")) {
      setTEXT(TextFr);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthed(false);
    router.push("/feed");
  }, [router]);

  return (
<View style={styles.header}>
  <View style={styles.container}>
    {/* Logo à gauche */}
    <Text style={{
      fontSize: 22,
        fontWeight: "700",
        color: "#333333",
        paddingLeft: 12,}}>FairPlay</Text>

    {/* Search au milieu */}
    <View style={styles.searchBar}>
      <TextInput
        placeholder="Rechercher des vidéos"
        style={styles.searchInput}
      />
      <TouchableOpacity style={styles.searchButton}>
        <FontAwesome name="search" size={18} color="black" />
      </TouchableOpacity>
    </View>

    {/* Actions à droite */}
    <View style={styles.headerActions}>
      {!isAuthed ? (
        <>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginButton}>Se Connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/login?register=true")}>
            <Text style={styles.loginButton}>S'Inscrire</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.loginButton}>Se Déconnecter</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.donateButton}
        onPress={() => Linking.openURL("https://ko-fi.com/fairplay_")}
      >
        <Text style={styles.donateText}>Donate</Text>
      </TouchableOpacity>
    </View>
  </View>
</View>


  );
};

