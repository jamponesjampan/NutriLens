import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  TextInput, Modal, ActivityIndicator, Alert, Platform, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface AdminPost {
  id: string;
  author_name: string;
  author_emoji: string;
  dish_name: string;
  caption: string;
  image_url: string;
  likes_count: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  icon: string;
  color: string;
  is_active: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_aoa: number;
  scan_limit_daily: number;
  has_ai_analysis: boolean;
  is_active: boolean;
}

type AdminTab = 'overview' | 'posts' | 'challenges' | 'plans' | 'users';

const TABS: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Visão geral', icon: 'dashboard' },
  { key: 'posts', label: 'Publicações', icon: 'photo-library' },
  { key: 'challenges', label: 'Desafios', icon: 'emoji-events' },
  { key: 'plans', label: 'Planos', icon: 'card-membership' },
  { key: 'users', label: 'Utilizadores', icon: 'people' },
];

const SEED_POSTS = [
  {
    author_name: 'Equipa NutriLens',
    author_emoji: '👩🏾‍⚕️',
    author_location: 'Luanda, Angola',
    dish_name: 'Mufete da nossa equipa',
    caption: 'O Mufete angolano é considerado um dos pratos mais completos nutricionalmente! Rico em proteína do peixe, ferro do feijão e energia do funge — perfeito para um almoço de alta performance. 💚',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    tags: ['Mufete', 'SaúdeAngolana', 'Nutrição'],
    is_admin_post: true,
    is_active: true,
    likes_count: 247,
  },
  {
    author_name: 'Dra. Fátima — NutriLens',
    author_emoji: '👩🏾‍⚕️',
    author_location: 'Angola',
    dish_name: 'Calulu de peixe com quiabo',
    caption: 'O quiabo é um aliado poderoso contra a diabetes! Controla o açúcar no sangue e é rico em fibras. Experimente esta versão leve do calulu com mais legumes e menos óleo de palma. 🌿',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
    tags: ['Calulu', 'Diabetes', 'Quiabo', 'Saudável'],
    is_admin_post: true,
    is_active: true,
    likes_count: 189,
  },
  {
    author_name: 'Equipa NutriLens',
    author_emoji: '💚',
    author_location: 'Angola',
    dish_name: 'Arroz integral com feijão',
    caption: 'Sabia que trocar o arroz branco pelo integral pode reduzir o risco de diabetes tipo 2 em 36%? Experimente hoje mesmo — o sabor surpreende! 🍚',
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
    tags: ['ArrozIntegral', 'Feijão', 'Saúde'],
    is_admin_post: true,
    is_active: true,
    likes_count: 312,
  },
  {
    author_name: 'NutriLens — Dica do dia',
    author_emoji: '🌟',
    author_location: 'Angola',
    dish_name: 'Papaia com mel angolano',
    caption: 'A papaia é rica em vitamina C e enzimas digestivas. Com mel puro angolano, é o pequeno-almoço perfeito para começar o dia com energia e saúde! 🍯',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    tags: ['Papaia', 'Mel', 'PequenoAlmoço', 'VitaminaC'],
    is_admin_post: true,
    is_active: true,
    likes_count: 156,
  },
];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAdmin, logout } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostData, setNewPostData] = useState({
    dish_name: '', caption: '', image_url: '', tags: '',
    author_name: 'Equipa NutriLens', author_emoji: '👩🏾‍⚕️',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)');
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, challengesRes, plansRes] = await Promise.all([
        supabase.from('community_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('challenges').select('*').order('created_at', { ascending: false }),
        supabase.from('subscription_plans').select('*').order('sort_order'),
      ]);

      if (postsRes.data) setPosts(postsRes.data);
      if (challengesRes.data) setChallenges(challengesRes.data);
      if (plansRes.data) setPlans(plansRes.data);

      // Seed posts if none exist
      if (!postsRes.data || postsRes.data.length === 0) {
        await seedPosts();
      }
    } catch (e) {
      console.log('Admin load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const seedPosts = async () => {
    const { data: adminUser } = await supabase.auth.getUser();
    if (!adminUser.user) return;

    for (const post of SEED_POSTS) {
      await supabase.from('community_posts').insert({
        ...post,
        user_id: adminUser.user.id,
        author_location: 'Luanda, Angola',
      });
    }
    const { data } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const createPost = async () => {
    if (!newPostData.dish_name || !newPostData.caption) return;
    setIsSaving(true);
    try {
      const { data: adminUser } = await supabase.auth.getUser();
      if (!adminUser.user) return;

      const tagsArray = newPostData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { error } = await supabase.from('community_posts').insert({
        user_id: adminUser.user.id,
        author_name: newPostData.author_name,
        author_emoji: newPostData.author_emoji,
        author_location: 'Angola',
        dish_name: newPostData.dish_name,
        caption: newPostData.caption,
        image_url: newPostData.image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
        tags: tagsArray,
        is_admin_post: true,
        is_active: true,
        likes_count: 0,
      });

      if (!error) {
        setShowNewPost(false);
        setNewPostData({ dish_name: '', caption: '', image_url: '', tags: '', author_name: 'Equipa NutriLens', author_emoji: '👩🏾‍⚕️' });
        loadData();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const togglePost = async (id: string, current: boolean) => {
    await supabase.from('community_posts').update({ is_active: !current }).eq('id', id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const deletePost = async (id: string) => {
    await supabase.from('community_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const toggleChallenge = async (id: string, current: boolean) => {
    await supabase.from('challenges').update({ is_active: !current }).eq('id', id);
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
  };

  if (!isAdmin) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.adminBadge}>
            <MaterialIcons name="shield" size={14} color={Colors.danger} />
            <Text style={styles.adminBadgeText}>PAINEL ADMIN</Text>
          </View>
          <Text style={styles.headerTitle}>NutriLens Admin</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.appBtn} onPress={() => router.push('/(tabs)')}>
            <MaterialIcons name="apps" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <MaterialIcons name="logout" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={{ height: 50 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialIcons name={tab.icon as any} size={16} color={activeTab === tab.key ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loaderText}>A carregar dados...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo da plataforma</Text>
              <View style={styles.statsGrid}>
                <StatCard icon="photo-library" label="Publicações" value={posts.length.toString()} color={Colors.info} />
                <StatCard icon="emoji-events" label="Desafios" value={challenges.filter(c => c.is_active).toString()} color={Colors.accent} />
                <StatCard icon="card-membership" label="Planos" value={plans.length.toString()} color={Colors.primary} />
                <StatCard icon="people" label="Utilizadores" value="Activos" color={Colors.fiber} />
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Acções rápidas</Text>
              <TouchableOpacity style={styles.actionCard} onPress={() => { setActiveTab('posts'); setTimeout(() => setShowNewPost(true), 300); }}>
                <MaterialIcons name="add-photo-alternate" size={22} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionCardTitle}>Nova publicação na comunidade</Text>
                  <Text style={styles.actionCardDesc}>Partilha receitas e dicas com todos os utilizadores</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('challenges')}>
                <MaterialIcons name="add-task" size={22} color={Colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionCardTitle}>Gerir desafios nutricionais</Text>
                  <Text style={styles.actionCardDesc}>Activar ou desactivar desafios de hábitos saudáveis</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard} onPress={() => setActiveTab('plans')}>
                <MaterialIcons name="card-membership" size={22} color={Colors.fiber} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionCardTitle}>Planos de subscrição</Text>
                  <Text style={styles.actionCardDesc}>Gerir preços e funcionalidades dos planos</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.securityNote}>
                <MaterialIcons name="security" size={16} color={Colors.primary} />
                <Text style={styles.securityText}>
                  Sessão admin verificada via base de dados. O acesso é controlado pelo campo is_admin na tabela profiles — não há credenciais no código.
                </Text>
              </View>
            </View>
          )}

          {/* POSTS */}
          {activeTab === 'posts' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Publicações da comunidade</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowNewPost(true)}>
                  <MaterialIcons name="add" size={18} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>Nova</Text>
                </TouchableOpacity>
              </View>
              {posts.map(post => (
                <View key={post.id} style={styles.postCard}>
                  <Image source={{ uri: post.image_url }} style={styles.postThumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <View style={styles.postMeta}>
                      <Text style={styles.postEmoji}>{post.author_emoji}</Text>
                      <Text style={styles.postAuthor} numberOfLines={1}>{post.author_name}</Text>
                      {post.is_active
                        ? <View style={styles.activePill}><Text style={styles.activePillText}>Activo</Text></View>
                        : <View style={styles.inactivePill}><Text style={styles.inactivePillText}>Inactivo</Text></View>
                      }
                    </View>
                    <Text style={styles.postDish} numberOfLines={1}>{post.dish_name}</Text>
                    <Text style={styles.postCaption} numberOfLines={2}>{post.caption}</Text>
                    <View style={styles.postActions}>
                      <TouchableOpacity style={styles.postAction} onPress={() => togglePost(post.id, post.is_active)}>
                        <MaterialIcons name={post.is_active ? 'visibility-off' : 'visibility'} size={16} color={Colors.textSecondary} />
                        <Text style={styles.postActionText}>{post.is_active ? 'Ocultar' : 'Mostrar'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.postAction} onPress={() => deletePost(post.id)}>
                        <MaterialIcons name="delete" size={16} color={Colors.danger} />
                        <Text style={[styles.postActionText, { color: Colors.danger }]}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* CHALLENGES */}
          {activeTab === 'challenges' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Desafios nutricionais</Text>
              {challenges.map(ch => (
                <View key={ch.id} style={[styles.challengeCard, { borderLeftColor: ch.color }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.challengeTitle}>{ch.title}</Text>
                    <Text style={styles.challengeDesc} numberOfLines={2}>{ch.description}</Text>
                    <Text style={styles.challengeDays}>{ch.duration_days} dias</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleBtn, { backgroundColor: ch.is_active ? Colors.primaryMuted : Colors.dangerMuted }]}
                    onPress={() => toggleChallenge(ch.id, ch.is_active)}
                  >
                    <Text style={[styles.toggleBtnText, { color: ch.is_active ? Colors.primary : Colors.danger }]}>
                      {ch.is_active ? 'Activo' : 'Inactivo'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* PLANS */}
          {activeTab === 'plans' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Planos de subscrição</Text>
              {plans.map(plan => (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price_aoa === 0 ? 'Gratuito' : `${plan.price_aoa.toLocaleString()} AOA`}</Text>
                  </View>
                  <View style={styles.planFeatures}>
                    <Text style={styles.planFeatureText}>📷 {plan.scan_limit_daily >= 9999 ? 'Ilimitado' : plan.scan_limit_daily} análises/dia</Text>
                    <Text style={styles.planFeatureText}>🤖 Análise avançada: {plan.has_ai_analysis ? '✅' : '❌'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gestão de utilizadores</Text>
              <View style={styles.usersInfo}>
                <MaterialIcons name="info-outline" size={20} color={Colors.info} />
                <Text style={styles.usersInfoText}>
                  A gestão detalhada de utilizadores está disponível no painel do Supabase. Os dados são protegidos por Row Level Security e apenas admins têm acesso completo.
                </Text>
              </View>
              <TouchableOpacity style={styles.supabaseBtn}>
                <MaterialIcons name="open-in-new" size={18} color={Colors.textInverse} />
                <Text style={styles.supabaseBtnText}>Ver no Supabase Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      )}

      {/* New Post Modal */}
      <Modal visible={showNewPost} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalCard} contentContainerStyle={{ paddingBottom: 32 }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova publicação</Text>
                <TouchableOpacity onPress={() => setShowNewPost(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <AdminInput label="Nome do prato *" value={newPostData.dish_name} onChangeText={v => setNewPostData(p => ({ ...p, dish_name: v }))} placeholder="Ex: Mufete com Funge" />
              <AdminInput label="Legenda *" value={newPostData.caption} onChangeText={v => setNewPostData(p => ({ ...p, caption: v }))} placeholder="Descreve o prato e os seus benefícios..." multiline />
              <AdminInput label="URL da imagem" value={newPostData.image_url} onChangeText={v => setNewPostData(p => ({ ...p, image_url: v }))} placeholder="https://images.unsplash.com/..." />
              <AdminInput label="Tags (separadas por vírgula)" value={newPostData.tags} onChangeText={v => setNewPostData(p => ({ ...p, tags: v }))} placeholder="Mufete, Saúde, Angola" />
              <AdminInput label="Nome do autor" value={newPostData.author_name} onChangeText={v => setNewPostData(p => ({ ...p, author_name: v }))} placeholder="Equipa NutriLens" />
              {newPostData.image_url ? (
                <Image source={{ uri: newPostData.image_url }} style={styles.previewImage} contentFit="cover" />
              ) : null}
              <TouchableOpacity
                style={[styles.saveBtn, (!newPostData.dish_name || !newPostData.caption) && { opacity: 0.5 }]}
                onPress={createPost}
                disabled={isSaving || !newPostData.dish_name || !newPostData.caption}
              >
                {isSaving ? <ActivityIndicator color={Colors.textInverse} /> : <Text style={styles.saveBtnText}>Publicar</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AdminInput({ label, value, onChangeText, placeholder, multiline }: any) {
  return (
    <View style={styles.adminInputGroup}>
      <Text style={styles.adminInputLabel}>{label}</Text>
      <TextInput
        style={[styles.adminInput, multiline && { height: 100, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  adminBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.danger, letterSpacing: 1 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: 8 },
  appBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted, borderRadius: Radius.md },
  logoutBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dangerMuted, borderRadius: Radius.md },
  tabBar: { paddingHorizontal: 16, gap: 4, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  tabActive: { backgroundColor: Colors.primaryMuted },
  tabText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  section: { padding: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.surfaceBorder },
  actionCardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  actionCardDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.primaryMuted, borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.primary + '44' },
  securityText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },
  postCard: { flexDirection: 'row', gap: 12, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 12, borderWidth: 1, borderColor: Colors.surfaceBorder },
  postThumb: { width: 70, height: 70, borderRadius: Radius.md },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  postEmoji: { fontSize: 14 },
  postAuthor: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  activePill: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  activePillText: { fontSize: 9, color: Colors.primary, fontWeight: FontWeight.bold },
  inactivePill: { backgroundColor: Colors.dangerMuted, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  inactivePillText: { fontSize: 9, color: Colors.danger, fontWeight: FontWeight.bold },
  postDish: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  postCaption: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16, marginTop: 2 },
  postActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  challengeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: Colors.surfaceBorder, borderLeftWidth: 4 },
  challengeTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  challengeDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  challengeDays: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  toggleBtn: { borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  toggleBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  planCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.surfaceBorder },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  planName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  planPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  planFeatures: { gap: 4 },
  planFeatureText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  usersInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.infoMuted, borderRadius: Radius.md, padding: 14, borderWidth: 1, borderColor: Colors.info + '44' },
  usersInfoText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  supabaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.info, borderRadius: Radius.full, paddingVertical: 14, marginTop: 4 },
  supabaseBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textInverse },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  adminInputGroup: { marginBottom: 14 },
  adminInputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6 },
  adminInput: { backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, padding: 12, fontSize: FontSize.sm, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.surfaceBorder },
  previewImage: { width: '100%', height: 160, borderRadius: Radius.lg, marginBottom: 14 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textInverse },
});
