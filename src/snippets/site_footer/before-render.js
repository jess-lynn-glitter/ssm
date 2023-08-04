site_footer : function(){
  wData.currentYear = new Date().getFullYear();
  /** childReplacement footer_render **/
  wData.footerItems = [
    {
      heading: "Patient Support",
      stateName: "patientSupport",
      linkList: [
        {
          url: wData.origin + "/providers",
          txt: "Find Doctors"
        },
        {
          url: wData.originNoWomp + "/medical-services/a-z",
          txt: "Find Medical Services"
        },
        {
          url: wData.origin + "/locations/locations-map",
          txt: "Find Locations"
        },
        {
          url: wData.origin + "/providers",
          txt: "Schedule Appointment"
        },
        {
          url: wData.originNoWomp + "/patient-tools/bill-pay",
          txt: "Pay a Bill"
        },
        {
          url: "https://mychart.piedmont.org/prd/",
          txt: "MyChart"
        },
        {
          url: wData.originNoWomp + "/patient-tools/request-records",
          txt: "Request Medical Records"
        },
        {
          url: wData.originNoWomp + "/patient-tools/pre-registration",
          txt: "Pre-Registration"
        },
      ]
    },
    {
      heading: "Resources",
      stateName: "resources",
      linkList: [
        {
          url: wData.originNoWomp + "/medical-professionals/medical-professionals-home",
          txt: "For Medical Professionals"
        },
        {
          url: wData.originNoWomp + "/medical-professionals/for-physicians/referralforms",
          txt: "Referral Forms"
        },
        {
          url: wData.originNoWomp + "/research/research-home",
          txt: "Clinical Research"
        },
        {
          url: wData.originNoWomp + "/patient-tools/piedmont-financial-assistance",
          txt: "Financial Resources"
        },
        {
          url: wData.originNoWomp + "/patient-tools/advanced-directives",
          txt: "Advanced Directives"
        },
      ]
    },
    {
      heading: "Piedmont Healthcare",
      stateName: "piedmontHealthcare",
      linkList: [
        {
          url: "https://piedmontcareers.org/",
          txt: "Careers"
        },
        {
          url: wData.originNoWomp + "/about-piedmont-healthcare/community-benefit/community-benefit",
          txt: "Community Benefit"
        },
        {
          url: wData.originNoWomp + "/living-better/living-better-home",
          txt: "Living Better Blog"
        },
        {
          url: wData.originNoWomp + "/patient-tools/classes-events",
          txt: "Clases & Events"
        },
        {
          url: wData.originNoWomp + "/about-piedmont-healthcare/media-room/media-center",
          txt: "News"
        },
        {
          url: wData.originNoWomp + "/about-piedmont-healthcare/about-us-home",
          txt: "About"
        },
        {
          url: wData.originNoWomp + "/about-piedmont-healthcare/foundation-and-giving/ways-to-give/foundation-ways-to-give",
          txt: "Give to Piedmont Healthcare"
        },
        {
          url: wData.originNoWomp + "/volunteers/volunteers-home",
          txt: "Volunteer"
        },
      ]
    },
  ];
  /** end childReplacement footer_render **/
  wData.footerItems.map(x => {
    x.linkList.map(y => y.class = `ftr-mid-links ${y.class || ""}`)
  })
}