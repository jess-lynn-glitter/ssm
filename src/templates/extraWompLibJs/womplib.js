/***************************************
             wDATA (CONFIGS)
***************************************/
/**
 * wData is a global configuration / data storage object
 * At build time, wData will exist on the global window object
 * Defining wData in extra-womplib.js makes it available at the very start of the build process, and for the entire process.
 * Note that it *only* exists at build time and does not exist in the user's browser
 * It is particularly useful for storing cross-template/snippet data, like flags and reusable strings.
 *
 * Please follow the existing pattern:
 *  - add fundamental flags, string variables, etc in the object literal itself (1)
 *  - properties that rely on other wData properties should be assigned
 *        using the existing `Object.assign(wData, {...})` (2)
 *  - breezecare overrides can be in the secondary assignment if possible (2);
 *        otherwise use the `if (wData.isBreeze) {...}` block (3).
 *  - wData assignments that can't go in the above should be at the bottom (4).
 */

// (1) Set initial flags and other properties on wData
wompLib.wData = {
  /* Bump manually before publishes to know for sure which code was used to build a page */
  version: 31,
  buildOrigin: location.origin,
  buildDate: new Date().toLocaleString('en-us', {
    timeZone: 'America/Vancouver',
    timeZoneName: 'short',
  }),
  pathname: location.pathname,
  brand: 'piedmont',
  childBrandParam: '',
  isGoogleBot: /googleBot=true/gi.test(location.href),
  isGozio: /googleBot=gozio/i.test(location.search),
  isDevEnv: determineDevEnv(),
  isUAT: /uat\./i.test(location.origin),
  isOrthoAtl: /orthoatlanta/i.test(location.origin),
  omniAssetsVersion: {
    prod: '2023-07-26_1800',
    stg: '2023-07-26_1800',
    uat: '2023-07-26_1800',
  },
  urlsToSkipLocal: [
    'apiDexCare',
    'apiDexCareNoProtocol',
    'apiWaitTimes',
    'apiWompHealthSearch',
    'apiWompHealthData',
  ],
  alertRecipients: 'jake.p@wompmobile.com, michael.h@womple.com',
  // Project-specific data for importing care tiles from omniAssets
  careTiles: {
    // Map the name of the tile (as used in omniAssets) with the name of it's associated snippet in this project
    templateNameMap: {
      // tileName: snippet_name
      quickCare: 'careTile_quickCare',
      locationTimeslots_details_current: 'careTile_timeslots',
      locationTimeslots_details_nearby: 'careTile_timeslots_nearestLocation',
      locationTimeslots_serp: '',
    },
    // Care tile templates/css include ~~keywords~~, but they might be different in this project; use this map to link ones that differ.
    wDataMap: {
      // "keyword-in-tile-template": "KeywordOnWDataInThisProject"
      'url-name': 'UrlName',
    },
  },
};

wompLib.wData.wompProjects = [
  {
    projectName: 'Piedmont',
    matcher:
      !/orthoatlanta/i.test(location.origin) &&
      !/stag|uat|stg/i.test(location.origin),
    id: 7965,
    child: '',
    isStaging: false,
    omniId: 7961,
    omniVersion: wompLib.wData.omniAssetsVersion.prod,
  },
  {
    projectName: 'Piedmont-UAT',
    matcher:
      !/orthoatlanta/i.test(location.origin) && /uat\./i.test(location.origin),
    id: 7967,
    child: '',
    isStaging: true,
    omniId: 7964,
    omniVersion: wompLib.wData.omniAssetsVersion.uat,
  },
  {
    projectName: 'Piedmont-Staging',
    matcher:
      !/orthoatlanta/i.test(location.origin) &&
      /stag|stg/i.test(location.origin),
    id: 7966,
    child: '',
    isStaging: true,
    omniId: 7963,
    omniVersion: wompLib.wData.omniAssetsVersion.stg,
  },
  {
    projectName: 'OrthoAtlanta',
    matcher:
      /orthoatlanta/i.test(location.origin) &&
      !/stag|uat|stg/i.test(location.origin),
    id: 7974,
    child: 'orthoatlanta',
    isStaging: false,
    omniId: 7961,
    omniVersion: wompLib.wData.omniAssetsVersion.prod,
  },
  {
    projectName: 'OrthoAtlanta-UAT',
    matcher:
      /orthoatlanta/i.test(location.origin) && /uat\./i.test(location.origin),
    id: 7976,
    child: 'orthoatlanta',
    isStaging: true,
    omniId: 7964,
    omniVersion: wompLib.wData.omniAssetsVersion.uat,
  },
  {
    projectName: 'OrthoAtlanta-Staging',
    matcher:
      /orthoatlanta/i.test(location.origin) &&
      /stag|stg/i.test(location.origin),
    id: 7977,
    child: 'orthoatlanta',
    isStaging: true,
    omniId: 7963,
    omniVersion: wompLib.wData.omniAssetsVersion.stg,
  },
];

wompLib.wData.mapIcons = {
  default: {
    fillColor: '#C84B26',
    fillOpacity: 1,
    strokeColor: '#CCCCCC',
    scale: 0.75,
    anchor: { x: 26, y: 68 },
    path: 'M23.0164 65.9543L23.1657 66.1684H23.1916C24.6865 68.0042 27.5944 67.9503 28.9836 65.9543C32.3385 61.1395 35.2121 57.0864 37.6687 53.6214C42.127 47.3332 45.2122 42.9818 47.309 39.5289C48.9416 36.8407 49.9943 34.6678 50.6355 32.5227C51.2779 30.3736 51.5 28.277 51.5 25.7506C51.5 11.7942 40.0847 0.5 26 0.5C11.9153 0.5 0.5 11.7942 0.5 25.7506C0.5 28.277 0.72208 30.3736 1.36449 32.5227C2.00572 34.6678 3.05844 36.8407 4.69097 39.5289C6.78784 42.9817 9.87301 47.3332 14.3312 53.6213C16.7879 57.0864 19.6615 61.1395 23.0164 65.9543ZM35.9133 25.7506C35.9133 31.1591 31.4753 35.5601 26 35.5601C20.5247 35.5601 16.0867 31.1591 16.0867 25.7506C16.0867 20.3421 20.5247 15.9412 26 15.9412C31.4753 15.9412 35.9133 20.3421 35.9133 25.7506Z',
  },
};

window.wData = wompLib.wData;

wData.wompProject = getWompProject(wData.wompProjects);
wData.wompAssetPath = `/${wData.wompProject.id}/${wompLib.cSite.assetVersion}`;
wData.wompOmniAssetsPath = `/${wData.wompProject.omniId}/${wData.wompProject.omniVersion}`;
setWDataFlags(wData.wompProject);

wData.logoId = 'logoPrimary';

const wompHealthApiEnvs = [
  {
    // Prod api
    url: 'https://womphealthapi.azurewebsites.net',
    condition:
      (!wData.isStaging && !wData.isUAT) || /api=prod/.test(location.search),
  },
  {
    // UAT (test) api
    url: 'https://womphealthtestapi.azurewebsites.net',
    condition: wData.isUAT || /api=uat/.test(location.search),
  },
  {
    // Staging (dev) api
    url: 'https://womphealthdevapi.azurewebsites.net',
    condition:
      (wData.isStaging && !wData.isUAT) || /api=stg/.test(location.search),
  },
];

wData.apiWompHealthDomain = wompHealthApiEnvs.find((x) => x.condition).url;

