(function (window, document) {
"use strict";

function showAll(){
  document.querySelectorAll(".reveal").forEach(function(el){
    el.classList.add("is-visible");
  });
}

window.KreditorReveal = {
  initialize: showAll
};

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded", showAll);
}else{
  showAll();
}

})(window, document);
