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
    document.location.href = '/';
}

export function getCurrentLanguage() {
    return strings.getLanguage();
}

function setCookie(cname, cvalue, exdays) {
    var d = "0";
    if (exdays != 0) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        d = d.toUTCString();
    }
    var expires = "expires="+ d;
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