// (2) More wData properties - these rely on initial flags defined above so they need to be assigned here, after wData is already initialized.
Object.assign(wData, {
  origin: wData.isUAT
    ? 'https://www.uat.care.piedmont.org'
    : wData.isStaging
    ? 'https://piedmont-staging.azureedge.net/'
    : 'https://www.care.piedmont.org',
  originNoWomp: wData.isStaging
    ? 'https://www.piedmont.org'
    : 'https://www.piedmont.org',

  apiWompHealthSearch: wData.apiWompHealthDomain + '/api/WompHealthSearch',
  apiWompHealthData: wData.apiWompHealthDomain + '/api/WompHealthData',
  apiDexCare: wData.isStaging
    ? 'https://dexcareapi-uat-piedmont.azureedge.net'
    : 'https://dexcareapi-piedmont.azureedge.net',
  apiDexCareNoProtocol: wData.isStaging
    ? 'dexcareapi-uat-piedmont.azureedge.net'
    : 'dexcareapi-piedmont.azureedge.net',
  // API KEYS: be sure to use the ones prefixed with `womp-` - these are the public ones!
  apiDexCareKey: wData.isStaging
    ? 'womp-dbc985fe-2087-40ae-8c38-a8c7541ab8bc'
    : 'womp-0ecd0b9c-cd90-434b-932e-7da04d1895f2',
  apiDexCareSlotsV5Key: wData.isStaging
    ? "8edb9f72-59e3-4f77-b121-aa3e6238136a"
    : "c652b8f6-936f-4169-946f-2206bcd8a73d",
  apiAutosearch: 'https://piedmont.azureedge.net',
  apiOriginScheduling: wData.isStaging
    ? 'https://scheduling.uat.care.piedmont.org'
    : 'https://scheduling.care.piedmont.org',
  apiWaitTimes: wData.isStaging
    ? 'https://www.example.com'
    : 'https://www.example.com',

  // Analytics
  gtmId: wData.isStaging ? '' : 'GTM-PGL9F2P',
  apiWompAnalytics: wData.apiWompHealthDomain + '/api/WompHealthAnalytics',
  DexCareAnalytics: wData.isStaging ? 'G-BM0E9BRD1S' : 'G-BM0E9BRD1S',
  UniversalAnalyticsTrackingID: wData.isStaging ? '' : 'UA-4581986-1',
  GA4TrackingID: wData.isStaging ? 'G-E827P0LRHK' : 'G-E827P0LRHK',
  newGoogleAnalyticsJSON: `${wData.wompOmniAssetsPath}/json/ga4.json`,
  phiProtectGoogelAnalyticsJSON: `${wData.wompOmniAssetsPath}/json/phi-protect-ga4.json`,
});

// (3) Override certain wData properties with breeze values
if (wData.isOrthoAtl) {
  Object.assign(wData, {
    name: wData.isUAT
      ? 'orthoatlanta-uat'
      : wData.isStaging
      ? 'orthoatlanta-staging'
      : 'orthoatlanta',
    childBrandParam: '&childBrand=orthoatlanta',
    origin: wData.isStaging
      ? 'https://www.uat.care.orthoatlanta.com'
      : 'https://www.care.orthoatlanta.com',
    originNoWomp: wData.isStaging
      ? 'https://www.orthoatlanta.com'
      : 'https://www.orthoatlanta.com',
  });
} else {
  Object.assign(wData, {
    name: wData.isUAT
      ? 'piedmont-uat'
      : wData.isStaging
      ? 'piedmont-staging'
      : 'piedmont',
  });
}

// (4) If you need to assign anything else to wData, do it here at the end.

// Consolidate pagetype regex matchers and set `wData.isXXX` page type flag
setPageRegexFlag();

// hard-coded insurance list. Put here in case it will be used on provider pages - if not, can be moved to location-details before-render
// wData.insuranceList = {
//   heading: "View Accepted Insurance Plans",
//   stateName: "insurance",
//   contentHtml: `
//     <div class="flx flx-col">
//       <strong>Aetna</strong>
//       HMO, POS and PPO

//       <strong class="mt-2">Blue Cross/Blue Shield</strong>
//       HMO, POS/PPO, Blue Card and Traditional

//       <strong class="mt-2">Cigna</strong>
//       HMO, Network/Flexcare, PPO, Open Access Plus (OAP), Indemnity and LocalPlus

//       <strong class="mt-2">Medicare</strong>

//       <strong class="mt-2">United</strong>
//       HMO, POS, EPO, PPO, Options PPO and Nexus ACO
//     </div>
//     `,
// };

/**
 * Feature flags
 * 
 * Use in html with `w-if="wData.features.XXXX"`
 * ... in JS with `if(wData.features.XXXX){}`
 * ... etc.
 * 
 * @documentation https://github.com/wompmobile/TexasHealth/wiki/feature-flags
 * @example
 *  // A feature flagged with this will only be enabled in staging:
      exampleScopedToStaging: wData.isStaging
    // A feature flagged with this will only be enabled when `?exampleFeat=true` is   added to url, regardless of environment:
      exampleScopedToQParam: /exampleFeat=true/.test(location.search)
    // A feature flagged with this will initially only be for breezecare; later it can be rolled out to THR as well:
      examplewithPartialRollout: wData.isBreeze
*/
wData.features = {
  // Include `filter by availability` on Provider SERP
  availabilityFilter: false,
  // If you flip this to false, all links on the page will go to canonical instead of `care.` subdomain
  allowCareDotLinks: true,
  // Hard code hours of operation on location pages
  // hardcodeHours: true,
  // Hard code quick care about section (as in, not from API)
  hardcodeQuickCareAbout: false,
  // This is the link in the Urgent Care "Tile" CTA
  hardcodeUrgentCareExternalUrl: true,
  // New Patient Visits, Virtual Visits, Online Booking, Walk-Ins Welcome
  // hardcodeLocationKeyFeatures: true

  /**
   * FLAGS FOR SITE CLOSURES
   */
  // 'Location closed' banner - site-by-site banner visibility and content controlled via `Description` field. Must be true and Description field must be populated for the banner to show on a location page.
  // locationDetailsAlertBanner: true,
  // Display "Video visits are unavailable" msg on quickcare page, and show tiles on location detail pages
  // isQuickCareAvailable: true,
  // mark all breeze locations as CLOSED due to inclement weather - SERP page
  // areBreezeLocationsOpen: true
};

/***************************************
           UTILITY FUNCTIONS
***************************************/

wompLib.fetchWompHealth = async function (extraParams = '') {
  try {
    let response = ``;
    let params;
    if (extraParams) {
      params = new URLSearchParams(extraParams);
      for (const [key, val] of params) {
        params.set(key, val);
      }
      params = '&' + params.toString();
    }

    if (params && params.includes('ProfileUrl=')) {
      response = await fetch(
        `${wData.apiWompHealthSearch}?includeFallbackResults=false&locations=false&type=search&brand=${wData.brand}${wData.childBrandParam}${params}`
      );
    } else {
      response = await fetch(
        `${wData.apiWompHealthSearch}?includeFallbackResults=false&locations=true&type=search&brand=${wData.brand}${wData.childBrandParam}${params}`
      );
    }

    const json = await response.json().then((res) => {
      const updatedRes = {
        ...res,
        providers: res.results.filter((res) => res.type == 'provider'),
        locations: res.results.filter((res) => res.type == 'location'),
      };

      return updatedRes;
    });
    return json;
  } catch (err) {
    wompLib.logError('Failure fetching wompHealth api', err);
  }
};

wompLib.fetchWompHealthData = async function (providerID = '') {
  try {
    let response = ``;

    response = await fetch(
      `${wData.apiWompHealthData}?locations=true&type=search&brand=${wData.brand}&id=${providerID}&pressganey=true`
    );

    const json = await response.json();
    return json;
  } catch (err) {
    wompLib.logError('Failure fetching wompHealth api', err);
  }
};

wompLib.formatPhoneNumber = function (num, format = 'default') {
  /* Filter only numbers from the input */
  const cleaned = ('' + num).replace(/\D/g, '');

  /* Check if the input is of correct */
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    /* Remove the matched extension code. Change this to format for any country code.*/
    const intlCode = match[1] ? '' : '';

    switch (format) {
      case 'hyphenated':
        return `${intlCode}${match[2]}-${match[3]}-${match[4]}`;
      default:
        return `${intlCode}(${match[2]}) ${match[3]}-${match[4]}`;
    }
  }

  return num;
};

wompLib.deletePage = async function () {
  const name = wData.name.toLowerCase();
  const url = `http://piedmont.ampify.wompmobile.com/${window.location.pathname}`;

  await fetch(
    `https://ampify.wompmobile.com/ampcache/deletePage?name=${name}&url=${encodeURIComponent(
      url
    )}`
  );

  return;
};

/**
 * Get universal care tiles templates and css and insert them into amp-list templates in their respective snippets.
 * (1) fetch omniAssets care-tiles.js
 * (2) execute as a fn
 * (3) instantiate AmpTemplateGenerator class and get the tile templates/css
 * (4) Grab each tile's corresponding snippet
 * (5) insert tile html into snippet using ~~ string replacement
 * (6) append tile css onto end of snippet css
 * (7) Build continues as normal, utilizing modified snippets
 *
 * @param {Array} tileNames Array of strings - each the name of a care tile (defined in omniAssets care-tiles.js)
 */
