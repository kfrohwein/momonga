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

        /**
         * Replace an item that is dropped to a sortable list.
         * This is currently only used in the lists receive event.
         *
         * @param event
         * @param ui
         */
        function momongaReplaceItems(event, ui) {
            $(this).children('[data-momongatype]').each(
                function () {
                    var item = $(this);
                    var momongaType = momongaSettings.presets[item.data('momongatype')];
                    if (momongaType.html) {
                        momongaSettings.replaceCallback(momongaType.html, item);
                    } else if (momongaType.file) {

                        // @todo Decide if there should be some loading spinner thing.
                        $.get(momongaType.file, function (data) {
                            momongaSettings.replaceCallback(data, item)
                        });
                    }
                }
            );
        }

        /**
         * Wrap the new sortable Item in html.
         *This is needed because we could get the html directly by json or async from $.get.
         *
         * @param html
         *  HTML provided by the preset by json or an HTML file.
         * @param el
         */
        function momongaReplaceItem(html, el) {
            el.replaceWith(
                '<div class="momongaItem">' + html + '</div>'
            );
        }

        /**
         *
         */
        function momongaMakeDraggable() {
            $(momongaSettings.draggableClass).draggable({
                containment: 'window',
                connectToSortable: '.' + momongaSettings.connectionClass,
                helper: 'clone',
                revert: 'invalid',
                cursor: 'move'
            });
        }

        /**
         * Our toolbar with some icons provided by jquery UI.
         * The pencil element should start with display:none; because it only shows if the momongaItem has a class
         * to be added to this element.
         * @type {*|HTMLElement}
         */
        var momongaToolbar = $('<div class="momongaToolbar">' +
            '<div class="momongaDragHandle ui-icon ui-icon-arrow-4"></div>' +
            '<div class="momongaEdit ui-icon ui-icon-pencil" style="display: none;"></div>' +
            '<div class="momongaDuplicate ui-icon ui-icon-copy"></div>' +
            '<div class="momongaDelete ui-icon ui-icon-trash"></div>' +
            '</div>');

        var momongaSettings = $.extend({
            sortables: $(this),
            presetsContainer: '.momongaPresets',
            connectionClass: 'momongaConnected',
            draggableClass: '.momongaDraggable',
            placeholder: 'momongaPlaceholder',
            presetsFile: 'momongaPresets.json',
            handler: '.momongaDragHandle',
            item: '.momongaItem',
            cursor: 'move',
            presets: {},
            toolbar: momongaToolbar,
            replaceItems: momongaReplaceItems,
            replaceCallback: momongaReplaceItem,
            makeDraggable: momongaMakeDraggable
        }, options);

        /**
         * Add to all targets a class so we can connect them and mark as drop targets.
         */
        momongaSettings.sortables.addClass(momongaSettings.connectionClass);

        /**
         * Activate drop sources.
         */
        momongaSettings.sortables.sortable({
            containment: 'window',
            connectWith: '.' + momongaSettings.connectionClass,
            placeholder: momongaSettings.placeholder,
            handle: momongaSettings.handler,
            cursor: momongaSettings.cursor,
            receive: momongaSettings.replaceItems
        });

        /**
         * Load the presets and add them to our toolbar.
         * @todo Only load file if there weren't any presets at start.
         */
        $.getJSON(momongaSettings.presetsFile).done(
            function (data) {
                momongaSettings.presets = data;
                $.each(momongaSettings.presets, function (key, value) {
                    $(momongaSettings.presetsContainer).append('<li><div class="momongaDraggable" data-momongatype="' +
                        key +
                        '">' +
                        value.preview +
                        '</div></li>');
                });
                // Make all source items draggable.
                momongaSettings.makeDraggable();
            }
        );


        // Add delete dialog.
        //@todo This can be done better.
        $('body').append('<div id="momongaConfirm" style="display: none;" title="Delete active item?">' +
            '<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>' +
            'The current selected item will be permanently deleted and cannot be recovered. Are you sure you want to proceed?</p>' +
            '</div>');


        momongaSettings.sortables.on('click', '.momongaDuplicate',
            function () {
                var active = $('.momongaActive');
                var newItem = active.clone(true);
                active.after(newItem);
                var bgColor = newItem.css('background-color');
                newItem.animate({backgroundColor: "#fafad2"}, 400, function () {
                    newItem.animate({backgroundColor: bgColor}, 400);
                });
            });
        momongaSettings.sortables.on('click', '.momongaDelete',
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

        // Register click event to all items so they get the context toolbar on click.
        momongaSettings.sortables.on('click', momongaSettings.item,
            function () {
                // Disable everything else.
                $('.momongaActive').removeClass('momongaActive');
                $('.momongaToolbar').remove();
                /*
                 var a = momongaSettings;
                 console.log(a);
                 console.log(a.hasOwnProperty('edit'));
                 if (momongaSettings.presets[$(this).data('momongatype')].hasOwnProperty('edit')) {
                 toolbar.find('.momongaEdit').addClass(momongaSettings.presets[$(this).data('momongatype')].edit).show();
                 }
                 else {
                 toolbar.find('.momongaEdit').hide();
                 }*/
                $(this)
                    .addClass('momongaActive')
                    .prepend(momongaSettings.toolbar);


            }
        );
    };
})(jQuery);
