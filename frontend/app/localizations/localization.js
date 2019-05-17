import LocalizedStrings from 'react-localization';
import en from './en.js';
import uk from './uk.js';


export let strings = new LocalizedStrings({
    en,
    uk
});

export function getInterfaceLanguage() {
    return strings.getInterfaceLanguage();
}

export function setLanguage(lang) {
    return strings.setLanguage(lang);
}

export function switchLanguage(lang) {
    setCookie("lang", lang, 0);
    // TODO: make it without refresh using changing state Redux
    document.location.href = '/';
}

export function getCurrentLanguage() {
    return strings.getLanguage();
}

function setCookie(cname, cvalue, exdays) {
    let d = "0";
    if (exdays !== 0) {
        let date = new Date();
        date.setTime(date.getTime() + (exdays*24*60*60*1000));
        d = date.toUTCString();
    }
    let expires = "expires="+ d;
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


export function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        if (c.indexOf(name) > -1) {
            return c.substring(c.indexOf(name) + name.length, c.length);
        }
    }
    return "";
}
