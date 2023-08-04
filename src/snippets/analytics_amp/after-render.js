analytics_amp : function(){
    // amp-analytics tag added in womp_amp_cleanup
    // enable sharing client id across amp and canonical pages
    if ($('meta[name="amp-google-client-id-api"]').length === 0) {
        $('head').append('<meta name="amp-google-client-id-api" content="googleanalytics">');
    }
}