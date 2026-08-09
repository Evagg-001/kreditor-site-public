(function(window) {
"use strict";

let initialized = false;

function utmData(){
 const q=new URLSearchParams(location.search), keys=["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
 const data={}; keys.forEach(k=>{const v=q.get(k)||sessionStorage.getItem(`kreditor_${k}`);if(v){data[k]=v;sessionStorage.setItem(`kreditor_${k}`,v)}}); return data;
}

function initialize(){
    if(initialized) return false;
    initialized = true;
    utmData();
    return true;
}

window.KreditorUTM = {
    initialize
};

})(window);
