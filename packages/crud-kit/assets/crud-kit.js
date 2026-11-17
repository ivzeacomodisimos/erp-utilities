/*
 * crud-kit — browser side for the jTable renderer.
 * Mounts the table, wires the filter form, validates the create/edit forms with
 * the same rules the server applies, and opens child tables.
 */
(function ($) {
  'use strict';

  var TEXT_SUFFIX = '__text';
  /** setup of every CRUD in the page (and its children), by CRUD id */
  var registry = {};

  function format(text, value) {
    return String(text).replace('{value}', value === undefined || value === null ? '' : value);
  }

  function isNumeric(text) {
    return text !== '' && !isNaN(text) && isFinite(text);
  }

  function escapeHtml(text) {
    return $('<span></span>').text(text === undefined || text === null ? '' : String(text)).html();
  }

  function ruleError(rules, value, texts) {
    var text = $.trim(value === undefined || value === null ? '' : String(value));
    if (text === '') {
      return rules.required ? texts['rule.required'] : null;
    }
    var length = text.length;
    if (rules.minLength !== undefined && length < rules.minLength) {
      return format(texts['rule.minLength'], rules.minLength);
    }
    if (rules.maxLength !== undefined && length > rules.maxLength) {
      return format(texts['rule.maxLength'], rules.maxLength);
    }
    if (rules.numeric && !isNumeric(text)) {
      return texts['rule.numeric'];
    }
    if (rules.integer && !/^-?\d+$/.test(text)) {
      return texts['rule.integer'];
    }
    if (rules.min !== undefined && isNumeric(text) && parseFloat(text) < rules.min) {
      return format(texts['rule.min'], rules.min);
    }
    if (rules.max !== undefined && isNumeric(text) && parseFloat(text) > rules.max) {
      return format(texts['rule.max'], rules.max);
    }
    if (rules.pattern !== undefined && !new RegExp(rules.pattern).test(text)) {
      return texts['rule.pattern'];
    }
    if (rules['in'] !== undefined && $.inArray(text, $.map(rules['in'], String)) < 0) {
      return format(texts['rule.in'], rules['in'].join(', '));
    }
    return null;
  }

  /**
   * Marks the invalid inputs of a jTable form. Returns true when the form is valid.
   */
  function validate($form, rules, texts) {
    var valid = true;
    $form.find('.ck-error').remove();
    $form.find('.ck-invalid').removeClass('ck-invalid');
    $.each(rules, function (name, fieldRules) {
      var $input = $form.find('[name="' + name + '"]');
      if ($input.length === 0) {
        return;
      }
      var error = ruleError(fieldRules, $input.val(), texts);
      if (error !== null) {
        valid = false;
        $input.addClass('ck-invalid').after($('<span class="ck-error"></span>').text(error));
      }
    });
    if (!valid) {
      $form.find('.ck-invalid').first().focus();
    }
    return valid;
  }

  /**
   * Search box bound to a hidden input: the user types a name, the field keeps the code.
   * Typing again clears the code until a suggestion is chosen.
   */
  function bindAutocomplete($text, $value, url) {
    $text.autocomplete({
      source: url,
      minLength: 1,
      select: function (event, ui) {
        $value.val(ui.item.id).trigger('change');
        $text.val(ui.item.label);
        return false;
      }
    }).on('input', function () {
      $value.val('');
    });
    withCaptions($text);
  }

  /**
   * Suggestions with a second line (caption) when the server sends one: tells apart values
   * with the same text (Lookup::details(), Field::suggestions() with details).
   */
  function withCaptions($input) {
    var widget = $input.autocomplete('instance');
    if (!widget) {
      return;
    }
    widget._renderItem = function (ul, item) {
      var $content = $('<div>').text(item.label);
      if (item.caption) {
        $content.append($('<small class="ck-suggest-caption">').text(item.caption));
      }
      return $('<li>').append($content).appendTo(ul);
    };
  }

  function confirmDialog(message, texts, onAccept) {
    if (!$.fn.dialog) {
      if (window.confirm(message)) {
        onAccept();
      }
      return;
    }
    var buttons = {};
    buttons[texts.deleteText] = function () {
      $(this).dialog('close');
      onAccept();
    };
    buttons[texts.cancel] = function () {
      $(this).dialog('close');
    };
    $('<div class="ck-confirm"></div>').text(message).dialog({
      title: texts.areYouSure,
      modal: true,
      resizable: false,
      width: 380,
      buttons: buttons,
      close: function () {
        $(this).dialog('destroy').remove();
      }
    });
  }

  function register(setup) {
    registry[setup.id] = setup;
    $.each(setup.children || {}, function (name, child) {
      register(child.setup);
    });
  }

  /**
   * Adds what every table needs (validation, "delete selected") to its jTable options.
   * getTable returns the table container once it exists.
   */
  function prepare(setup, config, getTable) {
    var texts = setup.texts;
    var userSubmitting = config.formSubmitting;

    config.formSubmitting = function (event, data) {
      if (!validate(data.form, setup.rules, texts)) {
        return false;
      }
      if (userSubmitting) {
        return userSubmitting.call(this, event, data);
      }
    };

    if (setup.bulkDelete) {
      config.toolbar = config.toolbar || {};
      config.toolbar.items = config.toolbar.items || [];
      config.toolbar.items.push({
        text: texts.deleteSelected,
        cssClass: 'ck-delete-selected',
        click: function () {
          var $table = getTable();
          var $rows = $table.jtable('selectedRows');
          if ($rows.length === 0) {
            confirmDialog(texts.noneSelected, $.extend({}, texts, { deleteText: 'OK' }), function () {});
            return;
          }
          confirmDialog(texts.deleteSelectedConfirm.replace('{count}', $rows.length), texts, function () {
            $table.jtable('deleteRows', $rows);
          });
        }
      });
    }
    return config;
  }

  window.CrudKit = {
    validate: validate,

    /**
     * jTable "input" of an autocomplete field.
     */
    autocompleteInput: function (data, field, url) {
      var record = data.record || {};
      var $wrapper = $('<span class="ck-autocomplete-field"></span>');
      var $value = $('<input type="hidden">').attr('name', field).val(data.value === undefined || data.value === null ? '' : data.value);
      var $text = $('<input type="text" class="ck-autocomplete" autocomplete="off">').val(record[field + TEXT_SUFFIX] || '');
      $wrapper.append($text, $value);
      bindAutocomplete($text, $value, url);
      return $wrapper;
    },

    /**
     * jTable "display" of an autocomplete field: the text, or the code when there is none.
     */
    lookupText: function (record, field) {
      var text = record[field + TEXT_SUFFIX];
      return escapeHtml(text !== undefined && text !== null && text !== '' ? text : record[field]);
    },

    /**
     * jTable "display" of a child column: a button that opens the child table of the row.
     */
    childButton: function (data, crudId, name) {
      var child = registry[crudId].children[name];
      var icon = child.icon || 'fas fa-list';
      var $button = $('<button type="button" class="ck-child-button"></button>').attr({ title: child.title, 'aria-label': child.title });
      if (/^(fas|far|fab|fa) /.test(icon)) {
        $button.append($('<i aria-hidden="true"></i>').attr('class', icon));
      } else if (/^[a-z0-9_]+$/.test(icon)) {
        // Quasar / Material icon name, e.g. "local_shipping".
        $button.append($('<i class="ck-material-icon" aria-hidden="true"></i>').text(icon));
      } else {
        $button.append($('<img alt="">').attr('src', icon));
      }

      $button.on('click', function () {
        // The table that owns the row: the page table or an open child table.
        var $owner = $button.closest('.jtable-child-table-container, .ck-table');
        var $childTable = null;
        var config = prepare(child.setup, $.extend(true, {}, child.config), function () {
          return $childTable;
        });
        var filters = {};
        $.each(child.links, function (childField, parentField) {
          filters[childField] = data.record[parentField];
        });
        $owner.jtable('openChildTable', $button.closest('tr'), config, function (opened) {
          $childTable = opened.childTable;
          $childTable.jtable('load', filters);
        });
      });
      return $button;
    },

    /**
     * @param setup {id, root, loadOnStart, bulkDelete, rules, texts, children}
     * @param config jTable options
     */
    jtable: function (setup, config) {
      var $root = $(setup.root);
      var $table = $root.children('.ck-table');
      var $filters = $root.children('.ck-filters');

      register(setup);
      $table.jtable(prepare(setup, config, function () {
        return $table;
      }));

      $filters.find('input.ck-autocomplete[data-source]').each(function () {
        var $text = $(this);
        bindAutocomplete($text, $filters.find($text.data('target')), $text.data('source'));
      });

      // Filters with suggestions: free text, with the values already stored as suggestions.
      $filters.find('input.ck-suggest[data-source]').each(function () {
        withCaptions($(this).autocomplete({ source: $(this).data('source'), minLength: 1 }));
      });

      function filterValues() {
        var values = {};
        $filters.find('[name]').each(function () {
          values[this.name] = $(this).val();
        });
        return values;
      }

      $filters.on('submit', function (e) {
        e.preventDefault();
        $table.show();
        $table.jtable('load', filterValues());
      });

      if (setup.loadOnStart) {
        $table.jtable('load', filterValues());
      }
    }
  };
})(jQuery);
