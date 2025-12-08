// Topbar.styles.ts
import { StyleSheet } from "react-native";
import { colors } from "../ui/colors";

export const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: "100%", 
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
 
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // push gauche ↔ droite
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkGray,
    paddingLeft: 20,
    
  },
  searchBar: {
    flexDirection: "row",
    flexGrow: 1, // occupe l’espace dispo
    flexShrink: 1, // se réduit si l’espace est petit
    flexBasis: 520, // largeur de base (comme CSS)
    maxWidth: 720,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    overflow: "hidden",
    flex:1
    
    
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 200,
    fontSize: 15,
    color: colors.darkGray,
    textAlign: "left",
  
  },
  searchButton: {
    backgroundColor: colors.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    color: colors.darkGray,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 8,
  },
  donateButton: {
    backgroundColor: colors.donatePink,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  donateText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
