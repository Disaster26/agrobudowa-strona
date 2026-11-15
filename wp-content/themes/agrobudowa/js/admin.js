/* Galeria realizacji w panelu: dodawanie z biblioteki mediów, usuwanie, przeciąganie. */
jQuery(function ($) {
  var $pole = $('#ab_zdjecia'), $lista = $('#ab-gal-lista'), ramka;
  if (!$pole.length) return;
  function zapisz() {
    $pole.val($lista.children('.ab-gal-el').map(function () { return $(this).data('id'); }).get().join(','));
  }
  function el(id, url) {
    return $('<div class="ab-gal-el" style="position:relative;width:110px;height:82px;cursor:move"></div>').attr('data-id', id)
      .append($('<img alt="" style="width:110px;height:82px;object-fit:cover;display:block;border-radius:3px">').attr('src', url))
      .append('<button type="button" class="ab-gal-usun" aria-label="Usuń" style="position:absolute;top:2px;right:2px;border:0;background:#000a;color:#fff;border-radius:50%;width:22px;height:22px;cursor:pointer;line-height:1">&times;</button>');
  }
  $lista.sortable({ update: zapisz });
  $lista.on('click', '.ab-gal-usun', function () { $(this).closest('.ab-gal-el').remove(); zapisz(); });
  $('#ab-gal-dodaj').on('click', function (e) {
    e.preventDefault();
    if (!ramka) {
      ramka = wp.media({ title: 'Wybierz zdjęcia realizacji', button: { text: 'Dodaj do galerii' }, library: { type: 'image' }, multiple: 'add' });
      ramka.on('select', function () {
        var jest = $pole.val().split(',');
        ramka.state().get('selection').each(function (a) {
          a = a.toJSON();
          if (jest.indexOf(String(a.id)) > -1) return;
          var s = a.sizes && (a.sizes.thumbnail || a.sizes.medium) ? (a.sizes.thumbnail || a.sizes.medium).url : a.url;
          $lista.append(el(a.id, s));
        });
        zapisz();
      });
    }
    ramka.open();
  });
});
