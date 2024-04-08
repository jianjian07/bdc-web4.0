export interface toolbarModel {
    name: string,
    icon: string,
    type: string,
    component: string,
    hidden?: string,
    children?: toolbarModel[]
}