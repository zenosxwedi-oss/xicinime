import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import HilltopAdModal from "@/components/HilltopAdModal";
import { useColors } from "@/hooks/useColors";
import { getEpisode, getServerUrl } from "@/lib/api";
import type { EpisodeDetail, EpisodeServer } from "@/types";

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = width * (9 / 16);

function buildPlayerHtml(url: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;background:#000;overflow:hidden}
  iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}
  video{position:absolute;top:0;left:0;width:100%!important;height:100%!important;object-fit:contain;background:#000}
</style>
</head>
<body>
<iframe
  src="${url}"
  allowfullscreen
  allow="autoplay;fullscreen;encrypted-media;picture-in-picture"
  scrolling="no"
></iframe>
<script>
(function(){
  function tryAutoplay(){
    try{
      var f=document.querySelector('iframe');
      if(f&&f.contentDocument){
        var v=f.contentDocument.querySelector('video');
        if(v){v.play();return;}
        var btn=f.contentDocument.querySelector('.play-button,[class*="play"],[id*="play"],button');
        if(btn)btn.click();
      }
    }catch(e){}
  }
  setTimeout(tryAutoplay,800);
  setTimeout(tryAutoplay,2000);
  window.addEventListener('message',function(e){
    if(e.data==='play'){tryAutoplay();}
  });
})();
</script>
</body>
</html>`;
}

function flattenServers(data: EpisodeDetail) {
  const servers: { label: string; server: EpisodeServer }[] = [];
  data.server?.qualities?.forEach((q) => {
    q.serverList?.forEach((s, i) => {
      servers.push({ label: s.title, server: s });
    });
  });
  return servers;
}

export default function WatchScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);

  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loadingServer, setLoadingServer] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  // HilltopAds
  const [adVisible, setAdVisible] = useState(false);
  const pendingAction = useRef<(() => Promise<void>) | null>(null);

  const showAdThen = useCallback((action: () => Promise<void>) => {
    pendingAction.current = action;
    setAdVisible(true);
  }, []);

  const handleAdClose = useCallback(async () => {
    setAdVisible(false);
    if (pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      await action();
    }
  }, []);

  const { data, isLoading, isError, refetch } = useQuery<EpisodeDetail>({
    queryKey: ["episode", episodeId],
    queryFn: () => getEpisode(episodeId!),
    enabled: !!episodeId,
  });

  React.useEffect(() => {
    if (data?.defaultStreamingUrl && !streamUrl) {
      setStreamUrl(data.defaultStreamingUrl);
    }
  }, [data?.defaultStreamingUrl]);

  const handleServerSelect = useCallback(async (server: EpisodeServer) => {
    if (selectedServerId === server.serverId) return;
    showAdThen(async () => {
      setSelectedServerId(server.serverId);
      setLoadingServer(true);
      try {
        const res = await getServerUrl(server.serverId);
        setStreamUrl(res.url);
      } catch {
      } finally {
        setLoadingServer(false);
      }
    });
  }, [selectedServerId, showAdThen]);

  if (isLoading) {
    return (
      <View style={[styles.fullCenter, { backgroundColor: "#000" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Memuat episode...
        </Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.fullCenter, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Feather name="alert-circle" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Gagal memuat episode
        </Text>
        <Pressable
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  const currentUrl = streamUrl || data.defaultStreamingUrl;
  const allServers = flattenServers(data);
  const synopsis = data.synopsis?.paragraphs?.join(" ") || "";
  const shortSynopsis = synopsis.length > 180 ? synopsis.slice(0, 180) + "..." : synopsis;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <HilltopAdModal visible={adVisible} onClose={handleAdClose} />

      {/* ───── TOP BAR ───── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: "#fff" }]} numberOfLines={1}>
          {data.title}
        </Text>
      </View>

      {/* ───── PLAYER ───── */}
      <View style={[styles.player, { height: PLAYER_HEIGHT }]}>
        {loadingServer ? (
          <View style={styles.playerCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : currentUrl && Platform.OS !== "web" ? (
          <WebView
            ref={webviewRef}
            source={{ html: buildPlayerHtml(currentUrl) }}
            style={styles.webview}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mixedContentMode="always"
            originWhitelist={["*"]}
            onShouldStartLoadWithRequest={() => true}
          />
        ) : currentUrl && Platform.OS === "web" ? (
          // @ts-ignore
          <iframe
            src={currentUrl}
            style={{ width: "100%", height: "100%", border: "none", background: "#000" }}
            allowFullScreen
          />
        ) : (
          <View style={styles.playerCenter}>
            <Feather name="video-off" size={36} color="#555" />
            <Text style={{ color: "#555", fontSize: 13, marginTop: 8 }}>
              Stream tidak tersedia
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ───── SERVER SELECTOR ───── */}
        <View style={styles.serverSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serverScroll}
          >
            {/* Default button */}
            {(() => {
              const isDefault = !selectedServerId;
              return (
                <Pressable
                  key="default"
                  style={[
                    styles.serverBtn,
                    isDefault
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 },
                  ]}
                  onPress={() => showAdThen(async () => {
                    setSelectedServerId(null);
                    setStreamUrl(data.defaultStreamingUrl);
                  })}
                >
                  <Feather
                    name="play-circle"
                    size={13}
                    color={isDefault ? "#fff" : colors.primary}
                  />
                  <Text
                    style={[
                      styles.serverBtnText,
                      { color: isDefault ? "#fff" : colors.primary },
                    ]}
                  >
                    Default
                  </Text>
                </Pressable>
              );
            })()}

            {allServers.map(({ label, server }, index) => {
              const isActive = selectedServerId === server.serverId;
              return (
                <Pressable
                  key={server.serverId}
                  style={[
                    styles.serverBtn,
                    isActive
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 },
                  ]}
                  onPress={() => handleServerSelect(server)}
                >
                  <Text
                    style={[
                      styles.serverBtnText,
                      { color: isActive ? "#fff" : colors.primary },
                    ]}
                  >
                    {label.trim() || `Server ${index + 1}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ───── EPISODE NAV ───── */}
        <View style={styles.navRow}>
          <Pressable
            style={[
              styles.navBtn,
              {
                backgroundColor: data.hasPrevEpisode ? colors.card : "transparent",
                borderColor: data.hasPrevEpisode ? colors.border : "transparent",
                opacity: data.hasPrevEpisode ? 1 : 0.35,
              },
            ]}
            onPress={() =>
              data.prevEpisode &&
              router.replace(`/watch/${data.prevEpisode.episodeId}`)
            }
            disabled={!data.hasPrevEpisode}
          >
            <Feather name="chevron-left" size={16} color={colors.foreground} />
            <Text style={[styles.navText, { color: colors.foreground }]}>
              Sebelumnya
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.navBtn,
              {
                backgroundColor: data.hasNextEpisode ? colors.primary : "transparent",
                borderColor: data.hasNextEpisode ? colors.primary : "transparent",
                opacity: data.hasNextEpisode ? 1 : 0.35,
              },
            ]}
            onPress={() =>
              data.nextEpisode &&
              router.replace(`/watch/${data.nextEpisode.episodeId}`)
            }
            disabled={!data.hasNextEpisode}
          >
            <Text
              style={[
                styles.navText,
                { color: data.hasNextEpisode ? "#fff" : colors.foreground },
              ]}
            >
              Selanjutnya
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={data.hasNextEpisode ? "#fff" : colors.foreground}
            />
          </Pressable>
        </View>

        {/* ───── INFO ───── */}
        <View style={styles.infoSection}>
          {/* Title */}
          <Text style={[styles.episodeTitle, { color: "#fff" }]}>
            {data.title}
          </Text>

          {/* Release badge */}
          {data.releasedOn ? (
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: colors.primary + "33", borderColor: colors.primary }]}>
                <Feather name="clock" size={11} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {data.releasedOn}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Genre pills */}
          {data.genreList?.length > 0 && (
            <View style={styles.genreWrap}>
              {data.genreList.map((g) => (
                <View
                  key={g.genreId}
                  style={[styles.genrePill, { borderColor: colors.border }]}
                >
                  <Text style={[styles.genreText, { color: colors.mutedForeground }]}>
                    {g.title}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Synopsis */}
          {synopsis.length > 0 && (
            <View style={styles.synopsisWrap}>
              <Text style={[styles.synopsis, { color: colors.mutedForeground }]}>
                {synopsisExpanded ? synopsis : shortSynopsis}
                {!synopsisExpanded && synopsis.length > 180 && (
                  <Text
                    style={{ color: colors.primary }}
                    onPress={() => setSynopsisExpanded(true)}
                  >
                    {" "}Tampilkan
                  </Text>
                )}
              </Text>
              {synopsisExpanded && (
                <Pressable onPress={() => setSynopsisExpanded(false)}>
                  <Text style={[styles.showLessText, { color: colors.primary }]}>
                    Sembunyikan
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  errorText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginTop: 4 },
  retryText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#0D0D14",
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },

  // Player
  player: { width: "100%", backgroundColor: "#000" },
  playerCenter: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  webview: { flex: 1, backgroundColor: "#000" },

  // Server
  serverSection: { paddingVertical: 14 },
  serverScroll: { paddingHorizontal: 16, gap: 8 },
  serverBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
  },
  serverBtnText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },

  // Nav
  navRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  navText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Info
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#1A1A2A",
    paddingBottom: 8,
  },
  episodeTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    lineHeight: 24,
    marginTop: 12,
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  genreWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  genreText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  synopsisWrap: { gap: 6 },
  synopsis: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  showLessText: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 2 },
});