wompLib.getCareTiles = async function (tileNames) {
  if (!wData.isGoogleBot) return;

  try {
    if (typeof tileNames == 'string') {
      tileNames = tileNames.split(',');
    }

    const careTilesJs = new Function(
      await (await fetch(`${wData.wompOmniAssetsPath}/js/care-tiles.js`)).text()
    );
    await careTilesJs(); // Runs the IIFE inside care-tiles.js

    // AmpTemplateGenerator is provided on the window by care-tiles.js
    const ampTemplateGenerator = new window.AmpTemplateGenerator();

    const tiles = await ampTemplateGenerator.get(tileNames, 'piedmont');

    // Split the current and nearby timeslot tiles into their own top-level objects
    if (tiles.locationTimeslots_details) {
      tiles.locationTimeslots_details_current =
        tiles.locationTimeslots_details.current;
      tiles.locationTimeslots_details_nearby =
        tiles.locationTimeslots_details.nearby;
      delete tiles.locationTimeslots_details;
    }

    console.log('importing care tiles:', tiles);

    // Use the keywords map at wData.careTiels.wDataMap to make sure the ~~keyword~~s in the tile code are present on wData
    for (const keyword in wData.careTiles.wDataMap) {
      const localKeyword = wData.careTiles.wDataMap[keyword];
      if (
        !wData.hasOwnProperty(localKeyword) ||
        wData[localKeyword] == undefined
      ) {
        wompLib.logError(
          `Care tiles import error: expected ~~${keyword}~~ mapped to wData.${localKeyword}, but wData.${localKeyword} is falsy`
        );
      }
      wData[keyword] = wData[localKeyword];
    }

    // Use `~~` string replacement to insert care tile templates into their respective snippets
    for (const name in tiles) {
      const tileObj = tiles[name];
      const snippetName = wData.careTiles.templateNameMap[name];

      if (tileObj && snippetName) {
        // replace --keyword-- with ~~keyword~~
        // add amp-bind and amp on attributes (stored as data attributes)
        tileObj.template = tileObj.template
          .replaceAll(/--(\S*?)--/g, '~~$1~~')
          .replaceAll(/data-amp-bind-([a-z]+)=/gm, '[$1]=')
          .replaceAll(/data-amp-on=/gm, 'on=');

        const careTiletemplate = doStringReplacement(name, tileObj.template);
        // `~~` replacement uses top-level key value pairs on wData
        wData['careTileTemplate_' + name] = careTiletemplate;
        // Get the snippet html
        const snippetHtml = wompLib.cSite.snippets[snippetName];
        // Perform string replacement
        const modifiedSnippet = wompLib.replaceTemplateStrings(
          wData,
          snippetHtml
        );
        // Save modified html into the snippet for rendering during the normal build process
        wompLib.cSite.snippets[snippetName] = modifiedSnippet;

        // Finally, append tile css to snippet css to be included later during the normal build process
        let snippetCss = wompLib.cSite.snippetCSS[snippetName];
        snippetCss = doStringReplacement(name, tileObj.css) + snippetCss;
        wompLib.cSite.snippetCSS[snippetName] = snippetCss;

        console.log('Inserted care tile ', name);
      }
    }

    /**
     * perform ~~ string replacement, passsing in data specifically for the care tiles
     * @param {string} tileName - name of the care tile being processed
     * @param {string} string - string on which to perform replacement
     * @returns modified string
     */
    function doStringReplacement(tileName, string) {
      return wompLib.replaceTemplateStrings(
        {
          namespace: 'careTile_' + tileName,
          'schedule-origin': wData.apiOriginScheduling,
          ...wData,
        },
        string
      );
    }
  } catch (err) {
    wompLib.logError('Problem getting care tiles', err);
  }
};

/**
 * Fetch wompHealth api for locations by passing Url=<wData.pathname> param
 * Take the response JSON and store it on wData stringified, along with some other properties so they can be used with the tilde string replacement.
 */
wompLib.storeWompHealthLocationsOnWData = async function () {
  const extraParams = `Url=${wData.pathname.toLowerCase()}&providers=false`;

  wData.wompHealthResponse = { locations: [{}] };
  wData.wompHealthResponse = await wompLib.fetchWompHealth(extraParams);

  // We use the first (should be only) location obj in the response to render out all the page content.

  if (!wData.wompHealthResponse.locations.length) {
    wData.wompHealthResponse = await wompLib.fetchWompHealth(
      'Url=' + wData.pathname + '&providers=false'
    );
  }
  const locationObject = wData.wompHealthResponse.locations[0];

  /* If there are still no providers, error out */
  if (!wData.wompHealthResponse.locations.length) {
    this.buildTime.success = false;
    this.buildTime.error = 'No locations returned';
  } else if (
    /* If the requested ProfileUrl doesn't match the returned one, it's the wrong provider. Error out. */
    wData.wompHealthResponse.locations[0].Url.toLowerCase() !== wData.pathname
  ) {
    this.buildTime.success = false;
    this.buildTime.error = "Page pathname doesn't match API result";
  }

  /* If buildTime.sucess if false, we don't want to build the page or save it to the blob storage */
  if (this.buildTime.success === false) {
    throw new Error(
      'Error: ' + this.buildTime.error + '\n' + window.location.pathname
    );
  }

  // Need to reformat and collapse open/close hours (combine days with same hours, e.g., `Mon - Wed  8am - 5pm`)
  if (locationObject.OpenHours?.length) {
    wData.wompHealthResponse.locations[0].collapsedOpenHours =
      wompLib.collapseSameOpenHours(locationObject);
  }

  Object.assign(wData, {
    // isFamilyCare: /Texas\sHealth\sFamily\sCare/i.test(locationObject.Name),
    wompHealthResponseStringified: JSON.stringify(wData.wompHealthResponse),
    UrlName: locationObject.UrlName,
    clinicAddress: locationObject.Address,
    clinicGeolocationStringified: JSON.stringify(
      wData.wompHealthResponse?.locations[0]?.GeocodedCoordinate?.coordinates
    ),
  });

  wData.pageTitle =
    (locationObject.LocationName || locationObject.Name) +
    ' | Piedmont Healthcare';
};

wompLib.createDistanceMilesStr = function (distance) {
  const distanceMiles =
    !distance && distance !== 0
      ? false
      : parseFloat(Number(distance).toFixed(1));
  const distanceMilesStr =
    distanceMiles === false
      ? false
      : distanceMiles == 1
      ? `${distanceMiles} mile`
      : `${distanceMiles} miles`;
  return distanceMilesStr;
};
/**
 * Get the open and close hours from location api response, format them correctly, and collapse them into format so that adjacent days with identical hours are combined. e.g.,
 * ```plain
 * Mon - Thu  8 a.m. - 5 p.m.
 * Fri        8 a.m. - 12 p.m.
 * Sat - Sun  Closed
 * ```
 * @param {Object} locationObject The location data object
 * @returns Array of objects, each containing days and hours for parsing with mustache
 */
wompLib.collapseSameOpenHours = function (locationObject) {
  // Modify open/close hours into correct format
  // NOTE: api returns date with `Z` at the end - this is SUPPOSED to mean it's UTC time... but they aren't, so remove the Z
  const formatDate = (dateStr) => {
    if (!dateStr) return 'closed';
    // convert date format "20120221T080000Z" to "2012-02-21T08:00:00"
    const correctISOString = dateStr
      .replace(/(.{4})(.{2})(.{5})(.{2})(.*)/, '$1-$2-$3:$4:$5')
      .replace(/Z$/i, '');

    // Convert full ISO string into format "8 a.m."
    return new Date(correctISOString)
      .toLocaleTimeString('en-us', {
        hour: 'numeric',
        minute: 'numeric',
      })
      // .toLowerCase()
      // .replace(":00", "")
      // .replace(/(a|p)(m)/i, "$1.$2.");
  };

  // Format date/time strings
  const openHoursArr = locationObject.OpenHours?.map((dateStr) =>
    formatDate(dateStr)
  );
  const closedHoursArr = locationObject.CloseHours?.map((dateStr) =>
    formatDate(dateStr)
  );

  if (!openHoursArr || !closedHoursArr) return;

  // Collapse open-close times in format `<open hour> - <close hour>`, e.g., `8 a.m. - 5 p.m.`
  const combinedTimes = openHoursArr.map(
    (time, index) => `${time} to ${closedHoursArr[index]}`
  );

  /**
   * Then rest of the function loops through each day of the week and checks to see if the current hours are equal to the previous iteration's hours; if so, keep track of what day it's on. When it finds hours that don't match the previous, push the tracked days and hours and reset the trackers.
   */
  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const collapsedDays = [];

  let firstComboDay = days[0];
  let lastComboDay = '';
  let comboTime = combinedTimes[0];

  days.forEach((currentDay, index) => {
    if (currentDay !== firstComboDay) {
      firstComboDay = firstComboDay || currentDay;
    }

    if (combinedTimes[index] == comboTime) {
      lastComboDay = currentDay === firstComboDay ? lastComboDay : currentDay;
    }

    if (combinedTimes[index] !== comboTime && lastComboDay) {
      // Current iteration's hours don't match the trakced hours, and more than one day share the hours (lastComboDay is truthy)
      collapsedDays.push({
        day: `${firstComboDay} - ${lastComboDay}`,
        hours: comboTime,
        closed: /closed/i.test(comboTime),
      });
      firstComboDay = currentDay;
      lastComboDay = '';
      comboTime = combinedTimes[index];
    } else if (currentDay !== firstComboDay && !lastComboDay) {
      // Current iterattion is not the first iteration after reset (or very first iteration) and the current iteration does not match the one before (lastComboDay is falsy)
      collapsedDays.push({
        day: firstComboDay,
        hours: comboTime,
        closed: /closed/i.test(comboTime),
      });
      firstComboDay = currentDay;
      lastComboDay = '';
      comboTime = combinedTimes[index];
    }
    if (index == days.length - 1) {
      // Final iteration - push whatever is tracked or left over.
      collapsedDays.push({
        day: `${firstComboDay}${lastComboDay ? ' - ' + lastComboDay : ''}`,
        hours: comboTime,
        closed: /closed/i.test(comboTime),
      });
    }
  });

  // If every day has exactly the same hours, set `sameEveryDay` flag as the UI has a different design/copy
  if (collapsedDays.length === 1) {
    collapsedDays[0].sameEveryDay = true;
  }

  // We don't want to show "Closed, seven days a week" - if that would be the case, return empty array so the hours don't render at all.
  if (collapsedDays[0].closed && collapsedDays[0].sameEveryDay) {
    return [];
  }

  return collapsedDays;
};

