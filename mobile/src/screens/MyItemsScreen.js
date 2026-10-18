import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';

export default function MyItemsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { items } = useApp();

  const myItems = items.filter((item) => item.reportedBy?.id === user?.id);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.images && item.images[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.placeholder]}>
          <Text style={{ fontSize: 20 }}>📦</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text
            style={[
              styles.typeBadge,
              {
                color: item.type === 'lost' ? COLORS.lostRed : COLORS.cyan,
                borderColor: item.type === 'lost' ? COLORS.lostRed : COLORS.cyan,
              },
            ]}
          >
            {item.type.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.itemCategory}>{item.category || 'General'}</Text>
        <Text style={styles.itemDate}>
          📅 {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || 'S').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Student'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'student@univ.edu'}</Text>
          <Text style={styles.profileId}>
            ID: {user?.studentId || 'N/A'} • {user?.role === 'admin' ? 'Security Staff' : 'Student'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Reported Items List */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>My Registered Reports ({myItems.length})</Text>
        <FlatList
          data={myItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={styles.emptyText}>You haven't filed any lost or found reports yet.</Text>
              <TouchableOpacity
                style={styles.reportNewBtn}
                onPress={() => navigation.navigate('Report')}
              >
                <Text style={styles.reportNewText}>+ File a New Report</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.cyan,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  profileId: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: COLORS.lostRed,
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceCard,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 6,
  },
  typeBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemCategory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  reportNewBtn: {
    marginTop: 14,
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reportNewText: {
    color: '#030712',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
