import { create } from 'zustand';
import { type SettingsRow, type SettingsPatch, getSettings, updateSettings } from './queries';

type State = {
  loaded: boolean;
  data: SettingsRow | null;
  load: () => Promise<void>;
  patch: (p: SettingsPatch) => Promise<void>;
};

export const useSettingsStore = create<State>((set) => ({
  loaded: false,
  data: null,
  async load() {
    const data = await getSettings();
    set({ data, loaded: true });
  },
  async patch(p) {
    const data = await updateSettings(p);
    set({ data });
  },
}));