/**
 * @description return all elements found in context element and child template elements
 *
 * element.querySelectorAll ignores template element content by design.
 * This includes template DOM in the querySelectorAll
 * so that it can be updated before amp-lists render.
 *
 * @param {String} selector - element CSS selector
 * @param {Element} context - element to query
 * @returns {[Element]} - an array of Element(s) that match the selector
 */
wompLib.querySelectorAllDomAndTemplate = function (
  selector,
  context = wompLib.doc
) {
  const domElems = Array.from(context.querySelectorAll(selector));

  const templates = context.querySelectorAll('template');
  let templateElemsAll = [];
  for (const template of templates) {
    templateElemsAll = templateElemsAll.concat(
      Array.from(template.content.querySelectorAll(selector))
    );
  }

  return domElems.concat(templateElemsAll);
};

/**
 * @description return all elements found in context element and child template elements
 * Same as wompLib.querySelectorAllDomAndTemplate except wraps in jquery object
 *
 * element.querySelectorAll ignores template element content by design.
 * This includes template DOM in the querySelectorAll
 * so that it can be updated before amp-lists render.
 *
 * @param {String} selector - element CSS selector
 * @param {Element} context (opt) - context element to query.
 *      defaults to wompLib.doc.documentElement
 * @returns {jQuery[Element]} -
 *      a jQuery object containing Element(s) that match the selector
 */
wompLib.$$$ = (selector, context = wompLib.doc.documentElement) => {
  if (!selector) return womp$();

  const domElems = wompLib.querySelectorAllDomAndTemplate(selector, context);

  return womp$(domElems);
};

/**
 * Insert html strings into template placeholders
 * Also inserts html strings into style[amp-custom]
 *
 * Intended to be called in AMP template after render
 *
 * Example Use:
 *
 *  Set in BeforeRenderJS
 *      wData.property = 'Conditional Property'
 *
 *  Template Replacement Example
 *      <div>~~property~~</div> => <div>Conditional Property</div>
 *
 * @param {obj} data - an object whose properties are strings containg html. Most often will be wData
 * @param {string} [string] - option string on which to perform replacement
 * @returns modified string if provided, or undefined
 */
wompLib.replaceTemplateStrings = function (data = wData, string) {
  // Manipulate document as a string
  var doc = string || wompLib.doc.documentElement.innerHTML;

  // Replace template placeholders with data strings scraped in beforeRenderJS
  doc = doc.replace(/~~(\S*?)~~/g, (match, $1) => {
    return (data[$1] && data[$1].toString()) || '';
  });

  if (string) {
    return doc;
  } else {
    // rewrite string to DOM
    wompLib.doc.documentElement.innerHTML = doc;
  }
};

/**
 * evalute the womp fns defined below.
 * The order matters, so they are called here.
 * wompLib.evalWompFns should be called at the top of after-template.js.
 */
wompLib.evalWompFns = function () {
  wompLib.evalWIf();
  wompLib.evalWMove();
  wompLib.evalWRender();
};

/**
 * Get the name of the data src passed through the snippet call and store it on wData so that we can consume it later
 * data props are pushed to array in order, and are consumed in order
 * @param {string} snippetName name of the snippet
 * @param {string} dataStr referecne to the data src (object name, function name, etc.)
 * @returns undefined
 */
wompLib.passSnippetProps = function (snippetName, dataStr) {
  if (!snippetName || !dataStr) return;

  wData.dataProps = wData.dataProps || {};
  wData.dataProps[snippetName] = wData.dataProps[snippetName] || [];
  wData.dataProps[snippetName].push(dataStr);
};

/**
 * Get a snippet's html and append it's css to the page (if not already added)
 * @param {string} snippetName name of the snippet to get
 * @returns string - the snippet's html
 */
wompLib.getSnippetHtmlCss = function (snippetName) {
  // See if snippet is already registered on the page. If not, append the snippet CSS
  const snipExists = wompLib.cWomp.snipCalls.filter(
    (x) => x[snippetName]
  ).length;
  if (!snipExists) {
    // Register snippet so css isn't included twicee
    const obj = {};
    obj[snippetName] = snippetName;
    wompLib.cWomp.snipCalls.push(obj);

    try {
      const snipCSS = wompLib.cSite.snippetCSS[snippetName];
      if (snipCSS && snipCSS.length > 0) {
        // Append to inlineCSS in case this fn is called early in build
        // wompLib.inlineCSS += snipCSS + ' '; // This was adding css twice
        // And append to style[amp-custom] if it's called later
        const $customStyles = $(wompLib.doc.documentElement).find(
          '[amp-custom]'
        );

        if (!$customStyles) wompLib.inlineCSS += snipCSS + ' ';

        $customStyles.html($customStyles.html() + snipCSS + ' ');
      }
    } catch (ex) {
      wompLib.logError(
        'Error appending CSS for Snippet[' + snippetName + '] : ',
        ex
      );
    }
  }

  // Return the html
  return wompLib.cSite.snippets[snippetName];
};

/**
 * Add [w-if="wData.someData"] attribute to an element and the element will be conditionally kept or removed from the DOM depending on the truthiness of wData.someData.
 * If the w-if is truthy (and thus is kept in the DOM), its next sibling will be removed from the DOM if it has w-else attribute.
 *
 * @returns undefined
 * 
 * @example
 * ```html
 *  <div id="example" w-if="wData.someData" >
      <p> #example is removed from the DOM if wData.someData is falsy </p>
    </div>
    <div id="altContent" w-else>
      <h2>If wData.someData is falsy, #altContent will be rendered instead</h2>
      <p>If wData.someData is truthy, #altContent will be removed from DOM</p>
    </div>

    // Equivalent to:
    {if(wData.someData)}
      <div id="example" >
        <p>...</p>
      </div>
    {endif}
    {if(!wData.someData)}
      <div id="altContent">
        <h2>...</h2>
        <p>...</p>
      </div>
    {endif}
    ```
 */
wompLib.evalWIf = function () {
  const doc = wompLib.doc.documentElement;
  const wIfs = wompLib.querySelectorAllDomAndTemplate(
    '[data-w-if], [w-if]',
    doc
  );
  if (!wIfs.length) return;
  console.log(`wompIfs: Found ${wIfs.length}:`, wIfs);

  for (const el of wIfs) {
    const dataStr =
      el.getAttribute('data-w-if') || el.getAttribute('w-if') || '';

    // datStr can be object dot notation, js expression, function name, etc.
    let dataEval = eval(dataStr);

    // get the w-if's next sibling (if there is one) and determine if it is a w-else
    const sibling = el.nextElementSibling;
    const hasElse =
      sibling &&
      (sibling.hasAttribute('data-w-else') || sibling.hasAttribute('w-else'));

    // [w-if]/[w-else] is nice but amp doesnt like it - replace with [date-w-if]/[data-w-else]
    if (el.hasAttribute('w-if')) {
      el.setAttribute('data-w-if', dataStr);
      el.removeAttribute('w-if');
    }
    if (sibling && sibling.hasAttribute('w-else')) {
      sibling.setAttribute('data-w-else', '');
      sibling.removeAttribute('w-else');
    }
    if (dataEval && hasElse) {
      // w-if is truthy; remove w-else if there is one.
      sibling.parentNode.removeChild(sibling);
    } else if (!dataEval) {
      // w-if is falsy; remove it. sibling will be rendered whether it's a w-else or not.
      el.parentNode.removeChild(el);
    }
  }
  console.log(`wompIfs: done.`);
};

