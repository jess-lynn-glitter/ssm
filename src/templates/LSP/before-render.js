// add code to modify the original page here
console.time('womp: AMP page - before');

try {
  const pageData = {
    pageType: "Location Directory",
    page_subtype: "Location Search Results",
  };

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="pageData">${JSON.stringify(pageData)}</div>`
  );

  wData.pageTitle = "Locations | Piedmont Healthcare";

  wData.pageDescription = "";
} catch (e) {
  console.error("Failed to look at location organization\n", e);
}

wData.searchConfigOverride = {
  apiDexCare: wData.apiDexCare,
  apiDexCareNoProtocol: wData.apiDexCareNoProtocol,
  apiDexCareKey: wData.apiDexCareKey,
  brand: "piedmont",
  defaultLocation: {
    city: "Keenesaw",
    coordinates: { lat: 34.02103, lng: -84.624717 },
    county: "Cobb County",
    state: "GA",
    zip: "30152",
  },
  eventCategory: "Location Search",
  fetchUrl: wData.apiWompHealthSearch,
  imagePlaceholderProvider:
    "https://kyruus-app-static.kyruus.com/providermatch/piedmont/photos/200/pd-nophoto.png",
  imgOrigin: wData.originNoWomp,
  locationCardTemplate: wompLib
    .getSnippetHtmlCss("card_location")
    .replace(/[\r\n]/gm, ""),
  mapBoundsNE: { lat: 35.023201, lng: -80.769172 },
  mapBoundsSW: { lat: 30.441520, lng: -85.592170 },
  mapIcons: wData.mapIcons,
  pageType: "Location Directory",
  page_subtype: "Location Search Results",
  paramSearch: "unified",
  paramUserCoords: "location-search_g",
  paramUserLocation: "location",
  popularSpecialties: [
    "Obstetrics and Gynecology",
    "Internal Medicine",
    "Family Medicine",
    "Orthopedic surgery",
    "Cardiology"
  ],
  phoneFormat: "hyphenated",
  scheduleOrigin: wData.isStaging
    ? "https://scheduling.uat.care.piedmont.org"
    : "https://scheduling.care.piedmont.org",
};

wData.analyticsDirectory = 'Same Day Care Directory';

// optionally resolve when ready to HTML template to by applied
setTimeout(function(){
  console.timeEnd('womp: AMP page - before');
  resolve("Done waiting.");
}, 500);

wData.filterModalContent = {
  isAmp: false,
  html: `
  <div class="univ-modal-placeholder">
    <div class="modal-content-hdr flx">
    </div>
    <div class="modal-content-options relative hidden">
    </div>
    <div class="loader">
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
  `,
  usePanelMobW: true
};