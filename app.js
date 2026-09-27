/* components.js */
/* KREDITOR V16.2 COMPONENT FOUNDATION */
(function(){
  'use strict';

  var API = window.KreditorComponents || {};

  function qsa(selector, root){
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ensureToastRegion(){
    var region = document.querySelector('.k-toast-region');
    if(region) return region;
    region = document.createElement('div');
    region.className = 'k-toast-region';
    region.setAttribute('aria-live','polite');
    region.setAttribute('aria-atomic','false');
    document.body.appendChild(region);
    return region;
  }

  API.toast = function(message, options){
    options = options || {};
    var region = ensureToastRegion();
    var toast = document.createElement('div');
    toast.className = 'k-toast';
    toast.dataset.state = options.state || 'info';
    toast.setAttribute('role', options.state === 'error' ? 'alert' : 'status');

    var text = document.createElement('div');
    text.className = 'k-toast__text';
    text.textContent = String(message || '');

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'k-toast__close';
    close.setAttribute('aria-label','Закрыть уведомление');
    close.textContent = '×';
    close.addEventListener('click', function(){ toast.remove(); });

    toast.appendChild(document.createElement('span'));
    toast.appendChild(text);
    toast.appendChild(close);
    region.appendChild(toast);

    window.setTimeout(function(){
      if(toast.isConnected) toast.remove();
    }, Number(options.duration || 4500));
    return toast;
  };

  API.setBusy = function(element, busy, label){
    if(!element) return;
    if(busy){
      if(!element.dataset.kOriginalLabel) element.dataset.kOriginalLabel = element.textContent.trim();
      element.setAttribute('aria-busy','true');
      element.disabled = true;
      if(label) element.textContent = label;
    }else{
      element.removeAttribute('aria-busy');
      element.disabled = false;
      if(element.dataset.kOriginalLabel){
        element.textContent = element.dataset.kOriginalLabel;
        delete element.dataset.kOriginalLabel;
      }
    }
  };

  API.announce = function(message, state){
    var region = document.getElementById('kreditor-announcer');
    if(!region){
      region = document.createElement('div');
      region.id = 'kreditor-announcer';
      region.className = 'sr-only';
      region.setAttribute('aria-live','polite');
      region.setAttribute('aria-atomic','true');
      document.body.appendChild(region);
    }
    region.textContent = '';
    window.setTimeout(function(){ region.textContent = String(message || ''); }, 20);
    if(state === 'error') region.setAttribute('role','alert');
    else region.removeAttribute('role');
  };

  function annotateCards(){
    qsa('.contact-card,.info-card,.solution-card,.audience-card,.article-card,.team-card,.faq-item,.thank-you-card').forEach(function(el){
      if(!el.dataset.kComponent) el.dataset.kComponent = 'card';
      if(el.matches('a,[role="button"]') || el.querySelector('a,button')) el.dataset.kInteractive = 'true';
    });
  }

  function annotateCTAs(){
    qsa('.btn,.header-cta,.desktop-sticky-main,.lead-channel-btn,.modal-contact-link').forEach(function(el){
      if(!el.dataset.kComponent) el.dataset.kComponent = 'cta';
    });
  }

  function annotateFields(){
    qsa('form').forEach(function(form){
      qsa('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),textarea,select', form).forEach(function(control){
        var wrapper = control.closest('.form-field,.field,.form-group,label');
        if(wrapper && wrapper !== control) wrapper.dataset.kComponent = 'field';
      });
    });
  }

  function enhanceValidation(){
    qsa('form').forEach(function(form){
      form.addEventListener('submit', function(){
        qsa('input,textarea,select', form).forEach(function(control){
          if(control.willValidate) control.setAttribute('aria-invalid', control.validity.valid ? 'false' : 'true');
        });
      }, true);
      form.addEventListener('input', function(event){
        var control = event.target;
        if(control && control.willValidate && control.validity.valid) control.setAttribute('aria-invalid','false');
      });
      form.addEventListener('change', function(event){
        var control = event.target;
        if(control && control.willValidate && control.validity.valid) control.setAttribute('aria-invalid','false');
      });
    });
  }

  function enhanceLinks(){
    qsa('a[target="_blank"]').forEach(function(link){
      var rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener','noreferrer'].forEach(function(token){ if(rel.indexOf(token) < 0) rel.push(token); });
      link.setAttribute('rel', rel.join(' '));
    });
  }

  function enhanceFooter(){
    qsa('.site-footer,.footer').forEach(function(footer){ footer.dataset.kComponent = 'footer'; });
  }

  function init(){
    annotateCards();
    annotateCTAs();
    annotateFields();
    enhanceValidation();
    enhanceLinks();
    enhanceFooter();
    document.documentElement.dataset.kComponents = 'ready';
    document.dispatchEvent(new CustomEvent('kreditor:components-ready'));
  }

  API.init = init;
  window.KreditorComponents = API;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();

/* script.js */
"use strict";
const $=(s,r=document)=>r.querySelector(s);



function track(event,params={}){
  try{
    if(typeof window.ym==="function" && window.KREDITOR_ANALYTICS?.yandexMetrikaId){window.ym(window.KREDITOR_ANALYTICS.yandexMetrikaId,"reachGoal",event,params)}
    window.dispatchEvent(new CustomEvent("kreditor:analytics",{detail:{event,params}}));
  }catch(e){void e;/* analytics must never block UX */}
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    $("#lead-modal")?.close();
  }
});



// KREDITOR V10: conversion analytics and friction diagnostics
document.querySelectorAll('form[data-conversion-form="lead"]').forEach(form=>{
  let started=false;
  form.addEventListener("focusin",()=>{
    if(!started){
      started=true;
      if(typeof track==="function") track("conversion_form_start",{page:location.pathname});
    }
  },{once:true});
  form.addEventListener("submit",()=>{
    if(typeof track==="function") track("conversion_submit_attempt",{page:location.pathname});
  });
});

document.querySelectorAll("[data-analytics]").forEach(el=>{
  el.addEventListener("click",()=>{
    if(typeof track==="function") track(el.dataset.analytics,{page:location.pathname});
  });
});

// Preserve campaign parameters without exposing sensitive values
(()=>{
  const params=new URLSearchParams(location.search);
  const allowed=["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  const campaign={};
  allowed.forEach(key=>{
    const value=params.get(key);
    if(value) campaign[key]=value.slice(0,120);
  });
  if(Object.keys(campaign).length){
    try{sessionStorage.setItem("kreditor_campaign",JSON.stringify(campaign));}catch(e){void e;}
  }
  document.querySelectorAll('form[data-conversion-form="lead"]').forEach(form=>{
    let data={};
    try{data=JSON.parse(sessionStorage.getItem("kreditor_campaign")||"{}");}catch(e){void e;}
    Object.entries(data).forEach(([key,value])=>{
      if(form.querySelector(`[name="${key}"]`)) return;
      const input=document.createElement("input");
      input.type="hidden"; input.name=key; input.value=value;
      form.appendChild(input);
    });
  });
})();

/* ux-polish.js */
/* KREDITOR V16.4 UX POLISH */
(() => {
  'use strict';

  const icons = {
    phone: '<svg class="kreditor-channel-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/></svg>',
    whatsapp: '<svg class="kreditor-channel-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a9.8 9.8 0 0 0-8.42 14.82L2 22l5.32-1.52A9.95 9.95 0 1 0 12 2Zm0 17.9a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-3.16.9.94-3.08-.19-.31A7.87 7.87 0 1 1 12 19.9Zm4.33-5.9c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1-.37-1.91-1.18a7.18 7.18 0 0 1-1.33-1.66c-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z"/></svg>',
    telegram: '<svg class="kreditor-channel-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m21.5 3.5-3.2 15.08c-.24 1.07-.87 1.33-1.76.83l-4.87-3.59-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.96 9.03-8.16c.39-.35-.09-.55-.61-.2L5.95 12.27l-4.8-1.5c-1.04-.33-1.06-1.04.22-1.54L20.14 2c.87-.32 1.63.2 1.36 1.5Z"/></svg>',
    email: '<svg class="kreditor-channel-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/></svg>'
  };

  const enhance = (root = document) => {
    root.querySelectorAll('[data-contact-channel]').forEach((node) => {
      const channel = node.getAttribute('data-contact-channel');
      const svg = icons[channel];
      if (!svg || node.querySelector('.kreditor-channel-svg')) return;

      const target = node.matches('.desktop-sticky-cta > a')
        ? node
        : node.querySelector('.modal-contact-icon, .lead-channel-icon, span');

      if (target) target.innerHTML = svg;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => enhance());
  } else {
    enhance();
  }

  window.KreditorUXPolish = { enhance };
})();

/* KREDITOR reveal fail-safe */
(function () {
  "use strict";

  function revealAll() {
    document.querySelectorAll(".reveal").forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", revealAll, { once: true });
  } else {
    revealAll();
  }

  window.setTimeout(revealAll, 300);
})();