/**
 * Sometimes we need to move elements around in the dom at build time. This fn will find elements with [w-move="<selector>"] attribute, and append them to an element identified by <selector>. Of the found w-move elements, it will also de-duplicate any with identical IDs (because IDs should be unique!). If
 *
 * For example, it is invalid to put amp-list templates inside other templates (even though it IS valid to put amp-lists inside amp-lists). Add [w-move="<selector>"] attribute to the template and it will be relocated to the first <selector> element found. This was templates can be kept inside snippet html without worrying about using that snippet inside a parent template.
 *
 * @returns undefined
 *
 * @example
 * ```html
 *  <!-- if this is in snippet html... -->
 * <template id="timeslotsTemplate"
 *    w-move="body"
 *    type="amp-mustache">
 *  </template>
 *
 *  <!-- in after-render it will be relocated to the body: -->
 *  <body>
 *    <!-- appended to the end after everything else -->
 *    <template id="timeslotsTemplate"
 *      w-move="body"
 *      type="amp-mustache">
 *    </template>
 *  </body*
 * ```
 */
wompLib.evalWMove = function () {
  try {
    const wMoves = wompLib.querySelectorAllDomAndTemplate(
      '[data-wmove], [w-move]'
    );

    if (!wMoves.length) return;
    console.log(`wompMoves: Found ${wMoves.length}:`, wMoves);

    wMoves.forEach((el) => {
      const selector =
        el.getAttribute('data-wmove') || el.getAttribute('w-move') || '';

      // throw if no selector provided, or if a matching element cannot be found
      if (
        !selector ||
        !wompLib.querySelectorAllDomAndTemplate(selector).length
      ) {
        throw new Error(`selector ${selector} not found`);
      }

      // Remove from original location...
      el.parentElement.removeChild(el);

      // ...and append it to the frist instance of <selector> if there isn't already one with the same ID
      if (!$(`${selector} > #${el.id}`).length) {
        wompLib
          .querySelectorAllDomAndTemplate(selector)[0]
          .appendChild($(el)[0]);
      }
    });
    console.log('wompMoves: Done');
  } catch (err) {
    wompLib.logError('Error in w-move:\n' + err);
  }
};

/**
 * Find `w-render` elements in the page and render inner template with mustache
 * Similar effect as using an amp-list except does it at build time (thus, is static) and with less code
 * 
 * @example
 * ```html
 * <!-- In template/snippet html -->
 *    <w-render data="wData.anArray">
 *      {{#.}}
 *        <a class="nav-item {{classes}}" href="{{href}}">
 *          {{txt}}
 *        </a>
 *      {{/.}}
 *    </w-render>
 * ```
 * ```js
 *
 *    // Define wData.anArray in before-render
 *    wData.anArray = [
 *      {href:"/", txt:"link 1", classes: "bold"},
 *      {href:"/link2", txt:"link 2", classes: "underline"},
 *    ]
 * ```
 * ```html
 *
 * <!-- Renders to this: -->
 *    <a class="nav-item bold" href="/">
 *       Link 1
 *    </a>
 *    <a class="nav-item underline" href="/link2">
 *       Link 2
 *    </a>
 * ```
 *
 * Can also include w-render in html of reusable snippets. Include the snippet on a page like normal and pass the name of the data source as a prop. In the snippet html, give the w-render node `name="snippet_name"` and `data-props` attributes. In the snippet before-render.js, store the data prop on wData by calling `wompLib.passSnippetProps`
 * @example
 *  ```html
 * <!-- In my_snippet html -->
 *    <w-render snippet="my_snippet" data-props>
 *      {{#.}}
 *        <a class="nav-item {{classes}}" href="{{href}}">
 *          {{txt}}
 *        </a>
 *      {{/.}}
 *    </w-render>
 * ```
 * ```js
 *  // In snippet before-render.js, call wompLib.passSnippetProps
 * my_snippet: function(dataStr) {
 *    wompLib.passSnippetProps("my_snippet", dataStr)
 * }
 
 * ```
 *  ```html
 * <!-- Where snippet is added to the page -->
 *    {my_snippet(wData.dataSource)}
 * ```
 * ```js
 *    // Define wData.dataSource in before-render
 *    wData.dataSource = [
 *      {href:"/", txt:"link 1", classes: "bold"},
 *      {href:"/link2", txt:"link 2", classes: "underline"},
 *    ]
 * ```
 *
 * 
 * 
 * wompLib.evalWRender is called in before-template.js
 *
 * @returns undefined
 */
wompLib.evalWRender = function () {
  try {
    const doc = wompLib.doc.documentElement;
    const wRenders = wompLib.querySelectorAllDomAndTemplate(
      'w-render, [data-wRender], [w-render]',
      doc
    );
    if (!wRenders.length) return;
    console.log(`wompRenders: Found ${wRenders.length}:`, wRenders);

    wompLib.addMustache();

    for (const el of wRenders) {
      let dataStr =
        el.getAttribute('data') ||
        el.getAttribute('data-wRender') ||
        el.getAttribute('w-render') ||
        '';
      let template = el.innerHTML;

      const isDataProps = el.hasAttribute('data-props');

      if (isDataProps) {
        const snippetName =
          el.getAttribute('snippet') || el.getAttribute('data-snippet') || '';

        // consume the data props in order
        dataStr = wData.dataProps[snippetName][0];

        if (!dataStr) {
          console.error(
            `${snippetName}: Expected data-props, but recieved none. Removing element.`
          );
        }
        // data prop is consumed; remove from store
        wData.dataProps[snippetName].splice(0, 1);
      }

      let data = eval(dataStr);
      if (typeof data == 'function') data = data();
      if (data || !isDataProps) {
        // It's ok to include unrendered mustache code if it will be used in a amp list - simply don't pass any data to the snippet and don't add [data=props]
        const contentToInsert = data
          ? Mustache.render(template, data)
          : template;
        el.insertAdjacentHTML('beforebegin', contentToInsert);
      }
      el.parentNode.removeChild(el);
    }
    console.log(`wompRenders: done.`);
  } catch (err) {
    wompLib.logError('Error in w-render', err);
  }
};

/**
 * Finds disallowed tag names in the html and replaces those nodes with their text content
 * @param {string} html - html string to sanitize
 * @param {array} whitelistedTagNames - array of strings, each a tag name that is allowed
 * @returns string - sanitized html
 */
wompLib.sanitizeHTML = function (html, whitelistedTagNames = []) {
  const tmpEl = document.createElement('div');
    tmpEl.innerHTML = html;

  /* Remove any elements that aren't in the whitelistedTagNames array */
  tmpEl.querySelectorAll('*').forEach(el => {
    const regEx = new RegExp(whitelistedTagNames.join('|'), 'i');
    if (/style|script/i.test(el.tagName)) {
      el.remove();
    } else if (!whitelistedTagNames.length || !regEx.test(el.tagName)) {
      el.insertAdjacentHTML('afterend', el.innerText);
      el.remove();
    } else if (/h2/i.test(el.tagName)) {
      el.classList.add('section-heading')
    }
  });
  
  return tmpEl.innerHTML;
}


/**
 * Render a snippet using mustache, without an amp-list
 * Allows for reusing snippets multiple times on a page, with different data in each
 * Modifies wompLib.newHTML, replacing {snippet(props)} with the rendered HTML.
 *
 * NOTE: Cannot use snippet's after-render.js yet because the snippet call is replaced by rendered HTML - thus the builder no longer will know to run the after-render.js.
 *
 * @param {String} snippetName - Name of snippet
 * @param {Object} json - Data for rendering the snippet with Mustache
 * @returns undefined
 */
wompLib.renderSnippetProps = function (snippetName, dataStr) {
  // If no props are passed, normal snippet replacement is used and the snippet's raw html is inserted into the page as part of normal build process.
  if (!snippetName || !dataStr) return;

  try {
    const json = dataStr == 'wData' ? wData : wData[dataStr];

    if (!json) {
      wompLib.newHTML = wompLib.newHTML.replace(
        `{${snippetName}(${dataStr})}`,
        ''
      );
      console.log(`${snippetName}(${dataStr}): Expected data, but found none.`);
      return;
    }

    wompLib.addMustache();

    let snippetHtml = wompLib.cSite.snippets[snippetName];
    const regex = new RegExp(`\\{${snippetName}.*?\\)\\s?\\}`);
    const matches = wompLib.newHTML.match(regex);
    const renderedHtml = Mustache.render(snippetHtml, json);

    wompLib.newHTML = wompLib.newHTML.replace(
      `{${snippetName}(${dataStr})}`,
      renderedHtml
    );
    // If this is the last isntance of the snippet call, stick the snippet css in the inline css - Otherwise we lose it.
    if (matches.length == 1) {
      wompLib.inlineCSS += wompLib.cSite.snippetCSS[snippetName];
    }
  } catch (err) {
    wompLib.logError('Error rendering a snippet function', err);
  }
};

