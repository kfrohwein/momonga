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

    /**
     * Register all events and make the desired containers sortable.
     * @param options
     * @returns {jQuery}
     */
    $.fn.momonga = function (options) {

        var opts, presetsContainer;
        /**
         * Merge public changeable defaults with local options to new opt(ion)s array for this registration.
         */
        opts = $.extend({}, $.fn.momonga.defaults, options);

        /**
         * Register events to current presets container.
         */
        presetsContainer = $(opts.presetsContainer);
        presetsContainer
            .on('momonga:AddPresets',
                function (e, presets) {
                    opts.addPresets.apply(presetsContainer, [presets]);
                }
            )
            .on('momonga:makePresetsDraggable',
                function (e, connectionClass) {
                    var items;
                    items = $(opts.draggableClass);
                    opts.makePresetsDraggable.apply(items, [connectionClass]);
                }
            );


        /**
         * Add to all targets a class so we can connect them and mark as drop targets.
         */
        this.addClass(opts.connectionClass);

        /**
         * Load the presets and add them to our toolbar.
         */
        if (opts.presetsURL) {
            $.getJSON(opts.presetsURL)
                .done(function (data) {
                    /**
                     * If there was a file merge presets recursively and make them draggagle.
                     * @todo Add spinner.
                     */
                    $.extend(true, opts.presets, data);
                    presetsContainer
                        .trigger('momonga:AddPresets', [opts.presets])
                        .trigger('momonga:makePresetsDraggable', [opts.connectionClass]);
                });
        } else if (opts.presets) {
            presetsContainer
                .trigger('momonga:AddPresets', [opts.presets])
                .trigger('momonga:makePresetsDraggable', [opts.connectionClass]);
        }

        /**
         * Use jQuery UIs sortable to activate the columns.
         */
        this.sortable({
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
                $(this).children('[data-momongatype]').each(
                    function () {
                        var _self, momongaType;
                        _self = $(this);
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
        this
            .on('click', opts.item,
                function (e) {
                    e.preventDefault();
                    e.stopPropagation();
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
            )
            /**
             * Register Toolbar duplicate action.
             */
            .on('click', '.momongaDuplicate',
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
            )
            /**
             * Register Toolbar delete action.
             */
            .on('click', '.momongaDelete',
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

        return this;
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

    /**
     * Activate jQuery UIs draggable for all our sources.
     */
    $.fn.momonga.makePresetsDraggable = function (connectionClass) {
        this.draggable({
            containment: 'window',
            connectToSortable: '.' + connectionClass,
            helper: 'clone',
            revert: 'invalid',
            cursor: 'move'
        });
    };

    $.fn.momonga.addPresets = function (presets) {
        var container;
        container = this;
        $.each(presets, function (key, value) {
            container.append('<li><div class="momongaDraggable" data-momongatype="' +
                key +
                '">' +
                value.preview +
                '</div></li>');
        });
    };
    $.fn.momonga.defaults = {
        // Selector.
        presetsContainer: '.momongaPresets',
        // Selector.
        draggableClass: '.momongaDraggable',
        // Class name.
        connectionClass: 'momongaConnected',
        // Class name.
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
        makePresetsDraggable: $.fn.momonga.makePresetsDraggable,
        addPresets: $.fn.momonga.addPresets,
        //replaceItems: $.fn.momonga.replaceItems,
        replaceItem: $.fn.momonga.replaceItem,
    };

})(jQuery);
