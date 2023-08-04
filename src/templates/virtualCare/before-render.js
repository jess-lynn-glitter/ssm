// add code to modify the original page here
console.time('womp: AMP page - before');

try {
  const pageData = {
    pageType: "Virtual Care",
    page_subtype: "Schedule Video Visits"
  };

  document.body.insertAdjacentHTML('beforeend', `<div id="pageData">${JSON.stringify(pageData)}</div>`);

  wData.pageTitle = 'Quick Care Video Visit | Piedmont Healthcare';

  wData.pageDescription = 'Quick Care video visits offer an easy, convenient and affordable alternative to the traditional urgent care experience when you need care quick – from anywhere you have an internet connection.';
} catch (e) {
  console.error('Failed to look at location organization\n', e);
};

// optionally resolve when ready to HTML template to by applied
setTimeout(function(){
  console.timeEnd('womp: AMP page - before');
  resolve("Done waiting.");
}, 500);

wData.analyticsDirectory = 'Virtual Care';