/**
 * Gets a STRING representation of an override object from a property on wData and add a script element to the page, which in turn stores the override as an OBJECT on window. Must be called from after-render.
 * @param {String} dataName property name on wData that contains a STRING representation of an object of script config overrides
 */
wompLib.addScriptConfigOverride = function (dataName) {
  if (dataName && wData[dataName]) {
    const searchOverrideScript = `<script id="scriptConfigOverride" type="application/json">
            ${JSON.stringify(wData[dataName])}
        </script>`;
    $('body').prepend($(searchOverrideScript));
  }
};

wompLib.generateScriptHashes = () => {
  // Grab the amp-script tags
  const scripts = $('script[target="amp-script"]');

  if (scripts.length > 0) {
    let data = [];

    // Add the text for each script to the array
    $(scripts).each(function () {
      const html = this.innerHTML
        .replace(/\r?\n|\r/gi, '')
        .replace(/\s{2,}/gi, ' ')
        .replace(/\) \./gi, ').')
        .trim();

      $(this).html(html);

      data.push(html);
    });

    if (data.length > 1) {
      // Stringify the array for API consumption
      data = JSON.stringify(data);
    } else {
      data = data[0];
    }

    // Call the API and update the <head> of the document
    const fetchURL = new URL(
      'https://ampscripthash.azurewebsites.net/generateCSPHash'
    );
    womp$.ajax({
      url: fetchURL.href,
      method: 'POST',
      data: { script: data },
      async: false,
      dataType: 'text',
      success: function (hashes) {
        $('head').append(`<meta name="amp-script-src" content="${hashes}">`);
      },
    });
  } else {
    return false;
  }
};

wompLib.pageFetch = function (url = location.href) {
  return new Promise(async (resolve, reject) => {
    try {
      const sourceUrl = new URL(url);
      sourceUrl.searchParams.delete('amp');

      const response = await fetch(sourceUrl);

      if (!response.ok) throw new Error(response.statusText);

      let responseText = await response.text();
      /* Modify the page to only download desired assets */
      responseText = wompLib.Capture.disable(responseText, 'x-');

      const parser = new DOMParser();
      const doc = parser.parseFromString(responseText, 'text/html');
      let doc$ = $(doc);

      wData.page = doc$;
      resolve(doc$);
    } catch (err) {
      reject(err);
    }
  });
};

/* Intended for use in the Promises of these functions:
    wompLib.waitForProperty
    wompLib.waitForElement
*/
function waitForPropertyOrElement(
  resolve,
  reject,
  type,
  item,
  maxWait = 10000
) {
  // Throw Error after maxWait
  var timeout = setTimeout(function () {
    clearInterval(interval);
    reject(`Could not find "${item}" on page load.`);
  }, maxWait);

  // Wait for property or element to become available
  var interval = setInterval(function () {
    // Wait for property or element
    // Use try/catch approach to make sure we catch potential eval(item) errors
    // Using window.eval for Closure Compiler compatibility.
    try {
      if (type == 'property' && window.eval(item) === undefined)
        throw new Error('item not present yet');
      else if (type == 'element') $$(item)[0].outerHTML;
    } catch (ex) {
      console.log(`womp- waiting for ${item}`);
      return;
    }

    console.log(`womp- found: ${item}`);
    clearInterval(interval);

    resolve(`womp- found: ${item}`);
  }, 250);
}

/**
 * Returns a Promise that resolves when propertyName is available on Window
 * @param {string} propertyName - An object or property of an object
 *      ex: 'utag_data' or  '$.templates'
 * @param {number} maxWait - Maximum time to wait for the object (in milliseconds)
 * @returns {obj} - A promise that will resolve or reject based on the presence of the object
 */
wompLib.waitForProperty = function (propertyName, maxWait) {
  return new Promise(function (resolve, reject) {
    waitForPropertyOrElement(
      resolve,
      reject,
      'property',
      propertyName,
      maxWait
    );
  });
};

/**
 * Waits for an element to become available in the DOM.
 * @param {string} elementName - A jQuery selector for a DOM Node
 *      ex: '#alsoBought, .doNotWorry'
 * @param {number} maxWait - Maximum time to wait for the object (in milliseconds)
 * @returns {obj} - A promise that will resolve or reject based on the presence of the DOM Node
 */
wompLib.waitForElement = function (elementName, maxWait) {
  return new Promise(function (resolve, reject) {
    waitForPropertyOrElement(resolve, reject, 'element', elementName, maxWait);
  });
};

/**
 * Assembles structured data (schema) from provided data.
 * All page types will have org data. specific pages will have their own additional specific data.
 * Add `<script id="schema"></script>` to the page. This fn will insert the stringified JSON data into the script.
 *
 * Run from after-render / after-template
 *
 * @param {object} data data from which to assemble the structured data
 */
wompLib.createSchema = function (data) {
  // TODO - Add seo keywords?

  const structuredData = {
    '@id': '_:graph',
    generatedAt: new Date().toISOString().split('T')[0],
    '@graph': [],
  };
  // Org data
  structuredData['@graph'].push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Piedmont Healthcare',
    url: wData.originNoWomp,
    logo: 'https://www.example.com',
  });

  try {
    // Location Details
    if (wData.isLocationDetail) {
      const businessType = 'MedicalOrganization';
      const {
        LocationName,
        Summary,
        ImageUrl,
        Phone,
        OpenHourDay,
        CloseHourDay,
        Days,
        GeocodedCoordinate,
        Street1,
        Street2,
        City,
        Region,
        PostalCode,
        Country,
        Url,
      } = data.locations[0];

      const [latitude, longitude] = GeocodedCoordinate.coordinates;
      const openingHours = `${OpenHourDay} - ${CloseHourDay}, ${Days}`;

      const streetAddress = Street1 + (Street2 ? ', ' + Street2 : '');

      structuredData['@graph'].push({
        '@context': 'http://schema.org',
        '@type': businessType,
        name: LocationName,
        description: Summary,
        url: wData.origin + wData.pathname,
        image: wData.origin + ImageUrl,
        openingHours: openingHours,
        telephone: Phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: streetAddress,
          addressLocality: City,
          addressRegion: Region,
          postalCode: PostalCode,
          addressCountry: Country,
          url: wData.origin + Url,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: latitude,
          longitude: longitude,
        },
        hasMap: `https://google.com/maps/place/${streetAddress},${City}, ${Region} ${PostalCode}`,
      });
    } else if (wData.isLocations) {
      structuredData['@graph'].push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: wData.origin + wData.pathname,
        potentialAction: {
          '@type': 'SearchAction',
          target:
            wData.origin +
            '/Locations?distance=&time=any&location-search_g={search_term_string}',
          // target: {
          //   "@type": "EntryPoint",
          //   urlTemplate:
          //     wData.origin +
          //     "/Locations?distance=&time=any&location-search_g={search_term_string}",
          // },
          'query-input': {
            '@type': 'PropertyValueSpecification',
            valueRequired: true,
            valueName: 'search_term_string',
          },
        },
      });
    }

    $('#schema')
      .html(JSON.stringify(structuredData))
      .attr('type', 'application/ld+json');
  } catch (err) {
    $('body').append(
      `<div id="wompQuit">"Error creating schema" - ${err}</div>`
    );
    $('body').append(
      `<script id="wompNoStorage">"Error creating schema" - ${err}</script>`
    );
    wompLib.logError('Error creating schema:\n' + err);
  }
};

/**
 * Add Mustache to the global object if it is not already present
 * Code is directly from mustachejs
 */
