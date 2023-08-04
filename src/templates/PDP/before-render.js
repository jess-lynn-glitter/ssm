(async function () {
  try {
    const pathname = wData.pathname.toLowerCase();
    let buildTime = {
      success: true,
    };

    const regex = /(^\/provider\/[a-z\+\.,-]*\/)([0-9]*)(\?|$|\/(\?|$))/i;
    const KyruusId = pathname.match(regex)[2];

    /* Set analytics directory for PHI Protect */
    wData.analyticsDirectory = "Provider Directory";

    /* Create provider object */
    wData.wompHealthResponse = { providers: [{}] };

    /** We are going to use the Kyruus ID to match providers here */
    wData.wompHealthResponse = await wompLib.fetchWompHealth(
      "search=&KyruusId=" + KyruusId
    );

    /* If there are still no providers, error out */
    if (!wData.wompHealthResponse.providers.length) {
      console.error(`NO PROVIDER FOUND FOR KYRUUSID ${KyruusId} - Now what to do?`);
      buildTime.success = false;
      buildTime.error = "No providers returned";
    } else if (wData.wompHealthResponse.info.some == false) {
      /* Make sure we have exact matches for the search, otherwise we'll build the wrong provider */
      buildTime.success = false;
      buildTime.error = "No exact matches for provider";
    }

    /* If buildTime.sucess if false, we don't want to build the page or save it to the blob storage */
    if (buildTime.success === false) {
      throw new Error(
        "Error: " + buildTime.error + "\n" + window.location.pathname
      );
    }

    wData.wompHealthResponseStringified = JSON.stringify(
      wData.wompHealthResponse
    );
    wData.provider = wData.wompHealthResponse.providers[0];

    /* Prepare provider id */
    wData.providerId = wData.provider.id;

    /* Save short name for booking */
    wData.provider.shortName = `Dr. ${wData.provider.Name.split(" ").pop()}`;

    prepProvName();
    prepProvImg();
    prepLocName();
    prepLocAddr();
    prepVideoUrl()

    wData.provider.LocationUrl = prepLocUrl(wData.provider.LocationUrl);
    
    /* Prepare page title and description */
    wData.pageTitle = `${wData.provider.Name}, ${wData.provider.Degrees}`;
    wData.pageDescription = `${wData.provider.Name}, ${wData.provider.Degrees}`;
    // Some providers might not have an address in the Addresses array - so use from city and state fields - and only add to page title and description if there is one, or it will be `undefined, undefined`
    const city = wData.providerAddressCity || wData.provider.City
    const state = wData.providerAddressState || wData.provider.Region
    if (city && state) {
      wData.pageTitle += ` - ${city}, ${state}`
      wData.pageDescription += ` - ${city}, ${state}`
    }

    /* Fetch additional data that's only in WompHealthData and insert it into the provider response */
    await fetch(
      `${wData.apiWompHealthData}?brand=${wData.brand}&id=${wData.providerId}`
    )
      .then((res) => res.json())
      .then((res) => {
        // console.log('res !!!', res);
        wData.provider.SitecoreId = res.SitecoreId
          ? `{${res.SitecoreId}}`
          : false;
        wData.provider.comments = res.Reviews;
        wData.provider.bio = res.Bio || res.ProfessionalStatement;
        wData.provider.Languages = res.Languages;
        wData.provider.Tier = res.Tier;
        wData.provider.isInNetwork = /Piedmont Clinic/i.test(res.Networks.join(','));
      });

    /* Get top 4 similar providers at this location */
    await fetch(
      `${wData.apiWompHealthSearch}?locations=false&type=search&brand=${wData.brand}&search=&LocationId=${wData.provider.LocationId}&top=4`
    )
    .then((res) => res.json())
    .then((res) => {
      if (res.results) {
        /* Remove current provider from list */
        res.results = res.results.filter((item) => {
          return item.id !== wData.provider.id;
        });
        /* Add the distance to location */
        const distance = res.info.locations[0].distance;
        wData.provider.Distance = distance.toFixed(2);
       
        /* Shorten list to show top 3 providers. If results are longer than 3, we render "see more providers" button. */
        if (res.results.length > 3) {
          wData.seeMoreProvs = true;
          res.results = res.results.slice(0,3)
        }
        // Handle the case in which filtering above results in zero similar providers
        // TODO - refactor this and above to be more elegant.
        if (res.results.length) {
          wData.hasSimilarProviders = true;
          wData.provider.similarProviders = res.results;
        } else {
          wData.provider.similarProviders = false;
        }
      } else {
        wData.provider.similarProviders = false;
      }
    });

    /* set booleans for w-if section display */
    wIfDataAssignment();

    videoModal();

    await Promise.allSettled([
      fetchLocationData(),
      createAboutMe(),
      createInsurance(),
      createReviews(),
      createBreadcrumbs(),
      provPhonePrep()
    ]);

    $('body').append('<div id="wompInvalidAmpOK"></div>');
  } catch (err) {
    wompLib.sendAlertEmail({
      subject: "Failure building provider-details page",
      msg: `Failure fetching or parsing wompHealth api on page ${location.href}`,
    });
    wompLib.sendAlertSlack({
      pageUrl: location.href,
      msg: `Failure building provider-details page: ${JSON.stringify(err)}`,
    });

    wompLib.logError("failure fetching/parsing wompHealth api", err);
    wompLib.deletePage().then(() => {
      $("body").append(`<div id="wompQuit">${err}</div>`);
      $("body").append(`<script id="wompNoStorage">${err}</script>`);
    });
  }
  resolve("before-render.js complete");
})();

