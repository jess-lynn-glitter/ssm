console.time('womp: AMP page - after');

$('head title').html(wData.pageTitle);

$('a[href]')
    .each(function(){
      if (/local|toAmpPage/.test(this.className)) {
        $(this).attr('href', function(){
          const url = new URL($(this).attr('href'));
          if (url.pathname = location.pathname) {
            return url.hash;
          } else {
            return url.pathname + url.search + url.hash;
          }
        });
      }
    });

console.timeEnd('womp: AMP page - after');