wompLib.addMustache = function () {
  if (window.Mustache) return;

  (function defineMustache(global, factory) {
    if (
      typeof exports === 'object' &&
      exports &&
      typeof exports.nodeName !== 'string'
    ) {
      factory(exports);
    } else if (typeof define === 'function' && define.amd) {
      define(['exports'], factory);
    } else {
      global.Mustache = {};
      factory(global.Mustache);
    }
  })(this, function mustacheFactory(mustache) {
    var objectToString = Object.prototype.toString;
    var isArray =
      Array.isArray ||
      function isArrayPolyfill(object) {
        return objectToString.call(object) === '[object Array]';
      };
    function isFunction(object) {
      return typeof object === 'function';
    }
    function typeStr(obj) {
      return isArray(obj) ? 'array' : typeof obj;
    }
    function escapeRegExp(string) {
      return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    }
    function hasProperty(obj, propName) {
      return obj != null && typeof obj === 'object' && propName in obj;
    }
    var regExpTest = RegExp.prototype.test;
    function testRegExp(re, string) {
      return regExpTest.call(re, string);
    }
    var nonSpaceRe = /\S/;
    function isWhitespace(string) {
      return !testRegExp(nonSpaceRe, string);
    }
    var entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    };
    function escapeHtml(string) {
      return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
        return entityMap[s];
      });
    }
    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var equalsRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;
    function parseTemplate(template, tags) {
      if (!template) return [];
      var sections = [];
      var tokens = [];
      var spaces = [];
      var hasTag = false;
      var nonSpace = false;
      function stripSpace() {
        if (hasTag && !nonSpace) {
          while (spaces.length) delete tokens[spaces.pop()];
        } else {
          spaces = [];
        }
        hasTag = false;
        nonSpace = false;
      }
      var openingTagRe, closingTagRe, closingCurlyRe;
      function compileTags(tagsToCompile) {
        if (typeof tagsToCompile === 'string')
          tagsToCompile = tagsToCompile.split(spaceRe, 2);
        if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
          throw new Error('Invalid tags: ' + tagsToCompile);
        openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
        closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
        closingCurlyRe = new RegExp(
          '\\s*' + escapeRegExp('}' + tagsToCompile[1])
        );
      }
      compileTags(tags || mustache.tags);
      var scanner = new Scanner(template);
      var start, type, value, chr, token, openSection;
      while (!scanner.eos()) {
        start = scanner.pos;
        value = scanner.scanUntil(openingTagRe);
        if (value) {
          for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
            chr = value.charAt(i);
            if (isWhitespace(chr)) {
              spaces.push(tokens.length);
            } else {
              nonSpace = true;
            }
            tokens.push(['text', chr, start, start + 1]);
            start += 1;
            if (chr === '\n') stripSpace();
          }
        }
        if (!scanner.scan(openingTagRe)) break;
        hasTag = true;
        type = scanner.scan(tagRe) || 'name';
        scanner.scan(whiteRe);
        if (type === '=') {
          value = scanner.scanUntil(equalsRe);
          scanner.scan(equalsRe);
          scanner.scanUntil(closingTagRe);
        } else if (type === '{') {
          value = scanner.scanUntil(closingCurlyRe);
          scanner.scan(curlyRe);
          scanner.scanUntil(closingTagRe);
          type = '&';
        } else {
          value = scanner.scanUntil(closingTagRe);
        }
        if (!scanner.scan(closingTagRe))
          throw new Error('Unclosed tag at ' + scanner.pos);
        token = [type, value, start, scanner.pos];
        tokens.push(token);
        if (type === '#' || type === '^') {
          sections.push(token);
        } else if (type === '/') {
          openSection = sections.pop();
          if (!openSection)
            throw new Error('Unopened section "' + value + '" at ' + start);
          if (openSection[1] !== value)
            throw new Error(
              'Unclosed section "' + openSection[1] + '" at ' + start
            );
        } else if (type === 'name' || type === '{' || type === '&') {
          nonSpace = true;
        } else if (type === '=') {
          compileTags(value);
        }
      }
      openSection = sections.pop();
      if (openSection)
        throw new Error(
          'Unclosed section "' + openSection[1] + '" at ' + scanner.pos
        );
      return nestTokens(squashTokens(tokens));
    }
    function squashTokens(tokens) {
      var squashedTokens = [];
      var token, lastToken;
      for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
        token = tokens[i];
        if (token) {
          if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
            lastToken[1] += token[1];
            lastToken[3] = token[3];
          } else {
            squashedTokens.push(token);
            lastToken = token;
          }
        }
      }
      return squashedTokens;
    }
    function nestTokens(tokens) {
      var nestedTokens = [];
      var collector = nestedTokens;
      var sections = [];
      var token, section;
      for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
        token = tokens[i];
        switch (token[0]) {
          case '#':
          case '^':
            collector.push(token);
            sections.push(token);
            collector = token[4] = [];
            break;
          case '/':
            section = sections.pop();
            section[5] = token[2];
            collector =
              sections.length > 0
                ? sections[sections.length - 1][4]
                : nestedTokens;
            break;
          default:
            collector.push(token);
        }
      }
      return nestedTokens;
    }
    function Scanner(string) {
      this.string = string;
      this.tail = string;
      this.pos = 0;
    }
    Scanner.prototype.eos = function eos() {
      return this.tail === '';
    };
    Scanner.prototype.scan = function scan(re) {
      var match = this.tail.match(re);
      if (!match || match.index !== 0) return '';
      var string = match[0];
      this.tail = this.tail.substring(string.length);
      this.pos += string.length;
      return string;
    };
    Scanner.prototype.scanUntil = function scanUntil(re) {
      var index = this.tail.search(re),
        match;
      switch (index) {
        case -1:
          match = this.tail;
          this.tail = '';
          break;
        case 0:
          match = '';
          break;
        default:
          match = this.tail.substring(0, index);
          this.tail = this.tail.substring(index);
      }
      this.pos += match.length;
      return match;
    };
    function Context(view, parentContext) {
      this.view = view;
      this.cache = { '.': this.view };
      this.parent = parentContext;
    }
    Context.prototype.push = function push(view) {
      return new Context(view, this);
    };
    Context.prototype.lookup = function lookup(name) {
      var cache = this.cache;
      var value;
      if (cache.hasOwnProperty(name)) {
        value = cache[name];
      } else {
        var context = this,
          names,
          index,
          lookupHit = false;
        while (context) {
          if (name.indexOf('.') > 0) {
            value = context.view;
            names = name.split('.');
            index = 0;
            while (value != null && index < names.length) {
              if (index === names.length - 1)
                lookupHit = hasProperty(value, names[index]);
              value = value[names[index++]];
            }
          } else {
            value = context.view[name];
            lookupHit = hasProperty(context.view, name);
          }
          if (lookupHit) break;
          context = context.parent;
        }
        cache[name] = value;
      }
      if (isFunction(value)) value = value.call(this.view);
      return value;
    };
    function Writer() {
      this.cache = {};
    }
    Writer.prototype.clearCache = function clearCache() {
      this.cache = {};
    };
    Writer.prototype.parse = function parse(template, tags) {
      var cache = this.cache;
      var tokens = cache[template];
      if (tokens == null)
        tokens = cache[template] = parseTemplate(template, tags);
      return tokens;
    };
    Writer.prototype.render = function render(template, view, partials) {
      var tokens = this.parse(template);
      var context = view instanceof Context ? view : new Context(view);
      return this.renderTokens(tokens, context, partials, template);
    };
    Writer.prototype.renderTokens = function renderTokens(
      tokens,
      context,
      partials,
      originalTemplate
    ) {
      var buffer = '';
      var token, symbol, value;
      for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
        value = undefined;
        token = tokens[i];
        symbol = token[0];
        if (symbol === '#')
          value = this.renderSection(
            token,
            context,
            partials,
            originalTemplate
          );
        else if (symbol === '^')
          value = this.renderInverted(
            token,
            context,
            partials,
            originalTemplate
          );
        else if (symbol === '>')
          value = this.renderPartial(
            token,
            context,
            partials,
            originalTemplate
          );
        else if (symbol === '&') value = this.unescapedValue(token, context);
        else if (symbol === 'name') value = this.escapedValue(token, context);
        else if (symbol === 'text') value = this.rawValue(token);
        if (value !== undefined) buffer += value;
      }
      return buffer;
    };
    Writer.prototype.renderSection = function renderSection(
      token,
      context,
      partials,
      originalTemplate
    ) {
      var self = this;
      var buffer = '';
      var value = context.lookup(token[1]);
      function subRender(template) {
        return self.render(template, context, partials);
      }
      if (!value) return;
      if (isArray(value)) {
        for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
          buffer += this.renderTokens(
            token[4],
            context.push(value[j]),
            partials,
            originalTemplate
          );
        }
      } else if (
        typeof value === 'object' ||
        typeof value === 'string' ||
        typeof value === 'number'
      ) {
        buffer += this.renderTokens(
          token[4],
          context.push(value),
          partials,
          originalTemplate
        );
      } else if (isFunction(value)) {
        if (typeof originalTemplate !== 'string')
          throw new Error(
            'Cannot use higher-order sections without the original template'
          );
        value = value.call(
          context.view,
          originalTemplate.slice(token[3], token[5]),
          subRender
        );
        if (value != null) buffer += value;
      } else {
        buffer += this.renderTokens(
          token[4],
          context,
          partials,
          originalTemplate
        );
      }
      return buffer;
    };
    Writer.prototype.renderInverted = function renderInverted(
      token,
      context,
      partials,
      originalTemplate
    ) {
      var value = context.lookup(token[1]);
      if (!value || (isArray(value) && value.length === 0))
        return this.renderTokens(token[4], context, partials, originalTemplate);
    };
    Writer.prototype.renderPartial = function renderPartial(
      token,
      context,
      partials
    ) {
      if (!partials) return;
      var value = isFunction(partials)
        ? partials(token[1])
        : partials[token[1]];
      if (value != null)
        return this.renderTokens(this.parse(value), context, partials, value);
    };
    Writer.prototype.unescapedValue = function unescapedValue(token, context) {
      var value = context.lookup(token[1]);
      if (value != null) return value;
    };
    Writer.prototype.escapedValue = function escapedValue(token, context) {
      var value = context.lookup(token[1]);
      if (value != null) return mustache.escape(value);
    };
    Writer.prototype.rawValue = function rawValue(token) {
      return token[1];
    };
    mustache.name = 'mustache.js';
    mustache.version = '2.3.0';
    mustache.tags = ['{{', '}}'];
    var defaultWriter = new Writer();
    mustache.clearCache = function clearCache() {
      return defaultWriter.clearCache();
    };
    mustache.parse = function parse(template, tags) {
      return defaultWriter.parse(template, tags);
    };
    mustache.render = function render(template, view, partials) {
      if (typeof template !== 'string') {
        throw new TypeError(
          'Invalid template! Template should be a "string" ' +
            'but "' +
            typeStr(template) +
            '" was given as the first ' +
            'argument for mustache#render(template, view, partials)'
        );
      }
      return defaultWriter.render(template, view, partials);
    };
    mustache.to_html = function to_html(template, view, partials, send) {
      var result = mustache.render(template, view, partials);
      if (isFunction(send)) {
        send(result);
      } else {
        return result;
      }
    };
    mustache.escape = escapeHtml;
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;
    return mustache;
  });
}.bind(window);
// window.wData = wData;

