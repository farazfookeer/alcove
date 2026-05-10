import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  ClawHubSkill,
  ClawHubSearchResult,
  InstalledSkill,
} from "../lib/types";

export function useSkillStore() {
  const [results, setResults] = useState<ClawHubSkill[]>([]);
  const [installed, setInstalled] = useState<InstalledSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<ClawHubSkill | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoke<ClawHubSearchResult>("clawhub_search", {
        query,
        limit: 20,
      });
      setResults(res.skills);
    } catch (e) {
      setError(String(e));
      setResults([]);
    }
    setLoading(false);
  }, []);

  const browse = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoke<ClawHubSearchResult>("clawhub_browse", {
        category,
        limit: 20,
      });
      setResults(res.skills);
    } catch (e) {
      setError(String(e));
      setResults([]);
    }
    setLoading(false);
  }, []);

  const getSkill = useCallback(async (slug: string) => {
    try {
      const skill = await invoke<ClawHubSkill>("clawhub_get_skill", { slug });
      setSelectedSkill(skill);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const installSkill = useCallback(async (slug: string) => {
    setInstalling(slug);
    try {
      await invoke<string>("clawhub_install", { slug });
      // Refresh installed list
      await refreshInstalled();
    } catch (e) {
      setError(String(e));
    }
    setInstalling(null);
  }, []);

  const removeSkill = useCallback(async (slug: string) => {
    setInstalling(slug);
    try {
      await invoke<string>("clawhub_remove", { slug });
      await refreshInstalled();
    } catch (e) {
      setError(String(e));
    }
    setInstalling(null);
  }, []);

  const updateAll = useCallback(async () => {
    setLoading(true);
    try {
      await invoke<string>("clawhub_update_all");
      await refreshInstalled();
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }, []);

  const refreshInstalled = useCallback(async () => {
    try {
      const list = await invoke<InstalledSkill[]>("clawhub_list_installed");
      setInstalled(list);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  return {
    results,
    installed,
    loading,
    installing,
    selectedSkill,
    error,
    search,
    browse,
    getSkill,
    installSkill,
    removeSkill,
    updateAll,
    refreshInstalled,
    setSelectedSkill,
  };
}
