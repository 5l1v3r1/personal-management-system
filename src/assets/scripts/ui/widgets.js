var bootbox = require('bootbox');

export default (function () {
    if (typeof window.ui === 'undefined') {
        window.ui = {};
    }
    ui.widgets = {
        elements: {
            'accordion-element-id'          : '#accordion',
            'accordin-section-class'        : '.accordin-section',
            'call-widget-modal'             : '.call-widget-modal',
            'widgetModalClassName'          : 'widget-modal',
            'widgetRemoveFolderClassName'   : '.widget-remove-folder',
        },
        data: {
            folderPathInUploadDir           : 'data-folder-path-in-upload-dir',
            uploadType                      : 'data-upload-type'
        },
        apiUrl: {
            removeFolderViaPost             : '/upload/{upload_type}/remove-subdirectory'
        },
        placeholders: {
            uploadType                      : '{upload_type}'
        },
        init: function () {
            this.applyAccordion();
            this.callModalOnWidgetPlusIcon();
            this.addMonthlyPaymentSummaryToAccordinHeader();
            this.removeFolderOnFolderRemovalIconClick();

            $(document).ready(function(){
                ui.widgets.fixAccordions();
            });
        },
        applyAccordion: function () {
            $(this.elements["accordion-element-id"]).accordion({
                header: "h3",
                collapsible: true,
                active: false,
                autoHeight: false
            });
        },
        fixAccordions: function () {
            /**
             * In some cases accordion won't work if display is set to flex
             *  accordion needs to be initialized first and then css must be applied so it will work fine
             */
            let accordionSectionSelectorForMyTravels = '.ui-accordion-content';
            let cssFlex = {
                "display": "flex",
                "flex-wrap": "wrap",
                "padding": "5px"
            };
            let allSelectorsToFix = [
                accordionSectionSelectorForMyTravels
            ];

            $.each(allSelectorsToFix, function (index, selector) {
                if ($(selector).length > 0) {
                    $(selector)
                        .css(cssFlex)
                        .collapse('hide')
                        .hide();
                }

            });


        },
        callModalOnWidgetPlusIcon() {
            let callModalButton = $(this.elements["call-widget-modal"]);

            if (callModalButton.length === 0) {
                return;
            }

            let settings = JSON.parse($(callModalButton).attr('data-settings'));
            let _this = this;

            callModalButton.click(() => {
                bootbox.alert({

                    message: () => {
                        if (settings.type !== undefined && settings.type !== null) {

                            switch (settings.type) {
                                case 'template':

                                    $.ajax({
                                        method: 'POST',
                                        url: settings.url
                                    }).done((data) => {
                                        let bootboxBody = $('.' + _this.elements.widgetModalClassName).find('.bootbox-body');
                                        bootboxBody.html(data);

                                        if (settings.callFunctions !== undefined && settings.callFunctions !== null) {
                                            let func = new Function(settings.callFunctions);
                                            func();
                                        }
                                    }).fail(() => {
                                        bootstrap_notifications.notify('There was an error while fetching data for bootbox modal', 'danger')
                                    });

                                    break;
                                default:
                                    throw "Unknow type was provided: " + settings.type;
                            }

                        }
                    },
                    backdrop: true,
                    buttons: {
                        ok: {
                            label: 'Cancel'
                        }
                    },
                    className: _this.elements.widgetModalClassName,
                    size: 'large'
                });

            })
        },
        addMonthlyPaymentSummaryToAccordinHeader: function () { //TODO: refractor and make it reusable + make additional func. for payments
            let accordin_wrapper = $(this.elements["accordion-element-id"]);
            let accordin_sections = $(accordin_wrapper).find(this.elements["accordin-section-class"]);

            $(accordin_sections).each((index, element) => {
                let header = $(element).find('h3');
                let payment_summary = $(element).find('section.monthly-summary .amount').html();
                $(header).find('.payment-summary').html(' ( ' + payment_summary + ' )');
            });
        },
        removeFolderOnFolderRemovalIconClick: function () {
            let folderRemovalButton = $(this.elements.widgetRemoveFolderClassName);
            let _this               = this;

            if( $(folderRemovalButton).length > 0 ){

                $(folderRemovalButton).on('click', (event) => {
                    let clickedButton               = $(event.target);
                    let subdirectoryPathInUploadDir = $(clickedButton).attr(_this.data.folderPathInUploadDir);
                    let uploadType                  = $(clickedButton).attr(_this.data.uploadType);
                    let apiUrl                      = _this.apiUrl.removeFolderViaPost.replace(_this.placeholders.uploadType, uploadType);
                    let data = {
                        'subdirectory_current_path_in_module_upload_dir': subdirectoryPathInUploadDir,
                        'block_removal'                                 : true
                    };

                    $.ajax({
                        method  : "POST",
                        url     : apiUrl,
                        data    : data
                    }).always((data) => {

                        // if there is code there also must be message so i dont check it
                        let code                = data['code'];
                        let message             = data['message'];
                        let notification_type   = '';

                        if( undefined === code ){
                            return;
                        }

                        if( code === 200 ){
                            notification_type = 'success';

                            window.setTimeout( () => {
                                window.location.reload();
                            }, 1000)

                        }else{
                            notification_type = 'danger';
                        }

                         bootstrap_notifications.notify(message, notification_type);
                    });

                });

            }

        }
    };
}());