/**
 * Determine if the code is running in published environment (i.e., published to the builder) or a development environment (i.e., using the WompManager extension or a local-builder)
 *
 * When code is published to the builder, it is minified and comments are stripped. We can take advantage of this by adding a comment to the code and then searching for that comment string in cSite. If the comment is found, it's a development env; if it's missing, it's running published code.
 *
 * @returns boolean
 */
function determineDevEnv() {
  if (/isDevEnv=false/i.test(location.search)) return false;

  return /isDevEnvComment/.test(wompLib.cSite.siteWideBeforeRenderJS);
}

/**
 * Take an array of objects (each object representing config options for each parent/child associated with the project) and find the one where the matcher is truthy
 * 
 * @param {array} wompProjects - array of objects
 * @returns object - the matching project, found via a url match
 * @example
 * ```js
 * wData.wompProjects= [{
      projectName: "TexasHealth",
      matcher:
        !/breeze/i.test(location.origin) &&
        !/stag|uat|stg/i.test(location.origin),
      id: 7942,
      child: "",
      isStaging: false,
    }]
    // ... 
    wData.wompProject = getWompProject(wData.wompProjects)
 * ```
 */
function getWompProject(wompProjects) {
  for (const project of wompProjects) {
    if (project.matcher) {
      return project;
    }
  }

  wompLib.logError('Error making womp asset path! Assets will be broken!');
  wompLib.sendAlertEmail({
    subject:
      'Error making womp asset path! Assets would be broken! (stopping build)',
    msg: `Error determining project id for page ${location.href}.\n Womp asset path would be broken - stopping the build!`,
  });
  wompLib.sendAlertSlack({
    pageUrl: location.href,
    msg: `Error determining project id (and this womp asset path).\n Womp asset path would be broken - stopping the build!`,
  });
  wompLib.wompQuit(
    'Error determining project id (and this womp asset path). Womp asset path would be broken.'
  );
}

/**
 * Takes the project config opbject for the page tha tis building and uses it to set various convenience flags on wData
 *  i.e., wData.isStaging, wData.isChild, wData.isBreeze (signifying it is a breezecare page), etc.
 * @param {object} wompProject - An object containing config options for a specific parent or child associated with the Project
 * @returns undefined
 */
function setWDataFlags(wompProject) {
  wData.isStaging = wompProject.isStaging;
  wData.isChild = !!wompProject.child;
  if (wompProject.child) {
    wData[
      'is' +
        wompProject.child.charAt(0).toUpperCase() +
        wompProject.child.slice(1)
    ] = true;
  }
}

/**
 * Consumes template settings (name, urlRegexMatch) and
 * 1) consolidates regex matchers onto wDate.pageRegex
 * 2) sets a page type flag (e.g., 'isLocationDetail')
 */
function setPageRegexFlag() {
  wData.pageRegex = {};
  let foundPageRegexMatch = false;
  wompLib.cSite.womps
    .filter((template) => template.name !== 'extraWompLibJs')
    .forEach((template) => {
      wData.pageRegex['page-' + template.name] = new RegExp(
        template.regexURLMatch || ''
      );

      const str =
        'is' +
        template.name
          .split('_')
          .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
          .join('');
      wData[str] = false;

      const regex = new RegExp(wData.pageRegex['page-' + template.name], 'i');

      if (regex.test(location.pathname) && !foundPageRegexMatch) {
        wData[str] = true;
        foundPageRegexMatch = true;
      }
    });
}

/**
 * send internal alerts about failures, etc.
 * See https://wiki.wompmobile.com/amp-api/SendEmail
 *
 * Note that the email is only sent from womp IP addresses, so it will do nothing during local dev.
 *
 * @param {object} data - data from which to construct an email
 * @param {string} [data.recipients = wData.alertRecipients] - Comma-separated string of email recipient(s)
 * @param {string} data.subject - Email subject line
 * @param {string} data.msg - Body of email
 * @returns undefined
 */
wompLib.sendAlertEmail = function ({
  recipients = wData.alertRecipients,
  subject,
  msg,
}) {
  // Don't send emails in staging env
  if (wData.isStaging || wData.isDevEnv || !recipients) return;

  const data = { to: recipients, subject, msg };
  const queryParams = [];
  for (const key in data)
    if (data.hasOwnProperty(key)) {
      queryParams.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
      );
    }

  // Intentionally synchronous
  fetch(
    'https://www.wompmobile.com/amp-api/SendEmail?' + queryParams.join('&')
  );
};

/**
 * send internal alerts to slack channel #womp-thr-alert.
 * Sends a POST request to webhook - webhook is defined in channel settings
 * See https://slack.com/help/articles/360041352714-Create-more-advanced-workflows-using-webhooks
 *
 * @param {object} data - data from which to construct an email
 * @param {string} [data.page_url = location.href] - page's url
 * @param {string} data.msg - Message to send
 * @returns undefined
 */
wompLib.sendAlertSlack = function ({ pageUrl = location.href, msg }) {
  // Don't send alerts in staging env or in dev environment
  if (wData.isStaging || wData.isDevEnv) return;

  const data = { page_url: pageUrl, msg: msg || '' };
  // Intentionally synchronous
  fetch(
    'https://hooks.slack.com/workflows/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',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

function determineDevEnv() {
  if (/isDevEnv=false/i.test(location.search)) return false;

  return /isDevEnvComment/.test(wompLib.cSite.siteWideBeforeRenderJS);
}

// THESE THINGS GO LAST
// For dev and CI environemnts
if (wData.isDevEnv) {
  /**
   * Some API calls will give CORS errors when fetched from localhost.
   *
   * This is a workaround to avoid CORS errors.
   *
   * If building locally, with localhost or equivalent as domain (e.g., in CI environment), fetch certain api calls manually so that referrer is not localhost.
   *
   * See wData.urlsToSkipLocal for list of calls (properties on wData) to make manually.
   *
   * For each api call to skip, rewrite it with the original url as a query param. local-builder's express router will fetch the api manually and return the response.
   */
  if (/localhost|lvh\.me|127\.0\.0\.1/.test(location.origin)) {
    wData.urlsToSkipLocal.forEach((call) => {
      if (wData[call]) {
        wData[call] = 'http://localhost:3000/?skipLocal&url=' + wData[call];
      }
    });
  }

  // Normally the builder will wait 20 seconds before proceeding with the build. If you're scraping *synchronously* keeping that is a good idea. But we aren't so we can shorten the wait before procdeeding with the build to speed up dev a little.
  // NOTE: this only applies to development, not building published pages.
  setTimeout(() => {
    wompLib.secondaryRan = true;
    wompLib.docReady();
  }, 5000);
}
