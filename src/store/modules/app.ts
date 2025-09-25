import { defineStore } from "pinia";
import { MenuSetting, ProjectConfig } from "/#/config";
import { PROJ_CFG_KEY } from "/@/enums/cacheEnum";
import { store } from '/@/store';
import { deepMerge } from "/@/utils";
import { Persistent } from "/@/utils/cache/persistent";
interface AppState {
    pageLoading: boolean,
    projectConfig: ProjectConfig | null;
    iframeSrc: string,
    maskShow: boolean,
    maskText: string
}
export const useAppStore = defineStore({
    id: 'app',
    state: (): AppState => ({
        pageLoading: false,
        projectConfig: Persistent.getLocal(PROJ_CFG_KEY),
        iframeSrc: '',
        maskShow: false,
        maskText: '蒙版默认文字'
    }),
    getters: {
        getProjectConfig(): ProjectConfig {
            // return this.projectConfig || ({ menuSetting: { collapsed: false } } as ProjectConfig)
            return this.projectConfig || ({} as ProjectConfig);
        },
        getPageLoading(): boolean {
            return this.pageLoading;
        },
        getMenuSetting(): MenuSetting {
            return this.getProjectConfig.menuSetting;
        },
        getTheme(): string {
            return this.getProjectConfig.theme;
        },
        getIframeSrc(): string {
            return this.iframeSrc
        }
    },
    actions: {
        setPageLoading(loading: boolean): void {
            this.pageLoading = loading
        },
        setProjectConfig(config: DeepPartial<ProjectConfig>): void {
            this.projectConfig = deepMerge(this.projectConfig || {}, config);
            Persistent.setLocal(PROJ_CFG_KEY, this.projectConfig);
        },
        setIframeSrc(src) {
            this.iframeSrc = src
        },
        setMaskShow(show: boolean) {
            this.maskShow = show
        },
        setMaskText(text: string) {
            this.maskText = text
        }
    }
})

export function useAppStoreWithOut() {
    return useAppStore(store);
}
