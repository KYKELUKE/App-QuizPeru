"use client";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  // Mock data for profile stats
  const stats = {
    quizzesTaken: 24,
    correctAnswers: 187,
    points: 1250,
    rank: "Explorador Inca",
  };

  // Mock data for achievements
  const achievements = [
    {
      id: 1,
      name: "Primer Quiz",
      description: "Completaste tu primer quiz",
      icon: "trophy",
      unlocked: true,
    },
    {
      id: 2,
      name: "Experto en Historia",
      description: "Responde correctamente 10 preguntas de historia",
      icon: "book",
      unlocked: true,
    },
    {
      id: 3,
      name: "Maestro Gastronómico",
      description: "Responde correctamente 15 preguntas de gastronomía",
      icon: "utensils",
      unlocked: false,
    },
    {
      id: 4,
      name: "Geógrafo Andino",
      description: "Completa todos los quizzes de geografía",
      icon: "mountain",
      unlocked: false,
    },
  ];

  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      type: "quiz",
      name: "Historia del Imperio Inca",
      result: "18/20",
      date: "Hoy",
    },
    {
      id: 2,
      type: "achievement",
      name: "Experto en Historia",
      date: "Ayer",
    },
    {
      id: 3,
      type: "quiz",
      name: "Gastronomía Peruana",
      result: "12/15",
      date: "3 días atrás",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: "https://picsum.photos/200" }}
            style={styles.profileImage}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user?.email || "Usuario"}</Text>
            <Text style={styles.rank}>{stats.rank}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.quizzesTaken}</Text>
          <Text style={styles.statLabel}>Quizzes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.correctAnswers}</Text>
          <Text style={styles.statLabel}>Correctas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.points}</Text>
          <Text style={styles.statLabel}>Puntos</Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Logros</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.achievementsScroll}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.lockedAchievement,
              ]}>
              <View
                style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.lockedIcon,
                ]}>
                <FontAwesome5
                  name={achievement.icon}
                  size={24}
                  color={achievement.unlocked ? "#fff" : "#999"}
                />
              </View>
              <Text
                style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.lockedText,
                ]}>
                {achievement.name}
              </Text>
              <Text
                style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.lockedText,
                ]}>
                {achievement.description}
              </Text>
              {!achievement.unlocked && (
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color="#999"
                  style={styles.lockIcon}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View
              style={[
                styles.activityIcon,
                activity.type === "achievement" &&
                  styles.achievementActivityIcon,
              ]}>
              <Ionicons
                name={activity.type === "quiz" ? "help-circle" : "trophy"}
                size={20}
                color="#fff"
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityName}>{activity.name}</Text>
              {activity.result && (
                <Text style={styles.activityResult}>{activity.result}</Text>
              )}
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  nameContainer: {
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  rank: {
    fontSize: 14,
    color: "#0F3057",
    marginTop: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "#f0f0f0",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#0F3057",
  },
  achievementsScroll: {
    marginLeft: -5,
  },
  achievementCard: {
    width: 150,
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: "center",
  },
  lockedAchievement: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0F3057",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  lockedIcon: {
    backgroundColor: "#ccc",
  },
  achievementName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: "center",
    color: "#888",
  },
  lockedText: {
    color: "#999",
  },
  lockIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00C2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  achievementActivityIcon: {
    backgroundColor: "#FFB800",
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activityResult: {
    fontSize: 12,
    color: "#00C2FF",
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F3057",
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
});
