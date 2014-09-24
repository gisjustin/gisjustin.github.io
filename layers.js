

function getInternetExplorerVersion() {    
	var rv = -1; // Return value assumes failure.    
	if (navigator.appName == 'Microsoft Internet Explorer') {        
		var ua = navigator.userAgent;        
		var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");        
		if (re.exec(ua) != null)            
		rv = parseFloat(RegExp.$1);    
	}    
	return rv;
}

function checkVersion() {    
	var msg = "";    
	var ver = getInternetExplorerVersion();    
	if (ver > -1) {        
		if (ver >= 9.0)            
			msg = ""        
		else            
			msg = "****************ALERT****************\n\nIndianaMAP is best viewed in IE9 and above.\n\nYour browser version: Internet Explorer "+ver;    
	}
	if (msg != '')  alert(msg);
}

checkVersion();		

var isGTIE8 = true; //This variable tells us weather the browser is IE8 or above. 
var IEVersion = getInternetExplorerVersion();

if (IEVersion > -1) {        
	if (IEVersion >= 9.0)            
		isGTIE8 = true;        
	else            
		isGTIE8 = false;
}		

var goToCat = function(sCategory){window.location.href = "layerGallery.html?category="+sCategory;}


var showCat = function(secID){
	hideAllSections();	
	var targetSection = document.getElementById(secID);
	targetSection.style.display = 'block';
}


var showSection = function(sectionName){			
	//Hide the title and all sections
	hideAllSections();
	
	//loop through the selected section and turn on the correct elements
	var y = document.getElementById(sectionName);
	y = y.getElementsByTagName('div');				
	for(var i = 0; i < y.length; i++){
		if(y[i].className == 'section')	y[i].style.display = 'block';
	}
}


var hideAllSections = function(){
	document.getElementById('splashPage').style.display = 'none';
	hideSection('Demographics');
	hideSection('Environment');
	hideSection('Geology');
	hideSection('Government');
	hideSection('Hydrology');
	hideSection('Imagery');
	hideSection('Infrastructure');
	hideSection('Reference');
}


var hideSection = function(sectionName){
	var y = document.getElementById(sectionName);
	y = y.getElementsByTagName('div');
	
	for(var i = 0; i < y.length; i++){
		if(y[i].className == 'section')	y[i].style.display = 'none';
	}				
}


var toggleTitle = function(divID){
	var tarObj  = document.getElementById(divID + 'Title');
	var tarObj2 = document.getElementById(divID + 'Tab');
	
	if (tarObj.className == 'tabTitle'){
		tarObj.className = 'titleStyle';
	}else{
		tarObj.className = 'tabTitle';
	}
}


// The following function extracts a url parameter			
function gup( name )
{
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null )
		return "";
	else
		return results[1];
}

var layerListHolding = [];


