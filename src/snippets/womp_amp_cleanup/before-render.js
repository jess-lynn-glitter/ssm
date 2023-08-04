womp_amp_cleanup : function(){
    console.time('snippet: womp_amp_cleanup - before');
 
    // remove all javascripts
    // $('script').filter(function(){
    //     // don't strip json scripts
    //     return !(/json/gi).test($(this).attr('type'));
    // }).remove();

    //replace youtube videos with amp-youtube videos (might need to be buffed later for shortened URLs) -MW
    $('iframe[src*="youtube"]').each(function(){
        var id;
        var q_idx = $(this).attr('src').indexOf('?');
        if (q_idx === -1) { // if statement added to hanlde shortened URLs with no '?' -JP 
            id = $(this).attr('src').substring($(this).attr('src').lastIndexOf('/')+1);
        } else {
            id = $(this).attr('src').substring($(this).attr('src').lastIndexOf('/')+1, q_idx);
        }
        $(this).before('<amp-youtube data-videoid="' + id + '" layout="responsive" width="480" height="270"></amp-youtube>');
        $(this).remove();
    });

    //replace standard twitter widgets with amp-twitter elements-MW
    $('twitterwidget,[data-tweet-id]').each(function(){
        var id = $(this).attr('data-tweet-id');
        $(this).replaceWith('<amp-twitter width=486 height=657 layout="responsive" data-tweetid="' + id + '" ></amp-twitter>');
        //$(this).remove();
    });

    //remplce embeded tumbler posts with amp-iframes (no special AMP tumblr integration yet)-MW
    $('iframe[src*="tumblr"]').each(function(){
        var id = $(this).attr('src');
        var height = $(this).attr('height');
        $(this).before('<amp-iframe width=542 height= ' + height + ' sandbox="allow-scripts allow-same-origin" layout="responsive" frameborder="0" src="' + id + '" resizable ><div overflow tabindex=0 role=button aria-label="Read more">Read more!</div></amp-iframe>');
        $(this).remove();
    });
    
    // add image height and width attributes
    $('img:not([height]),img[height="auto"],img[height*="%"]').attr('height', function(){
        return $(this).outerHeight();
    });
    $('img:not([width]),img[width="auto"],img[width*="%"]').attr('width', function(){
        return $(this).outerWidth();
    });
    
    console.timeEnd('snippet: womp_amp_cleanup - before');
}