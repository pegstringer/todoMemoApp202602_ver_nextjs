"use client";

import { useState, useEffect, useCallback } from "react";
import { audioEngine } from "@/utils/audioEngine";
import { bgmPlayer } from "@/utils/bgm";

const STORAGE_KEY = "todo-memo-app-audio";

type AudioState = {
  muted: boolean;
  bgmEnabled: boolean;
};

const defaultState: AudioState = {
  muted: false,
  bgmEnabled: true,
};

export function useAudio() {
  const [muted, setMuted] = useState(true); // start muted until user interacts
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: AudioState = JSON.parse(saved);
        setMuted(state.muted);
        setBgmEnabled(state.bgmEnabled);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (!initialized) return;
    try {
      const state: AudioState = { muted, bgmEnabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [muted, bgmEnabled, initialized]);

  // Sync mute state with audio engine
  useEffect(() => {
    audioEngine.setMuted(muted);
    if (muted) {
      bgmPlayer.stop();
    } else if (bgmEnabled && initialized) {
      bgmPlayer.start();
    }
  }, [muted, bgmEnabled, initialized]);

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (initialized) return;
    await audioEngine.init();
    setInitialized(true);
    setMuted(false);
    audioEngine.setMuted(false);
  }, [initialized]);

  const toggleMute = useCallback(() => {
    if (!initialized) {
      initAudio();
      return;
    }
    setMuted((prev) => !prev);
  }, [initialized, initAudio]);

  const toggleBgm = useCallback(() => {
    if (!initialized) {
      initAudio();
      return;
    }
    setBgmEnabled((prev) => {
      const next = !prev;
      if (next && !muted) {
        bgmPlayer.start();
      } else {
        bgmPlayer.stop();
      }
      return next;
    });
  }, [initialized, initAudio, muted]);

  return {
    muted,
    bgmEnabled,
    initialized,
    toggleMute,
    toggleBgm,
    initAudio,
  };
}
