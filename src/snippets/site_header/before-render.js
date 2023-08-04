site_header: async function() {
  /** childReplacement site_header_navigation **/
  // two levels header text
  wData.headerItemsLvOne = [
      { href: wData.originNoWomp + "/about-piedmont-healthcare/about-us-home", txt: 'About Us', class: 'gray' },
      { href: wData.originNoWomp + "/medical-professionals/medical-professionals-home", hideTxt:"Medical", txt: 'Professionals', class: 'gray' },
      { href: wData.originNoWomp + "/about-piedmont-healthcare/foundation-and-giving/about", txt: 'Give', icon:"icon-gift", class: 'orange' },
      { href: wData.originNoWomp + "/emergency-room-wait-times/emergency-room-wait-times", txt: 'ER Wait Times', icon: "icon-clock", class: 'orange'},
      { href: "https://mychart.piedmont.org/prd/Authentication/Login", txt:'Piedmont MyChart', icon: "user-icon-desktop", class: 'orange' }
  ]
  wData.headerItemsLvTwo = [
    { href: wData.origin + "/providers", txt: 'Find Doctors' },
    { hideTxt:"Medical", txt: 'Services', dropIcon: 'angle-down', serviceFlyout: true},
    { href: wData.origin + "/locations/locations-map", hideTxt:"Find", txt: 'Locations' },
    { hideTxt:"Patient", txt: 'Resources', dropIcon: 'angle-down', resourceFlyout: true},
    { href: wData.originNoWomp + "/patient-tools/bill-pay", txt: 'Pay Bill' },
    { href: "https://piedmontcareers.org/", txt: 'Careers', class: "nowrap", icon:"fa-briefcase" },
    { href: wData.origin + "/providers", txt: 'Book Appointment', class: "nowrap", icon:"calendar-check" },
  ]
  wData.sideNavItems = [
    { href: wData.originNoWomp + "/emergency-room-wait-times/emergency-room-wait-times", txt: 'ER Wait Times',
      icon: "icon-clock-sideNav"
    },
    { href: wData.originNoWomp + "/about-piedmont-healthcare/foundation-and-giving/overview/piedmont-healthcare", txt: 'Give',
      icon: "icon-gift-sideNav"
    },
    {
      href: wData.originNoWomp + "/patient-tools/bill-pay", txt: 'Pay Bill',
      icon: "fa-credit-card"
    },
  ]
  wData.sideNavItemsMenu = [
    { href: wData.origin + "/providers", txt: 'Find Doctors' },
    { href: wData.originNoWomp + "/medical-services/a-z", dropIcon: 'angle-right', txt: 'Medical Services', serviceFlyout: true},
    { href: wData.origin + "/locations/locations-map", txt: 'Find Locations' },
    { href: wData.originNoWomp + "/patient-tools/patient-tools", dropIcon: 'angle-right', txt: 'Patient Resources', resourceFlyout: true},
    { href: wData.originNoWomp + "/patient-tools/bill-pay", txt: 'Pay Bill' },
    { href: "https://piedmontcareers.org", txt: 'Careers', class: "" },
    { href: wData.origin + "/providers", txt: 'Book Appointment', class: "" },
    { href: wData.origin + "/about-piedmont-healthcare/about-us-home", txt: 'About Us', class: "" },
    { href: wData.origin + "/medical-professionals/medical-professionals-home", txt: 'Medical Professionals', class: "" },
  ]
/** end childReplacement site_header_navigation **/
}
