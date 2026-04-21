import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, FoodAnalysis, MOCK_ANALYSES, FamilyMember } from '@/constants/mockData';

interface AppContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  isOnboarded: boolean;
  isLoggedIn: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  analyses: FoodAnalysis[];
  currentStreak: number;
  totalScanned: number;
  dailyCaloriesConsumed: number;
  familyMembers: FamilyMember[];
  activeMemberId: string;
  accessibilityMode: boolean;
  subscriptionPlan: string;
  dailyScanCount: number;
  setUser: (u: UserProfile) => void;
  completeOnboarding: (u: UserProfile, email: string, password: string) => Promise<{ error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  continueAsGuest: () => void;
  addAnalysis: (a: FoodAnalysis) => void;
  logout: () => void;
  addFamilyMember: (m: FamilyMember) => void;
  switchActiveMember: (id: string) => void;
  setAccessibilityMode: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_FAMILY: FamilyMember[] = [
  {
    id: 'main',
    name: 'Eu',
    profileType: 'self',
    emoji: '🧑',
    color: '#4ADE80',
    goal: 'eat_healthy',
    restrictions: [],
    dailyCalorieTarget: 2000,
  },
];

const SCAN_LIMITS: Record<string, number> = {
  free: 3,
  basic: 20,
  premium: 9999,
  guest: 2,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalScanned, setTotalScanned] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(DEFAULT_FAMILY);
  const [activeMemberId, setActiveMemberId] = useState('main');
  const [accessibilityMode, setAccessibilityModeState] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  const [dailyScanCount, setDailyScanCount] = useState(0);
  const appStateRef = useRef(AppState.currentState);

  const isLoggedIn = !!session || isGuest;

  const dailyCaloriesConsumed = analyses
    .filter(a => {
      const today = new Date().toDateString();
      return new Date(a.timestamp).toDateString() === today;
    })
    .reduce((sum, a) => sum + a.nutrients.calories, 0);

  // App state management for token refresh
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
      appStateRef.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  // Initial session load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else if (!isGuest) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const profile: UserProfile = {
          name: data.name || 'Utilizador',
          age: data.age || 25,
          weight: data.weight || 70,
          height: data.height || 170,
          goal: data.goal || 'eat_healthy',
          diet: data.diet || 'omnivore',
          activity: data.activity || 'moderate',
          restrictions: data.restrictions || [],
          dailyCalorieTarget: data.daily_calorie_target || 2000,
          profileType: data.profile_type || 'self',
        };
        setUserState(profile);
        setIsOnboarded(data.is_onboarded || false);
        setIsAdmin(data.is_admin || false);
        setSubscriptionPlan(data.subscription_plan || 'free');
        setCurrentStreak(data.current_streak || 0);
        setTotalScanned(data.total_scanned || 0);
        if (profile.profileType === 'elder') setAccessibilityModeState(true);

        // Update main family member
        setFamilyMembers([{
          id: 'main',
          name: data.name || 'Eu',
          profileType: data.profile_type || 'self',
          emoji: data.profile_type === 'child' ? '👶' : data.profile_type === 'elder' ? '👴' : '🧑',
          color: '#4ADE80',
          goal: data.goal || 'eat_healthy',
          restrictions: data.restrictions || [],
          dailyCalorieTarget: data.daily_calorie_target || 2000,
        }]);

        // Load scan history
        await loadScanHistory(userId);
      }
    } catch (e) {
      console.log('Profile load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScanHistory = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const mapped: FoodAnalysis[] = data.map(row => ({
          id: row.id,
          imageUri: `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400`,
          dish: row.item_name,
          cuisine: 'Angolana',
          ingredients: [],
          nutrients: {
            calories: parseInt(row.calories) || 0,
            protein: 0, carbs: parseInt(row.carbs) || 0,
            fat: 0, fiber: 0, sugar: 0,
            sodium: parseInt(row.sodium) || 0,
            iron: 0, calcium: 0, vitaminC: 0,
            vitaminD: 0, vitaminB12: 0,
            potassium: 0, magnesium: 0,
          },
          score: 80,
          scoreLabel: 'Bom',
          profileCompatibility: 'Compatível',
          warnings: [],
          benefits: [],
          recommendation: '',
          timestamp: new Date(row.created_at).getTime(),
          meal: 'lunch',
        }));
        setAnalyses(mapped);
      } else {
        // Show mock data for new users
        setAnalyses(MOCK_ANALYSES);
      }
    } catch (e) {
      setAnalyses(MOCK_ANALYSES);
    }
  };

  const completeOnboarding = async (profile: UserProfile, email: string, password: string): Promise<{ error?: string }> => {
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: profile.name },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        // Update profile in Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: profile.name,
            email,
            goal: profile.goal,
            diet: profile.diet,
            activity: profile.activity,
            restrictions: profile.restrictions,
            daily_calorie_target: profile.dailyCalorieTarget,
            profile_type: profile.profileType || 'self',
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            is_onboarded: true,
            diabetes: profile.restrictions.includes('diabetes'),
            hypertension: profile.restrictions.includes('hypertension'),
            weight_loss: profile.goal === 'lose_weight',
          });

        if (updateError) console.log('Profile update error:', updateError);

        setUserState(profile);
        setIsOnboarded(true);
        if (profile.profileType === 'elder') setAccessibilityModeState(true);
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Erro ao criar conta' };
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message || 'Erro ao fazer login' };
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setIsOnboarded(true);
    setUserState({
      name: 'Convidado',
      age: 25,
      weight: 70,
      height: 170,
      goal: 'eat_healthy',
      diet: 'omnivore',
      activity: 'moderate',
      restrictions: [],
      dailyCalorieTarget: 2000,
      profileType: 'self',
    });
    setAnalyses(MOCK_ANALYSES);
    setSubscriptionPlan('guest');
    setIsLoading(false);
  };

  const setUser = (u: UserProfile) => {
    setUserState(u);
    if (supabaseUser) {
      supabase.from('profiles').update({
        name: u.name,
        goal: u.goal,
        diet: u.diet,
        activity: u.activity,
        restrictions: u.restrictions,
        daily_calorie_target: u.dailyCalorieTarget,
        age: u.age,
        weight: u.weight,
        height: u.height,
        updated_at: new Date().toISOString(),
      }).eq('id', supabaseUser.id);
    }
  };

  const addAnalysis = async (a: FoodAnalysis) => {
    setAnalyses(prev => [a, ...prev]);
    setTotalScanned(prev => prev + 1);
    setDailyScanCount(prev => prev + 1);

    if (supabaseUser && !isGuest) {
      // Save to scan_history
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('scan_history').insert({
        user_id: supabaseUser.id,
        date: today,
        item_name: a.dish,
        calories: a.nutrients.calories.toString(),
        carbs: a.nutrients.carbs.toString(),
        sodium: a.nutrients.sodium.toString(),
        vitamins: `C:${a.nutrients.vitaminC}mg`,
      });

      // Update streak and total
      await supabase.from('profiles').update({
        total_scanned: totalScanned + 1,
        current_streak: currentStreak + 1,
      }).eq('id', supabaseUser.id);
    }

    setCurrentStreak(prev => prev + 1);
  };

  const logout = async () => {
    if (!isGuest) {
      await supabase.auth.signOut();
    }
    setUserState(null);
    setIsOnboarded(false);
    setIsGuest(false);
    setIsAdmin(false);
    setSession(null);
    setSupabaseUser(null);
    setAnalyses([]);
    setFamilyMembers(DEFAULT_FAMILY);
    setActiveMemberId('main');
    setSubscriptionPlan('free');
    setDailyScanCount(0);
    setCurrentStreak(0);
    setTotalScanned(0);
  };

  const addFamilyMember = (m: FamilyMember) => {
    setFamilyMembers(prev => [...prev, m]);
  };

  const switchActiveMember = (id: string) => {
    setActiveMemberId(id);
  };

  const setAccessibilityMode = (v: boolean) => {
    setAccessibilityModeState(v);
  };

  return (
    <AppContext.Provider value={{
      user, supabaseUser, session, isOnboarded, isLoggedIn, isGuest, isAdmin, isLoading,
      analyses, currentStreak, totalScanned, dailyCaloriesConsumed,
      familyMembers, activeMemberId, accessibilityMode, subscriptionPlan, dailyScanCount,
      setUser, completeOnboarding, loginWithEmail, continueAsGuest,
      addAnalysis, logout, addFamilyMember, switchActiveMember, setAccessibilityMode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
