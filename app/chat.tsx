import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { SPECIALIST_RESPONSES, ChatMessage } from '@/constants/mockData';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init1',
    sender: 'specialist',
    text: 'Olá! Sou a Dra. Fátima, nutricionista da nossa equipa NutriLens. 💚\n\nEstou aqui para te ajudar com qualquer dúvida sobre alimentação, saúde e nutrição. Como posso ajudar-te hoje?',
    timestamp: Date.now() - 60000,
    type: 'text',
  },
  {
    id: 'init2',
    sender: 'specialist',
    text: '💡 Podes enviar texto, fotos de pratos ou perguntar sobre qualquer alimento. A nossa equipa responde em poucos instantes!',
    timestamp: Date.now() - 55000,
    type: 'tip',
  },
];

const QUICK_QUESTIONS = [
  'Como combater a anemia?',
  'O Mufete é saudável?',
  'O que comer para perder peso?',
  'Dicas para hipertensão',
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, accessibilityMode } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sharedImage, setSharedImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  const fs = (size: number) => accessibilityMode ? size * 1.2 : size;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (text?: string, imageUri?: string) => {
    const msgText = text || inputText.trim();
    if (!msgText && !imageUri) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: msgText || (imageUri ? '📷 [Foto enviada]' : ''),
      timestamp: Date.now(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSharedImage(null);
    scrollToBottom();

    // Simulate specialist typing
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1800 + Math.random() * 1200));
    setIsTyping(false);

    const responseIdx = Math.floor(Math.random() * SPECIALIST_RESPONSES.length);
    const specialistMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'specialist',
      text: SPECIALIST_RESPONSES[responseIdx],
      timestamp: Date.now(),
      type: Math.random() > 0.7 ? 'tip' : 'text',
    };

    setMessages(prev => [...prev, specialistMsg]);
    scrollToBottom();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSharedImage(result.assets[0].uri);
      await sendMessage('', result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await sendMessage('', result.assets[0].uri);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isSpecialist = item.sender === 'specialist';

    return (
      <View style={[styles.msgRow, isSpecialist ? styles.msgRowLeft : styles.msgRowRight]}>
        {isSpecialist && (
          <View style={styles.specialistAvatar}>
            <Text style={{ fontSize: 14 }}>👩🏾‍⚕️</Text>
          </View>
        )}
        <View style={[
          styles.bubble,
          isSpecialist ? styles.bubbleSpecialist : styles.bubbleUser,
          item.type === 'tip' && styles.bubbleTip,
        ]}>
          {item.type === 'tip' && (
            <View style={styles.tipBadge}>
              <MaterialIcons name="lightbulb" size={12} color={Colors.accent} />
              <Text style={styles.tipBadgeText}>Dica da equipa</Text>
            </View>
          )}
          <Text style={[
            styles.bubbleText,
            isSpecialist ? styles.bubbleTextSpecialist : styles.bubbleTextUser,
            { fontSize: fs(FontSize.sm) },
          ]}>
            {item.text}
          </Text>
          <Text style={[styles.msgTime, { color: isSpecialist ? Colors.textMuted : 'rgba(255,255,255,0.5)' }]}>
            {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.specialistBig}>
            <Text style={{ fontSize: 22 }}>👩🏾‍⚕️</Text>
          </View>
          <View>
            <Text style={[styles.headerName, { fontSize: fs(FontSize.md) }]}>Dra. Fátima — NutriLens</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineText, { fontSize: fs(FontSize.xs) }]}>Especialista disponível</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <MaterialIcons name="info-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        ListHeaderComponent={
          <View style={styles.chatIntro}>
            <View style={styles.chatIntroIcon}>
              <MaterialIcons name="health-and-safety" size={28} color={Colors.primary} />
            </View>
            <Text style={[styles.chatIntroTitle, { fontSize: fs(FontSize.md) }]}>
              Falar com os nossos Especialistas
            </Text>
            <Text style={[styles.chatIntroDesc, { fontSize: fs(FontSize.xs) }]}>
              A nossa equipa de nutricionistas angolanas está aqui para te ajudar a comer melhor, sem julgamentos e sem custos extras.
            </Text>
          </View>
        }
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingRow}>
              <View style={styles.specialistAvatar}>
                <Text style={{ fontSize: 14 }}>👩🏾‍⚕️</Text>
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>A escrever</Text>
                <Animated.Text style={[styles.typingDots, { opacity: typingDots }]}>...</Animated.Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <View style={styles.quickQuestionsWrap}>
          <Text style={[styles.quickLabel, { fontSize: fs(FontSize.xs) }]}>Perguntas rápidas:</Text>
          <View style={styles.quickRow}>
            {QUICK_QUESTIONS.map((q, i) => (
              <TouchableOpacity key={i} style={styles.quickChip} onPress={() => sendMessage(q)}>
                <Text style={[styles.quickChipText, { fontSize: fs(FontSize.xs) }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.attachBtn} onPress={takePhoto}>
          <MaterialIcons name="camera-alt" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
          <MaterialIcons name="photo" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { fontSize: fs(FontSize.sm) }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escreve a tua dúvida..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : {}]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim()}
        >
          <MaterialIcons name="send" size={20} color={inputText.trim() ? Colors.textInverse : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  specialistBig: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  headerName: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  onlineText: { color: Colors.primary, fontWeight: FontWeight.medium },
  infoBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  messagesList: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  chatIntro: {
    alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24,
    marginBottom: 8,
  },
  chatIntroIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 2, borderColor: Colors.primary,
  },
  chatIntroTitle: { fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  chatIntroDesc: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 2 },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  specialistAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
  },
  bubble: {
    maxWidth: '78%', borderRadius: Radius.lg, padding: 12, gap: 4,
  },
  bubbleSpecialist: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary, borderBottomRightRadius: 4,
  },
  bubbleTip: {
    backgroundColor: Colors.accentMuted, borderColor: Colors.accent + '55', borderWidth: 1,
  },
  tipBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  tipBadgeText: { fontSize: 10, color: Colors.accent, fontWeight: FontWeight.bold },
  bubbleText: { lineHeight: 20 },
  bubbleTextSpecialist: { color: Colors.textPrimary },
  bubbleTextUser: { color: Colors.textInverse, fontWeight: FontWeight.medium },
  msgTime: { fontSize: 10, alignSelf: 'flex-end' },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, marginTop: 4 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 12,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  typingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  typingDots: { fontSize: FontSize.sm, color: Colors.textSecondary },
  quickQuestionsWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  quickLabel: { color: Colors.textMuted, marginBottom: 8, fontWeight: FontWeight.medium },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: {
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  quickChipText: { color: Colors.textSecondary, fontWeight: FontWeight.medium },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder,
  },
  attachBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg,
    paddingHorizontal: 14, paddingVertical: 10, color: Colors.textPrimary,
    maxHeight: 120, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceBorder, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: Colors.primary },
});