/**
 * Brief: cleans up the data for provider phone number.
 */
async function provPhonePrep() {
  if (wData.provider.Phones[0]) {
    wData.provider.Phone = wompLib.formatPhoneNumber(wData.provider.Phones[0], "hyphenated");
  }
  if (wData.provider.similarProviders) {
    const similarProviders = wData.provider.similarProviders;
    for (let i = 0; i < similarProviders.length; i++) {
      if (similarProviders[i].Phones[0]) {
        wData.provider.similarProviders[i].Phone = wompLib.formatPhoneNumber(
          similarProviders[i].Phones[0], "hyphenated"
        );
      }
    };
  }
}

/**
 * Brief: Assigns the data for various wData variables to be displayed on the front end.
 */
function wIfDataAssignment() {
  wData.hasAboutMe = wData.provider ? true : false;
  wData.hasInsurance =
    wData.provider.InsuranceAccepted?.length > 0 ? true : false;
  wData.hasRating = wData.provider.Rating > 0 ? true : false;

  /* wData.provider.comments will come back as a string or an object */ 
  const providerComments = wData.provider.comments

  if(typeof providerComments === "object"){
    wData.hasReviews =
    providerComments.reviews?.aggregate_ratings?.average_rating > 0 ? true : false;
  } else if(typeof providerComments === "string"){
      try {
        const providerCommentsClean = providerComments.replaceAll(/(\\\\\"\"|\"\"\")/gi, '\"');
        wData.provider.comments = providerCommentsClean;

        const parsedComments = JSON.parse(providerCommentsClean);
        wData.hasReviews = parsedComments.reviews?.aggregate_ratings?.average_rating > 0 ? true : false;
      } catch (err) {
        wData.hasReviews = false;
      }
  } else {
    wData.hasReviews = false 
  }
  
  wData.hasLocation = wData.provider.LocationId && !/virtual/gi.test(wData.provider.LocationName) ? true : false;

  /* Booking Data is uri encoded name and string for booking scenario */
  const bookingData = getBookingScenario(wData.provider);
  /* Expected Data: "one" or "two" */
  wData.bookingScenario = bookingData.bookingScenario;
  /* Expected Data: FirstName%20MiddleName%20LastName */
  wData.provider.UriEncodedName = bookingData.UriEncodedName;
}

/**
 * Brief: Prepares provider name
 */
function prepProvName() {
  wData.providerName =
    wData.provider.Degrees.length && wData.provider.Degrees[0] !== ''
      ? wData.provider.Name + `, ${wData.provider.Degrees.join(", ")}`
      : wData.provider.Name;
}

/**
 * Brief: Prepares the data for location addresses
 */
function prepLocAddr() {
  if (wData.provider.Addresses.length > 0) {
    wData.providerAddressArray = wData.provider.Addresses[0].split(", ");

    wData.providerAddressCity = wData.providerAddressArray[0];
    wData.providerAddressState = wData.providerAddressArray[1];
    wData.providerAddressStreet = wData.providerAddressArray[2];
    if (wData.providerAddressArray[4]) {
      wData.providerAddressStreetClean =
        wData.providerAddressStreet + ", " + wData.providerAddressArray[3];
      wData.providerAddressStreet =
        wData.providerAddressStreet +
        ', <span class="nowrap">' +
        wData.providerAddressArray[3] +
        "</span>";
      wData.providerAddressZip = wData.providerAddressArray[4];
    } else {
      wData.providerAddressZip = wData.providerAddressArray[3];
    }

    wData.googleAddress = wData.provider.Addresses[0];
  } else {
    const provider = wData.provider;
    if (provider.Street1 && provider.City && provider.Region && provider.PostalCode) {
      const addressString = `${provider.Street1} ${provider.Street2 ? provider.Street2 : ''} ${provider.City} ${provider.Region} ${provider.PostalCode}`;
      wData.googleAddress = encodeURIComponent(addressString);
    } else if (wData.provider.GeocodedCoordinate?.coordinates) {
      const coordinateString = `${wData.provider.GeocodedCoordinate?.coordinates[1]},${wData.provider.GeocodedCoordinate?.coordinates[0]}`;
      wData.googleAddress = coordinateString;
    }
  }
}

function prepLocUrl(locUrl) {
  const locUrlObj = /^http/gi.test(locUrl)
    ? new URL(locUrl)
    : /^www/gi.test(locUrl)
      ? new URL('https://' + locUrl)
      : new URL(wData.origin + locUrl);

  const isPiedmontUrl = /\/locations\/location-details(.*)/gi.test(locUrlObj.pathname);

  wData.provider.isExternalUrl = !isPiedmontUrl;

  return isPiedmontUrl
    ? `${wData.origin}${locUrlObj.pathname}#${wData.provider.Npi}`
    : `${locUrlObj}`;
}

function prepVideoUrl() {
  const videoUrl = wData.provider.PagesUrl
  let videoId;

  if(videoUrl){
    //We might receive two types of video urls for the video bio
    //Ex. 1 - "https://youtu.be/t6uizlBIHbY"
    //Ex. 2 - "https://www.youtube.com/watch?v=BXNpDiYNn44"
    const urlParts = videoUrl.split("/");
    const lastPart = urlParts[urlParts.length -1];

    if(lastPart.includes('watch?v=')){
      const params = lastPart.split("=");
      videoId = params[params.length -1];
    } else {
      videoId = lastPart;
    } 

    if(videoId){
      wData.provider.PagesUrl = videoId;
    }
  }
}

/**
 * Brief: Video modal content
 */
function videoModal() {
  wData.videoModalContent = {
    isAmp: true,
    html: `${wData.provider.VideoBio
        ? `<div id="univModalPlaceholder" class="modal-content-video">
                <div id="modalContentOptions" class="relative modal-options">
                  <amp-youtube 
                    id="modalVideo"
                    data-videoid="${wData.provider.VideoBio}"
                    layout="responsive"
                    width="480"
                    height="270"
                    data-param-modestbranding=1
                  ></amp-youtube>
                </div>
                <div id="modalContentLoader" class="loader hidden">
                  <div class="lds-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>`
        : ""}`,
    triggerState: "videoModal",
    modalId: "1",
    usePanelMobW: false,
  };
}

/**
 * Brief: Prepares the location name
 */
function prepLocName() {
  const locName = wData.provider.LocationName?.length
    ? wData.provider.LocationName
    : wData.provider.LocationNames.length > 0
      ? wData.provider.LocationNames[0]
      : '';
      
  if (locName.length) {
    wData.locationNameClean = locName
      .replace(/\s#(\d)+/, '')
      .replace(
        /(Adult Care|Behavioral Health|Family Care|Internal Medicine|Residency Clinic|Surgical Specialists|Urgent Care)/,
        '<span class="nowrap">$1</span>'
      );
  }
}

/**
 * Brief: Prepares the data for the provider Img
 */
function prepProvImg() {
  if (wData.provider.ImageUrl.length > 0) {
    wData.providerImageUrl = wData.provider.ImageUrl;
  } else {
    try {
      wData.providerImageUrl = `https://kyruus-app-static.kyruus.com/providermatch/piedmont/photos/200/pd-nophoto.png`;
    } catch (error) {
      console.error("Could not retrieve placeholder image", error);
    }
  }
}

