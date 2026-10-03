(() => {
  const root=document.documentElement;
  const langButtons=[...document.querySelectorAll('[data-lang]')];
  const translatables=[...document.querySelectorAll('[data-pt][data-en]')];
  const themeButton=document.getElementById('themeToggle');

  function setLang(lang){
    root.lang=lang==='pt'?'pt-BR':'en';
    localStorage.setItem('genesis_lang',lang);
    langButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
    translatables.forEach(el=>{el.textContent=el.dataset[lang];});
  }

  function resolvedTheme(choice){
    if(choice==='system')return matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
    return choice;
  }
  function setTheme(choice){
    localStorage.setItem('genesis_theme',choice);
    root.dataset.theme=resolvedTheme(choice);
    document.querySelector('meta[name="theme-color"]').setAttribute('content',root.dataset.theme==='light'?'#f6f7fa':'#0b0d12');
    themeButton.textContent=choice==='light'?'☀':choice==='dark'?'☾':'◐';
    themeButton.title=choice==='light'?'Light':choice==='dark'?'Dark':'System';
  }
  function cycleTheme(){
    const current=localStorage.getItem('genesis_theme')||'system';
    setTheme(current==='system'?'light':current==='light'?'dark':'system');
  }

  langButtons.forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  themeButton.addEventListener('click',cycleTheme);
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>{
    if((localStorage.getItem('genesis_theme')||'system')==='system')setTheme('system');
  });

  setLang(localStorage.getItem('genesis_lang')||'pt');
  setTheme(localStorage.getItem('genesis_theme')||'system');
})();
