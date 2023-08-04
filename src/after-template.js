wompLib.evalWompFns()

/**
 * Add the version and build-date data attributes to <html>
 * This is very useful for knowing which code version and build-date of the page you are viewing
 * It shows the date and time that the page built
 */
$("html").attr("data-version", wData.version);
$("html").attr("data-build-date", wData.buildDate);
$("html").removeAttr("amp");

for (const pageType in wData.pageRegex) {
  if (wData.pageRegex[pageType].test(location.pathname)) {
    $("body").addClass(pageType);
  }
}
if (wData.isBreeze) {
  $("body").addClass('breeze-care');
}

// ~~ string replacements
wompLib.replaceTemplateStrings(wData);

// Create structured data for each page and insert stringified JSON into script#schema
wompLib.createSchema(wData.schemaData || wData.wompHealthResponse);

// NOTE: Do not enable callrail until given go-ahead by Brad.
// // Insert callrail analytics script at end of body tag, on non-googlebot pages only
// if (!wData.isGoogleBot) {
//   const callRailScript = $(
//     `<script defer type="text/javascript" src="${wData.analyticsCallRail}"></script>`
//   );
//   $("body").append(callRailScript);
// }

// helper scripts for not GoogleBot or for SERP
if (!wData.isGoogleBot || /\/(locations|doctors)/gi.test(window.location.pathname)) {
  const helperScripts = $(
    /*html*/
    `<script defer type="text/javascript">
      let throttled = false;

      function throttleCallback(callback, delay = 500) {
        if (!throttled) {
          throttled = true;
          setTimeout(function() {
            callback(); /* ensure it's called at the end of resizing */
            throttled = false;
          }, delay);
        }
      }
    </script>`
  );
  $("body").append(helperScripts);
}

$('a[href*="https://mychart.piedmont.org"]').attr(
  'target',
  '_blank'
);

// If flag is off; and is quickcare; and is prod - then don't allow any care-dot links
if (
  !wData.features.allowCareDotLinks &&
  wData.isQuickCare &&
  !wData.isStaging &&
  !wData.isUAT
) {
  $('a[href*="care.piedmont"]').each((i, e) => {
    const href = e.href;
    $(e).attr('href', href.replace(/(uat\.)?care\./, '').replace("/providers", "/search"));
  });
}

// Mustache.js is added to the page during prerender and in dev env it will persist after build is complete (because the page is persistent from build to post-build). OmniAsets also requires Mustache.js, but it cannot use the one added during preredner (in production, the prerender mustache.js will not be available!)
// In dev env, remove the prerender Mustache.js from the page at the end of the build process to more realistically mimic how it will be in production.
if (wData.isDevEnv) {
  delete window.Mustache
}

if (!wData.isGoogleBot) {
  $('body').append(/*html*/
  `<script>
    const addMaximumScaleToMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]');

      if (el !== null) {
        let content = el.getAttribute('content');
        let re = /maximum\-scale=[0-9\.]+/g;

        if (re.test(content)) {
            content = content.replace(re, 'maximum-scale=1.0');
        } else {
            content = [content, 'maximum-scale=1.0'].join(', ')
        }

        el.setAttribute('content', content);
      }
    };

    const checkIsIOS = () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (checkIsIOS()) {
      addMaximumScaleToMetaViewport();
    }
  </script>`);
}