/**
 * Brief: fetches location data for provider.
 */
async function fetchLocationData() {
  if (wData.hasLocation) {
    let locIds = '';
    wData.provider.LocationIds.forEach((el) => {
      locIds = locIds.concat(`&ids=${el}`);
    });

    let temp = await fetch(
      `${wData.apiWompHealthData}?brand=${wData.brand}&practice=${wData.provider.PracticeGroupId[0]}${locIds}&data=locations`
    ).then((res) => res.json());

    wData.mapConfigOverride = {
      brand: 'piedmont',
      imagePlaceholderLocation: 
        'https://kyruus-app-static.kyruus.com/providermatch/piedmont/photos/200/pd-nophoto.png', 
      mapIcons: wData.mapIcons,
      mapType: 'providerDet',
      results: [{
        type: 'provider'
      }]
    };

    temp = temp.map((locationObj) => ({
      ...locationObj,
      collapsedOpenHours: wompLib.collapseSameOpenHours(locationObj),
      providerId: wData.provider.id,
    }));

    wData.hasMultipleLocations = temp.length > 1;
    wData.provider.hasMultipleLocations = (wData.hasMultipleLocations && !wData.isGoogleBot);
    wData.provider.locations = temp;
    wData.provider.locationsCount = wData.provider.locations.length;
    wData.provider.locations = wData.provider.locations
      .map((location, i) => ({
        ...location,
        Url: prepLocUrl(location.Url),
        cleanAddress: `
          ${location.Street1}, 
          ${location.Street2?.length
            ? `${location.Street2}, `
            : ''
          }
          ${location.City}, 
          ${location.Region} 
          ${location.PostalCode}
        `,
        googleAddress: encodeURIComponent(location.Address),
        hidden: i !== 0 
      }));
    wData.provider.locationsCount = wData.provider.locations.length;
    
    try {
      if (temp instanceof Array) {
        for (let i = 0; i < temp.length; i++) {
          /* Set Type to it's first value, so the map's marker renders correctly */
          if (temp[i].Type instanceof Array && temp[i].Type.length) {
            temp[i].Type = temp[i].Type[0];
          } else if (temp[i].Type instanceof Arrya && !temp[i].Type.length) {
          /* If Type is an array, but it's empty, set Type to an empty string */
            temp[i].Type = "";
          }
        }
      }
      if (temp?.length) {
        /* Create appropriate URL links for locations */
        wData.hasLocationUrl = temp[0].Url ? true : false;
        for (let i = 0; i < temp.length; i++) {
          if (wData.hasLocationUrl) {
            temp[i].Url = prepLocUrl(temp[i].Url);
          }
          if (temp[i].collapsedOpenHours) {
            wData.provider.LocationOpenHours = temp[i].collapsedOpenHours;
          }
          wData.provider.LocationUrl = temp[i].Url;
  
          /* Just need to pass primary location to view on map */
          wData.mapConfigOverride.results[i] = temp[i];
  
          /* Make sure result has a type */
          wData.mapConfigOverride.results[i].type = 'provider';
        }
      } else {
      /* Fails to return locations, use provider loc data as backup */
        wData.mapConfigOverride.results[0] = {};
        if (wData.provider.Addresses[0]) {
          wData.mapConfigOverride.results[0].Address =
            wData.provider.Addresses[0];
        }
        if (
          wData.provider.GeocodedCoordinates[0]
            .coordinates
        ) {
          wData.mapConfigOverride.results[0].GeocodedCoordinate =
            wData.provider.GeocodedCoordinates[0];
        }
        if (wData.provider.LocationIds[0]) {
          wData.mapConfigOverride.results[0].id =
            wData.provider.LocationIds[0];
        }
        if (wData.provider.LocationNames[0]) {
          wData.mapConfigOverride.results[0].LocationName =
            wData.provider.LocationNames[0];
        }
        wData.provider.LocationUrl = false;
      }
    } catch (err) {
      console.error('Error provider fetching location: \n' + err);
    }
  }
}

