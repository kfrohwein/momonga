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

                $(this).children('[data-momongatype]').each(
                    function () {
                        console.log(settings.presets[$(this).data('momongatype')].html);
                        $(this).replaceWith(
                            settings.presets[$(this).data('momongatype')].html
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
                    $(settings.presetsContainer).append('<div class="momongaDraggable" data-momongatype="' +
                        key +
                        '">' +
                        value.preview +
                        '</div>');
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


        // Register click event to all items so they get the context toolbar on click.
        $(this).on('click', settings.item,
            function () {
                $('.momongaActive').removeClass('momongaActive');
                $('.momongaToolbar').remove();

                var toolbar = $('<div class="momongaToolbar">' +
                    '<div class="momongaDragHandle ui-icon ui-icon-arrow-4"></div>' +
                    '<div class="momongaDuplicate ui-icon ui-icon-copy"></div>' +
                    '<div class="momongaDelete ui-icon ui-icon-trash"></div>' +
                    '</div>');

                toolbar.find('.momongaDuplicate').click(
                    function () {
                        var active = $('.momongaActive');
                        var newItem = active.clone(true);
                        active.after(newItem);
                        var bgColor = newItem.css('background-color');
                        newItem.animate({backgroundColor: "#fafad2"}, 400, function () {
                            newItem.animate({backgroundColor: bgColor}, 400);
                        });
                    }
                );
                toolbar.find('.momongaDelete').click(
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
                $(this)
                    .addClass('momongaActive')
                    .prepend(toolbar);
            }
        );
    };
})(jQuery);
