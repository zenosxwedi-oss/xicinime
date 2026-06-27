import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const AD_URL =
  "https://smooth-survey.com/dpm.FIzodpGON/v/ZeGlUw/Ge_m/9RuVZkUElPk/P/TJcgxZNTzWMp3OOTDYkXtFNLzQE/3/MBzJcc5iMimwf";

const AD_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;background:#000;overflow:hidden}
  iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}
</style>
</head>
<body>
<iframe src="${AD_URL}" allowfullscreen allow="autoplay;fullscreen" scrolling="no"></iframe>
</body>
</html>`;

interface HilltopAdModalProps {
  visible: boolean;
  onClose: () => void;
}

const CLOSE_DELAY = 5;

export default function HilltopAdModal({ visible, onClose }: HilltopAdModalProps) {
  const [countdown, setCountdown] = useState(CLOSE_DELAY);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setCountdown(CLOSE_DELAY);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setCountdown(CLOSE_DELAY);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    if (countdown === 0) onClose();
  }, [countdown, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => countdown === 0 && onClose()}
    >
      <View style={styles.container}>
        {Platform.OS !== "web" ? (
          <WebView
            source={{ html: AD_HTML }}
            style={styles.webview}
            javaScriptEnabled
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            mixedContentMode="always"
            originWhitelist={["*"]}
          />
        ) : (
          // @ts-ignore
          <iframe
            src={AD_URL}
            style={{ width: "100%", height: "100%", border: "none", background: "#000" }}
            allowFullScreen
          />
        )}

        <Pressable
          style={[
            styles.closeBtn,
            countdown === 0 ? styles.closeBtnActive : styles.closeBtnDisabled,
          ]}
          onPress={handleClose}
        >
          <Text style={styles.closeBtnText}>
            {countdown > 0 ? `Lewati ${countdown}s` : "✕ Tutup"}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeBtn: {
    position: "absolute",
    top: 44,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeBtnActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  closeBtnDisabled: {
    backgroundColor: "rgba(80,80,80,0.7)",
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
});