/**
 * Brief: creates the About Me section of the page
 */
async function createAboutMe() {
  try {
    if (wData.provider) {
      /* only create object if there's data from API */
      wData.aboutMe = {};
      wData.aboutMe.heading = `About ${wData.provider.Name.split(' ')[0]}`;
      wData.aboutMe.stateName = "aboutMe";

      // Specialties
      let primarySpecialties = [];
      let secondarySpecialties = [];
      wData.provider.PrimarySpecialties.forEach((specialty) => {
        primarySpecialties.push(`<p class="mt-05">${specialty}</p>`);
      });

      if (wData.provider.SecondarySpecialties) {
        wData.provider?.SecondarySpecialties.forEach((specialty) => {
          secondarySpecialties.push(`<p class="mt-05">${specialty}</p>`);
        });
      }

      // Gender
      let gender = 'Unspecified';
      if (wData.provider.Gender) {
        gender = wData.provider.Gender;
      };

      // Languages
      let languages = '';
      if (wData.provider.Languages) {
        wData.provider.Languages.forEach((language) => {
          languages += `<p class="mt-05">${language}</p>`;
        });
      };

      // Age groups
      let ageGroups = '';
      if (wData.provider.AgesSeen) {
        wData.provider.AgesSeen.forEach((ageGroup) => {
          ageGroups += `<p class="mt-05">${ageGroup}</p>`;
        })
      }

      // Organizations
      let organizations = '';
      if (wData.provider.ProviderOrganization) {
        wData.provider.ProviderOrganization.forEach((org) => {
          organizations += `<p class="mt-05">${org}</p>`;
        })
      }

      // Age
      let age = wData.provider.Age || 'Unspecified';

      // Education
      let education = '';
      wData.provider.Education?.forEach((item) => {
        education += `
        <p class="mt-05 bold">${item.name}</p>
        <p class="mt-0 light">${item.position ? item.position + ', ' : ''}${item.fieldOfStudy ? item.fieldOfStudy + ', ' : ''}${item.grad_year}</p>
        `;
      });

      // Certifications
      let certifications = '';
      wData.provider.Certifications?.forEach((item) => {          
        certifications += `
        <p class="mt-05 bold">${item}</p>
        `;
      });

      // Bio
      let providerBio = wData.provider.Bio || wData.provider.ProfessionalStatement;
      if (providerBio) {
        const splitBio = providerBio.split(' ');
        let bioString = providerBio.replaceAll('\n', '<br />');

        const isHtml =
          /\<(ol|ul|li|div|span|br|h1|h2|h3|h4|h5|a|strong|em|p)\>/i.test(
            providerBio
          );

        bioString = wompLib.sanitizeHTML(bioString, [
          'ol',
          'ul',
          'li',
          'div',
          'span',
          'br',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'a',
          'strong',
          'em',
          'p',
        ]);

        /* 
          This is to handle the edge case of if a providers bio has exactly 76 words in splitBio. The ending word is always an empty char, ''.
          By removing the last empty char it prevents the button from being added to a provider that will show no more words by pressing the button.
        */
        if(splitBio[splitBio.length - 1] === ""){
          splitBio.pop();
        }

        if (splitBio.length > 75 && !isHtml) {
          bioString =
            /*html*/
            `<div>
              <input type="checkbox" id="bioToggle" />
              <span id="bioTextInitial">
                ${splitBio.slice(0, 75).join(' ')} 
              </span>
              <span id="bioTextFull">
                ${splitBio.slice(75).join(' ')}
              </span>
              <label id="bioLabel" class="btn-primary" for="bioToggle">
              </label>
            </div>`;
        }
        const tempBioHTML = new DOMParser().parseFromString(
          /*html*/
          `<div>${bioString}</div>`, 'text/html');

        providerBio = tempBioHTML.querySelector('div').innerHTML;
        wData.provider.Bio = providerBio;
      }

      wData.aboutMe.contentHtml =
        /*html*/
        `<div class="flx flx-col">
          ${
            primarySpecialties.length
              ? /*html*/`<h4 class="mt-1">Specialties</h4>
                ${primarySpecialties.join('')}`
              : ''
          }
          ${
            secondarySpecialties.length
              ? secondarySpecialties
              : ''
          }
         
          <h4 class="mt-4">Gender</h4>
          <p class="mt-05">${gender}</p>

          ${
            languages.length
             ? `<h4 class="mt-4">Languages</h4>
              ${languages}`
              : ''
          }

          ${
            ageGroups.length
            ? `<h4 class="mt-4">Age groups seen</h4>
            ${ageGroups}`
            : ''
          }

          ${
            organizations.length
            ? `<h4 class="mt-4">Organizations</h4>
            ${organizations}`
            : ''
          }

          ${
            education.length
              ? /*html*/`<h4 class="mt-4">Education</h4>
                ${education}`
              : ''
          }

          ${
            certifications.length
              ? `<h4 class="mt-4">Certifications</h4>
                ${certifications}`
              : ''
          }
        </div>`;
    }
  } catch (error) {
    wData.aboutMe = false;
    console.error("AboutMe Section Error:", error);
  }
}

