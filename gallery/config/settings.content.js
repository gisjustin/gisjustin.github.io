/*------------------------------------*/
// TEMPLATE CONTENT CONFIGURATION
/*------------------------------------*/

// SITE TITLE. USED IN NAVIGATION AND PAGE TITLE
pmgConfig.siteTitle = "IndianaMap Thematic Map Gallery";

// SITE HEADING. USED ON HOME PAGE
pmgConfig.siteHeading = "Thematic Map Gallery";

// SITE INTRO TEXT. USED ON HOME PAGE
pmgConfig.siteIntro = "IndianaMap is the public source for Indiana map data. The Thematic Map Gallery helps people find commonly used maps for a better understanding of Indiana issues and trends."

/*------------------------------------*/
// NAVIGATION AREA LINKS
/*------------------------------------*/

pmgConfig.showNavLinks = true; // SHOW NAVIGATION LINKS. Set to false to not display links in the top banner.
pmgConfig.navLinks = [ // NAVIGATION LINKS. 
	// LINK 1
	{
		title: "Viewer",
		url: 'http://maps.indiana.edu'
	}, // COMMA
	// LINK 2
	{
		title: "Layer Gallery",
		url: 'http://maps.indiana.edu/layers.html'
	}
	// LAST LINK DOES NOT HAVE A COMMA AFTER IT
];

/*------------------------------------*/
// SIDE BAR
/*------------------------------------*/

pmgConfig.rightSideLinksTitle = 'More Maps';
pmgConfig.showRightSideLinks = true; // SHOW LINKS ON RIGHT SIDE?
pmgConfig.rightLinks = [
	// LINK 1
	{
		title: "Los Angeles County Farmers' Markets",
		url: 'http://www.arcgis.com/home/webmap/viewer.html?webmap=1f09a12504a046f68e311ad1a9eadca8'
	},
	// LINK 2
	{
		title: "California Shipwrecks",
		url: 'http://www.arcgis.com/home/webmap/viewer.html?webmap=a182011915884ca987b217294c30f6c1'
	},
	// LINK 3
	{
		title: "Palm Springs, California, Places To Go",
		url: 'http://www.arcgis.com/home/webmap/viewer.html?webmap=88b187a860934d8491bdff591d0b1e1a'
	},
	// LINK 4
	{
		title: "Yosemite National Park",
		url: 'http://www.arcgis.com/home/webmap/viewer.html?webmap=83e5fde80c0e4f5f89eca416e73f8c17'
	},
	// LINK 5
	{
		title: "California Fire History and Population",
		url: 'http://www.arcgis.com/home/webmap/viewer.html?webmap=e939b8ec4a56446c94cb728a1c06a4a4'
	},
	// LINK 6
	{
		title: "California Quakes & Faults",
		url: 'http://www.arcgis.com/home/webmap/viewer.html?webmap=10697cfd56374c9fb48b1059a80f14b1'
	},
	// LINK 7
	{
		title: "Southern California Surf Spots",
		url: 'http://www.arcgis.com/home/webmap/viewer.html?webmap=9a313c7ffecc401991eff1c442458b12'
	}
	// LAST LINK DOES NOT HAVE A COMMA AFTER IT
];

// CONTENT ABOVE LINKS

pmgConfig.rightHeading = "IndianaMap";
pmgConfig.rightContent = "IndianaMap.org is the public source for map data in Indiana. IndianaMap helps people find commonly used layers and maps for a better understanding of Indiana issues and trends. Quick access to this authoritative geospatial information supports situational awareness and better decision making.";

// ADDITIONAL CONTENT. BELOW LINKS

pmgConfig.rightHeading2 = "Other"; // REMOVE TO NOT SHOW
pmgConfig.rightContent2 = "Mauris suscipit dignissim elit vel eleifend."; // REMOVE TO NOT SHOW

/*------------------------------------*/
// BOTTOM FOOTER
/*------------------------------------*/

// FOOTER TITLE
pmgConfig.footerHeading = "About IndianaMap."; // FOOTER TITLE

// FOOTER DESCRIPTION
pmgConfig.footerDescription = "IndianaMap helps people find commonly used layers and maps for a better understanding of Indiana issues and trends. Quick access to this authoritative geospatial information supports situational awareness and better decision making."; // FOOTER TEXT

// FOOTER LOGO
pmgConfig.footerLogo = '../images/IndianaMap/Green/CornerLogo.png'; // 200 pixels wide x 85 pixels high. Will scale if bigger.
pmgConfig.footerLogoURL = 'http://www.indianamap.org/'; // URL to go to when the logo is clicked

// FOOTER EMAIL
pmgConfig.footerEmail = 'info@indianamap.org'; // YOUR EMAIL
pmgConfig.footerEmailSubject = "The IndianaMap Thematic Gallery";
pmgConfig.footerEmailBody = "Hello ";

// END
