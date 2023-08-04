// add code to modify the original page here
console.time('womp: AMP page - before');

/* Set analytics directory for PHI Protect */
wData.analyticsDirectory = "Provider Directory";

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

wData.videoModalContent = {
  isAmp: true,
  html: `
  <div class="univ-modal-placeholder modal-content-video">
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
  triggerState: 'videoModal',
  modalId: '1',
  usePanelMobW: false
};

try {
  const pageData = {
    pageType: "Provider Directory",
    page_subtype: "Provider Search Results"
  };

  document.body.insertAdjacentHTML('beforeend', `<div id="pageData">${JSON.stringify(pageData)}</div>`);

  wData.pageTitle = 'Find a Doctor | Piedmont Healthcare';

  wData.pageDescription = 'Find Dallas - Fort Worth doctors, health care providers, medical specialists and physicians on the medical staff near you. Serving communities across Dallas/Fort Worth and North Texas. Search by medical specialty. Call a doctor of your choice.';
} catch (e) {
  console.error('Failed to look at provider organization\n', e);
};

wData.searchConfigOverride = {
  apiDexCare: wData.apiDexCare,
  apiDexCareNoProtocol: wData.apiDexCareNoProtocol,
  apiDexCareSlotsV5Key: wData.apiDexCareSlotsV5Key,
  autosuggestHdr: 'Suggested Searches',
  brand: 'piedmont',
  childBrand: wData.isOrthoAtl ? 'orthoatlanta' : '',
  defaultLocation: {
    city: 'Keenesaw',
    coordinates: { lat: 34.02103, lng: -84.624717 },
    county: 'Cobb County',
    state: 'GA',
    zip: '30152',
  },
  displayPrimaryClinicalInterests: false, /* use Specialties array instead */
  displaySecondarySpecialties: false, /* use Specialties array instead */
  eventCategory: 'Provider Search',
  fetchUrl: wData.apiWompHealthSearch,
  imagePlaceholderLocation:
    'https://kyruus-app-static.kyruus.com/providermatch/piedmont/photos/200/pd-nophoto.png',
  imagePlaceholderProvider:
    'https://kyruus-app-static.kyruus.com/providermatch/piedmont/photos/200/pd-nophoto.png',
  imgOrigin: wData.originNoWomp,
  inNetworkBrand: 'Piedmont Clinic',
  mapBoundsNE: { lat: 35.023201, lng: -80.769172 },
  mapBoundsSW: { lat: 30.441520, lng: -85.592170 },
  mapIcons: wData.mapIcons,
  pageType: 'Provider Directory',
  page_subtype: 'Provider Search Results',
  paramSearch: 'unified',
  paramUserLocation: 'location',
  phoneFormat: 'hyphenated',
  popularSpecialties: [
    "Obstetrics and Gynecology",
    "Internal Medicine",
    "Family Medicine",
    "Orthopedic surgery",
    "Cardiology"
  ],
  providerCardTemplate: wompLib.getSnippetHtmlCss('card_provider'),
  scheduleOrigin: wData.isStaging
    ? 'https://scheduling.uat.care.piedmont.org'
    : 'https://scheduling.care.piedmont.org',
};

// optionally resolve when ready to HTML template to by applied
setTimeout(function(){
  console.timeEnd('womp: AMP page - before');
  resolve("Done waiting.");
}, 500)
