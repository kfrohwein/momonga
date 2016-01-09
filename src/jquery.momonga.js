/**
 *  Project: Momonga
 *  Description: jQuery Plugin to build HTML content with the use of jQuery UI sortable and drag & drop functionality.
 *  Copyright (c) 2015 Karsten Frohwein
 *  Released under the MIT license
 *  @author: Karsten Frohwein
 *  @license: MIT
 */
;(function ($) {
    "use strict";

    $.fn.momonga = function (options) {

        var opts, self;

        /**
         * Merge public changeable defaults with local options to new opt(ion)s array for this registration.
         */
        opts = $.extend({}, $.fn.momonga.defaults, options);

        self = this;
        /**
         * Add to all targets a class so we can connect them and mark as drop targets.
         */
        self.addClass(opts.connectionClass);
        /**
         * Load the presets and add them to our toolbar.
         */
        $.getJSON(opts.presetsURL)
            .done(function (data) {
                /**
                 * If there was a file merge presets.
                 */
                $.extend(true, opts.presets, data);
            })
            .always(
                function () {
                    $.each(opts.presets, function (key, value) {
                        // @todo Make overrideable.
                        $(opts.presetsContainer).append('<li><div class="momongaDraggable" data-momongatype="' +
                            key +
                            '">' +
                            value.preview +
                            '</div></li>');
                    });
                    /**
                     * Make all source items draggable.
                     */
                    opts.makeDraggable(opts.draggableClass, opts.connectionClass);
                }
            );

        /**
         * Use jQuery UIs sortable to activate the columns.
         */
        self.sortable({
            connectWith: '.' + opts.connectionClass,
            placeholder: opts.placeholder,
            handle: opts.handler,
            cursor: 'move',
            /**
             * Replace an item that is dropped to a sortable list.
             * This is currently only used in the lists receive event.
             *
             * @param event
             * @param ui
             */
            receive: function (event, ui) {
                this.children('[data-momongatype]').each(
                    function () {
                        var _self, momongaType;
                        _self = this;
                        momongaType = opts.presets[_self.data('momongatype')];
                        /**
                         * @todo Set a spinner class to this item.
                         */
                        if (momongaType.html) {
                            opts.replaceItem(momongaType.html, _self);
                        } else if (momongaType.file) {
                            $.get(momongaType.file, function (data) {
                                opts.replaceItem(data, _self);
                            });
                        }
                    }
                );
            }
        });

        /**
         * Register click event to all items so they get the context toolbar on click.
         */
        self.on('click', opts.item,
            function () {
                // Disable everything else.
                $('.momongaActive').removeClass('momongaActive');
                $('.momongaToolbar').remove();
                /*
                 var a = settings;
                 console.log(a);
                 console.log(a.hasOwnProperty('edit'));
                 if (settings.presets[$(this).data('momongatype')].hasOwnProperty('edit')) {
                 toolbar.find('.momongaEdit').addClass(settings.presets[$(this).data('momongatype')].edit).show();
                 }
                 else {
                 toolbar.find('.momongaEdit').hide();
                 }*/
                $(this).addClass('momongaActive').prepend(opts.toolbar);
            }
        );
        /**
         * Register Toolbar duplicate action.
         */
        self.on('click', '.momongaDuplicate',
            function () {
                var bgColor, newItem, active;

                active = $('.momongaActive');
                newItem = active.clone(true);
                active.after(newItem);
                bgColor = newItem.css('background-color');
                newItem.animate({backgroundColor: "#fafad2"}, 400, function () {
                    newItem.animate({backgroundColor: bgColor}, 400);
                });
            }
        );

        /**
         * Register Toolbar delete action.
         */
        self.on('click', '.momongaDelete',
            function () {
                $("#momongaConfirm").dialog({
                    resizable: false,
                    modal: true,
                    position: {of: $('.momongaActive')},
                    show: {
                        effect: "fade",
                        duration: 400
                    },
                    hide: {
                        effect: "fade",
                        duration: 400
                    },
                    buttons: {
                        "Delete active item": function () {
                            $('.momongaActive').animate({backgroundColor: "#fa8072"}, 400).fadeOut(400, function () {
                                $('.momongaActive').remove();
                            });
                            $(this).dialog("close");
                        },
                        "Cancel": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            }
        );

        return self;
    };
    /**
     * Add delete dialog.
     *
     * @todo Change to setting.
     */
    $.fn.momonga.deleteDialog = function () {
        $('body').append('<div id="momongaConfirm" style="display: none;" title="Delete active item?">' +
            '<p><span class="ui-icon ui-icon-alert"></span>' +
            'The current selected item will be permanently deleted and cannot be recovered. Are you sure you want to proceed?</p>' +
            '</div>');
    };
    /**
     * Wrap the new sortable Item in html.
     * This is needed because we could get the html directly by json or async from $.get.
     *
     * @param html
     *  HTML provided by the preset by json or an HTML file.
     * @param el
     *
     * @todo Make HTML an option.
     */
    $.fn.momonga.replaceItem = function (html, el) {
        el.replaceWith(
            '<div class="momongaItem">' + html + '</div>'
        );
    };

    /** Activate jQuery UIs draggable for all our sources.
     *
     */
    $.fn.momonga.makeDraggable = function (draggableClass, connectionClass) {
        $(draggableClass).draggable({
            containment: 'window',
            connectToSortable: '.' + connectionClass,
            helper: 'clone',
            revert: 'invalid',
            cursor: 'move'
        });
    };
    $.fn.momonga.defaults = {
        // Selector.
        presetsContainer: '.momongaPresets',
        // Classname.
        connectionClass: 'momongaConnected',
        // Selector.
        draggableClass: '.momongaDraggable',
        // @todo: Classname?
        placeholder: 'momongaPlaceholder',
        // URL to JSON file.
        presetsURL: '',
        // @todo: Selector?
        handler: '.momongaDragHandle',
        // Selector
        item: '.momongaItem',
        // You can predefine presets here. They will be merged if a defined a presets file.
        presets: {},
        /**
         * Our toolbar with some icons provided by jquery UI.
         * .momongaEdit should be display:none; in yor CSS because it only
         * shows if the momongaItem has a class to be added to this element.
         * @type {HTMLElement}
         */
        toolbar: $('<div class="momongaToolbar">' +
            '<div class="momongaDragHandle ui-icon ui-icon-arrow-4"></div>' +
            '<div class="momongaEdit ui-icon ui-icon-pencil"></div>' +
            '<div class="momongaDuplicate ui-icon ui-icon-copy"></div>' +
            '<div class="momongaDelete ui-icon ui-icon-trash"></div>' +
            '</div>'),
        makeDraggable: $.fn.momonga.makeDraggable,
        replaceItems: $.fn.momonga.replaceItems,
        replaceItem: $.fn.momonga.replaceItem,
    };

})(jQuery);
