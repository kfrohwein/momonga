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

        var opts;
        opts = $.extend({}, $.fn.momonga.defaults, options);


        return this.each(function () {

        }


        /**
         * Add delete dialog.
         *
         * @todo Change to setting.
         */
        momonga.defaults.deleteDialog = function () {
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
        momonga.defaults.replaceItem = function (html, el) {
            el.replaceWith(
                '<div class="momongaItem">' + html + '</div>'
            );
        };
        /**
         * Replace an item that is dropped to a sortable list.
         * This is currently only used in the lists receive event.
         *
         * @param event
         * @param ui
         */
        momonga.defaults.replaceItems = function (event, ui) {
            this.children('[data-momongatype]').each(
                function () {
                    var momongaItem, momongaType;
                    momongaItem = $(this);
                    momongaType = momonga.options.presets[momongaItem.data('momongatype')];
                    if (momongaType.html) {
                        momonga.options.replaceItem(momongaType.html, momongaItem);
                    } else if (momongaType.file) {
                        /**
                         * @todo Decide if there should be some loading spinner thing.
                         */
                        $.get(momongaType.file, function (data) {
                            momonga.options.replaceItem(data, momongaItem);
                        });
                    }
                }
            );
        };

        /**
         *
         */
        momonga.defaults.makeDraggable = function () {
            $(momonga.options.draggableClass).draggable({
                containment: 'window',
                connectToSortable: '.' + momonga.options.connectionClass,
                helper: 'clone',
                revert: 'invalid',
                cursor: 'move'
            });
        };

        /*************************************************************
         * Merge defaults with options and start executing the plugin.
         *************************************************************/
        momonga.options = $.extend({}, momonga.defaults, options);

        /**
         * Add to all targets a class so we can connect them and mark as drop targets.
         */
        momonga.addClass(momonga.options.connectionClass);

        /**
         * Activate drop sources.
         */
        momonga.sortable({
            containment: 'window',
            connectWith: '.' + momonga.options.connectionClass,
            placeholder: momonga.options.placeholder,
            handle: momonga.options.handler,
            cursor: momonga.options.cursor,
            receive: momonga.options.replaceItems
        });

        /**
         * Load the presets and add them to our toolbar.
         * @todo Only load file if there weren't any presets at start.
         */
        $.getJSON(momonga.options.presetsFile).done(
            function (data) {
                momonga.options.presets = data;
                $.each(momonga.options.presets, function (key, value) {
                    $(momonga.options.presetsContainer).append('<li><div class="momongaDraggable" data-momongatype="' +
                        key +
                        '">' +
                        value.preview +
                        '</div></li>');
                });
                // Make all source items draggable.
                momonga.options.makeDraggable();
            }
        );
        /**
         * Register click event to all items so they get the context toolbar on click.
         */
        momonga.on('click', momonga.options.item,
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
                $(this)
                    .addClass('momongaActive')
                    .prepend(momonga.options.toolbar);
            });
        /**
         * Register Toolbar duplicate action.
         */
        momonga.on('click', '.momongaDuplicate',
            function () {
                var bgColor, newItem, active;

                active = $('.momongaActive');
                newItem = active.clone(true);
                active.after(newItem);
                bgColor = newItem.css('background-color');
                newItem.animate({backgroundColor: "#fafad2"}, 400, function () {
                    newItem.animate({backgroundColor: bgColor}, 400);
                });
            });

        /**
         * Register Toolbar delete action.
         */
        momonga.on('click', '.momongaDelete',
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
            });
        return momonga;
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
        presetsFile: 'momongaPresets.json',
        // @todo: Selector?
        handler: '.momongaDragHandle',
        // Selector
        item: '.momongaItem',
        // CSS Property.
        cursor: 'move',
        // You can predefine presets here. They will be merged if a defined a presets file.
        presets: {}
    };

    /**
     * Our toolbar with some icons provided by jquery UI.
     * .momongaEdit should be display:none; in yor CSS because it only
     * shows if the momongaItem has a class to be added to this element.
     * @type {HTMLElement}
     */
    $.fn.momonga.toolbar = $('<div class="momongaToolbar">' +
        '<div class="momongaDragHandle ui-icon ui-icon-arrow-4"></div>' +
        '<div class="momongaEdit ui-icon ui-icon-pencil"></div>' +
        '<div class="momongaDuplicate ui-icon ui-icon-copy"></div>' +
        '<div class="momongaDelete ui-icon ui-icon-trash"></div>' +
        '</div>');
})(jQuery);
