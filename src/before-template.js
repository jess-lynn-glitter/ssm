// If the page is OrthoAtlanta domain, but is NOT provider SERP, don't build it! and redirect to canonical!
if (wData.isOrthoAtl && !wData.isPSP) {
  wompLib.logError('OOS for OrthoAtlanta');
  wompLib.deletePage().then(() => {
    // Need to remove invalidOk tag or the other's won't work
    $('#wompInvalidOK').remove();
    // Quit the build...
    $('body').append(`<div id="wompQuit">OOS for OrthoAtlanta</div>`);
    // Don't store anything...
    $('body').append(
      `<script id="wompNoStorage">OOS for OrthoAtlanta</script>`
    );
    // and redirect to canonical...
    $('body').append(`{#wompRedirect}`);
  });
}

/* Error Handling */

/* Log Errors to console*/
wompLib.logError = function (msg, ex) {
  if (msg.includes("Error appending CSS")) return;
  console.error(msg);
  console.error(ex);
};

// Bold console.log messages for sites with busy consoles
window.log = function () {
  console.groupCollapsed.apply(this, arguments);
  console.trace();
  console.groupEnd.apply(this, arguments);
};

/*
  A wrapper for catching errors in functions
  Call your function like this: 
    safely(functionName);
  Three different outcomes depending on context
    1. Developing Locally - debugger kicks in in browser
    2. Developing on amp server - #wompInvalidAmpOK script appended with error stack text, returned page won't validate
    3. Production amp server - #wompNoStorage script appended. AMP page won't publish.
  #wompInvalidAmpOK and #wompNoStorage need to be added to back to body in womp_amp_cleanup.
*/
window.safely = function (callback) {
  if (wompLib.consoleTrackTime) {
    console.time(callback.name);
  }
  log(`womp- start: ${callback.name || "anonymous"}`);
  try {
    callback();
  } catch (ex) {
    wompLib.logError(`Error running function: ${callback.name}`, ex);
    if (/usestagingampfile/.test(location.search)) {
      // Return Error in development
      womp$("body").append(`
<script type="application/json" id="wompInvalidAmpOK">
{
    "errLocation": "${callback.name}",
    "errMsg": "${ex.stack}"
}
</script>`);
    } else {
      // Don't store womp in production
      womp$("body").append(`
<script type="application/json" id="wompNoStorage">
{
    "errLocation": "${callback.name}",
    "errMsg": "${ex.message}"
}
</script>`);
    }
  }
  if (wompLib.consoleTrackTime) {
    console.timeEnd(callback.name);
  }
};

/* 
    Counters to track asynchronous items 
    and fire resolve as quickly as possible.
    Only useful in beforeRenderJS
    See AT&T cellphones AMP project before Render for example of configuration and usage
*/
wompLib.buildStatus = {};
wompLib.buildTime = {};
wompLib.logTodo = true;
wompLib.trackTime = true;
wompLib.consoleTrackTime = true;
wompLib.todo = function (item) {
  if (wompLib.consoleTrackTime) {
    console.time(item);
  }
  wompLib.buildTime[item] = Date.now();
  wompLib.buildStatus[item] = "todo";
  if (wompLib.logTodo) {
    log(`womp- todo:    ${Object.keys(wompLib.buildStatus).length} ${item}`);
  }
};
wompLib.done = function (item, msg) {
  msg = msg || "";
  wompLib.buildStatus[item] = "done";
  let progress = { total: 0 };
  Object.values(wompLib.buildStatus).forEach(function (state) {
    progress[state] = (progress[state] || 0) + 1;
    progress.total += 1;
  });
  var buildTime = Date.now() - wompLib.buildTime[item];
  if (wompLib.logTodo) {
    log(
      `womp- done: ${progress.done || 0} ${
        progress.total
      } ${item}, ${msg}, ${buildTime}`
    );
  }
  if (wompLib.consoleTrackTime) {
    console.timeEnd(item);
  }

  if (!progress.todo) {
    log(`womp- complete: ${progress.total} actions, finalizing page`);
    safely(wompLib.beforeResolve);
  }
};

/**
 * Don't delete this comment
 *
 * This comment will only exist in non-minified code, i.e., non-published code
 * Search wompLib.cSite.siteWideBeforeRenderJS
 *   for `isDevEnvComment` to determine if in dev env!
 *
 * isDevEnvComment
 */
