/* EVOLU Platform | UX-SHELL-1.
   Shared PRESENTATION only; identity, capabilities and tenant boundaries
   in public static previews must never be mistaken for authorization. */
(function(global){
  'use strict';
  function initialize(root){
    const host=root||document;
    const sidebar=host.querySelector('[data-ux-sidebar]');
    const brand=host.querySelector('[data-ux-brand]');
    const drawerOpen=host.querySelector('[data-menu-open]');
    const drawerClose=host.querySelector('[data-menu-close]');
    const themeSwitch=host.querySelector('[data-theme-toggle]');
    const langSwitch=host.querySelector('[data-locale-toggle]');
    if(!sidebar||!brand)return;
    const isMobile=()=>global.matchMedia('(max-width:767px)').matches;
    let returnFocus=null;

    function updateBrand(){
      const collapsed=document.body.classList.contains('ux-collapsed');
      const english=document.documentElement.lang.toLowerCase().startsWith('en');
      const label=english?(collapsed?'Expand menu':'Collapse menu'):(collapsed?'Expandir menu':'Recolher menu');
      brand.title=label;brand.setAttribute('aria-label',label);
      brand.setAttribute('aria-expanded',String(!collapsed));
    }
    function toggleBrand(){
      if(isMobile()){closeDrawer();return;}
      document.body.classList.toggle('ux-collapsed');updateBrand();
    }
    function showDrawer(){
      if(!isMobile())return;
      returnFocus=document.activeElement;
      sidebar.classList.add('ux-open');
      drawerOpen?.setAttribute('aria-expanded','true');
      drawerClose?.focus();
    }
    function closeDrawer(){
      const hadDrawer=sidebar.classList.contains('ux-open');
      sidebar.classList.remove('ux-open');
      drawerOpen?.setAttribute('aria-expanded','false');
      if(hadDrawer&&returnFocus instanceof HTMLElement)returnFocus.focus();
    }
    function synchronizeViewport(){
      // The mobile drawer always opens with readable labels, even when desktop was collapsed.
      if(isMobile())document.body.classList.remove('ux-collapsed');
      else closeDrawer();
      updateBrand();
    }
    function updateTheme(){
      const isLight=document.documentElement.dataset.theme==='light';
      themeSwitch?.setAttribute('aria-label',document.documentElement.lang.startsWith('en')?'Toggle color theme':'Alternar tema');
      if(themeSwitch)themeSwitch.textContent=isLight?'☾':'☀';
    }
    function updateLocale(){
      if(langSwitch)langSwitch.textContent=document.documentElement.lang.startsWith('en')?'PT':'EN';
      updateBrand();updateTheme();
      for(const item of sidebar.querySelectorAll('.ux-nav a,.ux-nav button')){
        const span=item.querySelector('.ux-nav-label');
        const title=span?.textContent?.trim()||item.textContent?.trim()||'';
        if(title){item.title=title;item.setAttribute('aria-label',title);}
      }
    }
    brand.addEventListener('click',toggleBrand);
    drawerOpen?.addEventListener('click',showDrawer);
    drawerClose?.addEventListener('click',closeDrawer);
    sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(isMobile())closeDrawer();}));
    themeSwitch?.addEventListener('click',()=>{
      document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'dark':'light';
      updateTheme();
      document.dispatchEvent(new CustomEvent('ux:theme',{detail:{theme:document.documentElement.dataset.theme}}));
    });
    langSwitch?.addEventListener('click',()=>{
      const next=document.documentElement.lang.startsWith('en')?'pt-BR':'en';
      document.documentElement.lang=next;
      document.dispatchEvent(new CustomEvent('ux:locale',{detail:{locale:next}}));
      updateLocale();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('ux-open'))closeDrawer();});
    global.addEventListener('resize',synchronizeViewport);
    document.addEventListener('ux:navigation-update',updateLocale);
    updateLocale();updateTheme();synchronizeViewport();
    global.EvoluShell={updateLocale,closeDrawer};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initialize(document),{once:true});
  else initialize(document);
})(window);
