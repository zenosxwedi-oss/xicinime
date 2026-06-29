import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/Theme';

const VERSION = '1.0.0';

interface MenuItemProps {
  icon: any;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, sub, onPress, danger }: MenuItemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={[styles.menuIcon, danger && { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
        <Feather name={icon} size={18} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={styles.menuLabel}>
        <Text style={[styles.menuText, danger && { color: Colors.error }]}>{label}</Text>
        {sub && <Text style={styles.menuSub}>{sub}</Text>}
      </View>
      <Feather name="chevron-right" size={16} color={Colors.muted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
      <StatusBar style="light" />
      <View style={[styles.topSpacer, { paddingTop: insets.top + 8 }]} />

      {/* App identity */}
      <View style={styles.identity}>
        <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} contentFit="cover" />
        <Text style={styles.appName}>XICINIME</Text>
        <Text style={styles.appTagline}>Nonton anime sub indo gratis</Text>
        <Text style={styles.appVersion}>v{VERSION}</Text>
      </View>

      {/* Donate section */}
      <View style={styles.donateCard}>
        <View style={styles.donateLeft}>
          <Text style={styles.donateTitle}>💜 Dukung Xicinime</Text>
          <Text style={styles.donateSub}>Bantu kami terus beroperasi dengan donasi kecilmu</Text>
        </View>
        <Pressable
          style={styles.donateBtn}
          onPress={() => Linking.openURL('https://trakteer.id/xicinime/tip')}
        >
          <Text style={styles.donateBtnText}>Donasi</Text>
        </Pressable>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Umum</Text>
        <View style={styles.card}>
          <MenuItem
            icon="globe"
            label="Buka Website"
            sub="xicinime.my.id"
            onPress={() => Linking.openURL('https://xicinime.my.id')}
          />
          <MenuItem
            icon="download"
            label="Download APK Terbaru"
            sub="Dapatkan versi terbaru"
            onPress={() => Linking.openURL('https://xicinime.my.id/download')}
          />
          <MenuItem
            icon="message-circle"
            label="Lapor Masalah"
            sub="Hubungi kami via Trakteer"
            onPress={() => Linking.openURL('https://trakteer.id/xicinime/tip')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tentang</Text>
        <View style={styles.card}>
          <MenuItem
            icon="info"
            label="Tentang Xicinime"
            sub={`Versi ${VERSION}`}
            onPress={() => Alert.alert('Xicinime', `Aplikasi streaming anime sub indo gratis.\nVersi ${VERSION}\n\n© 2026 Xicinime`)}
          />
          <MenuItem
            icon="shield"
            label="Kebijakan Privasi"
            onPress={() => Linking.openURL('https://xicinime.my.id')}
          />
        </View>
      </View>

      <Text style={styles.footer}>Made with 💜 by Xicinime Team</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  topSpacer: {},
  identity: { alignItems: 'center', paddingVertical: Spacing.xl },
  appIcon: { width: 80, height: 80, borderRadius: Radius.xl, marginBottom: 12 },
  appName: { color: Colors.primary, fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  appTagline: { color: Colors.subtext, fontSize: 13, marginTop: 4 },
  appVersion: { color: Colors.muted, fontSize: 11, marginTop: 4 },
  donateCard: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.surface2,
    borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row',
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  donateLeft: { flex: 1 },
  donateTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  donateSub: { color: Colors.subtext, fontSize: 12, lineHeight: 17 },
  donateBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full },
  donateBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.subtext, fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: Spacing.lg, marginBottom: 8, textTransform: 'uppercase' },
  card: { backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: 'rgba(147,51,234,0.15)', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1 },
  menuText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  menuSub: { color: Colors.subtext, fontSize: 11, marginTop: 1 },
  footer: { color: Colors.muted, textAlign: 'center', fontSize: 12, marginTop: Spacing.lg, marginBottom: Spacing.md },
});
