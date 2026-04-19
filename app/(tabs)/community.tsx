import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { MOCK_COMMUNITY_POSTS, CommunityPost } from '@/constants/mockData';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Tudo', 'Receitas', 'Dicas', 'Desafios', 'Família'];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user, accessibilityMode } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [selectedCat, setSelectedCat] = useState('Tudo');
  const [searchText, setSearchText] = useState('');

  const fs = (size: number) => accessibilityMode ? size * 1.2 : size;

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={styles.postCard}>
      {/* Author Row */}
      <View style={styles.authorRow}>
        <View style={styles.authorAvatar}>
          <Text style={{ fontSize: 22 }}>{item.authorEmoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.authorName, { fontSize: fs(FontSize.sm) }]}>{item.authorName}</Text>
          <View style={styles.authorMeta}>
            <MaterialIcons name="location-on" size={11} color={Colors.textMuted} />
            <Text style={[styles.authorLocation, { fontSize: fs(FontSize.xs) }]}>{item.authorLocation}</Text>
            <Text style={styles.authorDot}>·</Text>
            <Text style={[styles.authorTime, { fontSize: fs(FontSize.xs) }]}>{item.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MaterialIcons name="more-horiz" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Dish Image */}
      <View style={styles.postImageWrap}>
        <Image source={{ uri: item.imageUri }} style={styles.postImage} contentFit="cover" transition={200} />
        <View style={styles.dishBadge}>
          <Text style={[styles.dishBadgeText, { fontSize: fs(FontSize.xs) }]}>🍽️ {item.dishName}</Text>
        </View>
      </View>

      {/* Caption */}
      <View style={styles.postBody}>
        <Text style={[styles.caption, { fontSize: fs(FontSize.sm) }]} numberOfLines={3}>
          {item.caption}
        </Text>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {item.tags.map(tag => (
            <TouchableOpacity key={tag} style={styles.tagChip}>
              <Text style={[styles.tagText, { fontSize: fs(FontSize.xs) }]}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
            <MaterialIcons
              name={item.liked ? 'favorite' : 'favorite-border'}
              size={22} color={item.liked ? Colors.danger : Colors.textSecondary}
            />
            <Text style={[styles.actionCount, { fontSize: fs(FontSize.sm), color: item.liked ? Colors.danger : Colors.textSecondary }]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="chat-bubble-outline" size={21} color={Colors.textSecondary} />
            <Text style={[styles.actionCount, { fontSize: fs(FontSize.sm) }]}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="share" size={21} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="bookmark-border" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: fs(FontSize.xxl) }]}>Nossa Terra 🌍</Text>
          <Text style={[styles.headerSub, { fontSize: fs(FontSize.xs) }]}>Receitas e dicas da comunidade angolana</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialIcons name="add-photo-alternate" size={22} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { fontSize: fs(FontSize.sm) }]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Pesquisar receitas angolanas..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Category Filter */}
      <View style={{ height: 44, marginBottom: 8 }}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, selectedCat === item && styles.catChipActive]}
              onPress={() => setSelectedCat(item)}
            >
              <Text style={[
                styles.catChipText,
                { fontSize: fs(FontSize.sm) },
                selectedCat === item && styles.catChipTextActive,
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Community Banner */}
      <View style={styles.communityBanner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerEmoji}>🏆</Text>
          <View>
            <Text style={[styles.bannerTitle, { fontSize: fs(FontSize.sm) }]}>+2.400 angolanos a cuidar da saúde</Text>
            <Text style={[styles.bannerSub, { fontSize: fs(FontSize.xs) }]}>Junta-te à maior comunidade nutricional de Angola</Text>
          </View>
        </View>
      </View>

      {/* Posts Feed */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="people" size={48} color={Colors.textMuted} />
            <Text style={[styles.emptyText, { fontSize: fs(FontSize.md) }]}>Ainda sem publicações</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  headerSub: { color: Colors.textSecondary, marginTop: 2 },
  shareBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.surface,
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  searchInput: { flex: 1, color: Colors.textPrimary },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  catChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  catChipText: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catChipTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  communityBanner: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.lg, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.primary + '55', flexDirection: 'row', alignItems: 'center',
  },
  bannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerEmoji: { fontSize: 24 },
  bannerTitle: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  bannerSub: { color: Colors.primary, marginTop: 2 },
  postCard: {
    marginHorizontal: 16, backgroundColor: Colors.surface,
    borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  authorAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  authorName: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  authorLocation: { color: Colors.textMuted },
  authorDot: { color: Colors.textMuted, fontSize: 10 },
  authorTime: { color: Colors.textMuted },
  moreBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  postImageWrap: { position: 'relative' },
  postImage: { width: '100%', height: 220 },
  dishBadge: {
    position: 'absolute', bottom: 10, left: 12,
    backgroundColor: 'rgba(13,17,23,0.8)', borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  dishBadgeText: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  postBody: { padding: 14 },
  caption: { color: Colors.textPrimary, lineHeight: 22, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagChip: {
    backgroundColor: Colors.primaryMuted, borderRadius: Radius.full,
    paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  tagText: { color: Colors.primary, fontWeight: FontWeight.medium },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 8, flex: 1 },
  actionCount: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
  empty: { paddingTop: 80, alignItems: 'center', gap: 10 },
  emptyText: { color: Colors.textSecondary, fontWeight: FontWeight.semibold },
});
