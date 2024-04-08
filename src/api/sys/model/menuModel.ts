import { RouteMeta } from "vue-router";

export interface RouteItem {
    icon: string;
    path: string;
    component: string;
    meta: RouteMeta;
    name?: string;
    redirect?: string;
    children?: RouteItem[];
    hidden: boolean;
}
export type getMenuListResultModel = RouteItem[];

export interface menuModel {
    id: string;
    icon: string;
    path: string;
    component: string;
    meta: RouteMeta;
    name: string;
    redirect?: string;
    children?: menuModel[];
    hidden: boolean;
    extra?: any
}
