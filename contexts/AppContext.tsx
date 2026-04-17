import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, FoodAnalysis, MOCK_ANALYSES } from '@/constants/mockData';

interface AppContextType {
  user: UserProfile | null;
  isOnboarded: boolean;
  isLoggedIn: boolean;
  analyses: FoodAnalysis[];
  currentStreak: number;
  totalScanned: number;
  dailyCaloriesConsumed: number;
  setUser: (u: UserProfile) => void;
  completeOnboarding: (u: UserProfile) => void;
  addAnalysis: (a: FoodAnalysis) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>(MOCK_ANALYSES);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalScanned, setTotalScanned] = useState(MOCK_ANALYSES.length);

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
      }
    });
  }, []);

  const completeOnboarding = (u: UserProfile) => {
    setUserState(u);
    setIsOnboarded(true);
    setIsLoggedIn(true);
    AsyncStorage.setItem('nutrilens_user', JSON.stringify(u));
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
    AsyncStorage.removeItem('nutrilens_user');
  };

  return (
    <AppContext.Provider value={{
      user, isOnboarded, isLoggedIn, analyses, currentStreak, totalScanned, dailyCaloriesConsumed,
      setUser, completeOnboarding, addAnalysis, logout,
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
