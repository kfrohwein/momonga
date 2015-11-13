/*
 *  Project: Momonga
 *  Description: jQuery Plugin to build HTML content with the use of jQuery UI sortable and drag & drop functionality
 *  Author: Karsten Frohwein
 *  License: MIT
 */
;(function ($) {
    "use strict";
    $.fn.momonga = function (options) {

        var settings = $.extend({
            connectionClass: 'momongaConnected',
            placeholder: 'momongaPlaceholder',
            handler: '.momongaDragHandle',
            cursor: 'move'
        }, options);



            // Add to all targets a class so we can connect them and mark as drop targets.
        $(this).addClass(settings.connectionClass);

        // Activate drop sources.
        $(this).sortable({
            containment: 'window',
            connectWith: '.' + settings.connectionClass,
            placeholder: settings.placeholder,
            handle: settings.handler,
            cursor: settings.cursor,
            receive: function (event, ui) {
                // @todo Do replacement by data attribute to template.
                $(this).children('[data-momonga-type]').replaceWith('<div class="momongaItem">Hallo Welt!</div>');
                // Add Toolbar event.


            }
        });

        // UI will be created automatically
        $('.momongaDraggable').draggable({
            containment: 'window',
            connectToSortable: settings.connectionClass,
            helper: 'clone',
            revert: 'invalid',
            cursor: 'move',
        });
        $('.momongaItem').click(
            function () {
                $('.momongaActive').removeClass('momongaActive');
                $('.momongaToolbar').remove();

                var toolbar = $('<div class="momongaToolbar" style="position: absolute;top: -5px;left: -20px;">' +
                    '<div class="momongaDragHandle ui-icon ui-icon-arrow-4"></div>' +
                    '<div class="momongaDoublicate ui-icon ui-icon-copy"></div>' +
                    '<div class="momongaDelete ui-icon ui-icon-trash"></div>' +
                    '</div>');

                $(this)
                    .addClass('momongaActive')
                    .css('position', 'relative')
                    .prepend(toolbar);
            }
        );
    };
})(jQuery);
