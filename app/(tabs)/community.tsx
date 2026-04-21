import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Dimensions, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  author_name: string;
  author_emoji: string;
  author_location: string;
  image_url: string;
  dish_name: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  tags: string[];
  is_admin_post: boolean;
  created_at: string;
  liked?: boolean;
}

const CATEGORIES = ['Tudo', 'Receitas', 'Dicas', 'Desafios', 'Família'];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user, accessibilityMode, isGuest, supabaseUser } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCat, setSelectedCat] = useState('Tudo');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const fs = (size: number) => accessibilityMode ? size * 1.2 : size;

  const loadPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) setPosts(data);

      // Load user's liked posts
      if (supabaseUser) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', supabaseUser.id);
        if (likes) setLikedIds(new Set(likes.map(l => l.post_id)));
      }
    } catch (e) {
      console.log('Posts load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabaseUser]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const onRefresh = () => { setRefreshing(true); loadPosts(); };

  const toggleLike = async (postId: string) => {
    if (isGuest) return;
    if (!supabaseUser) return;

    const isLiked = likedIds.has(postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setLikedIds(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p
    ));

    if (isLiked) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: supabaseUser.id });
      await supabase.from('community_posts').update({ likes_count: post.likes_count - 1 }).eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: supabaseUser.id });
      await supabase.from('community_posts').update({ likes_count: post.likes_count + 1 }).eq('id', postId);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (searchText) {
      const q = searchText.toLowerCase();
      return p.dish_name.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = likedIds.has(item.id);
    const timeAgo = getTimeAgo(item.created_at);
    return (
      <View style={styles.postCard}>
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={{ fontSize: 22 }}>{item.author_emoji || '👤'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.authorName, { fontSize: fs(FontSize.sm) }]}>{item.author_name}</Text>
              {item.is_admin_post && (
                <View style={styles.adminBadge}>
                  <MaterialIcons name="verified" size={12} color={Colors.primary} />
                  <Text style={styles.adminBadgeText}>Equipa</Text>
                </View>
              )}
            </View>
            <View style={styles.authorMeta}>
              <MaterialIcons name="location-on" size={11} color={Colors.textMuted} />
              <Text style={[styles.authorLocation, { fontSize: fs(FontSize.xs) }]}>{item.author_location || 'Angola'}</Text>
              <Text style={styles.authorDot}>·</Text>
              <Text style={[styles.authorTime, { fontSize: fs(FontSize.xs) }]}>{timeAgo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.postImageWrap}>
          <Image source={{ uri: item.image_url }} style={styles.postImage} contentFit="cover" transition={200} />
          <View style={styles.dishBadge}>
            <Text style={[styles.dishBadgeText, { fontSize: fs(FontSize.xs) }]}>🍽️ {item.dish_name}</Text>
          </View>
        </View>

        <View style={styles.postBody}>
          <Text style={[styles.caption, { fontSize: fs(FontSize.sm) }]} numberOfLines={3}>{item.caption}</Text>
          <View style={styles.tagsRow}>
            {item.tags?.map(tag => (
              <TouchableOpacity key={tag} style={styles.tagChip}>
                <Text style={[styles.tagText, { fontSize: fs(FontSize.xs) }]}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
              <MaterialIcons name={isLiked ? 'favorite' : 'favorite-border'} size={22} color={isLiked ? Colors.danger : Colors.textSecondary} />
              <Text style={[styles.actionCount, { fontSize: fs(FontSize.sm), color: isLiked ? Colors.danger : Colors.textSecondary }]}>
                {item.likes_count}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialIcons name="chat-bubble-outline" size={21} color={Colors.textSecondary} />
              <Text style={[styles.actionCount, { fontSize: fs(FontSize.sm) }]}>{item.comments_count || 0}</Text>
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
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: fs(FontSize.xxl) }]}>Nossa Terra 🌍</Text>
          <Text style={[styles.headerSub, { fontSize: fs(FontSize.xs) }]}>Receitas e dicas da comunidade angolana</Text>
        </View>
        {!isGuest && (
          <TouchableOpacity style={styles.shareBtn}>
            <MaterialIcons name="add-photo-alternate" size={22} color={Colors.textInverse} />
          </TouchableOpacity>
        )}
      </View>

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
              <Text style={[styles.catChipText, { fontSize: fs(FontSize.sm) }, selectedCat === item && styles.catChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.communityBanner}>
        <Text style={styles.bannerEmoji}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { fontSize: fs(FontSize.sm) }]}>+2.400 angolanos a cuidar da saúde</Text>
          <Text style={[styles.bannerSub, { fontSize: fs(FontSize.xs) }]}>A maior comunidade nutricional de Angola</Text>
        </View>
      </View>

      {isGuest && (
        <View style={styles.guestBanner}>
          <MaterialIcons name="lock" size={16} color={Colors.accent} />
          <Text style={[styles.guestBannerText, { fontSize: fs(FontSize.xs) }]}>Modo de teste — Cria uma conta para gostar e publicar</Text>
        </View>
      )}

      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading
              ? <Text style={[styles.emptyText, { fontSize: fs(FontSize.md) }]}>A carregar publicações...</Text>
              : (
                <>
                  <MaterialIcons name="people" size={48} color={Colors.textMuted} />
                  <Text style={[styles.emptyText, { fontSize: fs(FontSize.md) }]}>Ainda sem publicações</Text>
                  <Text style={[styles.emptySubText, { fontSize: fs(FontSize.sm) }]}>O admin publicará conteúdo em breve!</Text>
                </>
              )
            }
          </View>
        }
      />
    </View>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHr < 24) return `${diffHr}h atrás`;
  return `${diffDay}d atrás`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  headerSub: { color: Colors.textSecondary, marginTop: 2 },
  shareBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.surfaceBorder },
  searchInput: { flex: 1, color: Colors.textPrimary },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder },
  catChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  catChipText: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catChipTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  communityBanner: { marginHorizontal: 16, marginBottom: 10, backgroundColor: Colors.primaryMuted, borderRadius: Radius.lg, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: Colors.primary + '55', flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerEmoji: { fontSize: 22 },
  bannerTitle: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  bannerSub: { color: Colors.primary, marginTop: 2 },
  guestBanner: { marginHorizontal: 16, marginBottom: 10, backgroundColor: Colors.accentMuted, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.accent + '44', flexDirection: 'row', alignItems: 'center', gap: 8 },
  guestBannerText: { flex: 1, color: Colors.accent, fontWeight: FontWeight.medium },
  postCard: { marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.surfaceBorder },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  authorAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder },
  authorName: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  adminBadgeText: { fontSize: 9, color: Colors.primary, fontWeight: FontWeight.bold },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  authorLocation: { color: Colors.textMuted },
  authorDot: { color: Colors.textMuted, fontSize: 10 },
  authorTime: { color: Colors.textMuted },
  postImageWrap: { position: 'relative' },
  postImage: { width: '100%', height: 220 },
  dishBadge: { position: 'absolute', bottom: 10, left: 12, backgroundColor: 'rgba(13,17,23,0.8)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: Colors.surfaceBorder },
  dishBadgeText: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  postBody: { padding: 14 },
  caption: { color: Colors.textPrimary, lineHeight: 22, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagChip: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: Colors.primary + '44' },
  tagText: { color: Colors.primary, fontWeight: FontWeight.medium },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 8, flex: 1 },
  actionCount: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
  empty: { paddingTop: 80, alignItems: 'center', gap: 10 },
  emptyText: { color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  emptySubText: { color: Colors.textMuted },
});