/**
 * Brief: Creates the Insurance section of the page
 */
async function createInsurance() {
  try {
    /* Insurance Section */
    if (wData.provider.InsuranceAccepted.length > 0) {
      /* only create object if there's data from API */
      wData.insuranceSection = {};
      wData.insuranceSection.heading = "Insurance Coverage";
      wData.insuranceSection.stateName = "insurance";

      let insuranceListHTML = ``;

      wData.provider.InsuranceAccepted.sort().forEach((item) => {
        insuranceListHTML += /*html*/`<div class="flx flx-row mt-05">${item}</div>`;     
      });
      wData.insuranceSection.contentHtml = 
        /*html*/
        `<div class="txt-lg px-1 py-05">
          <div id="provInsurNote" class="flx p-2 mb-1">
          <svg id="svgInfoIco" class="mr-1">
            <use xlink:href="#fa-circle-info"></use>
          </svg>
          <p class="mt-0">
            <span class="bold">
              Note:
            </span>
            Please contact the practice directly to confirm your health plan is in network.
          </p>
          </div>
          <div id="provInsurList">
            ${insuranceListHTML}
          </div>
        </div>`;
    }
  } catch (error) {
    wData.insuranceSection = false;
    console.error("Insurance Section Error:", error);
  }
}

/**
 * Brief: Creates the review section of the page
 */
