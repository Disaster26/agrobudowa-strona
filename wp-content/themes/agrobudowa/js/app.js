(function(){
  'use strict';
  var d=document, body=d.body;

  /* zgody (baner cookies) */
  var KLUCZ='ab-zgody';
  function zgody(){try{var v=JSON.parse(localStorage.getItem(KLUCZ)||'null');if(v&&Date.now()-v.t<31536e6)return v;}catch(e){}return null;}
  function zapiszZgody(m,s){var v={m:m?1:0,s:s?1:0,t:Date.now()};try{localStorage.setItem(KLUCZ,JSON.stringify(v));}catch(e){}stosuj(v);return v;}
  function zgodaMedia(){var v=zgody();return !!(v&&v.m);}
  function stosuj(v){
    if(v&&v.s&&window.abGa)window.abGa();
    if(!v||v.m)mapaGotowa();
  }

  /* menu mobilne */
  var burger=d.querySelector('.burger'), menu=d.getElementById('menu-mob');
  if(burger&&menu){
    burger.addEventListener('click',function(){
      var o=burger.getAttribute('aria-expanded')==='true';
      burger.setAttribute('aria-expanded',String(!o));
      burger.setAttribute('aria-label',o?'Otwórz menu':'Zamknij menu');
      menu.hidden=o;
    });
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){menu.hidden=true;burger.setAttribute('aria-expanded','false');burger.focus();}});
  }

  /* pasek mobilny po przewinięciu za przyciski pierwszego ekranu */
  var pasek=d.querySelector('.mob-pasek');
  if(pasek&&'IntersectionObserver' in window){
    var cel=d.querySelector('.hero-btns')||d.querySelector('.podt');
    if(cel){
      new IntersectionObserver(function(en){
        var w=!en[0].isIntersecting&&en[0].boundingClientRect.top<0;
        pasek.classList.toggle('widac',w);
        pasek.setAttribute('aria-hidden',String(!w));
        pasek.querySelectorAll('a').forEach(function(a){a.tabIndex=w?0:-1;});
      }).observe(cel);
    }
  }

  /* galerie w kartach: palec, mysz, strzałki, licznik */
  var galerie={};
  d.querySelectorAll('.gal[data-gal]').forEach(function(g){
    var tor=g.querySelector('.gal-tor'), n=tor.querySelectorAll('figure').length;
    var licz=g.querySelector('.gal-i'), p=g.querySelector('.gal-p'), x=g.querySelector('.gal-x');
    var karta=g.closest('.karta'), tyt=karta?karta.querySelector('h3').textContent:'';
    galerie[g.dataset.gal]={tor:tor,tyt:tyt,kadry:g.dataset.kadry==='1'};
    function idx(){return Math.round(tor.scrollLeft/Math.max(1,tor.clientWidth));}
    function upd(){var i=idx();if(licz)licz.textContent=i+1;if(p)p.disabled=i<=0;if(x)x.disabled=i>=n-1;}
    function idz(i){tor.scrollTo({left:Math.max(0,Math.min(n-1,i))*tor.clientWidth,behavior:'smooth'});}
    if(p)p.addEventListener('click',function(){idz(idx()-1);});
    if(x)x.addEventListener('click',function(){idz(idx()+1);});
    tor.addEventListener('scroll',function(){window.requestAnimationFrame(upd);},{passive:true});
    tor.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();idz(idx()+1);}if(e.key==='ArrowLeft'){e.preventDefault();idz(idx()-1);}if(e.key==='Enter'){otworzLb(g.dataset.gal,idx());}});
    upd();
    var start=0,sl=0,ciag=false,ruch=0;
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;ciag=true;ruch=0;start=e.clientX;sl=tor.scrollLeft;});
    window.addEventListener('pointermove',function(e){if(!ciag)return;var dx=e.clientX-start;ruch=Math.max(ruch,Math.abs(dx));if(ruch>4){tor.classList.add('ciagnie');tor.scrollLeft=sl-dx;}});
    window.addEventListener('pointerup',function(e){if(!ciag)return;ciag=false;tor.classList.remove('ciagnie');if(ruch>4){var dx=e.clientX-start;idz(Math.round(sl/tor.clientWidth)+(dx<-40?1:dx>40?-1:0));}});
    tor.addEventListener('click',function(e){if(ruch>4){e.preventDefault();ruch=0;return;}otworzLb(g.dataset.gal,idx());});
  });
  d.querySelectorAll('[data-otworz]').forEach(function(b){b.addEventListener('click',function(){otworzLb(b.dataset.otworz,0);});});

  /* powiększenie zdjęć */
  var lb=d.getElementById('lb'), lbTor=lb&&lb.querySelector('.lb-tor'), lbLicz=lb&&lb.querySelector('.lb-licz'), lbTyt=lb&&lb.querySelector('.lb-tyt'), ostatni=null, lbN=0;
  function lbIdx(){return Math.round(lbTor.scrollLeft/Math.max(1,lbTor.clientWidth));}
  function otworzLb(id,start){
    var g=galerie[id]; if(!g||!lb)return;
    ostatni=d.activeElement;
    var imgs=g.tor.querySelectorAll('img'); lbN=imgs.length;
    lbTor.innerHTML='';
    imgs.forEach(function(im,i){var f=d.createElement('figure');var n=d.createElement('img');n.src=im.dataset.big||im.currentSrc||im.src;n.alt=im.alt;if(Math.abs(i-start)>1)n.loading='lazy';f.appendChild(n);lbTor.appendChild(f);});
    lbTyt.textContent=g.tyt+(g.kadry?' (kadry z filmu)':'');
    lb.hidden=false;body.classList.add('zablokuj');
    lbTor.scrollLeft=start*lbTor.clientWidth;
    lbLicz.textContent=(start+1)+' / '+lbN;
    lb.querySelector('.lb-z').focus();
  }
  function zamknijLb(){lb.hidden=true;body.classList.remove('zablokuj');lbTor.innerHTML='';if(ostatni)ostatni.focus();}
  if(lb){
    lbTor.addEventListener('scroll',function(){lbLicz.textContent=(lbIdx()+1)+' / '+lbN;},{passive:true});
    lb.querySelector('.lb-z').addEventListener('click',zamknijLb);
    lb.querySelector('.lb-p').addEventListener('click',function(){lbTor.scrollTo({left:(lbIdx()-1)*lbTor.clientWidth,behavior:'smooth'});});
    lb.querySelector('.lb-x').addEventListener('click',function(){lbTor.scrollTo({left:(lbIdx()+1)*lbTor.clientWidth,behavior:'smooth'});});
    lb.addEventListener('click',function(e){if(e.target.tagName==='FIGURE')zamknijLb();});
  }

  /* film YouTube - odtwarzacz wstawiany dopiero po kliknięciu (i za zgodą) */
  var film=d.getElementById('film');
  function graj(id,tyt){
    film.querySelector('.film-ramka').innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0" title="'+tyt.replace(/"/g,'&quot;')+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  }
  function otworzFilm(id,tyt){
    if(!film)return; ostatni=d.activeElement;
    var r=film.querySelector('.film-ramka');
    if(zgodaMedia()){graj(id,tyt);}
    else{
      r.innerHTML='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;text-align:center;color:#fff"><p style="margin:0;max-width:30em">Film jest na YouTube, który zapisuje własne pliki cookies.</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn btn-or" type="button" data-graj>Odtwórz film</button><a class="btn btn-jasny" href="https://www.youtube.com/watch?v='+encodeURIComponent(id)+'" target="_blank" rel="noopener">Otwórz na YouTube</a></div></div>';
      r.querySelector('[data-graj]').addEventListener('click',function(){var v=zgody()||{s:0};zapiszZgody(1,v.s);ukryjBaner();graj(id,tyt);});
    }
    film.querySelector('.film-tyt').textContent=tyt;
    film.hidden=false;body.classList.add('zablokuj');film.querySelector('.lb-z').focus();
  }
  function zamknijFilm(){film.hidden=true;film.querySelector('.film-ramka').innerHTML='';body.classList.remove('zablokuj');if(ostatni)ostatni.focus();}
  d.querySelectorAll('[data-yt]').forEach(function(b){b.addEventListener('click',function(){otworzFilm(b.dataset.yt,b.dataset.tytul||'Film');});});
  if(film){film.querySelector('.lb-z').addEventListener('click',zamknijFilm);film.addEventListener('click',function(e){if(e.target===film)zamknijFilm();});}

  d.addEventListener('keydown',function(e){
    if(lb&&!lb.hidden){if(e.key==='Escape')zamknijLb();if(e.key==='ArrowRight')lb.querySelector('.lb-x').click();if(e.key==='ArrowLeft')lb.querySelector('.lb-p').click();}
    else if(film&&!film.hidden&&e.key==='Escape')zamknijFilm();
  });

  /* filtr realizacji */
  var filtr=d.querySelector('.filtr');
  if(filtr){
    var btns=filtr.querySelectorAll('button'), karty=d.querySelectorAll('.karty-lista .karta');
    var ustaw=function(f){
      btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.f===f));});
      karty.forEach(function(k){k.hidden=!(f==='*'||k.dataset.kat===f);});
    };
    btns.forEach(function(b){b.addEventListener('click',function(){ustaw(b.dataset.f);history.replaceState(null,'',b.dataset.f==='*'?location.pathname:'#'+b.dataset.f);});});
    var h=location.hash.slice(1);
    if(['hale','inwentarskie','konstrukcje'].indexOf(h)>-1)ustaw(h);
  }

  /* formularz zapytania */
  var form=d.getElementById('zapytanie');
  if(form){
    var info=form.querySelector('.f-info'), btn=form.querySelector('button[type=submit]');
    var pokaz=function(ok,msg){info.hidden=false;info.className='f-info '+(ok?'ok':'blad');info.textContent=msg;info.focus();};
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.checkValidity()){form.reportValidity();return;}
      if(form.dataset.tryb==='demo'){pokaz(true,'Wersja testowa: formularz nie wysyła wiadomości. Na stronie docelowej zapytanie trafi na adres firmy, a klient dostanie potwierdzenie.');return;}
      var fd=new FormData(form);fd.append('ajax','1');btn.disabled=true;
      fetch(form.getAttribute('action'),{method:'POST',body:fd,credentials:'same-origin'}).then(function(r){return r.json();}).then(function(j){pokaz(j.ok,j.msg);if(j.ok)form.reset();}).catch(function(){pokaz(false,'Nie udało się wysłać. Prosimy zadzwonić.');}).then(function(){btn.disabled=false;});
    });
  }

  /* mapa Google: po zgodzie, ładowana przy przewinięciu */
  var mapa=d.querySelector('.mapa[data-mapa]'), mapaZaladowana=false;
  function wstawMape(){if(!mapa||mapaZaladowana)return;mapaZaladowana=true;mapa.innerHTML='<iframe title="AGRO-BUDOWA na mapie Google" src="'+mapa.dataset.mapa+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';}
  function mapaGotowa(){
    if(!mapa||mapaZaladowana)return;
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();wstawMape();}},{rootMargin:'300px'});io.observe(mapa);}else wstawMape();
  }

  /* baner cookies */
  var ck=d.getElementById('cookies');
  function ukryjBaner(){if(ck)ck.hidden=true;}
  if(ck){
    var ust=d.getElementById('ck-ust'), cm=d.getElementById('ck-m'), cs=d.getElementById('ck-s');
    var bZap=ck.querySelector('[data-zgoda=zapisz]'), bUst=ck.querySelector('[data-zgoda=ust]');
    var otworzUst=function(){var v=zgody();if(cm)cm.checked=v?!!v.m:true;if(cs)cs.checked=v?!!v.s:false;ust.hidden=false;bZap.hidden=false;bUst.hidden=true;};
    d.addEventListener('click',function(e){
      var b=e.target.closest('[data-zgoda]'); if(!b)return;
      var a=b.dataset.zgoda;
      if(a==='ust'){otworzUst();return;}
      if(a==='pokaz'){e.preventDefault();ck.hidden=false;otworzUst();return;}
      if(a==='min'){zapiszZgody(0,0);ukryjBaner();}
      if(a==='all'){zapiszZgody(1,1);ukryjBaner();}
      if(a==='zapisz'){zapiszZgody(cm&&cm.checked,cs&&cs.checked);ukryjBaner();}
      if(a==='mapa'){var v=zgody()||{s:0};zapiszZgody(1,v.s);ukryjBaner();wstawMape();}
    });
  }
  stosuj(zgody());
})();