$(document).ready(function(){
	var availableTags = [
		{ "label": "Demographics", "value": "Demographics" },
		{ "label": "Census", "value": "Demographics Census"},
		{ "label": "Ethnicity", "value": "Demographics Ethnicity"},
		{ "label": "Population", "value": "Demographics Population"},
		{ "label": "Environment", "value": "Environment"},
		{ "label": "Agribusiness", "value": "Environment Agribusiness"},
		{ "label": "Agriculture", "value": "Environment Agriculture"},
		{ "label": "Crops", "value": "Environment Crops"},
		{ "label": "Ecology", "value": "Environment Ecology"},
		{ "label": "Land Cover", "value": "Environment Land Cover"},
		{ "label": "Managed Lands", "value": "Environment Managed Lands"},
		{ "label": "Monitoring", "value": "Environment Monitoring"},
		{ "label": "Remediation", "value": "Environment Remediation"},
		{ "label": "Soils", "value": "Environment Soils"},
		{ "label": "Storage Tanks", "value": "Environment Storage Tanks"},
		{ "label": "Waste", "value": "Environment Waste"},
		{ "label": "Wind", "value": "Environment Wind"},
		{ "label": "Geology", "value": "Geology"},
		{ "label": "Bedrock", "value": "Geology Bedrock"},
		{ "label": "Coal Data", "value": "Geology Coal Data"},
		{ "label": "Coal Depth", "value": "Geology Coal Depth"},
		{ "label": "Coal Elevation", "value": "Geology Coal Elevation"},
		{ "label": "Coal Mines", "value": "Geology Coal Mines"},
		{ "label": "Coal Thickness", "value": "Geology Coal Thickness"},
		{ "label": "Glacial", "value": "Geology Glacial"},
		{ "label": "Industrial Minerals", "value": "Geology Industrial Minerals"},
		{ "label": "Petroleum", "value": "Geology Petroleum"},
		{ "label": "Physiography", "value": "Geology Physiography"},
		{ "label": "Seismic", "value": "Geology Seismic"},
		{ "label": "Silurian", "value": "Geology Silurian"},
		{ "label": "Surficial", "value": "Geology Surficial"},
		{ "label": "Government", "value": "Geology Government"},
		{ "label": "Boundaries", "value": "Geology Boundaries"},
		{ "label": "Congress", "value": "Geology Congress"},
		{ "label": "General Assembly", "value": "Geology General Assembly"},
		{ "label": "Local Boundaries", "value": "Geology Local Boundaries"},
		{ "label": "Redistricted", "value": "Geology Redistricted"},
		{ "label": "Voting", "value": "Geology Voting"},
		{ "label": "Hydrology", "value": "Hydrology"},
		{ "label": "Aquifers", "value": "Hydrology Aquifers"},
		{ "label": "Canals", "value": "Hydrology Canals"},
		{ "label": "Floodplains", "value": "Hydrology Floodplains"},
		{ "label": "Hydrologic", "value": "Hydrology Hydrologic"},
		{ "label": "Karst", "value": "Hydrology Karst"},
		{ "label": "Monitoring", "value": "Hydrology Monitoring"},
		{ "label": "Water Bodies", "value": "Hydrology Water Bodies"},
		{ "label": "Water Quality", "value": "Hydrology Water Quality"},
		{ "label": "Water Wells", "value": "Hydrology Water Wells"},
		{ "label": "Watersheds", "value": "Hydrology Watersheds"},
		{ "label": "Wetlands", "value": "Hydrology Wetlands"},
		{ "label": "Imagery", "value": "Imagery"},
		{ "label": "Best Available", "value": "Imagery Best Available"},
		{ "label": "NAIP", "value": "Imagery NAIP"},
		{ "label": "Topo", "value": "Imagery Topo"},
		{ "label": "Infrastructure", "value": "Infrastructure"},
		{ "label": "Airports", "value": "Infrastructure Airports"},
		{ "label": "Bridges", "value": "Infrastructure Bridges"},
		{ "label": "Communications", "value": "Infrastructure Communications"},
		{ "label": "Critical", "value": "Infrastructure Critical"},
		{ "label": "Dams", "value": "Infrastructure Dams"},
		{ "label": "Energy", "value": "Infrastructure Energy"},
		{ "label": "Facilities", "value": "Infrastructure Facilities"},
		{ "label": "Interstates", "value": "Infrastructure Interstates"},
		{ "label": "Railroads", "value": "Infrastructure Railroads"},
		{ "label": "Recreation", "value": "Infrastructure Recreation"},
		{ "label": "Schools", "value": "Infrastructure Schools"},
		{ "label": "Streets", "value": "Infrastructure Streets"},
		{ "label": "Reference", "value": "Reference"},
		{ "label": "Benchmarks", "value": "Reference Benchmarks"},
		{ "label": "Elevation", "value": "Reference Elevation"},
		{ "label": "Land", "value": "Reference Land"},
		{ "label": "Places", "value": "Reference Places"},
		{ "label": "PLSS", "value": "Reference PLSS"},
		{ "label": "Quadrangle", "value": "Reference Quadrangle"},
		{ "label": "Time Zones", "value": "Reference Time Zones"},
		{ "label": "Zip Codes", "value": "Reference Zip Codes"},
		{label: "Census Blockgroups", value: "Demographics Census Blockgroups"},
		{label: "Census Blocks", value: "Demographics Census Blocks"},
		{label: "Census Counties", value: "Demographics Census Counties"},
		{label: "Census Tracts", value: "Demographics Census Tracts"},
		{label: "Ethnicity American Indian", value: "Demographics Ethnicity American Indian"},
		{label: "Ethnicity Asian", value: "Demographics Ethnicity Asian"},
		{label: "Ethnicity Black", value: "Demographics Ethnicity Black"},
		{label: "Ethnicity Hispanic", value: "Demographics Ethnicity Hispanic"},
		{label: "Ethnicity White", value: "Demographics Ethnicity White"},
		{label: "Population Age Median", value: "Demographics Population Age Median"},
		{label: "Population Census Data Historical", value: "Demographics Population Census Data Historical"},
		{label: "Population Change 1990 2000", value: "Demographics Population Change 1990 2000"},
		{label: "Population Children Poverty", value: "Demographics Population Children Poverty"},
		{label: "Population Density Blockgroups", value: "Demographics Population Density Blockgroups"},
		{label: "Population Family Size", value: "Demographics Population Family Size"},
		{label: "Agribusiness Confined Feeding Operations", value: "Environment Agribusiness Confined Feeding Operations"},
		{label: "Agriculture Census", value: "Environment Agriculture Census"},
		{label: "Agriculture Cultivated Areas", value: "Environment Agriculture Cultivated Areas"},
		{label: "Crops 2001", value: "Environment Crops 2001"},
		{label: "Crops 2002", value: "Environment Crops 2002"},
		{label: "Crops 2003", value: "Environment Crops 2003"},
		{label: "Crops 2006", value: "Environment Crops 2006"},
		{label: "Crops 2008", value: "Environment Crops 2008"},
		{label: "Crops 2009", value: "Environment Crops 2009"},
		{label: "Crops 2010", value: "Environment Crops 2010"},
		{label: "Ecology Ecoregions", value: "Environment Ecology Ecoregions"},
		{label: "Ecology Trees Big", value: "Environment Ecology Trees Big"},
		{label: "Land Cover 1992", value: "Environment Land Cover 1992"},
		{label: "Land Cover 2001", value: "Environment Land Cover 2001"},
		{label: "Land Cover 2006", value: "Environment Land Cover 2006"},
		{label: "Land Cover Change 2001 2006", value: "Environment Land Cover Change 2001 2006"},
		{label: "Land Cover Impervious Surfaces 2001", value: "Environment Land Cover Impervious Surfaces 2001"},
		{label: "Land Cover Impervious Surfaces 2006", value: "Environment Land Cover Impervious Surfaces 2006"},
		{label: "Land Cover Impervious Surfaces Change 2001 2006", value: "Environment Land Cover Impervious Surfaces Change 2001 2006"},
		{label: "Land Cover Tree Canopy 2001", value: "Environment Land Cover Tree Canopy 2001"},
		{label: "Managed Lands Hoosier National Forest Mgt Areas", value: "Environment Managed Lands Hoosier National Forest Mgt Areas"},
		{label: "Managed Lands Hoosier National Forest Ownership", value: "Environment Managed Lands Hoosier National Forest Ownership"},
		{label: "Managed Lands IDNR", value: "Environment Managed Lands IDNR"},
		{label: "Managed Lands Patoka River NWR", value: "Environment Managed Lands Patoka River NWR"},
		{label: "Monitoring Air Quality NTAD", value: "Environment Monitoring Air Quality NTAD"},
		{label: "Monitoring Bacteria EPA", value: "Environment Monitoring Bacteria EPA"},
		{label: "Remediation Brownfields", value: "Environment Remediation Brownfields"},
		{label: "Remediation Cleanup Sites", value: "Environment Remediation Cleanup Sites"},
		{label: "Remediation Corrective Action Sites", value: "Environment Remediation Corrective Action Sites"},
		{label: "Remediation Institutional Control Sites", value: "Environment Remediation Institutional Control Sites"},
		{label: "Remediation Manufactured Gas Plants", value: "Environment Remediation Manufactured Gas Plants"},
		{label: "Remediation Superfund Sites", value: "Environment Remediation Superfund Sites"},
		{label: "Remediation Voluntary Remediation Program", value: "Environment Remediation Voluntary Remediation Program"},
		{label: "Soils SSURGO Soil Survey", value: "Environment Soils SSURGO Soil Survey"},
		{label: "Soils STATSGO Prime Farmland", value: "Environment Soils STATSGO Prime Farmland"},
		{label: "Soils STATSGO Shrink Swell Characteristics", value: "Environment Soils STATSGO Shrink Swell Characteristics"},
		{label: "Soils STATSGO Soil Associations", value: "Environment Soils STATSGO Soil Associations"},
		{label: "Storage Tanks Underground", value: "Environment Storage Tanks Underground"},
		{label: "Storage Tanks Underground Leaking", value: "Environment Storage Tanks Underground Leaking"},
		{label: "Waste Composting Facilities", value: "Environment Waste Composting Facilities"},
		{label: "Waste Construction Demolition Sites", value: "Environment Waste Construction Demolition Sites"},
		{label: "Waste Industrial Sites", value: "Environment Waste Industrial Sites"},
		{label: "Waste Old Landfills", value: "Environment Waste Old Landfills"},
		{label: "Waste Open Dump Sites", value: "Environment Waste Open Dump Sites"},
		{label: "Waste Restricted Sites", value: "Environment Waste Restricted Sites"},
		{label: "Waste Septage Sites", value: "Environment Waste Septage Sites"},
		{label: "Waste Solid Active Landfills", value: "Environment Waste Solid Active Landfills"},
		{label: "Waste Tire Sites", value: "Environment Waste Tire Sites"},
		{label: "Waste Transfer Stations", value: "Environment Waste Transfer Stations"},
		{label: "Waste Treatment Storage Disposal Sites", value: "Environment Waste Treatment Storage Disposal Sites"},
		{label: "Waste Water NPDES Facilities", value: "Environment Waste Water NPDES Facilities"},
		{label: "Waste Water NPDES Pipe Locations", value: "Environment Waste Water NPDES Pipe Locations"},
		{label: "Wind Power 100m", value: "Environment Wind Power 100m"},
		{label: "Wind Power 50m", value: "Environment Wind Power 50m"},
		{label: "Wind Speed 100m", value: "Environment Wind Speed 100m"},
		{label: "Wind Speed 50m", value: "Environment Wind Speed 50m"},
		{label: "Bedrock Elevation", value: "Geology Bedrock Elevation"},
		{label: "Bedrock Geology", value: "Geology Bedrock Geology"},
		{label: "Bedrock Structural Features", value: "Geology Bedrock Structural Features"},
		{label: "Coal Data NCRDS", value: "Geology Coal Data NCRDS"},
		{label: "Coal Depth Danville", value: "Geology Coal Depth Danville"},
		{label: "Coal Depth Springfield", value: "Geology Coal Depth Springfield"},
		{label: "Coal Elevation Colchester", value: "Geology Coal Elevation Colchester"},
		{label: "Coal Elevation Danville", value: "Geology Coal Elevation Danville"},
		{label: "Coal Elevation Houchin Creek", value: "Geology Coal Elevation Houchin Creek"},
		{label: "Coal Elevation Hymera", value: "Geology Coal Elevation Hymera"},
		{label: "Coal Elevation Springfield", value: "Geology Coal Elevation Springfield"},
		{label: "Coal Mines Abandoned Features", value: "Geology Coal Mines Abandoned Features"},
		{label: "Coal Mines Abandoned Highwalls", value: "Geology Coal Mines Abandoned Highwalls"},
		{label: "Coal Mines Abandoned Lands", value: "Geology Coal Mines Abandoned Lands"},
		{label: "Coal Mines Entries", value: "Geology Coal Mines Entries"},
		{label: "Coal Mines Surface", value: "Geology Coal Mines Surface"},
		{label: "Coal Mines Underground", value: "Geology Coal Mines Underground"},
		{label: "Coal Thickness Danville", value: "Geology Coal Thickness Danville"},
		{label: "Coal Thickness Danville Availability", value: "Geology Coal Thickness Danville Availability"},
		{label: "Coal Thickness Hymera", value: "Geology Coal Thickness Hymera"},
		{label: "Coal Thickness Springfield", value: "Geology Coal Thickness Springfield"},
		{label: "Coal Thickness Springfield Availability", value: "Geology Coal Thickness Springfield Availability"},
		{label: "Glacial PreWisconsin Glacial Limit", value: "Geology Glacial PreWisconsin Glacial Limit"},
		{label: "Glacial Quaternary Geology", value: "Geology Glacial Quaternary Geology"},
		{label: "Glacial Wisconsin Glacial Limit", value: "Geology Glacial Wisconsin Glacial Limit"},
		{label: "Industrial Minerals Data", value: "Geology Industrial Minerals Data"},
		{label: "Industrial Minerals Quarries Abandoned", value: "Geology Industrial Minerals Quarries Abandoned"},
		{label: "Industrial Minerals Sand Gravel Pits Abandoned", value: "Geology Industrial Minerals Sand Gravel Pits Abandoned"},
		{label: "Industrial Minerals Sand Gravel Resources", value: "Geology Industrial Minerals Sand Gravel Resources"},
		{label: "Industrial Minerals Sites 2001", value: "Geology Industrial Minerals Sites 2001"},
		{label: "Petroleum Fields", value: "Geology Petroleum Fields"},
		{label: "Petroleum Wells", value: "Geology Petroleum Wells"},
		{label: "Physiography National Natural Landmarks", value: "Geology Physiography National Natural Landmarks"},
		{label: "Physiography Natural Features", value: "Geology Physiography Natural Features"},
		{label: "Physiography Natural Regions", value: "Geology Physiography Natural Regions"},
		{label: "Physiography Regions", value: "Geology Physiography Regions"},
		{label: "Seismic Data", value: "Geology Seismic Data"},
		{label: "Seismic Earthquake Epicenters", value: "Geology Seismic Earthquake Epicenters"},
		{label: "Seismic Earthquake Liquefaction", value: "Geology Seismic Earthquake Liquefaction"},
		{label: "Seismic Earthquake Liquefaction Potential", value: "Geology Seismic Earthquake Liquefaction Potential"},
		{label: "Seismic Shaking Materials Response", value: "Geology Seismic Shaking Materials Response"},
		{label: "Silurian Reefs Points", value: "Geology Silurian Reefs Points"},
		{label: "Silurian Reefs Polygons", value: "Geology Silurian Reefs Polygons"},
		{label: "Surficial Clay Thickness Grid", value: "Geology Surficial Clay Thickness Grid"},
		{label: "Surficial Clay Thickness Points", value: "Geology Surficial Clay Thickness Points"},
		{label: "Surficial Gamma Ray Logs", value: "Geology Surficial Gamma Ray Logs"},
		{label: "Surficial Sand Thickness Grid", value: "Geology Surficial Sand Thickness Grid"},
		{label: "Surficial Sand Thickness Points", value: "Geology Surficial Sand Thickness Points"},
		{label: "Surficial Unconsolidated Thickness", value: "Geology Surficial Unconsolidated Thickness"},
		{label: "Boundaries Miscellaneous IDHS", value: "Government Boundaries Miscellaneous IDHS"},
		{label: "Congress 112th Districts", value: "Government Congress 112th Districts"},
		{label: "General Assembly 117th House", value: "Government General Assembly 117th House"},
		{label: "General Assembly 117th Senate", value: "Government General Assembly 117th Senate"},
		{label: "Local Boundaries Minor Civil Divisions", value: "Government Local Boundaries Minor Civil Divisions"},
		{label: "Redistricted Congressional Districts", value: "Government Redistricted Congressional Districts"},
		{label: "Redistricted General Assembly House Districts", value: "Government Redistricted General Assembly House Districts"},
		{label: "Redistricted General Assembly Senate Districts", value: "Government Redistricted General Assembly Senate Districts"},
		{label: "Voting Districts USCB", value: "Government Voting Districts USCB"},
		{label: "Aquifers Bedrock", value: "Hydrology Aquifers Bedrock"},
		{label: "Aquifers Unconsolidated", value: "Hydrology Aquifers Unconsolidated"},
		{label: "Canals Historic Routes", value: "Hydrology Canals Historic Routes"},
		{label: "Canals Historic Structures", value: "Hydrology Canals Historic Structures"},
		{label: "Floodplains DFIRM", value: "Hydrology Floodplains DFIRM"},
		{label: "Floodplains DFIRM BFE", value: "Hydrology Floodplains DFIRM BFE"},
		{label: "Floodplains DFIRM Xsect", value: "Hydrology Floodplains DFIRM Xsect"},
		{label: "Hydrologic Terrains", value: "Hydrology Hydrologic Terrains"},
		{label: "Karst Cave Density", value: "Hydrology Karst Cave Density"},
		{label: "Karst Dye Lines", value: "Hydrology Karst Dye Lines"},
		{label: "Karst Dye Points", value: "Hydrology Karst Dye Points"},
		{label: "Karst Sinkhole Areas", value: "Hydrology Karst Sinkhole Areas"},
		{label: "Karst Springs", value: "Hydrology Karst Springs"},
		{label: "Monitoring Streamflow Gauges", value: "Hydrology Monitoring Streamflow Gauges"},
		{label: "Monitoring Weather Stations", value: "Hydrology Monitoring Weather Stations"},
		{label: "Water Bodies Hydrography Points", value: "Hydrology Water Bodies Hydrography Points"},
		{label: "Water Bodies Lake Shore Features", value: "Hydrology Water Bodies Lake Shore Features"},
		{label: "Water Bodies Lakes", value: "Hydrology Water Bodies Lakes"},
		{label: "Water Bodies Rivers", value: "Hydrology Water Bodies Rivers"},
		{label: "Water Bodies Rivers Inventory", value: "Hydrology Water Bodies Rivers Inventory"},
		{label: "Water Bodies Rivers Outstanding", value: "Hydrology Water Bodies Rivers Outstanding"},
		{label: "Water Bodies Streams", value: "Hydrology Water Bodies Streams"},
		{label: "Water Bodies Streams Features", value: "Hydrology Water Bodies Streams Features"},
		{label: "Water Quality Lakes Impaired", value: "Hydrology Water Quality Lakes Impaired"},
		{label: "Water Quality Observations", value: "Hydrology Water Quality Observations"},
		{label: "Water Quality Sediment Inventory", value: "Hydrology Water Quality Sediment Inventory"},
		{label: "Water Quality Statistics", value: "Hydrology Water Quality Statistics"},
		{label: "Water Quality Streams Impaired", value: "Hydrology Water Quality Streams Impaired"},
		{label: "Water Wells IDNR", value: "Hydrology Water Wells IDNR"},
		{label: "Water Wells iLITH", value: "Hydrology Water Wells iLITH"},
		{label: "Water Wells Observation Wells", value: "Hydrology Water Wells Observation Wells"},
		{label: "Watersheds HUC06", value: "Hydrology Watersheds HUC06"},
		{label: "Watersheds HUC08", value: "Hydrology Watersheds HUC08"},
		{label: "Watersheds HUC08 2009", value: "Hydrology Watersheds HUC08 2009"},
		{label: "Watersheds HUC10 2009", value: "Hydrology Watersheds HUC10 2009"},
		{label: "Watersheds HUC11", value: "Hydrology Watersheds HUC11"},
		{label: "Watersheds HUC12 2009", value: "Hydrology Watersheds HUC12 2009"},
		{label: "Watersheds HUC14", value: "Hydrology Watersheds HUC14"},
		{label: "Wetlands Inventory Lines", value: "Hydrology Wetlands Inventory Lines"},
		{label: "Wetlands Inventory Points", value: "Hydrology Wetlands Inventory Points"},
		{label: "Wetlands Inventory Polygons", value: "Hydrology Wetlands Inventory Polygons"},
		{label: "Best Available Imagery", value: "Imagery Best-Available-Imagery"},
		{label: "Imagery 2005", value: "Imagery Imagery-2005"},
		{label: "NAIP 2007", value: "Imagery NAIP-2007"},
		{label: "NAIP 2008", value: "Imagery NAIP-2008"},
		{label: "NAIP 2010", value: "Imagery NAIP-2010"},
		{label: "Topo Maps 24K USGS", value: "Imagery Topo-Maps-24K-USGS"},
		{label: "Airports Boundaries ESRI", value: "Infrastructure Airports Boundaries ESRI"},
		{label: "Airports Public Use INDOT", value: "Infrastructure Airports Public Use INDOT"},
		{label: "Airports Public Use NTAD", value: "Infrastructure Airports Public Use NTAD"},
		{label: "Bridges County INDOT", value: "Infrastructure Bridges County INDOT"},
		{label: "Bridges System1 INDOT", value: "Infrastructure Bridges System1 INDOT"},
		{label: "Communications Broadband Coverage Wireless", value: "Infrastructure Communications Broadband Coverage Wireless"},
		{label: "Communications Broadband Coverage Wireline", value: "Infrastructure Communications Broadband Coverage Wireline"},
		{label: "Communications Cellular Towers FCC", value: "Infrastructure Communications Cellular Towers FCC"},
		{label: "Critical Facilities HAZUS Emergency", value: "Infrastructure Critical Facilities HAZUS Emergency"},
		{label: "Critical Facilities HAZUS Hospitals Clinics", value: "Infrastructure Critical Facilities HAZUS Hospitals Clinics"},
		{label: "Critical Facilities IDHS Emergency Medical Services", value: "Infrastructure Critical Facilities IDHS Emergency Medical Services"},
		{label: "Critical Facilities IDHS Fire Stations", value: "Infrastructure Critical Facilities IDHS Fire Stations"},
		{label: "Critical Facilities IDHS Hospitals", value: "Infrastructure Critical Facilities IDHS Hospitals"},
		{label: "Critical Facilities ISDH Hospitals Rural Health Clinics", value: "Infrastructure Critical Facilities ISDH Hospitals Rural Health Clinics"},
		{label: "Critical Facilities ISDH Long Term Care", value: "Infrastructure Critical Facilities ISDH Long Term Care"},
		{label: "Critical Facilities MHMP Fire Stations", value: "Infrastructure Critical Facilities MHMP Fire Stations"},
		{label: "Critical Facilities MHMP Medical Care", value: "Infrastructure Critical Facilities MHMP Medical Care"},
		{label: "Critical Facilities MHMP Police Stations", value: "Infrastructure Critical Facilities MHMP Police Stations"},
		{label: "Critical Facilities MHMP Schools", value: "Infrastructure Critical Facilities MHMP Schools"},
		{label: "Dams EPA", value: "Infrastructure Dams EPA"},
		{label: "Dams IDNR", value: "Infrastructure Dams IDNR"},
		{label: "Energy Alternative Fuel Sites", value: "Infrastructure Energy Alternative Fuel Sites"},
		{label: "Energy Electric Service Territories", value: "Infrastructure Energy Electric Service Territories"},
		{label: "Energy Ethanol Production Facilities", value: "Infrastructure Energy Ethanol Production Facilities"},
		{label: "Energy HAZUS Power Facilities", value: "Infrastructure Energy HAZUS Power Facilities"},
		{label: "Energy Pipelines Oil Gas", value: "Infrastructure Energy Pipelines Oil Gas"},
		{label: "Facilities BMV License Branches", value: "Infrastructure Facilities BMV License Branches"},
		{label: "Facilities Cemeteries", value: "Infrastructure Facilities Cemeteries"},
		{label: "Facilities Industrial Parks INDOT", value: "Infrastructure Facilities Industrial Parks INDOT"},
		{label: "Facilities Intermodal Terminals NTAD", value: "Infrastructure Facilities Intermodal Terminals NTAD"},
		{label: "Facilities Libraries", value: "Infrastructure Facilities Libraries"},
		{label: "Facilities Museums", value: "Infrastructure Facilities Museums"},
		{label: "Facilities Ports NTAD", value: "Infrastructure Facilities Ports NTAD"},
		{label: "Facilities Religous Facilities", value: "Infrastructure Facilities Religous Facilities"},
		{label: "Interstates Highways INDOT", value: "Infrastructure Interstates Highways INDOT"},
		{label: "Interstates Interstates TIGER", value: "Infrastructure Interstates Interstates TIGER"},
		{label: "Interstates Mile Markers System1 INDOT", value: "Infrastructure Interstates Mile Markers System1 INDOT"},
		{label: "Interstates Ramps INDOT", value: "Infrastructure Interstates Ramps INDOT"},
		{label: "Interstates Roadways INDOT", value: "Infrastructure Interstates Roadways INDOT"},
		{label: "Interstates Traffic Counts INDOT", value: "Infrastructure Interstates Traffic Counts INDOT"},
		{label: "Interstates Traffic Zone Analysis TIGER", value: "Infrastructure Interstates Traffic Zone Analysis TIGER"},
		{label: "Railroads 100K NTAD", value: "Infrastructure Railroads 100K NTAD"},
		{label: "Railroads Active Abandoned INDOT", value: "Infrastructure Railroads Active Abandoned INDOT"},
		{label: "Railroads Active INDOT", value: "Infrastructure Railroads Active INDOT"},
		{label: "Railroads Amtrak Stations NTAD", value: "Infrastructure Railroads Amtrak Stations NTAD"},
		{label: "Railroads Rail Crossings INDOT", value: "Infrastructure Railroads Rail Crossings INDOT"},
		{label: "Recreation Facilities IDNR", value: "Infrastructure Recreation Facilities IDNR"},
		{label: "Recreation Trails IDNR", value: "Infrastructure Recreation Trails IDNR"},
		{label: "Schools Districts USCB", value: "Infrastructure Schools Districts USCB"},
		{label: "Schools HAZUS", value: "Infrastructure Schools HAZUS"},
		{label: "Schools Higher Education ICHE", value: "Infrastructure Schools Higher Education ICHE"},
		{label: "Schools IDOE", value: "Infrastructure Schools IDOE"},
		{label: "Streets Address Points IDHS", value: "Infrastructure Streets Address Points IDHS"},
		{label: "Streets Centerlines IDHS", value: "Infrastructure Streets Centerlines IDHS"},
		{label: "Streets Roads INDOT 2005", value: "Infrastructure Streets Roads INDOT 2005"},
		{label: "Streets Roads TIGER 2005", value: "Infrastructure Streets Roads TIGER 2005"},
		{label: "Benchmarks GPS NOAA", value: "Reference Benchmarks GPS NOAA"},
		{label: "Benchmarks NOAA", value: "Reference Benchmarks NOAA"},
		{label: "Elevation Contours 24k USGS", value: "Reference Elevation Contours 24k USGS"},
		{label: "Land Parcels County IDHS", value: "Reference Land Parcels County IDHS"},
		{label: "Places GNIS USGS", value: "Reference Places GNIS USGS"},
		{label: "Places Incorporated Areas", value: "Reference Places Incorporated Areas"},
		{label: "Places Populated Areas", value: "Reference Places Populated Areas"},
		{label: "Places Urban Areas", value: "Reference Places Urban Areas"},
		{label: "PLSS Counties", value: "Reference PLSS Counties"},
		{label: "PLSS Sections", value: "Reference PLSS Sections"},
		{label: "PLSS State", value: "Reference PLSS State"},
		{label: "PLSS Surveyor Tie Cards", value: "Reference PLSS Surveyor Tie Cards"},
		{label: "PLSS Townships", value: "Reference PLSS Townships"},
		{label: "Quadrangle Boundaries 100k", value: "Reference Quadrangle Boundaries 100k"},
		{label: "Quadrangle Boundaries 24k", value: "Reference Quadrangle Boundaries 24k"},
		{label: "Quadrangle Boundaries 250k", value: "Reference Quadrangle Boundaries 250k"},
		{label: "Time Zones", value: "Reference Time Zones"},
		{label: "Zip Codes USCB", value: "Reference Zip Codes USCB"}
	];



	//$('#selected-layers').dropdown();        
	if (window.location.hash) { 
		 window.location = String(window.location).replace(/\#.*$/, "") + window.location.hash; 
	}

	$(window).scroll(function() { 
		 if ($(window).scrollTop() > 1200) { $("#jump-to-top").show(); }
		 else if ($(window).scrollTop() < 1200 ) { $("#jump-to-top").hide(); }
	});

	$("a[href='#header-top']").click(function() { 
		 $("#jump-to-top").hide(); 
		 $("html, body").animate({ scrollTop: 0 }, "fast"); 
		 return false;
	}); 

 /* $("a[rel=popover]")
		 .popover({
				offset: 10,
				html: true,
				delayIn: 450
		 });
*/
	$("#clear-layer-selections").click(function(e) { 
		 e.preventDefault(); 
		 window.localStorage.removeItem("layerGallery");  
		 $(".addLayer.on").each(function(index) { 
				//!!!!!!!!!!!!!!Adds different classes to the anchor
				$(this).toggleClass("on success primary").text("Add Layer");
		 }); 
		 setLayers(); 
	}); 

	$(".menu-layers")
		 .click(function(e) { 
				e.preventDefault(); 
				var hash = $(this).attr("data-lyr-id").replace(/ /g,'_'); 
				window.location.hash = hash; 
				window.location = String(window.location).replace(/\#.*$/, "") + window.location.hash; 
		 });

	$(".addLayer")
		 .click(function(e) { 
				e.preventDefault();
				
				//!!!!!!!!!!!!!!Adds different classes to the anchor when clicked
				if ($(this).hasClass("on")) { 
					$(this).toggleClass("on success primary").text("Add Layer");
				} else { 
					$(this).toggleClass("on success primary").text("Remove");
				} 
				// This if statement opens up the tab if it's not already open.
				if(document.getElementById('myLsSub').style.display != 'block'){
					$('myLsSub').show();
					toggleTitle('myLs');
				}
				setLayers(); 
		 })

	$("#filter-by")
		.val('') 
		.autocomplete({ 
			source: availableTags, 
							minLength:2,
							select: function( event, ui ) {
					 			if (ui.item) { 
							 		var hash = ui.item.value.replace(/ /g,'_'); 
							 		window.location.hash = hash; 
							 		$("#filter-by").val(''); 
							 		window.location = String(window.location).replace(/\#.*$/, "") + window.location.hash; 
							 		return false;
					 			}
							}
		 })
		 .keypress(function (e) { 
				var code = (e.keyCode ? e.keyCode : e.which);
				if (code === 13) { 
					 e.preventDefault(); 
					 var str = $(this).val(); 
					 str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) { return letter.toUpperCase();});
					 var hash = str.replace(/ /g,'_'); 
					 window.location.hash = hash; 
					 $("#filter-by").val(''); 
					 window.location = String(window.location).replace(/\#.*$/, "") + window.location.hash; 
				}
		 }) 

	if(! isGTIE8){
		$(".addLayer").each(
			function(index) {
			$(this).unbind('click');
			$(this).css('color','#CCC');
			$(this).css('text-decoration','none');
			$(this).css('cursor','default');
		})
	}

	initSetLayers();
}); 

function initSetLayers() { 
		var btns = window.localStorage.getItem("layerGallery") || [];  

		if (btns.length > 0) { 
			btns = btns.split(","); 
			$.each(btns, function(index, value) { 
				 var btn = $("a[data-lyr-id='"+ value+"']");         
				 if (btn.hasClass("on")) { 
						btn.toggleClass("on success primary").text("Add Layer");
				 } else { 
						btn.toggleClass("on success primary").text("Remove"); 
				 }
			});
			setLayers(); 
		}
}

function setLayers() { 
	$(".menu-layers").remove();

	var lyrs = []; 
	$(".addLayer.on").each(function(index) { 
		 var id = $(this).attr("data-lyr-id");
		 layerListHolding[index] = id; // An array that holds the list of layers turned on. This is required for browsers that don't have the local Storage capability only. -MD 
		 var tokens = id.split("_"), label = ""; 
		 for (var i = 1; i < tokens.length; i++) { 
			 label +=  tokens[i] + " "; 
		 }
		 $("#selected-layers-menu").prepend("<li class='menu-layers'><a href='#"+ id +"' data-lyr-id='"+ id +"'><img src='http://www.indianamap.org/images/cancel.gif'> "+ label +"</a></li>"); 
		 lyrs.push(id); 
	}); 
	
	if (lyrs.length > 0) { 
		 $("#empty-layer-menu").hide(); 
		 $(".dropdown-menu").toggle(true); 

	} else if (lyrs.length === 0) { 
		 $("#empty-layer-menu").show(); 
		 $(".dropdown-menu").toggle(false); 
	}
	
	document.getElementById('myListTotal').innerHTML = layerListHolding.length; //update the "My Layers" number display
	window.localStorage.setItem("layerGallery", lyrs);
}



	var toggleMini = function(divID){ 
		if(document.getElementById(divID).style.display == 'none'){
			document.getElementById(divID).style.display = 'block';
		}else{
			document.getElementById(divID).style.display = 'none';		
		}
	}
