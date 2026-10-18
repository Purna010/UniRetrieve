import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { items, matches } = useApp();

  const lostCount = items.filter((i) => i.type === 'lost').length;
  const foundCount = items.filter((i) => i.type === 'found').length;
  const matchCount = matches.length;

  const recentItems = items.slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Summary */}
      <View style={styles.userBar}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Campus Student'}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.roleBadge}>
              {user?.role === 'admin' ? '🛡️ Campus Security' : '🎓 Verified Student'}
            </Text>
            {user?.studentId && user.studentId !== 'N/A' && (
              <Text style={styles.idBadge}>ID: {user.studentId}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Action Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Recover What Matters</Text>
        <Text style={styles.bannerSub}>
          AI computer vision and geospatial algorithms automatically cross-reference lost & found reports across campus.
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.lostRed }]}
            onPress={() => navigation.navigate('Report', { defaultType: 'lost' })}
          >
            <Text style={styles.actionBtnText}>+ Report Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.cyan }]}
            onPress={() => navigation.navigate('Report', { defaultType: 'found' })}
          >
            <Text style={[styles.actionBtnText, { color: '#030712' }]}>+ Report Found</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Row */}
      <Text style={styles.sectionHeader}>Campus Asset Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: COLORS.lostRed }]}>{lostCount}</Text>
          <Text style={styles.metricLabel}>Lost Items</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: COLORS.cyan }]}>{foundCount}</Text>
          <Text style={styles.metricLabel}>Found Items</Text>
        </View>
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => navigation.navigate('Matches')}
        >
          <Text style={[styles.metricValue, { color: COLORS.amber }]}>{matchCount}</Text>
          <Text style={styles.metricLabel}>AI Matches</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionHeader}>Recent Campus Reports</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Browse')}>
          <Text style={styles.seeAllText}>Browse All →</Text>
        </TouchableOpacity>
      </View>

      {recentItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No items reported yet.</Text>
        </View>
      ) : (
        recentItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            {item.images && item.images[0] ? (
              <Image source={{ uri: item.images[0] }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>📦</Text>
              </View>
            )}
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text
                  style={[
                    styles.typePill,
                    {
                      color: item.type === 'lost' ? COLORS.lostRed : COLORS.cyan,
                      borderColor: item.type === 'lost' ? COLORS.lostRed : COLORS.cyan,
                    },
                  ]}
                >
                  {item.type.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.itemLocation} numberOfLines={1}>
                📍 {item.location?.label || 'Campus Ground'}
              </Text>
              {item.aiCategory && (
                <Text style={styles.aiTag}>AI: {item.aiCategory} ({item.aiConfidence || 75}%)</Text>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  userBar: {
    marginBottom: 16,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  roleBadge: {
    fontSize: 11,
    color: COLORS.cyan,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '600',
  },
  idBadge: {
    fontSize: 11,
    color: COLORS.textSecondary,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  banner: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bannerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#ffffff',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12,
    color: COLORS.cyan,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceCard,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 6,
  },
  typePill: {
    fontSize: 10,
    fontWeight: 'bold',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  aiTag: {
    fontSize: 10,
    color: COLORS.amber,
    marginTop: 2,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