async function createReviews() {
  try {
    /* Check to see if the provider comments are coming back as a string or an object */
    let commentsData;
    if(typeof wData.provider.comments === "object" ){
      commentsData = wData.provider.comments;
    } else {
      const commentsDataString = wData.provider.comments;
      commentsData = commentsDataString?.length > 0 ? JSON.parse(commentsDataString) : false;
    }

    if (commentsData) {
      /* only create object if there's data from API */
      wData.reviews = {};
      wData.reviews.heading = 'Reviews';
      wData.reviews.stateName = 'reviews';
    }
    const { 
      reviews: c_comments
    } = commentsData.reviews;

    const {
      average_rating: c_overallRating,
      rating_count: c_totalRatingCount,
      review_count: c_totalCommentCount,
      sub_ratings: c_subRatings
    } = commentsData.aggregate_ratings;
   

    // Question Breakdown
    const questionBreakdown = c_subRatings?.reduce(
      (html, rating) => (
        html += 
          `<div class="flx flx-row">
            <div class="div-provider-ratings flx flx-nowrap flx-algn-strt txt-ctr mr-2 bg-white">
              <div class="rating-number breakdown-rating txt-lg">${rating.average_rating.toFixed(1)}</div>
              <!-- replace link and stars -->
              <div class="stars bg-white" style="--rating: ${rating.average_rating};" aria-label="Rating of this provider is ${rating.value} out of 5."></div>
            </div>
            <span class="txt-sm line-h-05 mt-05 semibold">${rating.metric}</span>
          </div>`
      ), '');
    
    const rating = c_overallRating;
    const ratingCount = `${c_totalRatingCount} Ratings, ${c_totalCommentCount} Comments`;

    let commentSection = '';
    c_comments?.forEach((item) => {
      let date = item.review_date;
      // date = date.slice(0, -10);

      let year = date.substr(0, 4);
      let month = date.substr(5, 6);
      month = parseInt(month, 10);
      let day = date.substr(8, 9);

      let ratingValue = item.rating;
      // Round the rating value to one decimal place if necessary
      if (ratingValue) {
        ratingValue = parseFloat(ratingValue).toFixed(1);
      } else {
        console.error(`Rating value is: ${ratingValue}`);
      };

      commentSection += `
      <div class="comment-wrapper mt-05 pt-05 pb-1">
        <div class="flx flx-start mr-2">
          <div class="div-provider-ratings flx flx-nowrap flx-algn-ctr txt-ctr bg-white">
            <div class="stars bg-white" style="--rating: ${ratingValue};" aria-label="Rating of this provider is ${ratingValue} out of 5."></div>
          </div>
          <div class="date-wrapper txt-xs flx flx-algn-ctr px-1">
            <div class="txt-sm">${month}/${day}/${year}</div>
          </div>
        </div>
        <div>
          <div class="txt-sm">${item.body.replaceAll(/\*/gm, '')}</div>
        </div>
      </div>
      `;
    });

    wData.reviews.contentHtml =
      /*html*/
      `<div id="ratingsSection" class="flx flx-col txt-xl">
        ${
          questionBreakdown
            ? /*html*/`
              <p class="txt-sm mt-05">The Patient Satisfaction Rating is an average of all responses to the care provider related questions shown below from our survey. Patients that are treated in outpatient or hospital environments may receive different surveys, and the volume of responses will vary by question.</p>
              <div class="w100 mt-1 rating-heading">
                <span class="rating-number mr-1">${rating} out of 5</span>
                <div class="stars bg-white mr-1" style="--rating: ${rating};" aria-label="Rating of this provider is ${rating} out of 5."></div>
                <span class="txt-sm rating-count">${ratingCount}</span>
              </div>
              <blockquote class="mt-1">
                <div class="mt-1 bg-white">
                  ${questionBreakdown}
                </div>
              </blockquote>`
            : ''
        }
        ${
          commentSection
            ? /*html*/`
            <div class="flx flx-col mt-2">
              <div class="bg-white">
                ${commentSection}
              </div>
            </div>`
            : ''
        }
      </div>`;
  } catch (error) {
    wData.reviews = false;
    console.error("Reviews Section Error:", error);
  }
}

