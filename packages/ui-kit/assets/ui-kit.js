/*
 * ui-kit: behavior of the HTML + jQuery renderer (requires jQuery 1.9+).
 * Delegated handlers, so content added later (Ajax) works too.
 */
(function ($) {
  if (!$) {
    if (window.console) {
      window.console.error('ui-kit.js needs jQuery');
    }
    return;
  }

  var $doc = $(document);

  // Side panels (drawers) on narrow screens.
  $doc.on('click', '[data-uk-toggle]', function () {
    var side = $(this).attr('data-uk-toggle');
    var $layout = $(this).closest('[data-uk-layout]');
    $layout.toggleClass('is-' + side + '-open');
  });
  $doc.on('click', '[data-uk-close]', function () {
    $(this).closest('[data-uk-layout]').removeClass('is-left-open is-right-open');
  });
  $doc.on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('[data-uk-layout]').removeClass('is-left-open is-right-open');
    }
  });

  // Menu groups.
  $doc.on('click', '[data-uk-menu-toggle]', function () {
    var $button = $(this);
    var open = $button.attr('aria-expanded') !== 'true';
    $button.attr('aria-expanded', open ? 'true' : 'false');
    $button.closest('.uk-menu-group').toggleClass('is-open', open);
    $button.next('ul').prop('hidden', !open);
  });

  // Menu search: ignores case and accents and looks inside groups.
  function normalize(text) {
    text = String(text || '').toLowerCase();
    return text.normalize ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : text;
  }

  // Every typed word must start a word of the label ("fact prob" finds "Facturas con problemas",
  // "ob" does not find "problemas").
  function matchesWords(label, term) {
    var words = normalize(label).split(/[^a-z0-9]+/);
    var parts = term.split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
      var found = false;
      for (var j = 0; j < words.length && !found; j++) {
        found = words[j].indexOf(parts[i]) === 0;
      }
      if (!found) {
        return false;
      }
    }
    return true;
  }

  function setGroupOpen($li, open) {
    var $button = $li.children('[data-uk-menu-toggle]');
    $button.attr('aria-expanded', open ? 'true' : 'false');
    $li.toggleClass('is-open', open);
    $li.children('ul').prop('hidden', !open);
  }

  // Shows the options that match (or whose group matches); returns whether any is shown.
  function filterMenuList($ul, term, groupMatches) {
    var anyVisible = false;
    $ul.children('li').each(function () {
      var $li = $(this);
      var matches = groupMatches || matchesWords($li.children('.uk-menu-item').find('.uk-menu-label').first().text(), term);
      var visible = matches;
      if ($li.hasClass('uk-menu-group')) {
        if ($li.data('ukMenuOpen') === undefined) {
          $li.data('ukMenuOpen', $li.hasClass('is-open'));
        }
        var childVisible = filterMenuList($li.children('ul'), term, matches);
        visible = matches || childVisible;
        setGroupOpen($li, term === '' ? $li.data('ukMenuOpen') : visible);
      }
      $li.prop('hidden', !visible);
      anyVisible = anyVisible || visible;
    });
    return anyVisible;
  }

  $doc.on('input', '[data-uk-menu-search]', function () {
    var $menu = $(this).closest('.uk-menu');
    var term = normalize($.trim($(this).val()));
    var anyVisible = filterMenuList($menu.children('ul'), term, term === '');
    $menu.children('.uk-menu-empty').prop('hidden', anyVisible);
  });

  // Tabs (click, and arrow keys between tabs).
  function selectTab($tab) {
    var $tabs = $tab.closest('[data-uk-tabs]');
    var name = $tab.attr('data-uk-tab');
    $tabs.find('> .uk-tab-list > [data-uk-tab]').each(function () {
      var selected = $(this).attr('data-uk-tab') === name;
      $(this).attr('aria-selected', selected ? 'true' : 'false').attr('tabindex', selected ? '0' : '-1');
    });
    $tabs.find('> [data-uk-panel]').each(function () {
      $(this).prop('hidden', $(this).attr('data-uk-panel') !== name);
    });
    $tabs.trigger('uk:tab', [name]);
  }
  $doc.on('click', '[data-uk-tab]', function () {
    selectTab($(this));
  });
  $doc.on('keydown', '[data-uk-tab]', function (e) {
    var step = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
    if (step === 0) {
      return;
    }
    var $all = $(this).parent().children('[data-uk-tab]');
    var $next = $all.eq(($all.index(this) + step + $all.length) % $all.length);
    selectTab($next);
    $next.trigger('focus');
    e.preventDefault();
  });
})(window.jQuery);
