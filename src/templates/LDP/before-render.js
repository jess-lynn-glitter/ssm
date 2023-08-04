
(async function () {
  try {
    await wompLib.storeWompHealthLocationsOnWData();
    await wompLib.addMustache();

    wData.mapConfigOverride = {
      brand: "piedmont", 
      imagePlaceholderLocation: 
        'https://kyruus-app-static.kyruus.com/providermatch/piedmont/photos/200/pd-nophoto.png', 
      mapIcons: wData.mapIcons, 
      mapType: "locationDet"
    };

    wData.wompHealthResponse.locations[0].distanceMilesStr =
      wompLib.createDistanceMilesStr(
        wData.wompHealthResponse.locations[0]?.distance
      );

      wData.wompHealthResponse.locations[0].AboutThisPractice =
        wompLib.sanitizeHTML(
          wData.wompHealthResponse.locations[0].AboutThisPractice,
          [
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
          ]
        );

    const locationId = wData.wompHealthResponse.locations[0] ? wData.wompHealthResponse.locations[0].id : false;
    if (locationId) {
      /* Retrieve provider data via API or by scraping old */
      wData.providersData = await wompLib.fetchWompHealth(
        "LocationId=" + locationId + "&locations=false"
      );
    }

    /* Location "Type" logic */
    /* Check if Type is an array */
    if (wData.wompHealthResponse.locations[0]?.Type instanceof Array) {
      const types = wData.wompHealthResponse.locations[0].Type;
      
      if (types.length) {
        /* Set Type on location to the first item in types */
        wData.wompHealthResponse.locations[0].Type = types[0];
        
        /* Determine if this location is a Walgreens QuickCare location (provider-agnostic) */
        types.forEach((type) => {
          const sanitizedType = type.toLowerCase()
          if (sanitizedType.includes('quickcare')) {
            wData.isQuickCare = true;
          } else if (/wellstreet/i.test(wData.wompHealthResponse.locations[0].Name)) {
            wData.isUrgentCare = true;
          } else if (sanitizedType.includes('primary care')) {
            wData.isPrimaryCare = true;
          } else if (sanitizedType.includes('prompt care')) {
            wData.isPromptCare = true;
          } else if (/orthoatlanta/i.test(wData.wompHealthResponse.locations[0].Name)) {
            wData.isOrthoAtl = true;
          }
        })
      } else {
        /* If Type is an array but has no children, assign it as an empty string */
        wData.wompHealthResponse.locations[0].Type = "";
      }
    }

    /* This is to remove any extra ending characters(<br>, &nbsp) we may receive from PracticeServices */
    function sanitizePracticeServices(data) {
      if (data) {
        data = data.replace(/<[^>]*>?/gm, '');
        data = data.replace(/&nbsp;/g, ' ');
        const lastIndex = data.lastIndexOf('|');
        const sanitizedData = data.slice(0, lastIndex);
        let items = sanitizedData.split('|');
        items = items.map(item => item.trim());
        items = items.filter(item => item !== '');
        items = items.map(item => `<li>${item}</li>`)
        const htmlString = `<ul>${items.join('')}</ul>`
        return htmlString
      } else {
        return '';
      }
    }
    
    wData.wompHealthResponse.locations[0].PracticeServices = sanitizePracticeServices(wData.wompHealthResponse.locations[0].PracticeServices)

    /* This is to remove any extra ending characters(<br>, &nbsp) we may receive from AboutThisPractice and to format lists the same way as Practice Services */
    function sanitizeAboutThisPractice(html){
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const brs = doc.querySelectorAll("br");
      brs.forEach((br) => br.parentNode.removeChild(br));

      doc.body.innerHTML = doc.body.innerHTML.replace(/&nbsp;/g, ' ');

      const updatedHtmlString = doc.body.innerHTML;
      return updatedHtmlString
    }

    wData.wompHealthResponse.locations[0].AboutThisPractice = sanitizeAboutThisPractice(wData.wompHealthResponse.locations[0].AboutThisPractice)

    /* Format HTML escape characters in LeadInCopy */
    // const {LeadInCopy, Summary} = wData.wompHealthResponse.locations[0];
    // if (Summary?.length) {
    //   wData.wompHealthResponse.locations[0].Summary = decodeHTMLEntities(Summary);
    // } else if (LeadInCopy?.length) {
    //   wData.wompHealthResponse.locations[0].LeadInCopy = decodeHTMLEntities(LeadInCopy);
    // }

    /* Build page content */
    await Promise.all([
      getProviderList(),
      createInsurance()
    ]);

    if (wData.features.hardcodeLocationKeyFeatures && wData.isQuickCare) {
      Object.assign(wData.wompHealthResponse.locations[0], {
        AcceptingNewPatients: 1,
        VirtualCare: 1,
        WalkInsWelcome: 1,
      });
    }

    if (wData.features.hardcodeHours && wData.isQuickCare) {
      wData.wompHealthResponse.locations[0].OpenHours = [
        '20200518T083000Z',
        '20200518T083000Z',
        '20200518T083000Z',
        '20200518T083000Z',
        '20200518T083000Z',
        '20200518T090000Z',
        '20200518T090000Z',
      ];
      wData.wompHealthResponse.locations[0].CloseHours = [
        '20200518T190000Z',
        '20200518T190000Z',
        '20200518T190000Z',
        '20200518T190000Z',
        '20200518T190000Z',
        '20200518T160000Z',
        '20200518T160000Z',
      ];

      if (wData.wompHealthResponse.locations[0].AvidId == 1500) {
        wData.wompHealthResponse.locations[0].CloseHours[5] = '';
        wData.wompHealthResponse.locations[0].CloseHours[6] = '';
      }
      if (wData.wompHealthResponse.locations[0].AvidId == 1311) {
        wData.wompHealthResponse.locations[0].CloseHours[6] = '';
      }
    }

    try {
      if (wData.wompHealthResponse.locations[0].OpenHours?.length) {
        wData.wompHealthResponse.locations[0].collapsedOpenHours =
          wompLib.collapseSameOpenHours(wData.wompHealthResponse.locations[0]);
      }
    } catch (err) {
      console.error(err);
    }

    if (wData.features.hardcodeUrgentCareExternalUrl && wData.isUrgentCare) {
      const matchUrls = [
        {
          matchUrl: '/locations/location-details/practice/1519',
          link: 'https://www.wellstreet.com/office-locations/athens-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1555',
          link: 'https://www.wellstreet.com/office-locations/austell/',
        },
        {
          matchUrl: '/locations/location-details/practice/241',
          link: 'https://www.wellstreet.com/office-locations/barrow-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1377',
          link: 'https://www.wellstreet.com/office-locations/columbus-blackmon-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1556',
          link: 'https://www.wellstreet.com/office-locations/buckhead-north/',
        },
        {
          matchUrl: '/locations/location-details/practice/1557',
          link: 'https://www.wellstreet.com/office-locations/buckhead-south/',
        },
        {
          matchUrl: '/locations/location-details/practice/1738',
          link: 'https://www.wellstreet.com/office-locations/buford-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1609',
          link: 'https://www.wellstreet.com/office-locations/canton-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1502',
          link: 'https://www.wellstreet.com/office-locations/carrollton-ga-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1696',
          link: 'https://www.wellstreet.com/office-locations/cartersville-main-st/',
        },
        {
          matchUrl: '/locations/location-details/practice/1697',
          link: 'https://www.wellstreet.com/office-locations/cartersville-west-ave/',
        },
        {
          matchUrl: '/locations/location-details/practice/1613',
          link: 'https://www.wellstreet.com/office-locations/chamblee-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1558',
          link: 'https://www.wellstreet.com/office-locations/conyers-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1559',
          link: 'https://www.wellstreet.com/office-locations/covington/',
        },
        {
          matchUrl: '/locations/location-details/practice/1601',
          link: 'https://www.wellstreet.com/office-locations/cumming-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1560',
          link: 'https://www.wellstreet.com/office-locations/dallas-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1610',
          link: 'https://www.wellstreet.com/office-locations/douglasville-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1569',
          link: 'https://www.wellstreet.com/office-locations/druid-hills-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1739',
          link: 'https://www.wellstreet.com/office-locations/duluth-pleasant-hill-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1562',
          link: 'https://www.wellstreet.com/office-locations/dunwoody/',
        },
        {
          matchUrl: '/locations/location-details/practice/1506',
          link: 'https://www.wellstreet.com/office-locations/east-cobb-ga-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1503',
          link: 'https://www.wellstreet.com/office-locations/east-point-ga-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1695',
          link: 'https://www.wellstreet.com/office-locations/east-rome-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1563',
          link: 'https://www.wellstreet.com/office-locations/east-roswell-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1608',
          link: 'https://www.wellstreet.com/office-locations/ellenwood-urgent-care',
        },
        {
          matchUrl: '/locations/location-details/practice/1570',
          link: 'https://www.wellstreet.com/office-locations/fairburn-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1504',
          link: 'https://www.wellstreet.com/office-locations/fayetteville-ga-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1707',
          link: 'https://www.wellstreet.com/office-locations/fayetteville-hwy-85/',
        },
        {
          matchUrl: '/locations/location-details/practice/1691',
          link: 'https://www.wellstreet.com/office-locations/grayson-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1596',
          link: 'https://www.wellstreet.com/office-locations/hickory-flat-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/242',
          link: 'https://www.wellstreet.com/office-locations/jefferson-urgent-care',
        },
        {
          matchUrl: '/locations/location-details/practice/1611',
          link: 'https://www.wellstreet.com/office-locations/johns-creek-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1564',
          link: 'https://www.wellstreet.com/office-locations/johns-creek-alpharetta/',
        },
        {
          matchUrl: '/locations/location-details/practice/1505',
          link: 'https://www.wellstreet.com/office-locations/lagrange-ga-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1688',
          link: 'https://www.wellstreet.com/office-locations/lawrenceville-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1690',
          link: 'https://www.wellstreet.com/office-locations/lilburn-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1693',
          link: 'https://www.wellstreet.com/office-locations/lithonia-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1565',
          link: 'https://www.wellstreet.com/office-locations/loganville-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1692',
          link: 'https://www.wellstreet.com/office-locations/loganville-hwy-81/',
        },
        {
          matchUrl: '/locations/location-details/practice/1628',
          link: 'https://www.wellstreet.com/office-locations/macon-ingleside-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1740',
          link: 'https://www.wellstreet.com/office-locations/macon-zebulon-rd/',
        },
        {
          matchUrl: '/locations/location-details/practice/1572',
          link: 'https://www.wellstreet.com/office-locations/kennestone-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1566',
          link: 'http://www.wellstreet.com/office-locations/mcdonough/',
        },
        {
          matchUrl: '/locations/location-details/practice/1567',
          link: 'https://www.wellstreet.com/office-locations/milton-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1508',
          link: 'https://www.wellstreet.com/office-locations/newnan-crossing-blvd-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1518',
          link: 'https://www.wellstreet.com/office-locations/newnan-ga-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1568',
          link: 'https://www.wellstreet.com/office-locations/norcross-peachtree-corners-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1276',
          link: 'https://www.wellstreet.com/office-locations/oconee-health-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1509',
          link: 'https://www.wellstreet.com/office-locations/peachtree-city-ga-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/20',
          link: 'http://www.wellstreet.com/office-locations/virginia-highlands/',
        },
        {
          matchUrl: '/locations/location-details/practice/19',
          link: 'http://www.wellstreet.com/office-locations/sandy-springs',
        },
        {
          matchUrl: '/locations/location-details/practice/1737',
          link: 'https://www.wellstreet.com/office-locations/senoia-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1438',
          link: 'https://www.wellstreet.com/office-locations/smyrna-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/245',
          link: 'http://www.wellstreet.com/office-locations/snellville-urgent-care',
        },
        {
          matchUrl: '/locations/location-details/practice/1689',
          link: 'https://www.wellstreet.com/office-locations/snellville-centerville-hwy/',
        },
        {
          matchUrl: '/locations/location-details/practice/234',
          link: 'http://www.wellstreet.com/office-locations/stockbridge',
        },
        {
          matchUrl: '/locations/location-details/practice/1612',
          link: 'https://www.wellstreet.com/office-locations/tucker-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1376',
          link: 'https://www.wellstreet.com/office-locations/columbus-uptown-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/243',
          link: 'https://www.wellstreet.com/office-locations/watkinsville-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1604',
          link: 'https://www.wellstreet.com/office-locations/west-cobb-urgent-care',
        },
        {
          matchUrl: '/locations/location-details/practice/1694',
          link: 'https://www.wellstreet.com/office-locations/west-rome-urgent-care/',
        },
        {
          matchUrl: '/locations/location-details/practice/1597',
          link: 'https://www.wellstreet.com/office-locations/woodstock-urgent-care/',
        },
      ];

      wData.urgentCareExternalUrl = matchUrls.find(
        (x) => x.matchUrl === location.pathname
      ).link;
    }
    
    wData.breadcrumbsContent = {
      links: [
        {
          text: 'Home',
          href: wData.origin + '/',
        },
        {
          text: 'Locations',
          href:
            wData.origin + '/locations/locations-map',
        },
        {
          text: wData.wompHealthResponse.results[0].Name,
          href: null,
        },
      ],
      returnHref: wData.origin + '/locations/locations-map',
    };
    
    if (wData.isQuickCare) {
      const { Name, AvidId, AboutThisPractice } = wData.wompHealthResponse.locations[0];
      if (wData.features.hardcodeQuickCareAbout || !AboutThisPractice?.length) {
        wData.quickCareAbout =
          AvidId == 1500
            ? 'Now open at our new location at Trilith Studios, Piedmont QuickCare of Fayetteville offers same-day care illnesses, aches and pains, minor injuries, vaccinations, and more. Walk-ins welcome, based on availability; priority given to appointments made online.'
            : `${Name} offers same-day care with Piedmont Healthcare providers inside your neighborhood Walgreens. Get treated for illnesses, aches and pains, minor injuries, vaccinations, and more. Open 7 days a week with extended hours at most locations. Affordable self-pay pricing and most insurance accepted. Walk-ins welcome, based on availability; priority given to appointments made online.`;
      } else {
        wData.quickCareAbout = AboutThisPractice;
      };

      wData.insuranceSection = {};
      wData.insuranceSection.heading = 'Insurance Coverage';
      wData.insuranceSection.stateName = 'insurance';

      let insuranceListHTML = ``;

      const insList = [
        'Aetna HMO/POS',
        'Aetna PP',
        'Beech Street PPO',
        'Blue Cross Blue Shield HMO/POS',
        'Blue Cross Blue Shield PPO',
        'CIGNA PPO',
        'CIGNA HMO/POS',
        'Coventry HMO/POS',
        'Coventry PPO-Direct',
        'Coventry First Health PPO',
        'Humana HMO',
        'Humana PPO',
        'LifeWell PPO',
        'NovaNet PPO',
        'PHCS/Multiplan PPO',
        'United Healthcare HMO/POS',
        'United Healthcare PPO',
        'Aetna (Medicare Advantage)',
        'Cigna HealthSpring (Medicare Advantage)',
        'Coventry (Medicare Advantage)',
        'Humana (Medicare Advantage)',
        'PruittHealth Premier (Medicare Advantage)',
        'Humana Military (Tricare)',
        'Medicare',
        'Medicaid',
      ];

      insList.sort().forEach((item) => {
        insuranceListHTML += /*html*/ `<div class="flx flx-row mt-05">${item}</div>`;
      });
      wData.insuranceSection.contentHtml =
        /*html*/
        `<div class="px-1 py-05">
          <div id="provInsurList">
            ${insuranceListHTML}
          </div>
        </div>`;
    }

    setPageDescription(wData.wompHealthResponse.locations[0]);
    // wData.nearbyLocationsResponseStringified = '{}';
    // wData.nearbyLocationsResponse = await wompLib.fetchWompHealth(
    //   `top=1000&location=${wData.clinicAddress}&distance=10`
    // );

    // wData.nearbyLocationsResponseStringified = JSON.stringify({
    //   locations: wData.nearbyLocationsResponse.locations.map((location) => ({
    //     UrlName: location.UrlName,
    //     distance: location.distance,
    //     Street1: location.Street1,
    //     Street2: location.Street2,
    //     City: location.City,
    //     Region: location.Region,
    //     PostalCode: location.PostalCode,
    //     Url: location.Url.replace(/locations-old/gi, "Locations"),
    //   })),
    // });

    // This flag is used to hide the providers section from THPG clinic page if there are no provider results found for that clinic. Otherwise the section will say "no results found, here are similar..." which doesn't make sense from a UX perspective.
    wData.clinicHasProviders = wData.providersData?.info?.some;


    const hybridLocations = ['1635'];
    wData.isHybrid = !!hybridLocations.find(
      (avidId) => avidId == wData.wompHealthResponse.locations[0].AvidId
    );

    $('body').append('<div id="wompInvalidAmpOK"></div>');
  } catch (err) {
    wompLib.sendAlertEmail({
      subject: "Failure building location-details page",
      msg: `Failure fetching or parsing wompHealth api on page ${location.href}`,
    });
    wompLib.sendAlertSlack({
      pageUrl: location.href,
      msg: `Failure building location-details page: ${JSON.stringify(err)}`,
    });
    console.error(err)
    wompLib.logError("Failure fetching/parsing wompHealth api:\n" + err);

    wompLib.deletePage().then(() => {
      $("body").append(`<div id="wompQuit">${err}</div>`);
      $("body").append(`<script id="wompNoStorage">${err}</script>`);
    });
  }

  wData.filterModalContent = {
    isAmp: false,
    html: `
    <div id="univModalPlaceholder">
      <div id="modalContentHdr" class="flx">
      </div>
      <div id="modalContentOptions" class="relative hidden modal-options">
      </div>
      <div id="modalContentLoader" class="loader">
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
    <div id="univModalPlaceholder" class="modal-content-video">
      <div id="modalContentHdr" class="flx">
      </div>
      <div id="modalContentOptions" class="relative hidden modal-options">
      </div>
      <div id="modalContentLoader" class="loader">
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

  resolve();
})();

/**
 * Brief: Creates a list of providers for the location detail page.
 */
async function getProviderList() {
  let providerResponses = await fetch (`${wData.apiWompHealthSearch}?locations=false&type=search&brand=${wData.brand}&search=&LocationId=${wData.wompHealthResponse.locations[0].id}&top=30`
    )
    .then((res) => res.json())
    .then(res => {
      const updatedRes = {
        ...res,
        providers: res.results.filter(res => res.type == 'provider'),
        locations: res.results.filter(res => res.type == 'location')
      };

      return updatedRes;
    })
    .then((res) => res.providers);
    console.log('!!! Providers: ', providerResponses);

  let sortedResultsArr = [];
  for (let i = 0; i < providerResponses.length; i++) {
    if (
      providerResponses[i].Degrees[0] == "MD" ||
      providerResponses[i].Degrees[0] == "DO"
    ) {
      sortedResultsArr.unshift(providerResponses[i]);
    } else {
      sortedResultsArr.push(providerResponses[i]);
    }
  }
  console.warn(sortedResultsArr);
  providerResponses = sortedResultsArr;

  wData.providerVideoModals = '';

  await providerResponses.forEach(async (provider) => {
    if (provider.Degrees.length) {
      provider.DegreesString =
        provider.Degrees.join(", ");
    }

    if (provider.ImageUrl.length > 0) {
      provider.ImageUrl = provider.ImageUrl;
    } else {
      try {
        provider.ImageUrl = `https://kyruus-app-static.kyruus.com/providermatch/piedmont/photos/200/pd-nophoto.png`;
      } catch (error) {
        console.error("Could not retrieve placeholder image", error);
      }
    }

    if (provider.Phones[0]) {
      provider.Phone = wompLib.formatPhoneNumber(
        provider.Phones[0], "hyphenated"
      );
    }

    provider.closestLocation = {};
    provider.closestLocation.phone = wData.wompHealthResponse.locations[0].Phone;

    if (provider.SecondarySpecialties) {
      provider.Specialties =
        provider.PrimarySpecialties[0] +
        " • " +
        provider.SecondarySpecialties[0];
    } else {
      provider.Specialties =
        provider.PrimarySpecialties[0];
    }

    if (provider.VideoBio) {
      provider.hasVideoBio = true;
    }

    if (provider.VirtualCare) {
      provider.VirtualCare = true;
    } else {
      provider.VirtualCare = false;
    }

    videoModal(provider);

    // let providerBio =
    //   provider.Bio || provider.ProfessionalStatement;
    // if (providerBio) {
    //   const splitBio = providerBio.split(' ');
    //   let bioString = providerBio;

    //   if (splitBio.length > 75) {
    //     bioString =
    //       /*html*/
    //       `<div>
    //           <input type="checkbox" id="bioToggle" />
    //           <span id="bioTextInitial">
    //             ${splitBio.slice(0, 75).join(' ')} 
    //           </span>
    //           <span id="bioTextFull">
    //             ${splitBio.slice(75).join(' ')}
    //           </span>
    //           <label id="bioLabel" class="btn-primary" for="bioToggle">
    //           </label>
    //         </div>`;
    //   }
    //   const tempBioHTML = new DOMParser().parseFromString(
    //     /*html*/
    //     `<div>${bioString}</div>`,
    //     'text/html'
    //   );

    //   providerBio = tempBioHTML.querySelector('div').innerHTML;
    //   provider.Bio = providerBio;
    // }

    provider.Bio = wompLib.sanitizeHTML(provider.Bio, [
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

    provider.origin = wData.origin;
    provider.apiDexCareNoProtocol = wData.apiDexCareNoProtocol;
    provider.scheduleOrigin = wData.apiOriginScheduling;
    provider.apiDexCareSlotsV5Key = wData.apiDexCareSlotsV5Key
  });
  /**
   * Brief: Video modal content
   */
  function videoModal(provider) {
    if (provider.VideoBio) {
      const baseModalHtml = wompLib
        .getSnippetHtmlCss("base_modal")
        .replaceAll(/\{.*doNotWomp\}/gim, "");

      const dataToRender = {
        isAmp: true,
        html: 
          `<div class="univ-modal-placeholder modal-content-video">
            <div class="modal-content-options relative">
              <amp-youtube 
                id="modalVideo"
                data-videoid="${provider.VideoBio}"
                layout="responsive"
                width="480"
                height="270"
                data-param-modestbranding=1
              ></amp-youtube>
            </div>
            <div class="loader hidden">
              <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>`,
        triggerState: `videoModal_${provider.Npi}`,
        modalId: provider.Npi,
        usePanleMobW: false,
      };

      const renderedModal = Mustache.render(baseModalHtml, dataToRender);
      wData.providerVideoModals += renderedModal;
    }
  }

  wData.wompHealthResponse.locations[0].providers = providerResponses

  // Loop through each provider at the location - use mustache to render the provider card template and store as a list on wData, to be inserted using ~~ replacement
  const providerCardTemplate = wompLib.getSnippetHtmlCss('card_provider');
  wData.providers = '';
  providerResponses.forEach(
    (provider) =>
      (wData.providers += Mustache.render(providerCardTemplate, provider))
  );
}

