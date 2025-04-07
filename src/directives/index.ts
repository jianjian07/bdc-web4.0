import type { App } from 'vue'
import permission from './btnpermission'

const directivesList: any = {
    permission,
}

const setDirectives = {
    install(app: App<Element>) {

        Object.keys(directivesList).forEach((key) => {
            app.directive(key, directivesList[key])
        })
    },
}

export default setDirectives