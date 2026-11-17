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

  /* okienka realizacji: główne zdjęcie, po kliknięciu wszystkie zdjęcia po kolei (etapy budowy) */
  var galerie={};
  d.querySelectorAll('.gal[data-gal]').forEach(function(g){
    var karta=g.closest('.karta'), lista=[];
    try{lista=JSON.parse(g.dataset.zdj||'[]');}catch(e){}
    galerie[g.dataset.gal]={zdj:lista,tyt:karta?karta.querySelector('h3').textContent:''};
    var okl=g.querySelector('.gal-okl');
    if(okl)okl.addEventListener('click',function(){otworzLb(g.dataset.gal,0);});
  });
  d.querySelectorAll('[data-otworz]').forEach(function(b){b.addEventListener('click',function(){otworzLb(b.dataset.otworz,0);});});

  /* powiększenie zdjęć */
  var lb=d.getElementById('lb'), lbTor=lb&&lb.querySelector('.lb-tor'), lbLicz=lb&&lb.querySelector('.lb-licz'), lbTyt=lb&&lb.querySelector('.lb-tyt'), ostatni=null, lbN=0;
  function lbIdx(){return Math.round(lbTor.scrollLeft/Math.max(1,lbTor.clientWidth));}
  function otworzLb(id,start){
    var g=galerie[id]; if(!g||!lb||!g.zdj.length)return;
    ostatni=d.activeElement;
    var duze=window.innerWidth*(window.devicePixelRatio||1)>1100;
    lbN=g.zdj.length;
    lbTor.innerHTML='';
    g.zdj.forEach(function(z,i){var f=d.createElement('figure');var n=d.createElement('img');n.src=duze?z[1]:z[0];n.alt=g.tyt+' - '+z[2].toLowerCase();n.decoding='async';if(Math.abs(i-start)>1)n.loading='lazy';f.appendChild(n);lbTor.appendChild(f);});
    lbTyt.textContent=g.tyt;
    lb.hidden=false;body.classList.add('zablokuj');
    lbTor.scrollLeft=start*lbTor.clientWidth;
    lbLicz.textContent='etap '+(start+1)+' z '+lbN;
    lb.querySelector('.lb-z').focus();
  }
  function zamknijLb(){lb.hidden=true;body.classList.remove('zablokuj');lbTor.innerHTML='';if(ostatni)ostatni.focus();}
  if(lb){
    lbTor.addEventListener('scroll',function(){lbLicz.textContent='etap '+(lbIdx()+1)+' z '+lbN;},{passive:true});
    lb.querySelector('.lb-z').addEventListener('click',zamknijLb);
    lb.querySelector('.lb-p').addEventListener('click',function(){lbTor.scrollTo({left:(lbIdx()-1)*lbTor.clientWidth,behavior:'smooth'});});
    lb.querySelector('.lb-x').addEventListener('click',function(){lbTor.scrollTo({left:(lbIdx()+1)*lbTor.clientWidth,behavior:'smooth'});});
    lb.addEventListener('click',function(e){if(e.target===lb||e.target===lbTor||e.target.tagName==='FIGURE')zamknijLb();});
  }

  /* pierwszy ekran: zdjęcia zmieniane co kilka sekund (kolejne wczytywane po załadowaniu strony) */
  var hs=d.querySelectorAll('.hero-foto .hs');
  if(hs.length>1&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
    var hsStart=function(){
      hs.forEach(function(s,i){var im=s.querySelector('img');if(i&&im&&im.dataset.src){im.srcset=im.dataset.srcset||'';im.src=im.dataset.src;im.removeAttribute('data-src');}});
      var k=0;
      setInterval(function(){
        if(d.hidden)return;
        var n=(k+1)%hs.length, im=hs[n].querySelector('img');
        if(!im||!im.complete||!im.naturalWidth)return;
        hs[k].classList.remove('on');hs[n].classList.add('on');k=n;
      },5500);
    };
    var hsCzekaj=function(){setTimeout(hsStart,2500);};
    if(d.readyState==='complete')hsCzekaj();else window.addEventListener('load',hsCzekaj);
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
    if(['hale','inwentarskie','silosy'].indexOf(h)>-1)ustaw(h);
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
