/*
 *  Project: Momonga
 *  Description: jQuery Plugin to build HTML content with the use of jQuery UI sortable and drag & drop functionality
 *  Author: Karsten Frohwein
 *  License: MIT
 *
 *  @todo Capsulation of all major functionallity.
 */
;(function ($) {
    "use strict";
    $.fn.momonga = function (options) {

        var momonga_containers = $(this);
        var settings = $.extend({
            presetsContainer: '.momongaPresets',
            connectionClass: 'momongaConnected',
            placeholder: 'momongaPlaceholder',
            presetsFile: 'momongaPresets.json',
            handler: '.momongaDragHandle',
            item: '.momongaItem',
            cursor: 'move',
            presets: {}
        }, options);

        // Add to all targets a class so we can connect them and mark as drop targets.
        momonga_containers.addClass(settings.connectionClass);

        // Activate drop sources.
        momonga_containers.sortable({
            containment: 'window',
            connectWith: '.' + settings.connectionClass,
            placeholder: settings.placeholder,
            handle: settings.handler,
            cursor: settings.cursor,
            receive: function (event, ui) {
                $(this).children('[data-momongatype]').each(
                    function () {
                        $(this).replaceWith(
                            '<div class="momongaItem">' + settings.presets[$(this).data('momongatype')].html + '</div>'
                        );

                    }
                );
            }
        });

        // Load the presets and add them to our toolbar.
        // @todo Only load file if there weren't any presets at start.
        $.getJSON(settings.presetsFile).done(
            function (data) {
                settings.presets = data;
                $.each(settings.presets, function (key, value) {
                    $(settings.presetsContainer).append('<li><div class="momongaDraggable" data-momongatype="' +
                        key +
                        '">' +
                        value.preview +
                        '</div></li>');
                });
                // Make all source items draggable.
                // @todo Bind by .on() so this can be outside of the ajax request.
                $('.momongaDraggable').draggable({
                    containment: 'window',
                    connectToSortable: '.' + settings.connectionClass,
                    helper: 'clone',
                    revert: 'invalid',
                    cursor: 'move'
                });
            }
        );


        // Add delete dialog.
        //@todo This can be done better.
        $('body').append('<div id="momongaConfirm" style="display: none;" title="Delete active item?">' +
            '<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>' +
            'The current selected item will be permanently deleted and cannot be recovered. Are you sure you want to proceed?</p>' +
            '</div>');


        var toolbar = $('<div class="momongaToolbar">' +
            '<div class="momongaDragHandle ui-icon ui-icon-arrow-4"></div>' +
            '<div class="momongaEdit ui-icon ui-icon-pencil"></div>' +
            '<div class="momongaDuplicate ui-icon ui-icon-copy"></div>' +
            '<div class="momongaDelete ui-icon ui-icon-trash"></div>' +
            '</div>');

        momonga_containers.on('click', '.momongaDuplicate',
            function () {
                var active = $('.momongaActive');
                var newItem = active.clone(true);
                active.after(newItem);
                var bgColor = newItem.css('background-color');
                newItem.animate({backgroundColor: "#fafad2"}, 400, function () {
                    newItem.animate({backgroundColor: bgColor}, 400);
                });
            });
        momonga_containers.on('click', '.momongaDelete',
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
        momonga_containers.on('click', settings.item,
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
                    .prepend(toolbar);


            }
        );
    };
})(jQuery);
