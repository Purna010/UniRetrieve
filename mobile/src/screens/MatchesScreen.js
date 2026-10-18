import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function MatchesScreen({ navigation }) {
  const { matches, items, submitClaim, fetchMatches } = useApp();
  const { user } = useAuth();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [proofDetails, setProofDetails] = useState('');
  const [claiming, setClaiming] = useState(false);

  const getItem = (id) => items.find((i) => i.id === id);

  const handleOpenClaim = (match) => {
    setSelectedMatch(match);
    setStudentId(user?.studentId || '');
    setProofDetails('');
    setModalVisible(true);
  };

  const handleConfirmClaim = async () => {
    if (!studentId.trim() || !proofDetails.trim()) {
      Alert.alert('Required Info', 'Please provide your Student ID and ownership proof details.');
      return;
    }

    setClaiming(true);
    const res = await submitClaim(selectedMatch.id, {
      studentId: studentId.trim(),
      answers: [proofDetails.trim()],
    });
    setClaiming(false);

    if (res.success) {
      setModalVisible(false);
      Alert.alert(
        'Ownership Claim Filed! 🎉',
        'Your challenge response and student credentials have been sent to the finder. All claims are logged on Ethereum blockchain for transparency.'
      );
    } else {
      Alert.alert('Error', res.error || 'Failed to file claim.');
    }
  };

  const renderMatchCard = ({ item: match }) => {
    const lostItem = getItem(match.lostItemId);
    const foundItem = getItem(match.foundItemId);

    const scoreColor =
      match.similarityScore >= 80
        ? COLORS.green
        : match.similarityScore >= 60
        ? COLORS.amber
        : COLORS.textMuted;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.scoreBadge}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>
              {match.similarityScore}%
            </Text>
            <Text style={styles.scoreSub}>AI MATCH</Text>
          </View>
          <View style={styles.statusCol}>
            <Text
              style={[
                styles.statusText,
                { color: match.status === 'claimed' ? COLORS.green : COLORS.amber },
              ]}
            >
              {(match.status || 'PENDING_CLAIM').replace('_', ' ').toUpperCase()}
            </Text>
            {match.locationDistance !== undefined && (
              <Text style={styles.distanceText}>📍 ~{match.locationDistance} km delta</Text>
            )}
          </View>
        </View>

        {/* Side-by-Side Comparison */}
        <View style={styles.comparisonRow}>
          <View style={styles.compareCol}>
            <Text style={styles.compareLabel}>🔴 LOST REPORT</Text>
            <Text style={styles.compareTitle} numberOfLines={2}>
              {lostItem?.title || 'Reported Lost'}
            </Text>
            <Text style={styles.compareLoc} numberOfLines={1}>
              {lostItem?.location?.label || 'Campus'}
            </Text>
          </View>

          <Text style={styles.vsText}>⚡</Text>

          <View style={styles.compareCol}>
            <Text style={styles.compareLabel}>🟢 FOUND REPORT</Text>
            <Text style={styles.compareTitle} numberOfLines={2}>
              {foundItem?.title || 'Reported Found'}
            </Text>
            <Text style={styles.compareLoc} numberOfLines={1}>
              {foundItem?.location?.label || 'Campus'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.chatBtnText}>💬 Open Chat</Text>
          </TouchableOpacity>

          {!match.claimRequestSent && match.status !== 'claimed' ? (
            <TouchableOpacity
              style={styles.claimBtn}
              onPress={() => handleOpenClaim(match)}
            >
              <Text style={styles.claimBtnText}>Verify Ownership →</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>
                {match.status === 'claimed' ? '✔ Claim Resolved' : '⏳ Verification Under Review'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchCard}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchMatches}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No AI Matches Detected</Text>
            <Text style={styles.emptySub}>
              When lost and found items share matching categories, visual tags, or close campus proximity, recommendations appear here.
            </Text>
          </View>
        }
      />

      {/* Challenge-Response Claim Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔐 Challenge–Response Ownership Proof</Text>
            <Text style={styles.modalSub}>
              To prevent fraudulent claims, describe hidden marks, serial numbers, or internal contents only the true owner would know.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Student ID</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="STUDENT123"
                placeholderTextColor={COLORS.textMuted}
                value={studentId}
                onChangeText={setStudentId}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Verification Proof / Distinguishing Marks</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="e.g. Stickers on back, wallpaper description, internal zipper contents..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                value={proofDetails}
                onChangeText={setProofDetails}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={claiming}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleConfirmClaim}
                disabled={claiming}
              >
                {claiming ? (
                  <ActivityIndicator color="#030712" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Claim</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreSub: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  distanceText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  comparisonRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  compareCol: {
    flex: 1,
  },
  compareLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  compareTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  compareLoc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  vsText: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chatBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  claimBtn: {
    flex: 1,
    backgroundColor: COLORS.cyan,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#030712',
    fontSize: 12,
    fontWeight: 'bold',
  },
  claimedBadge: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimedText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.cyan,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#030712',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
