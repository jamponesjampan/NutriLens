import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, FoodAnalysis, MOCK_ANALYSES, FamilyMember } from '@/constants/mockData';

interface AppContextType {
  user: UserProfile | null;
  isOnboarded: boolean;
  isLoggedIn: boolean;
  analyses: FoodAnalysis[];
  currentStreak: number;
  totalScanned: number;
  dailyCaloriesConsumed: number;
  familyMembers: FamilyMember[];
  activeMemberId: string;
  accessibilityMode: boolean;
  setUser: (u: UserProfile) => void;
  completeOnboarding: (u: UserProfile) => void;
  addAnalysis: (a: FoodAnalysis) => void;
  logout: () => void;
  addFamilyMember: (m: FamilyMember) => void;
  switchActiveMember: (id: string) => void;
  setAccessibilityMode: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_FAMILY: FamilyMember[] = [
  {
    id: 'admin',
    name: 'Eu',
    profileType: 'self',
    emoji: '🧑',
    color: '#4ADE80',
    goal: 'eat_healthy',
    restrictions: [],
    dailyCalorieTarget: 2000,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>(MOCK_ANALYSES);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalScanned, setTotalScanned] = useState(MOCK_ANALYSES.length);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(DEFAULT_FAMILY);
  const [activeMemberId, setActiveMemberId] = useState('admin');
  const [accessibilityMode, setAccessibilityModeState] = useState(false);

  const dailyCaloriesConsumed = analyses
    .filter(a => {
      const today = new Date().toDateString();
      return new Date(a.timestamp).toDateString() === today;
    })
    .reduce((sum, a) => sum + a.nutrients.calories, 0);

  useEffect(() => {
    AsyncStorage.getItem('nutrilens_user').then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        setUserState(parsed);
        setIsOnboarded(true);
        setIsLoggedIn(true);
        if (parsed.profileType === 'elder') {
          setAccessibilityModeState(true);
        }
      }
    });
    AsyncStorage.getItem('nutrilens_family').then(data => {
      if (data) {
        const parsed = JSON.parse(data);
        setFamilyMembers(parsed);
      }
    });
  }, []);

  const completeOnboarding = (u: UserProfile) => {
    setUserState(u);
    setIsOnboarded(true);
    setIsLoggedIn(true);
    if (u.profileType === 'elder') setAccessibilityModeState(true);
    AsyncStorage.setItem('nutrilens_user', JSON.stringify(u));
    // Update admin family member
    const updatedFamily = DEFAULT_FAMILY.map(m =>
      m.id === 'admin' ? { ...m, name: u.name, goal: u.goal, restrictions: u.restrictions, dailyCalorieTarget: u.dailyCalorieTarget } : m
    );
    setFamilyMembers(updatedFamily);
    AsyncStorage.setItem('nutrilens_family', JSON.stringify(updatedFamily));
  };

  const setUser = (u: UserProfile) => {
    setUserState(u);
    AsyncStorage.setItem('nutrilens_user', JSON.stringify(u));
  };

  const addAnalysis = (a: FoodAnalysis) => {
    setAnalyses(prev => [a, ...prev]);
    setTotalScanned(prev => prev + 1);
    setCurrentStreak(prev => prev + 1);
  };

  const logout = () => {
    setUserState(null);
    setIsOnboarded(false);
    setIsLoggedIn(false);
    setFamilyMembers(DEFAULT_FAMILY);
    setActiveMemberId('admin');
    AsyncStorage.removeItem('nutrilens_user');
    AsyncStorage.removeItem('nutrilens_family');
  };

  const addFamilyMember = (m: FamilyMember) => {
    const updated = [...familyMembers, m];
    setFamilyMembers(updated);
    AsyncStorage.setItem('nutrilens_family', JSON.stringify(updated));
  };

  const switchActiveMember = (id: string) => {
    setActiveMemberId(id);
  };

  const setAccessibilityMode = (v: boolean) => {
    setAccessibilityModeState(v);
  };

  return (
    <AppContext.Provider value={{
      user, isOnboarded, isLoggedIn, analyses, currentStreak, totalScanned, dailyCaloriesConsumed,
      familyMembers, activeMemberId, accessibilityMode,
      setUser, completeOnboarding, addAnalysis, logout,
      addFamilyMember, switchActiveMember, setAccessibilityMode,
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
