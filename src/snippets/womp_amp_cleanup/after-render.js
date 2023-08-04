womp_amp_cleanup : function(){
    console.time('snippet: womp_amp_cleanup - after');

    /***********************************
        Adjust images to be AMP compliant
    ************************************/
    // JW - 5.5.17 updated replaceTagName function to prevent breaks from invalid characters.
    // We can remove this once it the builder script is updated.
    womp$.fn.replaceTagName = function (replaceWith) {
        var tags = [],
            i = this.length;
        while (i--) {
            var newElement = wompLib.doc.createElement(replaceWith),
                thisi = this[i],
                thisia = thisi.attributes;
            for (var a = thisia.length - 1; a >= 0; a--) {
                var attrib = thisia[a];
                try {
                    newElement.setAttribute(attrib.name, attrib.value);
                } catch (InvalidCharacterError) { // Avoid breaking script if attribute has an invalid character.
                    console.log(InvalidCharacterError);
                }
            }
            newElement.innerHTML = thisi.innerHTML;
            $(thisi).after(newElement).remove();
            tags[i] = newElement;
        }
        return $(tags);
    };
    
    // Switch img tags to amp-img tags
    $('img').each(function(){
        var img = $(this);
        if(img.attr('x-src') === '') {
            img.remove();
            return;
        }
        // img.replaceTagName('amp-img');
    });
    
    
    // set the layout for images that do not have layout yet. 
    // for small images, set to fixed, for larger images, set to repsonsive
    $('amp-img:not([layout])').each(function(){
        var img = $(this);
        if(img.attr('width') < 150){
           img.attr('layout', 'fixed');
        }else{
           img.attr('layout', 'responsive');
        }
    });
    

       
    
    /***********************************
        Adjust links to be AMP compliant
    ************************************/

    // Make all of the links absolute, so they go to the main site, not the AMP version. 
    $('a[href]')
    .filter(function(){
        // add .local or to .toAmpPage class earlier to redirect a class to the Canonical Amp site.
        return !/local|toAmpPage/.test(this.className);
    })
    .each(function(){
        $(this).attr('href', function(){
            return wompLib.qualifyURL($(this).attr('href'));
        });
    });
    
    // Remove empty link targets.
    $('a[target]').each(function() {
        if($(this).attr('target') !== '_blank') { $(this).removeAttr('target') }
    });
    
    
    /***********************************
        Adjust other elements to be AMP compliant
    ************************************/
    
    // Remove elements that AMP doesn't allow
    $('style:not([amp-custom]):not([amp-boilerplate])').remove();
    $('body>style').remove();
    $('font').contents().unwrap();
    $('font').remove();
    $('base, iframe, frame, frameset, object, param, applet, embed').remove();
    
    /***********************************
        Adjust other elements to be AMP compliant
    ************************************/
    safely(()=>{
        // Remove elements that AMP doesn't allow
        $('style:not([amp-custom]):not([amp-boilerplate])').remove();
        $('font').contents().unwrap();
        $('font').remove();
        $('iframe, frame, frameset').remove();
        
        $('object, embed, applet')
            .each(function() { $(this).after( $('<div class="missing-wrap"><div class="missing"></div></div>') ).remove() });
    
        //$('amp-img+amp-img').remove();
    });
    
    /***********************************
     use the AMP validator to remove any invalid attributes.. 
    ************************************/
    
    if (wompLib.ampValidator) {
        var resolveAmpError = function(error) {
            const allowedCustomElements = [
                'quick-care-widget',
                'location-timeslots',
                'provider-timeslots'
            ]
            
            // JW 6.28.17
            if ( error.code == "DISALLOWED_TAG" ) {
                // Regex to replace malformed tags that can't be selected.
                var tag = error.params[0],
                    pattern = '<(\/|\s)*(?='+tag+')'+tag+'[^>]*>',
                    regEx = new RegExp(pattern, 'g'),
                    doc = wompLib.doc.documentElement.innerHTML;
                console.log(tag + ' is not AMP valid');
                if (!allowedCustomElements.includes(tag)) {
                    wompLib.doc.documentElement.innerHTML = doc.replace(regEx, '');
                }
            } else if (error.code == "DISALLOWED_ATTR" && error.severity == "ERROR" && error.params[0].indexOf('x-') !== 0){
                try{
                    // Remove the invalid attribute value from every element. 
                    $(error.params[1] +'['+ error.params[0] +']').removeAttr(error.params[0]);
                }catch(ex){
                    //if jQuery fails, try removing the attributes with pure JS
                    try{
                        //select all elements of the same type
                        $(error.params[1].split(' ')[0]).each(function(i,e) {
                            //for each element, 
                            //loop through all the attributes
                            let attributes = e.attributes;
                            let idx = attributes.length;
                            while( idx-- ){
                                if(attributes[idx].name.indexOf(error.params[0]) > -1){
                                    this.removeAttributeNode(attributes[idx]);      
                                }
                            }
                        });
                    }catch(exx){}
                }
            } else if ( error.code == "INVALID_ATTR_VALUE" && error.severity == "ERROR" && error.params[0].indexOf('x-') !== 0){
                try{
                    // Remove the invalid attribues value from elements that have it.
                    $(`${error.params[1]}[${error.params[0]}="${error.params[2]}"]`).removeAttr(error.params[0]);
                }catch(ex){
                    //if jQuery fails, try removing the attributes with pure JS
                    try{
                        //select all elements of the same type
                        $(error.params[1].split(' ')[0]).each(function(i,e) {
                            //for each element, 
                            //loop through all the attributes
                            var attributes = e.attributes;
                            var k = attributes.length;
                            while( k-- ){
                                try {
                                    if(attributes[k].name === (error.params[0]) && attributes[k].value === (error.params[2]) ){
                                        e.removeAttributeNode(attributes[k]);      
                                    }
                                } catch (exk) {
                                    e.remove();
                                }
                            }
                        });
                    }catch(exx){}
                }
            }
        };

        // validate our shadow dom body html
        var errors = wompLib.ampValidator.validateString(wompLib.doc.documentElement.outerHTML).errors;
        var prevNumErrors = 0;
        do {
            prevNumErrors = errors.length;
    
            // this is not a complete doc, so there will be many errors. For now, lets just look for the DISALLOWED_ATTR errors - ingor any attributes that are escaped with x-
            errors.forEach(resolveAmpError);
    
            // validate updated dom html
            errors = wompLib.ampValidator.validateString(wompLib.doc.documentElement.outerHTML).errors;
            // if the number of errors is less than is was last iteration, then try to remove disallowed attributes again
            // when the number of errors is the same as last iteration, we have removed all disallowed attributes and we exit loop
        } while (errors.length < prevNumErrors);
    }

    // Add target to forms
    $('form:not([target])').attr('target','_top');


    /***********************************
    Convert social elements to the correct AMP component
    ************************************/

    // youtube
    $('iframe[src*="youtube"]').each(function(){
        var id;
        var q_idx = $(this).attr('src').indexOf('?');
        if (q_idx === -1) {
            id = $(this).attr('src').substring($(this).attr('src').lastIndexOf('/')+1);
        }
        else {
            id = $(this).attr('src').substring($(this).attr('src').lastIndexOf('/')+1, q_idx);
        }
        $(this).before('<amp-youtube data-videoid="' + id + '" layout="responsive" width="480" height="270"></amp-youtube>');
        $(this).remove();
    });

    // twitter
    $('twitterwidget').each(function(){
        var id = $(this).attr('data-tweet-id');
        $(this).before('<amp-twitter width=486 height=657 layout="responsive" data-tweetid="' + id + '" ></amp-twitter>');
        $(this).remove();
    });

    // tumblr
    $('iframe[src*="tumblr"]').each(function(){
        var id = $(this).attr('src');
        var height = $(this).attr('height');
        $(this).before('<amp-iframe width=542 height= ' + height + ' sandbox="allow-scripts allow-same-origin" layout="responsive" frameborder="0" src="' + id + '" resizable ><div overflow tabindex=0 role=button aria-label="Read more">Read more!</div></amp-iframe>');
        $(this).remove();
    });

    // tracking pixel - this is only for sites that already use WM for mobile optimize




    /***********************************
    Assign unique IDs to accordions if they don't already have them (prevents expanded section confusion)
    ************************************/
    $('amp-accordion').each(function(i){
        if(!$(this).attr('id')){
            $(this).attr('id', 'amp-accordion-' + i);
        }
    });
    
    
    /***********************************
       Add/Remove AMP component JS files
    ************************************/
    let ampTags = {
        'amp-3q-player': '0.1',
        'amp-access': '0.1',
        'amp-access-laterpay': '0.1',
        'amp-accordion': '0.1',
        'amp-ad': '0.1',
        'amp-ad-exit': '0.1',
        'amp-analytics': '0.1',
        'amp-anim': '0.1',
        'amp-animation': '0.1',
        'amp-apester-media': '0.1',
        'amp-app-banner': '0.1',
        'amp-audio': '0.1',
        'amp-auto-ads': '0.1',
        'amp-bind': '0.1',
        'amp-bodymovin-animation': '0.1',
        'amp-brid-player': '0.1',
        'amp-brightcove': '0.1',
        'amp-byside-content': '0.1',
        'amp-call-tracking': '0.1',
        'amp-carousel': '0.1',
        'amp-dailymotion': '0.1',
        'amp-date-display': '0.1',
        'amp-date-picker': '0.1',
        'amp-dynamic-css-classes': '0.1',
        'amp-experiment': '0.1',
        'amp-facebook': '0.1',
        'amp-facebook-comments': '0.1',
        'amp-facebook-like': '0.1',
        'amp-facebook-page': '0.1',
        'amp-fit-text': '0.1',
        'amp-font': '0.1',
        'amp-form': '0.1',
        'amp-fx-collection': '0.1',
        'amp-fx-flying-carpet': '0.1',
        'amp-gfycat': '0.1',
        'amp-gist': '0.1',
        'amp-google-vrview-image': '0.1',
        'amp-hulu': '0.1',
        'amp-iframe': '0.1',
        'amp-ima-video': '0.1',
        'amp-image-lightbox': '0.1',
        'amp-imgur': '0.1',
        'amp-instagram': '0.1',
        'amp-install-serviceworker': '0.1',
        'amp-izlesene': '0.1',
        'amp-jwplayer': '0.1',
        'amp-kaltura-player': '0.1',
        'amp-lightbox': '0.1',
        'amp-list': '0.1',
        'amp-live-list': '0.1',
        'amp-mathml': '0.1',
        'amp-nexxtv-player': '0.1',
        'amp-o2-player': '0.1',
        'amp-ooyala-player': '0.1',
        'amp-pinterest': '0.1',
        'amp-playbuzz': '0.1',
        'amp-position-observer': '0.1',
        'amp-reach-player': '0.1',
        'amp-reddit': '0.1',
        'amp-render': '1.0',
        'amp-riddle-quiz': '0.1',
        'amp-script': '0.1',
        'amp-selector': '0.1',
        'amp-sidebar': '0.1',
        'amp-social-share': '0.1',
        'amp-soundcloud': '0.1',
        'amp-springboard-player': '0.1',
        'amp-sticky-ad': '1.0',
        'amp-story': '0.1',
        'amp-timeago': '0.1',
        'amp-twitter': '0.1',
        'amp-user-notification': '0.1',
        'amp-video': '0.1',
        'amp-vimeo': '0.1',
        'amp-vine': '0.1',
        'amp-viz-vega': '0.1',
        'amp-vk': '0.1',
        'amp-web-push': '0.1',
        'amp-wistia-player': '0.1',
        'amp-youtube': '0.1',
    };
    
    // replace elements that match their script names
    Object.keys(ampTags).forEach(function(e,i){
    	if( ($(e).length || $(`template.uses-${e}`).length) && !$(`script[custom-element="${e}"]`).length ){
    	    $(`head:first`).append(`
    	    <script async custom-element="${e}" src="https://cdn.ampproject.org/v0/${e}-${ampTags[e]}.js"></script>`);
    	} else if( !$(e).length && $(`script[custom-element="${e}"]`).length ) {
    		$(`script[custom-element="${e}"]`).remove();
    	}
    });
    
    // replace elements that don't match their script names
    if($('template[type="amp-mustache"]').length && !$('script[custom-template="amp-mustache"]').length){
        $('head:first').append('<script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>');
    } else if( !$('template[type="amp-mustache"]').length && $('script[custom-template="amp-mustache"]').length ) {
		$('script[custom-template="amp-mustache"]').remove();
	}
	if($('amp-state').length && !$('script[custom-element="amp-bind"]').length){
        $('head:first').append('<script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>');
    } else if( !$('amp-state').length && $('script[custom-element="amp-bind"]').length ) {
		$('script[custom-element="amp-bind"]').remove();
	}
	if($('form').length && !$('script[custom-element="amp-form"]').length){
        $('head:first').append('<script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>');
    } else if( !$('form').length && $('script[custom-element="amp-form"]').length ) {
		$('script[custom-element="amp-form"]').remove();
	}    

    
    // try{
    //     // try to clean up CSS

    //     // cleanCSS - iterates rules, looks for matching selectors in document and removes all unused CSS
    //     function cleanCSS(){
            
    //         // Wrap any dynamic CSS you want to protect in a media rule
    //         // @media screen {
    //         //     interactive rule {
    //         //         color: red;
    //         //     }    
    //         // }
            
    //         var newCSSText = '';
            
    //         // iterate through all the custom style rules
    //         var rulesColleciton = $('style[amp-custom]')[0].sheet.cssRules;
            
    //         for (i = 0; i < rulesColleciton.length; i++) { 
                
    //             var rule = rulesColleciton[i];
    //             var sel = rule.selectorText;
                
    //             try{
                    
    //                 //check selector, some rules, like media rules do not have selectors
    //                 if(sel){
                        
    //                     // if the selector contains a ':', just look at the part before
    //                     sel = sel.split(':')[0];
                        
    //                     // see if this selector is used, if so, add it to our newCSSText 
    //                     if($(sel).length > 0){
    //                         newCSSText += rule.cssText;
    //                     }
                        
    //                 }else{
    //                     // always add media rules    
    //                     newCSSText += rule.cssText;
    //                 }
                    
    //             }catch(ex){
    //                 // there might be a selector that causes jQuery to throw an error, in these scenarios, add the css rule by default. 
    //                 newCSSText += rule.cssText;
    //             }
                
    //         }
            
    //         // set the newCSSText
    //         $('style[amp-custom]').text(newCSSText);
    //     }
        
    //     // call cleanCSS
    //     // cleanCSS();
        
    //     // perform string manipulation on the CSS 
    //     var strCSS = $('style[amp-custom]').text();
        
    //     // Eliminate !important
    //     strCSS = strCSS.replace(/!important/g, '');
        
    //     // minimize the new CSS
    //     //strCSS = minimizeCSS(strCSS);
        
    //     // set the strCSS
    //     $('style[amp-custom]').text(strCSS);
        
    // }catch(ex){
    //     console.error("could not clean CSS" + ex)
    // }//catch all CSS clean up 
        
    //remove JS comments, because they are breaking the //<![CDATA[[ breaks application/ld+json
    // $('script').text(function(){
    //     return $(this).text().replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    // })
    
    /**
     * removeComments and cssMinify taken from BBB
     */
    function removeComments() {
        // Manipulate document as a string
        var doc = wompLib.doc.documentElement.innerHTML;
      
        // Strip HTML Comments, Empty lines
        doc = doc.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//gi, ' ');
        doc = doc.replace(/<!--[\s\S]*?-->/gi, " ");
      
        // rewrite string to DOM
        wompLib.doc.documentElement.innerHTML = doc;
    };
    
    (function cssMinify() {
        /* Remove CSS and HTML Comments to prevent CSS oversize error */
        removeComments();
        
        let cssText = $('style[amp-custom]').text();
        
        // // tree shake CSS
        // cssText = wompLib.treeShakeCSS(cssText, wompLib.doc.body.outerHTML);
        // $$('style[amp-custom]').text(cssText);
        
        // convert inset css rule to top,left,bottom,right
        function insetToTrbl(rule) {
            // replace first whitespace if present
            if (/^\s/.test(rule))
                rule = rule.replace(/\s/,'');
            
            var splitRule = rule.split(' ');
            
            // determine how to return css - we may want to clean this up if there's a more elegant solution
            if (splitRule.length == 1)
                return `top:${splitRule[0]};right:${splitRule[0]};bottom:${splitRule[0]};left:${splitRule[0]};`;
            else if (splitRule.length == 2) {
                return `top:${splitRule[0]};right:${splitRule[1]};bottom:${splitRule[0]};left:${splitRule[1]};`;
            } else if (splitRule.length == 3) {
                return `top:${splitRule[0]};right:${splitRule[1]};bottom:${splitRule[2]};left:${splitRule[1]};`;
            } else if (splitRule.length == 4) {
                return `top:${splitRule[0]};right:${splitRule[1]};bottom:${splitRule[2]};left:${splitRule[3]};`;
            }
        }
        
        cssText = cssText.replace(/inset:([\d\spxrem%auto]*);/g, function(match, rule){
            return insetToTrbl(rule);
        });
        $('style[amp-custom]').text(cssText);
        
        
        function byteCount(s) {
            let bytes = encodeURI(s).split(/%..|./).length - 1;
            return bytes; 
        }
        let bytesUsed = byteCount(cssText);
        
        console.log("cssText bytes: " + bytesUsed);
        
        // Estimating remaining CSS characters, assuming mostly 1 byte characters in CSS rules
        console.log('CSS Length: ', bytesUsed, `bytes, about ${((75000 - bytesUsed) / 8).toFixed(0)} CSS Characters left`);
    }());

    wompLib.generateScriptHashes();
    
    //add a timestamp in the head for quicker build issue troubleshooting -MW
    var timestamp = new Date().toLocaleString();
    var offset = new Date().getTimezoneOffset();
    if(offset==0){
        offset = -8
    }
    var local = new Date( new Date().getTime() + offset * 3600 * 1000).toLocaleString().replace( / GMT$/, "" )
    
    $('head').prepend('<!-- SERVER TIMESTAMP ' + timestamp + '-->');
    $('head').prepend('<!-- LOCAL TIMESTAMP ' + local + ' offset: ' + offset + ' (-8)-->');
    
    
    console.timeEnd('snippet: womp_amp_cleanup - after');

}