/**
 * Brief: Creates the Insurance section of the page
 */
async function createInsurance() {
  try {
    /* Insurance Section */
    if (wData.wompHealthResponse.locations[0].InsuranceAccepted.length > 0) {
      /* only create object if there's data from API */
      wData.insuranceSection = {};
      wData.insuranceSection.heading = "Accepted Insurance";
      wData.insuranceSection.stateName = "insurance";

      let insuranceListHTML = ``;

      wData.wompHealthResponse.locations[0].InsuranceAccepted.sort().forEach((item) => {
        if (checkmarkList.includes(item)) {
          insuranceListHTML +=
            /*html*/
            `<div class="flx flx-row flx-algn-ctr mt-05">
              <svg class="svg-ico-check-circle" title="check icon"><use xlink:href="#icon-check-circle"></use></svg>
              <div class="ml-05">${item}</div>
            </div>`;
        } else {
          insuranceListHTML += /*html*/`<div class="flx flx-row mt-05"><div class="ml-32">${item}</div></div>`;
        }
      });
      wData.insuranceSection.contentHtml = 
        /*html*/
        `<div class="txt-lg">
          <div id="provInsurAccor" class="flx flx-row flx-algn-ctr">
            <svg class="svg-ico-check-circle" title="check icon"><use xlink:href="#icon-check-circle"></use></svg>
            <div class="ml-05">= Accepting New Patients</div>
          </div>
          <br>
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
 * Formats the phone number
 * @param {string} phoneNumberString phone number to be formatted
 * @returns formatted phone number
 */
function formatPhoneNumber(phoneNumberString) {
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }
  return null;
}

/**
 * Scrape the non-womp page for the conditions accordions and extract the headings and content into objects. Use the scraped data to render the base_accordion snippet html using mustache, creating an accordion for each one. Concatinate them intoa  string and store on wData, to be inserted into the page with ~~ str replacement.
 * @param {HTML Document} pageSource scraped non-womp pagesource
 * @returns undefined
 */
async function getConditionsList(pageSource) {
  // Find the conditions section. If there isn't one, return early.
  const conditionsSectionLocator = pageSource
    .find(".field-title:contains(onditions)")
    .closest(".list-accordion");

  // Find all the individual accordions). For each one, extract the heading and content and save as objects in an array
  const scrapedAccordions = conditionsSectionLocator.find("li.item");

  if (!scrapedAccordions.length) {
    delete wData.conditionsList;
    return;
  }

  const conditionsAccordsData = [];

  scrapedAccordions.each((i, e) => {
    const e$ = $(e);
    conditionsAccordsData.push({
      heading: e$.find(".toggle-header").text().trim(),
      contentHtml: e$.find(".toggle-content").text().trim(),
      stateName: "conditionsAccord" + i,
    });
  });

  // Get the base_accordion snippet html. Render out an accordion for each accordion data object and concatinate into wData.conditionsList
  const baseAccordionHtml = wompLib
    .getSnippetHtmlCss("base_accordion")
    .replaceAll(/\{.*doNotWomp\}/gim, "");

  wData.conditionsList = "";
  wompLib.addMustache();

  for (const accord of conditionsAccordsData) {
    const renderedAccord = Mustache.render(baseAccordionHtml, [accord]);
    wData.conditionsList += renderedAccord;
  }

  // wData.conditionsList will be inserted into the page using ~~ str replacement
}

/**
 * Scrape the non-womp page for the services accordions and extract the headings and content into objects. Use the scraped data to render the base_accordion snippet html using mustache, creating an accordion for each one. Concatinate them intoa  string and store on wData, to be inserted into the page with ~~ str replacement.
 * @param {HTML Document} pageSource scraped non-womp pagesource
 * @returns undefined
 */
async function getServicesList(pageSource) {
  // Find the services section. If there isn't one, return early.
  const servicesSectionLocator = pageSource
    .find(".field-title:contains(ervices)")
    .closest(".list-accordion");

  // Find all the individual accordions). For each one, extract the heading and content and save as objects in an array
  const scrapedAccordions = servicesSectionLocator.find("li.item");

  if (!scrapedAccordions.length) {
    delete wData.servicesList;
    return;
  }

  const servicesAccordsData = [];

  scrapedAccordions.each((i, e) => {
    const e$ = $(e);
    servicesAccordsData.push({
      heading: e$.find(".toggle-header").text().trim(),
      contentHtml: e$.find(".toggle-content").text().trim(),
      stateName: "servicesAccord" + i,
    });
  });

  // Get the base_accordion snippet html. Render out an accordion for each accordion data object and concatinate into wData.servicesList
  const baseAccordionHtml = wompLib
    .getSnippetHtmlCss("base_accordion")
    .replaceAll(/\{.*doNotWomp\}/gim, "");

  wData.servicesList = "";
  wompLib.addMustache();

  for (const accord of servicesAccordsData) {
    const renderedAccord = Mustache.render(baseAccordionHtml, [accord]);
    wData.servicesList += renderedAccord;
  }

  // wData.servicesList will be inserted into the page using ~~ str replacement
}

/**
 * 
 * @param {String} str 
 * @returns This will return decoded HTML text content.
 */
function decodeHTMLEntities(str) {
  const element = document.createElement('div');
  element.innerHTML = str;
  return element.textContent;
};


function setPageDescription(locationObj) {
  const {Name, Street1, Street2, City, Region, PostalCode} = locationObj

  if (wData.isQuickCare) {
    wData.pageDescription = `${Name} offers same-day care with Piedmont Healthcare providers inside your neighborhood Walgreens. Get treated for illnesses, aches and pains, minor injuries, vaccinations, and more. Open 7 days a week with extended hours at most locations. Affordable self-pay pricing and most insurance accepted. Walk-ins welcome, based on availability; priority given to appointments made online.`;
  } else if (wData.isUrgentCare) {
    wData.pageDescription =
      'Piedmont Urgent Care is ready to see you at your convenience, with no appointment necessary. If you have a sprain, bad cut or a nasty cough, we’re here to help you feel better again. Even routine procedures like chest X-rays and flu shots are easy. Open seven days a week, including holidays, with extended and weekend hours. Most urgent care is covered by your insurance, and we offer competitive self-pay rates for those patients without insurance. Walk-in only.';
  } else if (wData.isPrimaryCare) {
    wData.pageDescription = `${Name}, located at ${Street1}, ${Street2 ? Street2 + ", " : ""}${City}, ${Region} ${PostalCode}, believes prevention is the best medicine. That’s why we specialize in primary care to help you achieve - and maintain - better health.`;
  } else if (wData.isOrthoAtl) {
    wData.pageDescription = `${Name} offers easy and convenient access to a wide range of orthopaedic treatments to serve all of your orthopedic needs. We have a dedicated team of physicians, physician assistants, nurse practitioners, physical therapists, occupational therapists, hand therapists, and staff committed to patient care.`;
  } else if (wData.isPromptCare) {
    wData.pageDescription =
      'Piedmont Prompt Care is here for when you and your family need treatment for urgent health care needs. Prompt Care is a walk-in facility with no appointment necessary, and you may see a board-certified Prompt Care physician, a physician’s assistant or a nurse practitioner.';
  }
}