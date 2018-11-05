import LocalizedStrings from 'react-localization';
import en from './en.js';
import uk from './uk.js';
import ru from './uk.js';


export let strings = new LocalizedStrings({
    en,
    uk,
    ru
});

export function getInterfaceLanguage() {
    return strings.getInterfaceLanguage();
}

export function setLanguage(lang) {
    return strings.setLanguage(lang);
}


export function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)===' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}
