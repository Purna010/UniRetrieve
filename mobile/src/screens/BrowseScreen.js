import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';

const CATEGORIES = ['All', 'Electronics', 'Bags & Luggage', 'Accessories', 'Personal Items', 'Books & Stationery'];

export default function BrowseScreen() {
  const { items, loading, fetchItems } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.images && item.images[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={{ fontSize: 24 }}>📦</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.badgeRow}>
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
          <Text style={styles.categoryBadge}>{item.category || 'General'}</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.location?.label || 'Campus Ground'}
          </Text>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map((t, idx) => (
              <Text key={idx} style={styles.tagPill}>#{t}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search campus items, serials, tags..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Type Toggle: All | Lost | Found */}
      <View style={styles.typeFilterRow}>
        {['all', 'lost', 'found'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, typeFilter === t && styles.activeTypeBtn]}
            onPress={() => setTypeFilter(t)}
          >
            <Text
              style={[
                styles.typeBtnText,
                typeFilter === t && styles.activeTypeBtnText,
              ]}
            >
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories Carousel */}
      <View style={styles.catScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.catPill,
                categoryFilter === item && styles.activeCatPill,
              ]}
              onPress={() => setCategoryFilter(item)}
            >
              <Text
                style={[
                  styles.catPillText,
                  categoryFilter === item && styles.activeCatPillText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchItems}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found matching your criteria.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    fontSize: 13,
  },
  typeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 6,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  activeTypeBtn: {
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    borderColor: COLORS.cyan,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  activeTypeBtnText: {
    color: COLORS.cyan,
  },
  catScroll: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginRight: 8,
  },
  activeCatPill: {
    backgroundColor: COLORS.cyan,
  },
  catPillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeCatPillText: {
    color: '#030712',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.surfaceCard,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    alignItems: 'center',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryBadge: {
    fontSize: 10,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  metaRow: {
    marginTop: 8,
  },
  location: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  tagPill: {
    fontSize: 10,
    color: COLORS.cyan,
    backgroundColor: 'rgba(0, 245, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
