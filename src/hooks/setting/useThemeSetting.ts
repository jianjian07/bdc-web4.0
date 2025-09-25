import { useAppStore } from "/@/store/modules/app";
import { computed, unref } from "vue";

export function useThemeSetting() {
  const appStore = useAppStore();
  const getTheme = computed(() => appStore.getProjectConfig.theme);

  function toggleTheme() {
    setTheme((unref(getTheme) === 'normal' || unref(getTheme) === 'default') ? 'memorial' : 'normal');
  }

  function setTheme(theme: string): void {
    appStore.setProjectConfig({ theme });
  }
  return {
    getTheme,
    toggleTheme
  }
}
