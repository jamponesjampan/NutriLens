import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Perder peso', gain_muscle: 'Ganhar massa',
  maintain: 'Manter forma', eat_healthy: 'Comer melhor', manage_condition: 'Controlar saúde',
};

const DIET_LABELS: Record<string, string> = {
  omnivore: 'Onívoro', vegetarian: 'Vegetariano', vegan: 'Vegano',
  keto: 'Cetogênico', mediterranean: 'Mediterrâneo',
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentário', light: 'Leve', moderate: 'Moderado',
  active: 'Ativo', very_active: 'Muito ativo',
};

const RESTRICTION_LABELS: Record<string, string> = {
  gluten: 'Glúten', lactose: 'Lactose', diabetes: 'Diabetes',
  hypertension: 'Hipertensão', none: 'Nenhuma',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, currentStreak, totalScanned, dailyCaloriesConsumed } = useApp();

  const bmi = user ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1) : '--';
  const bmr = user ? Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <TouchableOpacity style={styles.editBtn}>
            <MaterialIcons name="edit" size={18} color={Colors.primary} />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <View style={styles.goalBadge}>
            <MaterialIcons name="flag" size={14} color={Colors.primary} />
            <Text style={styles.goalBadgeText}>{GOAL_LABELS[user?.goal || 'eat_healthy']}</Text>
          </View>
        </View>

        {/* Body Stats */}
        <View style={styles.statsGrid}>
          <StatCell label="Peso" value={`${user?.weight || '--'}`} unit="kg" icon="monitor-weight" />
          <StatCell label="Altura" value={`${user?.height || '--'}`} unit="cm" icon="straighten" />
          <StatCell label="IMC" value={bmi} unit="" icon="favorite" />
          <StatCell label="TMB" value={`${bmr}`} unit="kcal" icon="local-fire-department" />
        </View>

        {/* Streak & Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>Sua atividade</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>🔥 {currentStreak}</Text>
              <Text style={styles.activityLabel}>dias de streak</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>📸 {totalScanned}</Text>
              <Text style={styles.activityLabel}>refeições analisadas</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>🎯 {dailyCaloriesConsumed}</Text>
              <Text style={styles.activityLabel}>kcal hoje</Text>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Informações do perfil</Text>
          <InfoRow icon="restaurant-menu" label="Dieta" value={DIET_LABELS[user?.diet || 'omnivore']} />
          <InfoRow icon="fitness-center" label="Atividade" value={ACTIVITY_LABELS[user?.activity || 'moderate']} />
          <InfoRow icon="local-fire-department" label="Meta calórica" value={`${user?.dailyCalorieTarget || 2000} kcal/dia`} />
          <InfoRow icon="cake" label="Idade" value={`${user?.age || '--'} anos`} />
        </View>

        {/* Restrictions */}
        {user?.restrictions && user.restrictions.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Restrições alimentares</Text>
            <View style={styles.restrictionsWrap}>
              {user.restrictions.map(r => (
                <View key={r} style={styles.restrictionTag}>
                  <MaterialIcons name="warning" size={12} color={Colors.warning} />
                  <Text style={styles.restrictionText}>{RESTRICTION_LABELS[r]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.infoCardTitle}>Configurações</Text>
          <SettingRow icon="notifications" label="Notificações de refeição" hasSwitch />
          <SettingRow icon="palette" label="Tema" value="Escuro" />
          <SettingRow icon="language" label="Idioma" value="Português" />
          <SettingRow icon="share" label="Compartilhar app" />
          <SettingRow icon="star-rate" label="Avaliar no app store" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialIcons name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function StatCell({ label, value, unit, icon }: any) {
  return (
    <View style={styles.statCell}>
      <MaterialIcons name={icon} size={18} color={Colors.primary} />
      <Text style={styles.statValue}>{value}<Text style={styles.statUnit}> {unit}</Text></Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, value, hasSwitch }: any) {
  return (
    <View style={styles.settingRow}>
      <MaterialIcons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={styles.settingLabel}>{label}</Text>
      {hasSwitch ? (
        <Switch value={true} thumbColor={Colors.primary} trackColor={{ true: Colors.primaryDim }} />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: Colors.primary },
  editBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary, marginBottom: 12 },
  avatarText: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  goalBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: Colors.primary },
  goalBadgeText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, gap: 10, marginBottom: 20 },
  statCell: { width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.surfaceBorder },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  statUnit: { fontSize: FontSize.sm, fontWeight: FontWeight.regular, color: Colors.textSecondary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  activityCard: { marginHorizontal: 20, backgroundColor: Colors.primaryMuted, borderRadius: Radius.xl, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.primary },
  activityTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary, marginBottom: 14 },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityItem: { flex: 1, alignItems: 'center' },
  activityValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  activityLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  activityDivider: { width: 1, height: 36, backgroundColor: Colors.primary + '44' },
  infoCard: { marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: Colors.surfaceBorder },
  infoCardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  infoLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  infoValue: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  restrictionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  restrictionTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accentMuted, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.accent },
  restrictionText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.medium },
  settingsCard: { marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: Colors.surfaceBorder },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  settingLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  settingValue: { fontSize: FontSize.sm, color: Colors.textSecondary },
  logoutBtn: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.dangerMuted, borderRadius: Radius.full, paddingVertical: 14, borderWidth: 1, borderColor: Colors.danger + '44' },
  logoutText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.danger },
});