/**
 * Get the proper booking scenario for a provider
 */
function getBookingScenario(provider) {
  try {
    const { Name, BookingFlow } = provider;

    let UriEncodedName = '';
    let BookingFlowVal = '';

    if (Name) {
      UriEncodedName = encodeURIComponent(Name);
    } else {
      console.error('provider.Name is: ' + Name);
    }

    const data = {
      bookingScenario: false,
      UriEncodedName
    };

    if (BookingFlow) {
      BookingFlowVal = BookingFlow.toLowerCase();
      switch(BookingFlowVal) {
        case 'flow':
          data.bookingScenario = 'one';
          break;
        case 'form':
          data.bookingScenario = 'two';
          break;
        case 'call':
          data.bookingScenario = 'three';
          break;
        default:
          break;
      }
    } else {
      console.log('provider.BookingFlow is: ' + BookingFlow);
    }

    return data;
  } catch (err) {
    console.error(`Couldn't get booking scenario. Error: ` + err);
  }
}


function createBreadcrumbs() {
  wData.breadcrumbsContent = {
    links: [
      {
        text: 'Home',
        href: wData.origin + '/',
      },
      {
        text: 'Providers',
        href: wData.origin + '/providers',
      },
      {
        text: wData.provider.ProviderTitle,
        href: `${wData.origin}/providers?search=${encodeURIComponent(
          wData.provider.ProviderTitle
        )}`,
      },
      {
        text: wData.provider.Name,
        href: null,
      },
    ],
    returnHref: `${wData.origin}/providers?search=${encodeURIComponent(
      wData.provider.ProviderTitle
    )}`,
  };
}