base_svgIcons : function(){
    // example code to replace fontAwesome:
    $('.fa-facebook')
        .before('<svg class="wi wi-facebook"><use xlink:href="#wi-facebook"></use></svg>').remove();
    $('.fa-twitter')
        .before('<svg class="wi wi-twitter"><use xlink:href="#wi-twitter"></use></svg>').remove();
    $('.fa-youtube')
        .before('<svg class="wi wi-youtube"><use xlink:href="#wi-youtube"></use></svg>').remove();
    $('.fa-pinterest-p')
        .before('<svg class="wi wi-pinterest"><use xlink:href="#wi-pinterest"></use></svg>').remove();
    $('.fa-instagram')
        .before('<svg class="wi wi-instagram"><use xlink:href="#wi-instagram"></use></svg>').remove();
}