dojo.require("dojo.fx.easing");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojox.data.CsvStore");
dojo.require("dojox.encoding.digests._base"); 
dojo.require("dojox.layout.FloatingPane");
dojo.require("dojox.layout.ExpandoPane");
dojo.require("dijit.Dialog");
dojo.require("dijit.TitlePane");
dojo.require("dijit.Tree"); 
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.ComboBox");
dojo.require("esri.arcgis.utils"); 
dojo.require("esri.dijit.InfoWindowLite"); 
dojo.require("esri.dijit.Scalebar"); 
dojo.require("esri.dijit.Popup"); 
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("esri.dijit.Measurement");
dojo.require("esri.dijit.Print"); 
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.layers.KMLLayer"); 
dojo.require("esri.tasks.find");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.PrintTask"); 
dojo.require("esri.tasks.locator");
dojo.require("esri.toolbars.edit"); 
dojo.require("esri.toolbars.draw");
dojo.require("dijit.Tooltip"); 
dojo.require("esri.toolbars.navigation"); 
dojo.require("esri.map");
dojo.require("dijit.ColorPalette");
dojo.require("esri.layers.agsdynamic");
dojo.require("esri.utils");
dojo.require("esri.layers.FeatureLayer");
dojo.require("dojo.parser");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("esri.dijit.Legend");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.form.HorizontalSlider");   
   



// dojo.require("modules.RasterLayer");
// dojo.addOnLoad(dojo.isIE ? init : initLocalStorage); 
dojo.addOnLoad(dojo.isIE ? init : init); 

/**
 * Global parameters
 *
 */
// var wkid = 26916 or 102100 or 4326
var statesLayer;
var simpleFill = { "type": "esriSFS",
									 "style": "esriSFSSolid",
									 "color": [0,255,255,20],
									 "outline": {
											"type": "esriSLS",
											"style": "esriSLSSolid",
											"color": [0,255,255,255],
											"width": 1
										}
									}

									
 var find, params, idyn, selectedBasemap, graphicColor = "nothing", firstConnect, scalebar, map, bookmarkArray = [], layersearch = [], vislays = [], myNewColor=new Array(), currentMap = 0, addList = [], webmap = {}, startExtent, wkid = 26916, geometryService, seen = 0, referencedata = {}, printer, nwroot;
 var rasterLayer, flickrFeatureLayer, maxoffset, browseFeatures = [], idArray = [], queryArray = [], currentBrowseGraphic, currentEditGraphic = null, toolbar, editToolbar, navToolbar, measurement = null, maps = [], mapid = "", dojoConnections = [], pointType = "", workers = false, browseGraphics = {}, featureLayer, browseCache = {}, identifyCache = [], locatorService, scaffold = {"points":0,"polylines":0,"polygons":0,"rasters":0,"onload":0}, emptymap = {item: {
    "title": "Initial Map",
    "snippet": "IndianaMap",
    "extent":[[235308,4180000],[980000,4583385],{"wkid":26916}]  
  },  
  itemData: {
    "bookmarkItems":[],
    "operationalLayers":[],
    "baseMap":{
	"baseMapLayers": [{ 
	    "url":"http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Shaded_Relief/MapServer",
	    "opacity":1,
	    "visibility":true,
	    "type":"Raster",
	    "description":"Shaded Relief Basemap, (2006) - A scale-dependent basemap that combines the 2006 digital elevation model with selected transportation and other layers",
	    "geometryType":"None",
	}],
	"title":"Shaded Relief - Basemaps"
    }
  },
  log: []
};
// scaffold holds the insertion index for layer types
/*
 * @TODO: get webmap type from url
 */
function init() { 
	idyn = "true";
  esriConfig.defaults.map.logoLink = "http://maps.indiana.edu";
  geometryService = new esri.tasks.GeometryService("http://maps.indiana.edu/ArcGIS/rest/services/Utilities/Geometry/GeometryServer");
  locatorService = new esri.tasks.Locator("http://maps.indiana.edu/ArcGIS/rest/services/Utilities/Locator_IN_Composite_TRS/GeocodeServer"); 
	esri.config.defaults.geometryService = geometryService;
	//esri.config.defaults.io.proxyUrl = "http://maps.indiana.edu/proxy/proxy.ashx";
  var server = 'maps.indiana.edu';
	var server2 = 'bl-geoy-crinoid.ads.iu.edu';
	var server3 = 'http://maps.indiana.edu';
	esri.config.defaults.io.corsEnabledServers.push(server2);
esri.config.defaults.io.corsEnabledServers.push(server);
esri.config.defaults.io.corsEnabledServers.push(server3);

    

	/*** 
	* There are maps saved in local storage
	* Map Record: 
	* an array of map objects: maps = [], currentMap index into maps 
	* webmap is a json sync with map, an esri.map object. 
	* 1. @TODO check #hash for guid or named map
	* 2. @TODO check layergallery for, you know, layers -- asyncs in after init
	* 3. remember to fetch maps in map browsing --  
	* --- maps is a quasi-lifo array store, mimics a recent maps feature
	*
	* Use case layergallery eq operational layers -- sync with currentmap 
	* on either side. 
	*/ 

    /* Step 1. Check query string for guid */
    var qs = dojo.queryToObject(dojo.doc.location.search.substr((dojo.doc.location.search[0] === "?" ? 1 : 0))); 
    if (typeof qs !== "undefined" && qs !== null && typeof qs.mapid !== "undefined" && qs.mapid !== null && qs.mapid.length > 30) { 
       mapid = qs.mapid;
    }

    webmap.item = {
      "title": "Initial Map",
      "snippet": "IndianaMap",
      "extent":[[235308,4180000],[980000,4583385],{"wkid":26916}]  
    }; 
    webmap.itemData = {
      "bookmarkItems":[],
      "operationalLayers":[],
      "baseMap":{
	"baseMapLayers": [{ 
        "url":"http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Shaded_Relief/MapServer",
        "opacity":1,
        "visibility":true,
        "type":"Raster",
        "description":"Shaded Relief Basemap, (2006) - A scale-dependent basemap that combines the 2006 digital elevation model with selected transportation and other layers",
        "geometryType":"None",
        }],
        "title":"Shaded Relief - Basemaps"
      }
    };
    webmap.log = [];
    
var popup = new esri.dijit.Popup({
          fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]))
        }, dojo.create("div"));
//var popup= new esri.dijit.Popup(null,dojo.create("div")); 

    if (webmap.item !== undefined && webmap.item.extent !== undefined) { 
	startExtent = new esri.geometry.Extent(webmap.item.extent[0][0],webmap.item.extent[0][1],webmap.item.extent[1][0],webmap.item.extent[1][1],new esri.SpatialReference(webmap.item.extent[2])); 
    } else { 
	startExtent = new esri.geometry.Extent(386105.3,4155355.6,710312.7,4654126.4,new esri.SpatialReference({wkid:26916}));
    }
   map = new esri.Map("map", {
       //   infoWindow: popup
	   extent: startExtent,
	   sliderStyle: "large",
	   showAttribution: false,
	   infoWindow:popup
        });
		
		map.setLevel(0);
		 dojo.connect(map, "onExtentChange", showExtent);

   // map = new esri.Map("map", { extent: startExtent,  fadeOnZoom: false, force3DTransforms: false} );

   // dojoConnections.push(dojo.connect(map, "onClick", function(evt) { (evt); }));
   dojoConnections.push(dojo.connect(map, "onClick", function(evt) { identifyClick(evt); }));
 
    initMap(webmap);
    dojo.connect(map, 'onLoad', function(map) {
        doBuildList("",""); 
	$(document).ready(jQueryReady);
	
	scalebar = new esri.dijit.Scalebar({
            map: map,
            scalebarUnit:'english',  // metric|english
            attachTo:"bottom-left"
			
			
	});
	
	 map.infoWindow.resize(415, 200);
      //  map.infoWindow.setContent("<button id='detail-back-button'>Back</button><dl id='bookmark-list' class='detail-elements'></dl><table id='bookmark-detail-list' class='detail-elements'></table>");
        map.infoWindow.setTitle("Identify Results");

	


	navToolbar = new esri.toolbars.Navigation(map);
	toolbar = new esri.toolbars.Draw(map); 
	editToolbar = new esri.toolbars.Edit(map); 
	//editToolbar.deactivate(); 
	// dojo.connect(map,"onClick",());
	

	

	// Toolbar is a draw management class 
	if (measurement === null) { 
	    measurement = new esri.dijit.Measurement({
		map: map
	    }, dojo.byId('measurement-list'));
	    measurement.startup(); 
	}
	dojo.connect(measurement, "onMeasureEnd", measureEnd);
	maxOffset = function maxOffset(map, pixelTolerance) {
            return Math.floor(map.extent.getWidth() / map.width) * pixelTolerance;
	};

	dojo.connect(locatorService, "onAddressToLocationsComplete", showLocatorResults); 
	dojo.connect(map,"onLayerAdd",checkThenSync); 
	dojo.connect(map,"onLayerRemove",checkRemove); 
        dojo.connect(map,"onZoomEnd",checkZoomEnd);  
		
		
		dojo.connect(map, "onExtentChange", function(extent){
    
	 var s = map.getLevel();
	 var Scale = "";
	 switch (s)
	{
			case 0: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:2500000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
			$("#zoomSelect").val("0");
			
			break;
			
			case 1: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:1000000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
			
				$("#zoomSelect").val("1");
			break;
			
			case 2: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:500000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("2");
			break;
			
			case 3: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> ong1:250000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("3");
			
			break;
			
			case 4: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:125000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("4");
			
			break;
			
			case 5: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:64000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("5");
			
			break;
			
			case 6: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:32000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("6");
			
			break;
			
			case 7: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:16000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("7");
			
			break;
			
			case 8: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:8000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("8");
			break;
			
			case 9: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:4000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("9");
			
			break; 
			
			case 10: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:2000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("10");
			
			break; 
			
			case 11: 
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:2000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
				$("#zoomSelect").val("11");
			
			break; 
			
			default: 
				$("#zoomSelect").val("0");
			//Scale="<img src='/images/carrotUp.png' onclick=scaleUp() id='scaleUpID' /> 1:1000 <img src='/images/carrotDown.png' onclick=scaleDown() id='scaleDownID' />";
	}
		
   
  // document.getElementById( 'scaletext' ).innerHTML = "<span id='scalelabel'>" + Scale + "</span>";
  //code to generate map center will be used to pass url variable
  //var s = "";
  //s = "XMin: "+ map.extent.xmin +" YMin: " + map.extent.ymin +" XMax: " + map.extent.xmax +" YMax: " + map.extent.ymax;
 

	

  
  });
  
  

		
        // deleteMyMaps();            	
	// doQueryServer("http://maps.indiana.edu/ArcGIS/rest/services/",["Imagery","Maps","Utilities","CMIS"]);
	// map.setLevel(0); 

        // Map needs to load before deferred calls to replace map
        /* Test map: "http://bl-geoy-crinoid.ads.iu.edu:8888/map/525458ed-eed1-47a1-bc81-54414f31aca3" */
        if (mapid.length > 1) { 
            esri.request({
		"url":"http://bl-geoy-crinoid.ads.iu.edu:8888/map/" + mapid,
		"load":function(data) { 
		    var myreg = /^\{u\'map\'\: u\'(.*)\', u\'\_id\'\: ObjectId/i; 
		    var match = myreg.exec(data.status_string); 
		    if (match != null && match[1]) { 
			var mymap = jQuery.parseJSON(match[1]); /* saved as v.2 */
			var oldmap = revertWebMap(mymap);  /* converted to v.1!? */
			initMap(oldmap);
		    }
		}
            }); 

        } 
    });



  
 
  
  


  browseGraphics.locatorHoverSymbol = new esri.symbol.PictureMarkerSymbol("http://maps.indiana.edu/images/IndianaMap/PushPinCenterHighlight.png",50,50), 
  browseGraphics.markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,20,
								   new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
												    new dojo.Color([255,140,0]), 2.5), 
								   new dojo.Color([0,50,200,0.05]));
								   
								  
    
  browseGraphics.lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,50,200,0.25]), 2.5);
  browseGraphics.polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, 
								  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
												   new dojo.Color([255,140,0]), 2.5),
								  new dojo.Color([0,50,200,0.25]));  
  browseGraphics.currentBrowseGraphic = ""; 





       
        
        //modify the grid so only the STATE_NAME field is sortable
      //  grid.canSort = function(col){ if(Math.abs(col) == 2) { return true; } else { return false; } };
      }
function showExtent(ext){
    var theGroup = document.getElementById('DemographicsGroup')
	 var s = "<a href='http://webdb.iu.edu/spatial/scripts/isdp/filelist.cfm?xmin=" +ext.xmin +"&xmax=" + ext.xmax + "&ymax=" + ext.ymax + "&ymin=" + ext.ymin +">"
	 
	 console.log(s);
  //   theGroup.innerHTML =+ s;
   }
      function makeZoomButton(id){
        var zBtn = "<div data-dojo-type='dijit.form.Button'><img src='images/zoom.png'";
        zBtn = zBtn + " width='18' height='18'";
        zBtn = zBtn + " onClick=\"zoomRow('"+id+"')\"></div>";
        return zBtn;
      }

      function zoomRow(id){
        statesLayer.clearSelection();
        var query = new esri.tasks.Query();
        query.objectIds = [id];
        statesLayer.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW,function(features){
          //zoom to the selected feature
          var stateExtent = features[0].geometry.getExtent().expand(5.0);
          map.setExtent(stateExtent);
        });
      



}

/*
* takes a pseudo esri webmap object
* and calls as appropriate
* 
*/
function initMap(webmap) { 

	 // Create the Base Maps for the Basemap tab - MD
	
  var urlX = getXFromUrl(document.location.href);
  var urlY = getYFromUrl(document.location.href);
  var zoom = getZFromUrl(document.location.href);
  //var sLayerList = getsLayerListFromUrl(document.location.href);
  
  var sBasemap = getsBasemapFromUrl(document.location.href);
  
  //var tokens = sLayerList; // create an array of the current layers list -MD		
 // window.localStorage.setItem("layerGallery", sLayerList); 
  
  
  //if(null !== window.localStorage.getItem("layerGallery")){
//					if(window.localStorage.getItem("layerGallery").indexOf(serviceName.replace('/','_')) >= 0){
//						checked = true;
//										
//						addRemoveLayer(serviceName,'add');
//					}else{
//						checked = false; 
//					}; 				
//				}
//  
  
 // var xypt1 = new esri.geometry.Point(570000, 4400000, new esri.SpatialReference({ wkid: 26916 })); 
  //var xypt1 = new esri.geometry.Point(urlX, urlY, new esri.SpatialReference({ wkid: 26916 }));
var xypt1 = new esri.geometry.Point(urlX, urlY, new esri.SpatialReference({ wkid: 26916 }));
//var xypt = new esri.geometry.Point([-122.65,45.53],new esri.SpatialReference({ wkid:26916 }));
	map.centerAt(xypt1);
	map.setLevel(zoom);
	
		//selectedBasemap = sBasemap;

		
	
	//var basemap = basemapGallery.get("Light");

//createBasemapGallery();
 

console.log("initmap");


	var basemaps = [];
	
		
	var Streets = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Streets/MapServer"
	});
	var StreetsBasemap = new esri.dijit.Basemap({
		 layers: [Streets],
		 title: "Streets",
		  id: "bm1",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Streets_rectangle.png"
	});
	basemaps.push(StreetsBasemap);
	
	var ShadedRelief = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Shaded_Relief/MapServer"
	});
	var ShadedReliefBasemap = new esri.dijit.Basemap({
		 layers: [ShadedRelief],
		 title: "Streets and Shaded Relief",
		  id: "bm6",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Shaded_Relief_rectangle.png"
	});
	basemaps.push(ShadedReliefBasemap);
	
	var darkColShaRel = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Dark_Color_Shaded_Relief/MapServer"
	});
	var darkColShaRelBasemap = new esri.dijit.Basemap({
		 layers: [darkColShaRel],
		 title: "Dark Color Shaded Relief",
		  id: "bm2",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Dark-Color-Shaded-Relief_rectangle.png"
	});
	basemaps.push(darkColShaRelBasemap);
	
	var Light = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Light_Color_Shaded_Relief/MapServer"
	});
	var LightBasemap = new esri.dijit.Basemap({
		 layers: [Light],
		 title: "Light Color Shaded Relief",
		
		  id: "bm11",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Light-Color-Shaded-Relief_rectangle.png"
	});
	basemaps.push(LightBasemap);
	
	var ImgHyb2005 = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Imagery_2005/MapServer"
	});
	var ImgHyb2005Basemap = new esri.dijit.Basemap({
		 layers: [ImgHyb2005],
		 title: "Imagery Hybrid 2005",
		 id: "bm3",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/imagery_hybrid_2005_rectangle.png"
	});
	basemaps.push(ImgHyb2005Basemap);
	
	var Imagery = new esri.dijit.BasemapLayer({url:"http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Imagery_2005/MapServer"});
	var ImageryHybridBasemap = new esri.dijit.Basemap({
		 layers: [Imagery],
		 title: "2005 Imagery",
		  id: "bm8",
		 thumbnailUrl: "http://maps.indiana.edu/images/Basemaps/imagery_rectangle.png"
	});
	basemaps.push(ImageryHybridBasemap);
	
	var NAIP2010 = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/NAIP_2010/MapServer"
	});
	var NAIP2010Basemap = new esri.dijit.Basemap({
		 layers: [NAIP2010],
		 title: "NAIP 2010",
		  id: "bm4",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/NAIP-2010_rectangle.png"
	});
	basemaps.push(NAIP2010Basemap);
	
	
	var Image2011 = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/ArcGIS/rest/services/Imagery/Best_Available_Imagery_2011/MapServer"
	});
	var ImageryBasemap = new esri.dijit.Basemap({
		 layers: [Image2011],
		 title: "2011 Imagery",
		  id: "bm9",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/imagery_rectangle.png"
	});
	basemaps.push(ImageryBasemap);
	
	var BestAvailImHybrid = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Best_Available_Imagery_Hybrid/MapServer"
	});
	var BestAvailImHybridBasemap = new esri.dijit.Basemap({
		 layers: [BestAvailImHybrid],
		 title: "Best Availaible Imagery Hybrid",
		 id: "bm7",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Best_Available_Imagery_Hybrid_rectangle.png"
	});
	basemaps.push(BestAvailImHybridBasemap);
	
	
	var PLSS = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/PLSS/MapServer"
	});
	var PLSSBasemap = new esri.dijit.Basemap({
		 layers: [PLSS],
		 title: "PLSS",
		  id: "bm5",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/PLSS_rectangle.png"
	});
	basemaps.push(PLSSBasemap);
	
	
	
	
	
	
	
	
	


	var Topo = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Topos/MapServer"
	});
	var TopoBasemap = new esri.dijit.Basemap({
		 layers: [Topo],
		 title: "USGS Topographic",
		  id: "bm10",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Topos_rectangle.png"
	});
	basemaps.push(TopoBasemap);

	
	
	
	
	var basemapGallery = new esri.dijit.BasemapGallery({
		 showArcGISBasemaps:false,
		 basemaps:basemaps,
		 map:map
	}, "basemapGalleryDiv");
	
	dojo.connect(basemapGallery,"onSelectionChange",function(){
    selectedBasemap = basemapGallery.getSelected(); 
	console.log(selectedBasemap);
  });

	basemapGallery.startup();
	  var selected = basemapGallery.getSelected();





if (selectedBasemap != null) {
 basemapGallery.select(selectedBasemap);
}
else {
	
	basemapGallery.select("bm1");
	selectedBasemap = basemapGallery.getSelected(); 
	console.log(selectedBasemap);
}
















	
 // map.center

  // @TODO recognize title, snippet, etc. 
  // basemap is first 
  map.removeAllLayers(); 
  if (webmap.itemData.baseMap && webmap.itemData.baseMap.baseMapLayers) {
     var options = {};
     options.url = webmap.itemData.baseMap.baseMapLayers[0].url; 
     options.title = webmap.itemData.baseMap.title; 
     options.description = webmap.itemData.baseMap.baseMapLayers[0]["description"] || ""; 
     options.type = webmap.itemData.baseMap.baseMapLayers[0].type || "Raster"; 
     options.opacity = 1; 
     options.id = 'layer0';
     initWebMapLayer(options);      
  }
  for (var lyr in webmap.itemData.operationalLayers) { 
      var myreg = /^http:\/\/maps.indiana.edu\/ArcGIS\/rest\/services\/(.*)\/MapServer/i; 
      var match = myreg.exec(webmap.itemData.operationalLayers[lyr]['url']); 
      if (match != null && match[1]) { 
	  var id = match[1]; 
	  // forward slash is a no-no	  
	  id = (id.match(/\//g)) ? id.replace(/\//g,'_') : id; 
	  webmap.itemData.operationalLayers[lyr]['id'] = id; 
      }
      initWebMapLayer(webmap.itemData.operationalLayers[lyr]); 
  } 
  // @TODO set extent
  $(".detail-elements").hide(); 
  $("#measurementDiv").hide();
  sync(); 
}


function getXFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.x) {
          return urlObject.query.x;
        } else {
          return null;
        }
      }
	  
	  function getHIDFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.HID) {
          return urlObject.query.HID;
        }
		 if (urlObject.query && urlObject.query.hid) {
          return urlObject.query.hid;
        }else {
			return null;
		}
      }
	  
	   function getCIDFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.CID) {
          return urlObject.query.CID;
        } 
		
		 if (urlObject.query && urlObject.query.cid) {
          return urlObject.query.cid;
        }else {
          return null;
        }
      }
	  
	  function getSIDFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.SID) {
          return urlObject.query.SID;
        } 
		 if (urlObject.query && urlObject.query.sid) {
          return urlObject.query.sid;
        }
		else {
          return null;
        }
      }
	  
	  
	  function getYFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.y) {
          return urlObject.query.y;
        } else {
          return null;
        }
      }
	  function getZFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.z) {
          return urlObject.query.z;
        } else {
          return null;
        }
      }
	  function getsLayerListFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.sLayerList) {
          return urlObject.query.sLayerList;
        } else {
          return null;
        }
      }
	   function getsBasemapFromUrl(url) {
        var urlObject = esri.urlToObject(url);
        if (urlObject.query && urlObject.query.sBasemap) {
          return urlObject.query.sBasemap;
        } else {
          return null;
        }
      }


$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});



function jQueryReady() { 

  
	
	$(window).resize(function () { 
		if ($.browser.mozilla) { setDivHeaders(); }
		//$("#searchbutton").position({of:$("#searchbox"),at:"right center",offset:"-20 0"}); 
		map.resize();
		map.reposition();
		
	
		
		
	});

	initNavButtons(); // includes zoom image buttons and navigation bar elements
	initDraw(); // Draw has many toolbar buttons
	initDetailButtons(); // Detail div has tool switch buttons in header
	initMenuButtons();   
	checkForLayerGallery(); // If localstorage items and no map hash, then add to map

	/*
	 *  searchbutton and searchbox
	 */
	//function doSearch(event) { 
//		if (event.keyCode === $.ui.keyCode.ENTER) { 
//			event.preventDefault(); 
//			var term = $("#searchbox").val(); 
//			$("#searchbox").val(''); 
//
//			if (term !== "" && (/^clear:map/.test(term) || /^clear map/.test(term))) { 
//				var lyrs = $.map(map.layerIds, function(id,index) { if (id!=='layer0') return id;})
//				$.map(lyrs, function(id, index) { map.removeLayer(map.getLayer(id)); }); 
//				sync(); 
//			
//				$("#layer-header-button").click(); 
//
//			} else if (addList.length > 0) { 
//
//				for (var i in addList) { 
//					if (addList[i].category === 'County') { zoomCounty(addList[i].label);
//					} else if (addList[i].category === 'Place') { zoomPlace(addList[i].label); 
//					} else if (addList[i].category === 'Zip') { zoomZip(addList[i].label); 
//					} else { 
//						try { 
//							handleMapServer("http://maps.indiana.edu/ArcGIS/rest/services/"+addList[i].category +'/'+ addList[i].id + "/MapServer");
//							addList.length = 0; 			    
//						} catch (err) { logger(err.message); 
//					} 
//				}
//			}
//	
//			} else { 
//		
//				map.graphics.clear(); 
//				term = term.replace('"',' '); 
//				// The locator has lots of *special* issues
//				var address = {"SingleLine":term}; 
//				locatorService.outSpatialReference = map.spatialReference; 
//				locatorService.addressToLocations(address, ["Loc_name","User_fld"]); 
//			}
//		}
//	}
//	
//	$("#searchbutton").submit(function (event) { 
//		event.preventDefault(); 
//		var e = jQuery.Event("keydown", { keyCode: 13 });
//		doSearch(e); 
//		return false; 
//	}); 
	
	//// Add Search box functionality here -MD
//	$("#searchAddy")
//		.bind("keydown", function(event) { doSearch(event); })
//		.autocomplete({
//				minLength: 2,
//				source: data,
//				focus: function(event, ui) { addList.length = 0; addList.push(ui.item); $("#searchAddy").val(ui.item.label); return false; },
//				select: function(event, ui) { 
//								 addList.length = 0; 
//								 addList.push(ui.item); 
//								 $("#searchAddy").val(ui.item.label).focus();
//							},
//				delay: 50
//		})
//		
//		
//		
//		
//		
//		
//		.data("autocomplete")._renderItem = function (ul, item) { 
//			var uri; 
//			if (item.category === "Basemaps") { 
//				uri = "http://maps.indiana.edu/images/IndianaMap/BasemapLayer.png"; 
//			} else if (item.category === "Zip" || item.category === "Place" || item.category === "County" ){
//				uri = "http://maps.indiana.edu/images/IndianaMap/PushPin.png"; 
//			} else { 
//				uri = "http://maps.indiana.edu/images/IndianaMap/OperationalLayer.png"; 
//			}
//			
//			return $("<li></li>")
//			
//			.data("item.autocomplete", item )
//			.append('<a><img src="'+uri+'" height="16" width="16" />&nbsp;'+item.label+"</a>")
//			.appendTo(ul)
//	
//		};
	
		
	//    .focus(); 
	// States: Layer <-> Control <-> Initial Detail (link to All Detail)
	
	//Set the active layer items mouse over and exit events
	//Also set the onDoubleClick event handler
	$("#detail-list li")
		.live({
			mouseenter: function(){ detailHoverIn(this);},  
			mouseleave: function(){ detailHoverOut(this);},
			dblclick: function(){ 
				try { 
					var id = $(this).attr("data-lyr-id") || ""; 
					if (id && id.indexOf("layer0") === -1) { $("#"+id+"_detail-layer-visibility").click(); alert('Double Clicked an Active Layer'); }  
				} catch (err) { logger(err.message); } 
			}
		}); 
	
	// @TODO really untested code 
	$("#detail-list")
		.sortable({items:"li:not([data-lyr-id='layer0'])",
			delay: 300, 
			update: function (event, ui) { 
				var tmp = []; 
				$("#detail-list li")
					.each(function (i) {
						tmp.push($(this).attr("data-lyr-id")); 
					}); 
						 tmp = tmp.reverse(); 
						 for (i in tmp) { 
					 var lyr = map.getLayer(tmp[i]); 
					 if (lyr !== undefined) { 
							 map.reorderLayer(lyr,i); 
					 } 
						 }
						 var newList = map.layerIds; 
						 var myCompare = function(a, b) { 
					 if ($.inArray(a.id, newList) < $.inArray(b.id, newList)) { 
						return -1; 
					 }
					 else if ($.inArray(a.id, newList) > $.inArray(b.id, newList)) { 
							 return 1; 
					 }
					 else { 
							 return 0; 
					 }
						 }
						 webmap.itemData.operationalLayers.sort(myCompare); 
						 sync(); 
				 }
				}); 
			
	$("#detail-list li")
		.disableSelection(); 
	
	$("#bookmark-list > li")
		.live({
			click: function() { 
				var i = $(this).index(), arr=[];
				var type = identifyCache[i].feature.geometry.type; 
				var level = map.getLevel(); 
				if (typeof identifyCache[i] !== "undefined" && identifyCache[i].feature.attributes["score"] !== undefined) { 
					map.centerAndZoom(identifyCache[i].feature.geometry,6); 
				} else if ((type === "polygon" || type === "polyline") && level < 6) { 
					ext = identifyCache[i].feature.geometry.getExtent();
					// map.setExtent(ext,true); 
				} else if (type === "point") { 
					// map.centerAndZoom(identifyCache[i].feature.geometry,6); 
				}
	
				try { 
					var det = [];
					for (var key in identifyCache[i].feature.attributes) { 
						det.push({"key":key,"value":identifyCache[i].feature.attributes[key]});
					}
	
					$("#bookmark-detail-list").empty();  
					$("#bookmark-detail-template").tmpl(det).appendTo("#bookmark-detail-list"); 
					$("#bookmark-list").hide(); 
					$("#detail-back-button").show();
					$("#bookmark-detail-list").fadeIn('fast');
	
				} catch (err) { logger("error: " + err.message); }
	
			}, 
			
			mouseenter: function(){ 
				var i = $(this).index(), arr=[]; 
	
				if (Math.ceil(i) === Math.floor(i)) { 
					arr = [identifyCache[i].feature]; // kludge
					displayHover(arr, 0); 
				}
			},
			
			mouseleave: function(){ map.graphics.remove(browseGraphics.currentBrowseGraphic); } 
		}); 
	
	$("#browse-data-list > li")
		.live({
			click: function () { 
			$("#detail-filter-search, #detail-filter-search-button").hide(); 
			var id = $("#detail-filter-search-button").data("data-query-id") || ""; 
	
			var ind = $(this).index(), 
			ext,
			displayField = browseCache[id]['displayField'], 
			fieldList = browseCache[id]['fieldList'], 
			displayFieldType = browseCache[id]['displayFieldType'], 
			q = new esri.tasks.Query(); 
	
			if ((browseFeatures[ind].geometry.type === "polygon" || browseFeatures[ind].geometry.type === "polyline") &&
					browseFeatures[ind].geometry.spatialReference.wkid != 26916) 
			{ 
	
					var outSR = new esri.SpatialReference({ wkid: 26916});
					geometryService.project([browseFeatures[ind].geometry], outSR, function(projected) {
				ext = projected[0].getExtent();
				map.setExtent(ext,true); 
					});     
	
						} else if (browseFeatures[ind].geometry.type === "polygon" || browseFeatures[ind].geometry.type === "polyline") { 
					ext = browseFeatures[ind].geometry.getExtent();
					map.setExtent(ext,true); 
	
			} else if (browseFeatures[ind].geometry.type === "point" && browseFeatures[ind].geometry.spatialReference.wkid != 26916) { 
	
					var outSR = new esri.SpatialReference({ wkid: 26916});
					geometryService.project([browseFeatures[ind].geometry], outSR, function(projectedPoints) {
				pt = projectedPoints[0];
				map.centerAndZoom(pt,6); 
					});     
				
			} else if (browseFeatures[ind].geometry.type === "point") { 
					map.centerAndZoom(browseFeatures[ind].geometry,6); 
	
			} 			
	
			if (displayFieldType === "esriFieldTypeString") {
					q.where = displayField +" = '"+ browseFeatures[ind].attributes[displayField].replace("'","''")  +"'"; 		
	
			} else { 
					q.where = displayField +" = "+ browseFeatures[ind].attributes[displayField]; // TODO: deal with date type in display field		
	
			}
	
			q.outFields = [fieldList];
			q.returnGeometry = false; 
	
			if (id !== "") {  
	
					var queryLayer = map.getLayer(id); 
					var queryTask = new esri.tasks.QueryTask(queryLayer.url+'/0');
	
					dojo.connect(queryTask,"onComplete", function(set) { 
				try { 
						var det = [], fieldCount = 0;
						for (var key in set.features[0].attributes) { 
					if (set.fields[fieldCount].type === "esriFieldTypeOID") { 
							// Should we print or not? 
							
					} else if (set.fields[fieldCount].type === "esriFieldTypeDate") { 
							var dt = formatDate(set.features[0].attributes[key]),
						ky = set.fieldAliases[key] || key; 
							
							det.push({"key":ky,"value":dt});
	
					} else {  
							var ky = set.fieldAliases[key] || key; 
							det.push({"key":ky,"value":set.features[0].attributes[key]});
	
					}
					fieldCount++; 
						}
	
				} catch (err) { logger("error: " + err.message); /* Attribute undefined errors pop-up too frequently */  }
	
													$("#browse-data-detail-list").empty();  
				$("#browse-data-detail-template").tmpl(det).appendTo("#browse-data-detail-list"); 
				$("#browse-data-list").hide(); 
				$("#browse-data-detail-list").fadeIn('fast');
	
					}); 
					queryTask.execute(q); 
			}
				},
				mouseenter: function(){ displayHover(browseFeatures, $(this).index()); },
				mouseleave: function(){ map.graphics.remove(browseGraphics.currentBrowseGraphic); } 
		}); 
	
			$("#detail-filter-search-button").click(function () { 
	
		var tt = $("#detail-filter-search").val(), 
		id = $("#detail-filter-search-button").data("data-query-id") || ""; 
					
		if (/[A-Za-z0-9 -]*/.test(tt) && id !== "") {
				filterDetail(tt,id); 
		} else {
				return; 
		}
			}); 
	
			setupDropZone(); 
	}
	
	function detailHoverOut(obj) { 
			// $(obj).children("#layer-control").fadeOut().empty().remove(); 
			// $(obj).children(".reference-title").fadeIn();
			var id = $(obj).attr("data-lyr-id");
			if (id === 'layer0') { 
		$(obj).children("#tiny-basemap-thumbnail-gallery-list").hide(); 
			} else if (id) { 
		$("#"+id+"_visibility-slider, #"+id+"_detail-layer-data-button, #"+id+"_control-buttonset").hide();
		$("#"+id+"_detail-layer-title").fadeIn('slow');
			}
	
	}

	//Called when you hover over a layer in the Active Layers tab. 
	function detailHoverIn(obj) {     
    var layerTitle = $(obj).attr("data-lyr-title") || ""; //Get the title of the layer -MD
    var id = $(obj).attr("data-lyr-id") || ""; // Get the ID of the layer - MD
		
		/* The following commented out code was to display thumbnails of basemaps whenever you hovered over them when they used to be included in the layers list.
			 Now that they are in their own tab we no longer need this. - MD
			 
    if (id === 'layer0') { //Layer0 is the old Basemap selection when it was in the layers tab
      // basemap image ids 
			//$("#basemap-thumbnail-gallery-template").tmpl().prependTo(obj);
      //$("#tiny-basemap-thumbnail-light, #tiny-basemap-thumbnail-topos, #tiny-basemap-thumbnail-imagery, #tiny-basemap-thumbnail-topos, #tiny-basemap-thumbnail-shaded-relief").fadeIn();

			if (layerTitle.indexOf("Best Available Imagery Hybrid") !== -1) { 
	    	$("#tiny-basemap-thumbnail-imagery").hide();
      } else if (layerTitle.indexOf("Shaded Relief") !== -1) { 
	    	$("#tiny-basemap-thumbnail-shaded-relief").hide();
      } else if (layerTitle.indexOf("Topo") !== -1) { 
	    	$("#tiny-basemap-thumbnail-topos").hide();
      } else if (layerTitle.indexOf("PLSS") !== -1) { 
      	$("#tiny-basemap-thumbnail-plss").hide();
      } else if (layerTitle.indexOf("Light Color Shaded Relief") !== -1) { 
      	$("#tiny-basemap-thumbnail-light").hide();
      }

      $("#tiny-basemap-thumbnail-imagery").click(function() { 
	    	var opt = {
					"title":"Best Available Imagery Hybrid", 
					"id":"layer0",
					"type":"Raster",
					"description":"",
					"url":"Basemaps/Best_Available_Imagery_Hybrid"
        }; 
	    	
				initWebMapLayer(opt);

      }); 
        
			$("#tiny-basemap-thumbnail-plss").click(function() { 
	    	var opt = {
					"title":"PLSS", 
					"id":"layer0",
					"type":"Raster",
					"description":"",
					"url":"Basemaps/PLSS"
        }; 
	    	
				initWebMapLayer(opt);

      });
      
			$("#tiny-basemap-thumbnail-topos").click(function() { 
				var opt = {
					"title":"Topographic", 
					"id":"layer0",
					"type":"Raster",
					"description":"",
					"url":"Basemaps/Topos"
				}; 
				initWebMapLayer(opt);					
			}); 
			
			$("#tiny-basemap-thumbnail-shaded-relief").click(function() { 
				var opt = {
					"title":"Shaded Relief", 
					"id":"layer0",
					"type":"Raster",
					"description":"",
					"url":"Basemaps/Shaded_Relief"
				}; 
				initWebMapLayer(opt);		
			}); 
			
			$("#tiny-basemap-thumbnail-light").click(function() { 
				var opt = {
					"title":"Light Color Shaded Relief", 
					"id":"layer0",
					"type":"Raster",
					"description":"",
					"url":"Basemaps/Light_Color_Shaded_Relief"
				}; 
				initWebMapLayer(opt);
			}); 

			return;
    
		} else if (id) { 
		*/
		
		if(id){
			var lyr = map.getLayer(id), 
					oids = map.layerIds, 
					info = $(obj).attr("data-lyr-description") || ""; 
			
			//hide the Layer title -MD
			//$("#"+id+"_detail-layer-title").hide(); 
			
			//!!!!!! START OPACITY SLIDER CODE -MD  !!!!!			
			//Phase in the opacity slider -MD
			$("#"+id+"_visibility-slider").slider({
				range: "min",
				value: (lyr.opacity * 100),
				min: 1,
				max: 100,
				slide: function (event, ui) { 
					var id = $(this).closest('li').attr("data-lyr-id") || "",
							opacity = ui.value * .01; // 0-100
					if (id) { 
		    		var lyr = map.getLayer(id), vs = "#"+id+"_visibility_slider"; 
		    		lyr.setOpacity(opacity);
		    		var txt = Math.round(.01 * $("#"+id+"_visibility-slider").slider('option', 'value')); 
		    		txt = ((opacity * 100).toFixed(0) + '%'); 
		    		handle.qtip('option', 'content.text', txt);
					}
	    	}
			}).fadeIn('slow'),
			
			//Create the opacity tooltip showing the percentage of the transparency -MD
			handle = $('.ui-slider-handle', $("#"+id+"_visibility-slider"));
			//qTip is the JQuery tooltip
			handle.qtip({
	    	content: { 
					text: function() { 
		    		var opacity = $("#"+id+"_visibility-slider").slider('option', 'value'); 
		    		return ((opacity).toFixed(0) + '%'); 
					}
      	},	    
				position: { 
					my: 'bottom center',
					at: 'top center',
					of: handle,
					container: handle,
					adjust: { 
						scroll: false,
						resize: false,
						screen: false, 
						mouse: false,
						x: 0,
						y: -78
					}				
				},
				hide: { delay: 0 },
				style: { 
					classes: 'ui-tooltip-slider  ui-tooltip-shadow',
					widget: true
	    	}
			}); 
			//!!!!!! END OPACITY SLIDER CODE -MD  !!!!!			

			//!!!!!! BEGIN BROWSE BUTTON CODE  !!!!!
			//Create the "Browse" button on the active layer -MD 
			$("#"+id+"_detail-layer-data-button")
	    	.button({
					text:true,
					icons:{secondary:"ui-icon-arrowthick-1-e",},
					label:"Browse&nbsp;&nbsp;"
	    	})
	    	.click(function (event) { //Search for the active layer details when you click the browse button - MD
					$("#detail-back-button").show(); // Show the back button on the layers tab -MD
					$("#detail-filter-search, #detail-filter-search-button").show(); //show the layer search filter and the layer filter button -MD
					$("#detail-filter-search-button").data("data-query-id", $(this).closest('li').attr("data-lyr-id"));
					var id = $(this).closest('li').attr("data-lyr-id") || ""; 
          var displayField = $(this).closest('li').attr("data-lyr-display-field") || ""; 
					
					//Query the map for browse data ?? -MD
					if (id !== "" && browseCache[id] === undefined) { 
		    		var lyr = map.getLayer(id); 
		    		if (displayField !== "") { 
							var query = new esri.tasks.Query();
							if (lyr.url.indexOf("maps.indiana.edu") !== -1) { 
			    			query.where = (dojo.isIE ? " OBJECTID < 250 " : " 1=1 ") + " and len("+displayField+ ") > 0"; 
							} else { 
			    			query.where = " 1=1 "
							}
							query.outFields = [displayField];
							query.returnGeometry = true; 
							featureLayer = new esri.layers.FeatureLayer(lyr.url+'/0',{
								mode: esri.layers.FeatureLayer.MODE_SELECTION,
								visible: false,
								maxAllowableOffset: maxOffset(map,20)
							}); 			
							
							featureLayer.queryFeatures(query, function(featureSet) { 
			    			featureSet.features.sort(function(a,b){
									var aString = a.attributes[displayField];
									var bString = b.attributes[displayField];
									if (aString < bString) { return -1 } else if (aString > bString) { return 1 } else { return 0 };
			    		});
			    		
							browseFeatures = featureSet.features; 
			    		var items = [];
			    		dojo.forEach(featureSet.features, function(feature) { items.push({"UNIQUE":feature.attributes[displayField]}); }); 
							$("#browse-data-list").empty(); //Clear the current Browse data list -MD
							$("#browse-data-template").tmpl(items).appendTo("#browse-data-list"); //Add in the new items that were returned from the browes query above -MD
							$("#detail-list").hide(); // Hide the active layers list -MD
							$("#browse-data-list").show(); //show the browse data list -MD

			    		var fieldArray = [], 
									fieldList = "", 
									displayFieldType = ""; 
			    		
							$(featureLayer.fields).each(function (index, field) { 
								if (field.type === "esriFieldTypeString" || 
										field.type === "esriFieldTypeInteger" || 
										field.type === "esriFieldTypeDouble" || 
										field.type === "esriFieldTypeDate" || 
										field.type === "esriFieldTypeSmallInteger") 
								{
									if (displayField.toUpperCase() === field.name.toUpperCase()) { displayFieldType = field.type; }
									fieldArray.push('"'+field.name+'"'); 
								}
							});  
						
							fieldList = fieldArray.join(","); 
							browseCache[id] = { 
								"displayField": displayField, 
								"featureSet": featureSet, 
								"items": items, 
								"fields": featureLayer.fields, 
								"fieldArray": fieldArray, 
								"fieldList": fieldList,
								"displayFieldType": displayFieldType
							};  // Cache here -PR
						}); 
		    	
					} else { 
          	// First query to get display field -PR
		    		esri.request({
							url:lyr.url+'/0',
							content:{f:"json"},
							callbackParamName:"callback",
							load: function(data) {
								var query = new esri.tasks.Query(), 			    
								displayField = data.displayField || "NAME"; 
								// query.where = "OBJECTID < 250"; Set at service level -PR
								// query.geometry = map.getExtent();  -PR
								// query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_CONTAINS; -PR
								query.where = (dojo.isIE ? " OBJECTID < 250 " : " 1=1 ") + " and "+displayField+ " != ''"; 
								query.outFields = [displayField];
								query.returnGeometry = true; 
								featureLayer = new esri.layers.FeatureLayer(lyr.url+'/0',{mode: esri.layers.FeatureLayer.MODE_SELECTION,visible: false,maxAllowableOffset: maxOffset(map,20)}); 
								// Query for featureset -PR
								featureLayer.queryFeatures(query, function(featureSet) { 
									featureSet.features.sort(function(a,b){
										var aString = a.attributes[displayField];
										var bString = b.attributes[displayField];
										if (aString < bString) { return -1 } else if (aString > bString) { return 1 } else { return 0 };
									});
									browseFeatures = featureSet.features; 
									var items = [];
									dojo.forEach(featureSet.features, function(feature) { items.push({"UNIQUE":feature.attributes[displayField]}); });
	
									$("#browse-data-list").empty(); //Clear the current Browse data list -MD
									$("#browse-data-template").tmpl(items).appendTo("#browse-data-list"); //Add in the new items that were returned from the browes query above -MD
									$("#detail-list").hide(); // Hide the active layers list -MD
									$("#browse-data-list").show(); //show the browse data list -MD
	
									var fieldArray = [], fieldList = "", displayFieldType = ""; 
									$(featureLayer.fields).each(function (index, field) { 
										if (field.type === "esriFieldTypeString" || 
												field.type === "esriFieldTypeInteger" || 
												field.type === "esriFieldTypeDouble" || 
												field.type === "esriFieldTypeDate" || 
												field.type === "esriFieldTypeSmallInteger") 
										{
											if (displayField.toUpperCase() === field.name.toUpperCase()) { displayFieldType = field.type; }
											fieldArray.push('"'+field.name+'"'); 
										}
									});  
									fieldList = fieldArray.join(","); 
									browseCache[id] = { "displayField": displayField, 
										"featureSet": featureSet, 
										"items": items, 
										"fields": featureLayer.fields, 
										"fieldArray": fieldArray, 
										"fieldList": fieldList,
										"displayFieldType": displayFieldType
									};  // Cache here -PR
								}); 
							},
							error:esriConfig.defaults.io.errorHandler
						});			
		    	}
				} else if (id !== "") { 
		    	// Cache hit! 
					$("#browse-data-list").empty();
					$("#browse-data-template").tmpl(browseCache[id]['items']).appendTo("#browse-data-list"); 
					$("#detail-list").hide();
					$("#browse-data-list").show();
					browseFeatures = browseCache[id]['featureSet']['features']; 
        }
	    })
	    .show() //Show the Browse button -MD
	    //position the browse button -MD
			.position( 
				{my:"left", 
		     at:"right",
		     of:"#"+id+"_visibility-slider",
		     offset:"50 0",
		     collision:"fit"
				}
			); 
			//!!!!!! END BROWSE BUTTON CODE  !!!!!
	    
			//!!!!!! START TRASH BUTTON CODE -MD  !!!!!						
			$("#"+id+"_detail-layer-remove") // The trashcan icon button
	    	.button({icons:{ primary:"ui-icon-trash" }, text:false})
	    	.click(function() { 
					var id = $(this).closest('li').attr("data-lyr-id") || ""; 
					try { 
						removeWebMapLayer(id); 
						map.removeLayer(map.getLayer(id));
		    		var ref = id.replace('/','_')+'_reference'; 
		    		if ($("#"+ref).is(":visible")) { removeReferenceSelection($("#"+ref)); }
					} catch (err) { 
						logger(err.message); 
					} // Force user to click again
	    	}); 
			//!!!!!! END TRASH BUTTON CODE -MD  !!!!!						

			//!!!!!! START MOVE UP BUTTON CODE -MD  !!!!!						
      // @TODO This is buggy, at moments, layers move up 2 -PR
			$("#"+id+"_detail-layer-move-up")
	    	.button({
					icons:{ primary:"ui-icon-arrowthick-1-n"}, 
					text:false,
					disabled: ($.inArray(id, oids) === (oids.length - 1))
	    	})
	    	.click(function (e) { 
					try { 
		    		if (dojo.isIE) { 
							var id = $(this).closest('li').attr("data-lyr-id"); 
							var lyr = map.getLayer(id), oids = map.layerIds;  
							var currentIndex = $.inArray(id, oids); 
							map.reorderLayer(lyr, 1+currentIndex); 
							var newList = map.layerIds; 
							var myCompare = function(a, b) { 
			    			if ($.inArray(a.id, newList) < $.inArray(b.id, newList)) { 
									return -1; 
			    			} else if ($.inArray(a.id, newList) > $.inArray(b.id, newList)) { 
									return 1; 
			    			} else {   
									return 0; 
			    			}
							}
							webmap.itemData.operationalLayers.sort(myCompare); 
							sync();
            } else {
  		      	e.preventDefault(); 
              var id = $(this).closest('li').attr("data-lyr-id"),
								  moveuplength = webmap.itemData.operationalLayers.length - 1,
									ops = webmap.itemData.operationalLayers; 
              // forEach has no built-in break -PR
		       		for (var i = 0; i <= moveuplength; i++) { 
			  				if (typeof ops[i].id !== "undefined" && ops[i].id === id) { 
    			     		var car = ops.slice(0, i),
				 					reverse = ops.slice(i, i+2).reverse(),
				 					cdr = ops.slice(i+2); 
			     				var concat = [].concat(car,reverse,cdr).reverse(); 
			     				for (lyr = 1, j = 0; j < concat.length; ++lyr, ++j) {
				 						if (typeof concat[j].id !== "undefined") { 
				     					map.reorderLayer(map.getLayer(concat[j].id),lyr);
                    }
			     				}
			     				webmap.itemData.operationalLayers = concat;
                  break;  
			  				}
		       		}
		       		sync(); 
            }
					} catch (err) { 
						logger(err.message); 
					}
        });


			//!!!!!! START MOVE DOWN BUTTON CODE -MD  !!!!!						
			$("#"+id+"_detail-layer-move-down")
	    	.button({icons:{ primary:"ui-icon-arrowthick-1-s" },
		    	text:false,
		     	disabled: ($.inArray(id, oids) === 1)
		    })
	    	
				.click(function () { 
					try { 
		    		if (dojo.isIE) { 
							var id = $(this).closest('li').attr("data-lyr-id"); 
							var lyr = map.getLayer(id), oids = map.layerIds;  
							var currentIndex = $.inArray(id, oids); 
							map.reorderLayer(lyr, currentIndex - 1); 
							var newList = map.layerIds; 
							var myCompare = function(a, b) { 
								if ($.inArray(a.id, newList) < $.inArray(b.id, newList)) { 
									return -1; 
								} else if ($.inArray(a.id, newList) > $.inArray(b.id, newList)) { 
									return 1; 
								} else { 
									return 0; 
								}
		        	}
              webmap.itemData.operationalLayers.sort(myCompare); 
		        	sync(); 
            } else { 
            	e.preventDefault(); 
              var id = $(this).closest('li').attr("data-lyr-id"),
			    				length = webmap.itemData.operationalLayers.length,
			    				ops = webmap.itemData.operationalLayers; 
                  // forEach has no built-in break -PR
		        	for (var i = 1; i <= length; i++) { 
			    			if (typeof ops[i].id !== "undefined" && ops[i].id === id) { 
    			      	var car = ops.slice(0, i - 1),
				    			reverse = ops.slice(i - 1, i + 1).reverse(),
				    			cdr = ops.slice(i + 1); 
			        		var concat = [].concat(car,reverse,cdr).reverse(); 
			        		for (lyr = 1, j = 0; j < concat.length; ++lyr, ++j) {
				    				if (typeof concat[j].id !== "undefined") { map.reorderLayer(map.getLayer(concat[j].id),lyr); }
			        		}
			        		webmap.itemData.operationalLayers = concat;
                  break;  
			    			} 
		        	}
   		        sync(); 
            }
					} catch (err) { 
						logger(err.message); 
					}
	    	});
			//!!!!!! END MOVE DOWN BUTTON CODE -MD  !!!!!						


			$("#"+id+"_control-buttonset")
      	.buttonset()
        .show()
        .position({my:'left',at:'right',of:"#"+id+"_visibility-slider",offset:"120 0",collision:'fit'});
    } 
	}

	function removeWebMapLayer(id) { 
  	var tmp = []; 
    for (var i in webmap.itemData.operationalLayers) { 
			if (id !== webmap.itemData.operationalLayers[i]["id"]) { 
	    	tmp.push(webmap.itemData.operationalLayers[i]); 
			}
    }
    webmap.itemData.operationalLayers = tmp; 
	}


 
	function initWebMapLayer(options) {	
    //if (options.url.match(/^http/i)) { 
//    	options.url = options.url; 
//    } else { 
//			options.url = ('http://maps.indiana.edu/ArcGIS/rest/services/'+options.url+'/MapServer');  // fragment -PR
//    }
//
//		if (options.id) {
//    	options.id = options.id;
//    } else { 
//			var myreg = /^http:\/\/maps.indiana.edu\/ArcGIS\/rest\/services\/(.*)\/MapServer/i; 
//			var match = myreg.exec(options.url); 
//			if (match != null && match[1]) { options.id = match[1]; }
//    }
//
//    if (options.title) {
//    	options.title = options.title; 
//    } else { 
//      var ids = options.id.split('/'); 
//			title = (ids.length > 1) 
//	    ? (ids[1].replace(/_/g,' ') + ' - ' + ids[0]) 
//	    : (options.id.replace(/_/g,' '));
//    }
//
//    options.type = options.type || ""; 
//    options.description = (options.description && options.description.match(/\n/g)) 
//        ? options.description.replace(/\n/g,'<br />') 
//	: ""; 
//       
//    // forward slash is a no-no      
//    options.id = (options.id.match(/\//g)) ? options.id.replace(/\//g,'_') : options.id; 
//
//    if (options.id !== "layer0" && map.getLayer(options.id)) { return; } // existence check
//
//    if (options.id === "layer0") { 
//        options.opacity = 1; 
//         
//    } else if (/Polygon/.test(options.geometryType) || /Raster/.test(options.type)) { 
//	options.opacity = (options.opacity && options.opacity < 0.75) ? options.opacity : 0.75; 
//    }
//
//
//    var layer; 
	}



function doBuildList(dto,folders) {
    /*
    var cts = [], folder = "";
    for (var svc in dto.services) {
	var name = dto.services[svc]['name'].toString().split('/');
	if (folder.length == 0) { folder = name[0]; }
	cts.push(name[1]);
    }
    referencedata[folder] = cts;
    if (seen < folders.length - 1) { 
	seen++;

    } else if (seen == folders.length - 1) { 
	var root = {"items":[]};
	for (var key in referencedata) { 
	    var children = []; 
	    for (var svc in referencedata[key]) { 
		var nme = referencedata[key][svc]; 
		var service = {
		    "reference":key+'_'+nme+'_reference',
		    "esri":key+'_'+nme,
		    "id":key+'/'+nme,
		    "name":nme,
                    "title":nme.replace(/_/g,' '), 
		    "type":"service"
		};
		children.push(service); 
	    }
	    var folder = {"id":key,"name":key,"type":"folder","children":children};
	    root["items"].push(folder); 

	}
    */

	// servers is a global object array associated with base url, items have 2 keys: "folder" and "services", 
	nwroot = {"items":[]}, 
	srv = "maps.indiana.edu"; 

	for (var i in servers[srv]) { 
		var children = [], key = servers[srv][i]["folder"]; 
	  myreg = /^http:\/\/maps.indiana.edu\/ArcGIS\/rest\/services\/(.*)\/MapServer/i; 
	  for (var svc in servers[srv][i]["services"]) { 
			var match = myreg.exec(servers[srv][i]["services"][svc]["url"]); 
			if (match != null && match[1]) { 		
		  	var id = match[1], nme = match[1].split('/'), slash = match[1];
		    id = (id.match(/\//g)) ? id.replace(/\//g,'_') : id; // forward slash is a no-no	                      
        var ref_title = servers[srv][i]["services"][svc]["title"].replace(/ -.*/,'');
		    var service = {
					"reference":id+"_reference",
					"esri":id,
					"id":slash,
					"name":nme[1],
          "referenceTitle": ref_title,
					"title":servers[srv][i]["services"][svc]["title"],
					"type":servers[srv][i]["services"][svc]["type"],
					"geometryType":servers[srv][i]["services"][svc]["geometryType"],
					"opacity":servers[srv][i]["services"][svc]["opacity"],
					"visibility":servers[srv][i]["services"][svc]["visibility"],
					"description":servers[srv][i]["services"][svc]["description"],
					"displayField":servers[srv][i]["services"][svc]["displayField"]
				};
		    children.push(service); 
			}
		}
	  var folder = {"id":key,"name":key,"type":"folder","children":children, "thumb": "http://maps.indiana.edu/images/IndianaMap/Green/"+key+"Small.png"};
	  nwroot["items"].push(folder); 
	}
  //doAfterBuildList(); 
}

function doQueryServer(url,avoid) { 
  esri.request({
		url:url,
		content:{f:"json"},
		callbackParamName:"callback",
		load: function(data) {
	    $.each(avoid,function(index) { 
	      data.folders = $.grep(data.folders, function(value) { return value != avoid[index]; });
      });
            
	    for (var folder in data.folders) { 
				esri.request({url:url+data.folders[folder],
			  	content:{f:"json"},
			    callbackParamName:"callback",
			    load:function(dto){doBuildList(dto,data.folders);}
			  });
	    }
		},
		error:esriConfig.defaults.io.errorHandler
  });
}

/****
*  Sync is a high-level abstraction to coordinate between
*  - webmap json object
*  - map.layers 
*  - items used in browse bar
*  -PR
***/
function sync() { 
  //syncWebMap(); 
  //syncDetails(); 
  //syncReferenceLayers(); 
  //saveMapState(); 
	
	
	
}


/*****
* syncReferenceLayers 
*  browse-div? -> 
*    reference-layers? alter background
*    reference-list? alter background 
*    reference-folders? do nothing
*    map-list? do nothing 
*    map-folders?  do nothing
*  -PR
**/
function syncReferenceLayers() { 
    if (!$("#browse-div").is(':visible')) { 
	return; 
    }
    // browse-div is visible 
    var dl = ""; 
    if ($("#reference-layers").is(':visible')) { 
	dl = $("#reference-layers");
    } else if ($("#reference-list").is(':visible')) { 
        dl = $("#reference-list"); 
    } else { 
        return; // map-list, reference-folder, or map-folder is visible
    }

    if (map.layerIds.length === 1) { 
	return; // just basemap exists
    }

    // loop through list items, if li is !== -1, set color 
    var lookup = map.layerIds.slice(1); // everything but the basemap
    dl.children('li').each(function (index) { 
	if ($(this).children("span").length === 3 && 
            lookup.indexOf($(this).attr('data-lyr-name')) !== -1) 
        { 
            // Unfortunate naming means we loop through layerids to ensure exact match
            // "Seismic Earthquake Liquefaction" false positive with "Seismic Earthquake Liquefaction Potential"
            // ick. -PR
            if ($.inArray($(this).attr('data-lyr-name'), lookup) > -1) { 
               $(this)
 	          .css('background-color','rgba(102, 125, 102, 0.4)')
		  .prepend('<span class="ui-icon ui-icon-circle-check reference-circle-check"></span>');
            }
        }
    }); 
}

/***
*  returns true or false. checks map object, as fast as possible 
*/ 
function layerExists(layerName) { 
  return ($.inArray(layerName, map.layerIds, 1) > -1); // 1 skips basemap
}

/*
* takes the array of layerids, and rebuilds webmap operational layers 
*/
function savePreviousMap() { 
    previousMap = $.extend(true, {}, webmap); 
    previousMap.id = "prior"; 
    previousMap.title = "Previous Map"; 
    if (maps.length < 2) { 
	maps.push(previousMap); 
    }
}

function syncWebMap() { 

    var tp = [],
    // oracle is webmap object, map is modified accordingly.. 
    // visibility|opacity and attributes 
    layers = map.layerIds,
    ops = webmap.itemData.operationalLayers;
alert(layers);
alert(ops);
    webmap.item.extent = [[map.extent.xmin, map.extent.ymin],
			  [map.extent.xmax, map.extent.ymax],
			  {"wkid":map.extent.spatialReference.wkid}]; // update extent

    // sanity checks
    if ((typeof ops === "undefined" || typeof ops === null) || (typeof ops !== "undefined" && ops.length === 0)) { 
       for (var i in layers) { 
          if (layers[i] !== "layer0") { 
             map.removeLayer(map.getLayer(layers[i])); 
          }
       }
       return true;

    } else { 
       try { 
          ops = jQuery.unique(webmap.itemData.operationalLayers); 
          var oids = $.map(ops, function(el, i) { return el.id; }); 
          for (var i in layers) { 
             var id = layers[i] || "layer0";
             if (id !== "layer0" && $.inArray(id,oids) === -1) { 
                map.removeLayer(map.getLayer(id)); 
             } else if (id !== "layer0" && $.inArray(id, oids) !== -1) { 
                var lyr = map.getLayer(id); 

                /* @TODO fix opacity and extent after new map -PR */ 
                if (typeof lyr !== "undefined" || lyr !== null) { 
                   // webmap.itemData.operationalLayers[i]["opacity"] = lyr.opacity; 
                }
             }
          }
       } catch (err) { logger(err); }
        
       return true;
    }
}
/*
* Builds a layer list corresponding to reverse draw order 
* - Basemap is special, so the list is built from operational layers -PR
*
*/
function syncDetails() { 
    var t = [], 
    myreg = /^http:\/\/maps.indiana.edu\/ArcGIS\/rest\/services\/(.*)\/MapServer/i, 
    existenceCheck = []; 
    /* base map -PR */
    t.push({"title":webmap.itemData.baseMap.title,"id":"layer0"}); 
   
   var layersvis = map.getLayersVisibleAtScale(map.getScale());
  dojo.forEach(layers,function(layer){
    console.log(layer.id);
  });
   
    $.each(webmap.itemData.operationalLayers, function (index, lyr) { 
	if (existenceCheck.length > 0 && jQuery.inArray(lyr.id, existenceCheck) !== -1) { 

	} else { 
	    existenceCheck.push(lyr.id); 
	    t.push({"title":lyr.title,
		    "id":lyr.id,
		    "displayField":lyr.displayField,
		    "type":lyr.type,
		    "geometryType":lyr.geometryType,
		    "visibility":lyr.visibility,
		    "description":lyr.description}); 
        }
    });

    // reorder 
    for (var i = 1; i < t.length; i++)  { 
        map.reorderLayer(map.getLayer(t[i].id), i); 
    }
    /**
     * operational layers
     * The detail list is populated in reverse order of the layer ids
     */
    $("#detail-list").empty();
    $("#details-template")
       .tmpl(t.reverse())
       .appendTo("#detail-list");
    $(".detail-elements").hide(); 
    $("#detail-div, #detail-list").show();


    if ($.browser.mozilla) { 
       $("#detail-div-header").position({my:"top",at:"top",of:"#detail-div"});
    }


    $.each(webmap.itemData.operationalLayers, function (index, lyr) { 
        if (lyr.visibility == false) { 
    	   $("#"+lyr.id+"_detail-layer-visibility")
    	       .prop("checked", false)
    	       .closest('li').addClass("not-visible"); 
        }

        $("#"+lyr.id+"_detail-layer-visibility").change(function () { 

    	   try { 
    	       var id = $(this).closest('li').attr("data-lyr-id"); 
    	       var maplyr = map.getLayer(id),
    	           dtl = $(this).closest('li'),
    	           isChecked = $(this).prop("checked"); 
    	       if (isChecked && !maplyr.visible) { 
    		   maplyr.show(); 
    		   dtl.removeClass("not-visible").attr("data-lyr-visibility",true); 
    		   webmap.itemData.operationalLayers[index]["visibility"] = true; 
    		
    	       } else if (!isChecked && maplyr.visible) { 
    		   maplyr.hide(); 
    		   dtl.addClass("not-visible").attr("data-lyr-visibility",false); 
    		   webmap.itemData.operationalLayers[index]["visibility"] = false; 
    		
    	       }			

    	   } catch (err) { logger(err.message) }
        }); 
    }); 
	



         
    if ($("#detail-div").is(':visible')===false && scaffold["onload"] > 1) {
       $(".detail-elements").hide(); 
       $("#measurementDiv").hide(); 
       $("#detail-div, #detail-list").slideToggle('slow',setDivHeaders); 

    } else if (scaffold["onload"] < 2) { 
       /* what is this scaffold? */ 
       
       scaffold["onload"]++; 
       $("#detail-div").hide(); 

    } else if (scaffold["onload"] > 1 && $("#detail-div").is(":visible") === true) { 

       $("#detail-list").fadeIn('slow'); 
        
    }
     
}
/* 
*  Display lookup (find, browse) on map by adding graphic element
*/
function addGraphicToMap(geometry) { 

    toolbar.deactivate();
    drawEnd(); 
	
	
	if (graphicColor === "nothing") {
		
		graphicColor = "#000000"
		}
	
	;
	
	var myColor = dojo.colorFromHex(graphicColor);
	
	//alert(myColor);
	
	
	myNewColor = myColor.toRgb();
	//alert(myNewColor[0]);
var font = new esri.symbol.Font("20px", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLDER);
    if (geometry.type === "point") { 
        var symbol; 
        if (pointType === "CROSS") { 
            symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CROSS, 32,
							new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(graphicColor),2), new dojo.Color([myNewColor[0],myNewColor[1],myNewColor[2],0.25]));
							

	} else if (pointType === "PUSHPIN") { 
            symbol = new esri.symbol.PictureMarkerSymbol("http://static.arcgis.com/images/Symbols/Basic/GreenShinyPin.png",32,32); 
			symbol.setOffset(0, 8);
        } else if (pointType === "STICKPIN") { 
            symbol = new esri.symbol.PictureMarkerSymbol("http://static.arcgis.com/images/Symbols/Basic/GreenStickpin.png",32,32); 
			symbol.setOffset(0, 16);
        } else if (pointType === "TEXT") { 
            var userText = {"SingleLine":dojo.byId("userText").value};
			symbol = new esri.symbol.TextSymbol(dojo.byId("userText").value, font, [myNewColor[0],myNewColor[1],myNewColor[2],1]); 
			
			
        }

    } else if (geometry.type === "polyline") { 
	// alert(graphicColor);
	// var newColor = new dojo.colorFromHex(graphicColor);
	 //alert(newColor);
	var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(graphicColor), 1);
    } else if (geometry.type === "polygon") { 
	var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color(graphicColor), 2), new dojo.Color([myNewColor[0],myNewColor[1],myNewColor[2],0.25]));
    } else if (geometry.type === "extent") { 
	var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color(graphicColor), 2), new dojo.Color([myNewColor[0],myNewColor[1],myNewColor[2],0.25]));
    } else if (geometry.type === "multipoint") { 
	var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(graphicColor), 1), new dojo.Color([0,255,0,0.5]));
    } 

    var graphic = new esri.Graphic(geometry, symbol); 
    map.graphics.add(graphic); 
}

function activateEditToolbar(graphic) { 
    var tool = 0;
    tool = tool | esri.toolbars.Edit.MOVE | esri.toolbars.Edit.EDIT_VERTICES | esri.toolbars.Edit.SCALE | esri.toolbars.Edit.ROTATE;
    var options = { allowAddVertices: true, allowDeleteVertices: true }
    editToolbar.activate(tool, graphic, options); 
    $("#draw-delete-graphic-button").button().show().click(function() {
	if (currentEditGraphic !== null) {
	    editToolbar.deactivate();  
	    map.graphics.remove(graphic); 
	    $("#draw-delete-graphic-button").hide(); 
	}
    });
}


//////////////////////////////  Find and Query Map
function showResults(results) { 

  //symbology for graphics
  var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, 
       new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new dojo.Color(graphicColor), 1), 
       new dojo.Color([0, 255, 0, 0.25]));
  var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
  var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, 
       new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,new dojo.Color([255, 0, 0]), 2), 
       new dojo.Color({r:255,g:0,b:0,a:0.25}));

  //find results return an array of findResult.
  map.graphics.clear();
  dojo.forEach(results, function(result) {
    var graphic = result.feature;
    
    switch (graphic.geometry.type) {
    case "point":
      graphic.setSymbol(markerSymbol);
      break;
    case "polyline":
      graphic.setSymbol(lineSymbol);
      break;
    case "polygon":
      graphic.setSymbol(polygonSymbol);
      break;
    }
    map.graphics.add(graphic);
  });
}

function zoomToResult(results) { 
  // only choosing the top result to zoom
  try { 
      if (results[0]) {
	  if (results[0].feature.geometry.type === "point") { 
              map.centerAndZoom(results[0].feature.geometry,6);
	  } else { 
	      map.setExtent(results[0].feature.geometry.getExtent());  
	  }
      }
  } catch (err) { logger(err); }
}

// Query sublayer section
function queryCounty(q) { 
  try{
    var url = "http://maps.indiana.edu/ArcGIS/rest/services/Reference/PLSS_Counties/MapServer/0";
    queryTask = new esri.tasks.QueryTask(url); 
    query = new esri.tasks.Query(); 
    query.returnGeometry = false; 
    query.outFields = ["NAME_L"]; 
    query.text = q;
    queryTask.execute(query,showResults); 

  } catch (err) { logger(err); }
}

// Find section
function findCounty(q) { 
  try{
    // Add PLSS-Counties
    find = new esri.tasks.FindTask("http://maps.indiana.edu/ArcGIS/rest/services/Reference/PLSS_Counties/MapServer");
    params = new esri.tasks.FindParameters();
    params.returnGeometry = true; 
    params.layerIds = [0];
    params.searchText = q.toString();
    params.searchFields = ["NAME_L"];
    find.execute(params, showResults);
  } catch (err) { logger(err); }
}

function findPlace(q) { 
  try{
    // Add PLSS-Counties
    find = new esri.tasks.FindTask("http://maps.indiana.edu/ArcGIS/rest/services/Reference/Places_GNIS_USGS/MapServer");
    params = new esri.tasks.FindParameters();
    params.returnGeometry = true; 
    params.layerIds = [0];
    params.searchText = q.toString();
    params.searchFields = ["NAME"];
    find.execute(params, showResults);
  } catch (err) { logger(err); }
}
// Zoom section
function zoomCounty(q) { 
  try{
    // Add PLSS-Counties
    find = new esri.tasks.FindTask("http://maps.indiana.edu/ArcGIS/rest/services/Reference/PLSS_Counties/MapServer");
    params = new esri.tasks.FindParameters();
    params.returnGeometry = true; 
    params.layerIds = [0];
    params.searchText = q.toString();
    params.searchFields = ["NAME_L"];
    addList.length = 0; 
    find.execute(params, zoomToResult);
  } catch (err) { logger(err); }
}

function zoomPlace(q) { 
  try{
    find = new esri.tasks.FindTask("http://maps.indiana.edu/ArcGIS/rest/services/Reference/Places_GNIS_USGS/MapServer");
    params = new esri.tasks.FindParameters();
    params.returnGeometry = true; 
    params.layerIds = [0];
    params.searchText = q.toString();
    params.searchFields = ["PLACE"];
    addList.length = 0; 
    find.execute(params, zoomToResult);
  } catch (err) { logger(err); }
}

function zoomZip(q) { 
  try{
    find = new esri.tasks.FindTask("http://maps.indiana.edu/ArcGIS/rest/services/Reference/Zip_Codes_USCB/MapServer");
    params = new esri.tasks.FindParameters();
    params.returnGeometry = true; 
    params.layerIds = [0];
    params.searchText = q.toString();
    params.searchFields = ["ZCTA5"];
    addList.length = 0; 
    find.execute(params, zoomToResult);
  } catch (err) { logger(err); }
}

function zoomToMeasurementLocation() { 
    // Graphics are appended, so get the last in array
  try{ 
    var index = map.graphics.graphics.length - 1; 
    if (map.getLevel() >= 6) { 
	map.centerAndZoom(map.graphics.graphics[index].geometry,11);
    } else { 
	map.centerAndZoom(map.graphics.graphics[index].geometry,6);
    }
  } catch (err) { logger(err); }
}


function formatDate(value) { 
    var inputDate = new Date(value); 
    return dojo.date.locale.format(inputDate, {selector: 'date',datePattern: 'MMMM d, y'}); 
}

/* Hides extent changing buttons */ 
function drawStart() { 
    map.hideZoomSlider(); // because draw button press turns off
    $("#map-full-extent-button, #map-previous-extent-button, #map-next-extent-button, #map-zoom-in-button, #map-zoom-out-button").hide(); 
}

function drawEnd() { 
    map.showZoomSlider(); // because draw button press turns off
    $("#map-full-extent-button, #map-previous-extent-button, #map-next-extent-button, #map-zoom-in-button, #map-zoom-out-button").show(); 
}

function measureEnd(activeTool) { 
    // this.setTool(activeTool,false); 
	
    if (activeTool === "location") { 
	var index = map.graphics.graphics.length - 1; 
	var tml = "UTM Zone 16 NAD 83 [X,Y]&nbsp;<br />" + map.graphics.graphics[index].geometry.x + ",&nbsp;" + map.graphics.graphics[index].geometry.y + "<br /><button id='zoom-measurement-location-button' onclick='javascript:zoomToMeasurementLocation();'>Zoom To</button>"; 
        
        /* The measurement widget Lat Long is wrong, so we clear first */         
	$("#dijit_layout_ContentPane_1").empty().append(tml); 
	  

	outSR = new esri.SpatialReference({ wkid: 2966});
	geometryService.project([map.graphics.graphics[index].geometry ], outSR, function(projectedPoints) {
	    pt = projectedPoints[0];
	    var west = "<br /><br />Indiana State West NAD 83 (ftUS) [X,Y]<br />" + pt.x + ",&nbsp;" + pt.y; 
	    $("#dijit_layout_ContentPane_1").append(west); 
	});    
	  
	outSR = new esri.SpatialReference({ wkid: 2965});
	geometryService.project([map.graphics.graphics[index].geometry ], outSR, function(projectedPoints) {
	    pt = projectedPoints[0];
	    var east = "<br /><br />Indiana State East NAD 83 (ftUS) [X,Y]<br />" + pt.x + ",&nbsp;" + pt.y + "<br /><br />UTM Zone 16 NAD 83 [X,Y]&nbsp;<br />" + map.graphics.graphics[index].geometry.x + ",&nbsp;" + map.graphics.graphics[index].geometry.y; 
	    $("#dijit_layout_ContentPane_1").append(east); 
	});     
	//outSR = new esri.SpatialReference({ wkid: 26916});
	//geometryService.project([map.graphics.graphics[index].geometry ], outSR, function(projectedPoints) {
	   // pt = projectedPoints[0];
	    var utm = "<br /><br />UTM Zone 16 NAD 83 [X,Y]&nbsp;<br />" + map.graphics.graphics[index].geometry.x + ",&nbsp;" + map.graphics.graphics[index].geometry.y; 
	    $("#dijit_layout_ContentPane_1").append(utm); 
	//});  
	
    } else if (activeTool === "area") { 
        var index = map.graphics.graphics.length - 1,  
        tml = "<br /><br /><br /><span class='resultLabel'>Extent</span><br />[xmin, ymin, xmax, ymax]<br /><br />UTM Zone 16 NAD 83 (wkid:26916)<br />",  
        ext = map.graphics.graphics[index].geometry.getExtent(); 
        var utmmin = [ext.xmin,ext.ymin], utmmax = [ext.xmax,ext.ymax]; 
        tml += "["+ utmmin.join(",") + "<br />"+ utmmax.join(",") +"]";

	$("#dijit_layout_ContentPane_1").append(tml); 
	var outSR = new esri.SpatialReference({ wkid: 4326});
	geometryService.project([map.graphics.graphics[index].geometry.getExtent()], outSR, function(projectedExtent) {
	    var proj = projectedExtent[0];
	    var webMercator = "<br /><br />Latitude, Longitude (wkid:4326)<br />"; 
            var llmin = [proj.xmin,proj.ymin], llmax = [proj.xmax,proj.ymax]; 
            webMercator += "["+ llmin.join(",") + "<br />"+ llmax.join(",") +"]";
	    $("#dijit_layout_ContentPane_1").append(webMercator); 
	});     
    }
}

function initDetailButtons() { 
	// Detail Buttons
  //$("#detail-toc-button, #detail-draw-button, #detail-measurement-button, #detail-legend-button, #detail-bookmark-button, #detail-header-message, #detail-base-button").button();
    
  // @TODO for today: disable draw button
  // $("#detail-draw-button").button("option","disabled",true); 

	
	// Bookmark button onClick event
  $("#detail-bookmark-button").click(function () { 
		closeTabs($(this).attr('id'));
		idyn = "true";
  
		if (!$("#detail-div").is(":visible")) { 
  		$("#detail-div").slideToggle('slow', setDivHeaders);
  	}

  }); 



	// Current Layers button onClick event (OLD) -MD
  $("#detail-toc-button").click(
		function () { 
			//$(".detail-elements").hide();
			idyn = "true";
			//$("#measurement-list").hide();
			//$("#layer-header-button").click(); //open the layers menu
 			//$("#curLayersDiv").fadeIn(); //Turn on the current layers tab
			//$("#detail-list").fadeIn(); //turn on the current layers list
	
			// @TODO for today: disable draw button, and clear graphics
			//map.graphics.clear(); 
			//measurement.setTool("location",false); 
			//measurement.setTool("distance",false); 
			//measurement.setTool("area",false); 
	
			dojo.forEach(dojoConnections, dojo.disconnect);	
			dojoConnections.push(
				dojo.connect(
					map,"onClick",function(evt) { 
						editToolbar.deactivate(); 
						currentEditGraphic = null; 			
						// reset identify/bookmark collection
						doNotIdentify(evt); 
					}
				)
			);
	
			/*
			if (!$("#detail-div").is(":visible")) { 
				$("#detail-div").slideToggle('slow', setDivHeaders);
			} 
			*/
		}
	); 

	


	$("#get_query_samples").click(
		function() { 
			$('#query_samples')
				.find('option')
				.remove()
				.end()
				;
			var queryTask = new esri.tasks.QueryTask("http://maps.indiana.edu/arcgis/rest/services/" + ($("#query_activeLayers").val()) + "/MapServer/0");
			//alert("id" + id);
			//build query filter
			//alert("http://maps.indiana.edu/arcgis/rest/services/" + ($("#query_activeLayers").val()) + "/MapServer/0");
			var query = new esri.tasks.Query();
			var dirty = (new Date()).getTime();
			query.returnGeometry = true;
			query.outFields = ['*'];
			returnDistinctValues=true 
			query.where = "1=1 AND " + dirty + "=" + dirty;
			//execute query
			queryTask.execute(query,  function (results) {
				var selectedfield = $("#query_field").val();
				
				var featureSet = results;
				
				var numFeatures = featureSet.features.length;
				//alert("num" + numFeatures);
				//alert("id" + id);
				//alert(selectedfield);
				//QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the infowindow.
				var dataselectlist = document.getElementById("query_samples");
				//alert("here");
				for (var i=0; i<numFeatures; i++) {
					var graphic = featureSet.features[i];
					// alert(graphic.attributes.NAME_U);
					var Entry = document.createElement("option");
					//var selFieldString = new Object("graphic.attributes." + selectedfield);//"graphic.attributes." + selectedfield;
					//Entry.text = selFieldString;
					//var newarray = [];
					//newarray = 
					Entry.text = graphic.attributes[selectedfield];
					//alert(graphic.attributes[selectedfield]);
					//alert(Entry.text);
					dataselectlist.add(Entry ,null);
				}			
			});
	});



	$("#add_to_query_string").click(
		function() {	
			if ($("#query_field").val() !== ""){
				if ($("#query_field").val() === "esriFieldTypeInteger" || 
						$("#query_field").val() === "esriFieldTypeOID" || 
						$("#query_field").val() === "esriFieldTypeDouble") 
				{
					var qs = $("#query_field option:selected").text();	
					qs = qs + $("#query_operator").val();					
					if($('#query_samples').attr('disabled') != 'disabled'){
						qs = qs + $("#query_samples").val();
					}else{
						qs = qs + "" + $("#query_value").val() + "";
					}				
					$("#query_theQueryString").val(qs)	
				}	else {
					var qs = $("#query_field option:selected").text();
					qs = qs + $("#query_operator").val();
					if($('#query_samples').attr('disabled') != 'disabled'){
						qs = qs + "'" + $("#query_samples").val() + "'";
					}else{
						qs = qs + "'" + $("#query_value").val() + "'";
						//qs = qs + "'hello'";
					}
					
					$("#query_theQueryString").val(qs)
					//$('input[id=query_theQueryString]').val(qs);
				}
			} else {
				if ($.isNumeric($("#query_samples").val())) {
					var qs = $("#query_samples").val();
					qs = qs + $("#query_operator").val();
					//qs = qs + "'" + $("#query_samples").val() + "'";
					qs = qs + $("#query_value").val();
					$("#query_theQueryString").val(qs)
					//$('input[id=query_theQueryString]').val(qs);
				}	else {
					var qs = $("#query_samples").val();
					qs = qs + $("#query_operator").val();
					//qs = qs + "'" + $("#query_samples").val() + "'";
					qs = qs + "'" + $("#query_value").val() + "'";
					$("#query_theQueryString").val(qs)
				}
			}
		}
	);

	$("#execute_query").click(
		function() {
			if($('#query_theQueryString').val() !== ''){
				$('#queryResultsDiv').css('display','block');		
				$('#searchingQImg').css('display','block');				
				 doQuery($("#query_activeLayers").val());
			}else{
				alert('You must have a query to execute.');
			}
			//var queryTask = new esri.tasks.QueryTask("http://maps.indiana.edu/arcgis/rest/services/" + ($("#query_activeLayers").val()) + "/MapServer/0");
			//			//alert("id" + id);
			//      //build query filter
			//      var query = new esri.tasks.Query();
			//      query.returnGeometry = true;
			//      query.outFields = ['*'];
			//	  var dirty = (new Date()).getTime();
			//			var qstr = $("#query_theQueryString").val() + " AND " + dirty + "=" + dirty;
			//			query.where = qstr;
			//      //execute query
			//			//alert(qstr);
			//      queryTask.execute(query, showResults);	  
	});

	// When the Field select box changes, update the Samples select box -MD
	$("#query_field").change(
		function() {						
			if($(this).val() != ''){
				$('#query_samples,#queryValRadio1,#queryValRadio2,#query_operator').removeAttr('disabled'); //enable the Samples Select Box and Samples Radio Buttons -MD
				queryValRadio1.click(); //enable the Samples Select Box and Samples Radio Buttons -MD
			}else{
				$('#query_samples,#query_value,#queryValRadio1,#queryValRadio2,#query_operator').attr('disabled', 'disabled'); //disable the Samples section if an empty Field is chosen -MD
				$('#sampTxt1').css('color','#AAAAAA');
				$('#sampTxt2').css('color','#AAAAAA');
			}
		
			$('#query_samples')
				.find('option')
				.remove()
				.end();
				
			var queryTask = new esri.tasks.QueryTask("http://maps.indiana.edu/arcgis/rest/services/" + ($("#query_activeLayers").val()) + "/MapServer/0");
			//build query filter
			var query = new esri.tasks.Query();
			var dirty = (new Date()).getTime();
			query.returnGeometry = true;
			query.outFields = ['*'];
			query.where = "1=1 AND " + dirty + "=" + dirty;
			returnDistinctValues=true 
			
			//execute query
			queryTask.execute(query,  
				function (results) {
					var selectedfield = $("#query_field option:selected").text();					
					var featureSet = results;					
					var numFeatures = featureSet.features.length;					
					var dataselectlist = document.getElementById("query_samples");
					var uniqval;
					var values = [];
       				var testVals={};
					
					var features = results.features;
        dojo.forEach (features, function(feature) {
          uniqval = feature.attributes[selectedfield];
          if (!testVals[uniqval]) {
            testVals[uniqval] = true;
            values.push(uniqval);
          }
        });
				values.sort();
				
				 dojo.forEach (values, function(value) {
					var Entry = document.createElement("option"); 
					Entry.text = value;
				 dataselectlist.add(Entry ,null);
				 });
					
				//	//QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the infowindow.
//					for (var i=0; i<numFeatures; i++) {
//						var graphic = featureSet.features[i];
//						var Entry = document.createElement("option");
//						//var selFieldString = new Object("graphic.attributes." + selectedfield);//"graphic.attributes." + selectedfield;
//						//Entry.text = selFieldString;
//						//var newarray = [];
//						//newarray = 
//						Entry.text = graphic.attributes[selectedfield];
//						dataselectlist.add(Entry ,null);
//					}			
				}
			);
	});

	// The Samples Radio Button 	
	$('#queryValRadio1').click(
		function(){
			$('#query_samples').removeAttr('disabled'); //enable the Samples Select Box and Samples Radio Buttons -MD				
			$('#query_value').attr('disabled', 'disabled'); //disable the Samples Select box if an empty layer is chosen -MD
			$('#sampTxt1').css('color','#000000');
			$('#sampTxt2').css('color','#AAAAAA');
		}
	);

	// The Samples Radio Button 	
	$('#queryValRadio2').click(
		function(){
			$('#query_value').removeAttr('disabled'); //enable the Samples Select Box and Samples Radio Buttons -MD				
			$('#query_samples').attr('disabled', 'disabled'); //disable the Samples Select box if an empty layer is chosen -MD
			$('#sampTxt1').css('color','#AAAAAA');
			$('#sampTxt2').css('color','#000000');
		}
	);


	$("#query_activeLayers").change(
		function() {			
			if($(this).val() != ''){
				 $('#query_field,#add_to_query_string,#query_theQueryString,#execute_query').removeAttr('disabled'); //enable the Field Select Box
			}else{
				$('#query_field,#add_to_query_string,#query_theQueryString,#execute_query').attr('disabled', 'disabled'); //disable the Field Select box if an empty layer is chosen
			}
			
			// Disable the Samples section since a field is not yet chosen -MD
			$('#query_samples,#query_value,#queryValRadio1,#queryValRadio2,#query_operator').attr('disabled', 'disabled'); 
			$('#sampTxt1,#sampTxt2').css('color','#AAAAAA');
			
			$('#query_field')
				.find('option')
				.remove()
				.end()
				;
			$('#query_samples')
				.find('option')
				.remove()
				.end()
				;
			
			$('#query_field').append($('<option></option>').val('').html('Required'));// add the required option to the Field select box -MD
			
			var test = esri.request({
  			url: "http://maps.indiana.edu/ArcGIS/rest/services/" + ($(this).val()) +"/MapServer/0?f=json",
  			handleAs: "json"
			});		
				
				test.then(
					function (data) {
						
						console.log("Data: ", data);
					var fields = [];
					var startnum = 0;
					var stopnum = data.fields.length + 1;
							var stop = data.fields[startnum].name;
							while (startnum !== stopnum) { 
								fields.push(data.fields[startnum].name);
								startnum = startnum +1;
								var selectlist = document.getElementById("query_field");
									var Entry = document.createElement("option");
									var typeofentry = data.fields[startnum].type;
									Entry.text = data.fields[startnum].name;
									$("#query_field").append("<option value=" + typeofentry + ">" + Entry.text + "</option>");
									//selectlist.add(Entry ,null);
					
							}
								
										
					},
					function (error) {
						console.log("Error: ", error.message);
					}
				);


});




  
	
	$("#detail-back-button")
		.button({icons:{primary:"ui-icon-arrowthick-1-w"}})
		.click(
			function() { 
				if ($("#browse-data-detail-list").is(":visible")) { 
					// This causes problems, so draw graphics need own layer
					/*
						if (map.graphics.graphics[map.graphics.graphics.length-1] !== undefined) { 
							maps.graphics.remove(map.graphics.graphics[map.graphics.graphics.length-1]); 
						}
					*/
					
					map.graphics.clear(); 
	
					$("#detail-list, #browse-data-detail-list").hide(); 
					$("#browse-data-list, #detail-filter-search, #detail-filter-search-button").show(); 					
						
				} else if ($("#browse-data-list").is(":visible")) { 
					$(".detail-elements").hide(); 
					$("#measurementDiv").hide();
					$("#detail-list").show(); 									
					if ($("#detail-back-button").is(":visible")) { 	$("#detail-back-button").fadeOut(); 	}
				} else if ($("#bookmark-detail-list").is(":visible")) {
					$(".detail-elements").hide(); 
					$("#measurementDiv").hide();
					$("#bookmark-list").show(); 					
					if ($("#detail-back-button").is(":visible")) {  $("#detail-back-button").fadeOut(); }
				}
			}
		)  
		.hide();

  
	
	$("#detail-close-button")
  	.button({icons:{primary:"ui-icon-closethick"}})
    .click(
			function() { 
	    	// @TODO for today: disable draw button, and clear graphics
	    	map.graphics.clear(); 
	    	$("#detail-div").slideToggle('slow', setDivHeaders);
        $("#detail-filter-search, #detail-filter-search-button").hide(); 
				idyn = "true";
			}
		)    
    .show(); 

	
	
	$("#detail-filter-search-button")
		.button()
    .hide(); 

  
	
	$("#detail-filter-search").keydown(
		function(event){
	  	if (event.keyCode === 13) {
				$("#detail-filter-search-button").click();
	    } else if (event.keyCode === 40) { 
				// $("#browse-data-list").focus(); 
	    }
		}
	);
}


function activateDrawButton(id){
		$(id).css('background-color','#999');
}


function initDraw() { 
	// Draw buttons
  $("#draw-pushpin-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.POINT);
		dojo.disconnect(firstConnect);
		pointType = "PUSHPIN"; 
		toggleDrawTool('draw-point','ptTogImg','draw-pushpin-button');
		drawStart(); 
  });
  
	$("#draw-stickpin-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.POINT);
		dojo.disconnect(firstConnect);
		pointType = "STICKPIN"; 
		toggleDrawTool('draw-point','ptTogImg','draw-stickpin-button');
		drawStart(); 
		activateDrawButton("#draw-stickpin-button");
  });
	
  
	$("#draw-cross-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.POINT);
		dojo.disconnect(firstConnect);
		pointType = "CROSS";
		toggleDrawTool('draw-point','ptTogImg','draw-cross-button'); 
		drawStart(); 
  });
	
	$("#draw-buffer-button").button().click(function() {
		firstConnect = dojo.connect(map, "onClick", doBuffer);
		toolbar.activate(esri.toolbars.Draw.POINT);
		
    
		
  });
 
  $("#draw-text-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.POINT);
		dojo.disconnect(firstConnect);
		pointType = "TEXT"; 
		drawStart(); 
  });

  $("#draw-polyline-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.POLYLINE);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-line','lineTogImg','draw-polyline-button');
		drawStart(); 
  });
  
	$("#draw-freehand-polyline-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.FREEHAND_POLYLINE);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-line','lineTogImg','draw-freehand-polyline-button');
		drawStart(); 
  });
  
	$("#draw-rectangle-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.RECTANGLE);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-rectangle-button');
		drawStart(); 
  });
  
	$("#draw-left-arrow-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.LEFT_ARROW);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-left-arrow-button');
		drawStart(); 
  });
  
	$("#draw-right-arrow-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.RIGHT_ARROW);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-right-arrow-button');
		drawStart(); 
  });
  
	$("#draw-up-arrow-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.UP_ARROW);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-up-arrow-button');
		drawStart(); 
  });
  
	$("#draw-down-arrow-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.DOWN_ARROW);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-down-arrow-button');
		drawStart(); 
  });

  $("#draw-multipoint-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.MULTI_POINT);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-multipoint-button');
		drawStart(); 
  });

  $("#draw-polygon-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.POLYGON);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-polygon-button');
		drawStart(); 
  });

  $("#draw-freehand-polygon-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.FREEHAND_POLYGON);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-freehand-polygon-button');
		drawStart(); 
  });

  $("#draw-triangle-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.TRIANGLE);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-triangle-button');
		drawStart(); 
  });
  
	$("#draw-circle-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.CIRCLE);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-circle-button');
		drawStart(); 
  });
  
	$("#draw-ellipse-button").button().click(function() {
		toolbar.activate(esri.toolbars.Draw.ELLIPSE);
		dojo.disconnect(firstConnect);
		toggleDrawTool('draw-area','areaTogImg','draw-ellipse-button');
		drawStart(); 
  });
}

function setDivHeaders() { 
	if ($.browser.mozilla) { 
  	$("#detail-div-header").position({my:"top",at:"top",of:"#detail-div"});    
		$("#browse-div-header").position({my:"top",at:"top",of:"#browse-div"});   
  }
}



var closeTabs = function (id){
	var leftButtons = "#layer-header-button,#ActiveLayersButton,#detail-legend-button,#detail-basemap-button",
			rightButtons = "#detail-share-button,#detail-query-button,#detail-draw-button,#detail-measurement-button,#detail-identify-button",
			leftTabs = "#browse-div,#curLayersDiv,#legend-list,#baseMaps_05",
			rightTabs = "#shareDiv,#queryDiv,#draw-list,#measurementDiv";		
	
	if(jQuery.inArray('#'+id,leftButtons.split(',') ) >= 0){	
		$(leftTabs).hide();
		$(leftButtons).css('background', 'rgb(151,168,151)');	
	}else{
		$(rightTabs).hide();
		$(rightButtons).css('background', 'rgb(151,168,151)');
		
		measurement.setTool("location",false); 
		measurement.setTool("distance",false); 
		measurement.setTool("area",false);
		dojo.forEach(dojoConnections, dojo.disconnect);				
	}
}





// Set navigation attributes
function initNavButtons() { 
	$("#toc-header-button")
  	.attr('checked','true') 
		.click(function(){
    	// $("#legend-div, #draw-div, #measurement-div").hide();
      // $("#detail-list, #legend-list, #browse-data-list, #browse-data-detail-list, #measurement-list, #draw-list, #detail-back-button").hide(); 
	    $(".detail-elements").hide(); 
	    $("#measurementDiv").hide();
      $("#detail-list").show(); 

      if (!$("#detail-div").is(":visible")) { 
	    	$("#detail-div").slideToggle('slow', setDivHeaders); 
      } else { 
		  	$("#detail-div").slideToggle('slow');
			}
	  });

    // Headers fly off to corner in Firefox, position seems simplest to fix
    // setDivHeaders();
    //$("#wanker-buttons").position({my:"left",at:"right",of:"#IndianaMapLogo",offset:"850 -33"});

  $("#map-full-extent-button")
  	//.position({my:"top",at:"bottom",of:"#IndianaMapLogo",offset:"-55 -525"})
		.fadeIn()
		.click(function() { map.setLevel(0); })


  $("#map-previous-extent-button")
  	//.position({my:"top",at:"bottom",of:"#IndianaMapLogo",offset:"-70 -565"})
		.fadeIn()
		.click(function() { navToolbar.zoomToPrevExtent(); }); 
  
	$("#map-next-extent-button")
  	//.position({my:"top",at:"bottom",of:"#IndianaMapLogo",offset:"-35 -565"})
		.fadeIn()
		.click(function() { navToolbar.zoomToNextExtent(); });
  
	$("#map-zoom-in-button")
  	//.position({my:"top",at:"bottom",of:"#IndianaMapLogo",offset:"-20 -100"})
		.fadeIn()
		.click(function() { map.setLevel((map.getLevel() + 1));  });
  
	$("#map-zoom-out-button")
  	//.position({my:"top",at:"bottom",of:"#IndianaMapLogo",offset:"-20 -520"})
		.fadeIn()
		.click(function() { var lvl = (map.getLevel() - 1); (lvl > 0) ? map.setLevel(lvl) : map.setLevel(0); });

  /*
	$("#IndianaMapLogo").click(
		function() { 
  		if ($("#browse-div").is(':visible')) { $("#browse-div").fadeToggle('fast'); } 

			$("#site-menu-div").fadeToggle(); 
		}); 
	*/
	
	$("#browse-header-buttons")
		.buttonset()
		//.position({my:"left center",at:"right center",of:"#IndianaMapLogo",collision:"fit",offset:"30 0"})
    .fadeIn('slow'); 
    
	$("#map-header-button").button("option", "disabled", false); 

  $("#detail-header-buttons")
		.buttonset()
		//.position({my:"left center",at:"right center",of:"#IndianaMapLogo",collision:"fit",offset:"780 0"})
    .fadeIn('slow'); ; 

  $("#searchbox")
		//.position({my:"left center",at:"right center",of:"#IndianaMapLogo",collision:"fit",offset:"350 0"})
    .fadeIn('slow'); 
    
	//$("#searchbutton").position({of:$("#searchbox"),at:"right center",offset:"-20 0"}); 












	



	
	$("#detail-identify-button").click(
		function(){
			closeTabs($(this).attr('id'));	
			//$(this).css('background', 'rgb(139,166,170)');
			$(this).css('background', 'rgb(17,61,67)');
			idyn = "true";
			
			dojoConnections.push(
				dojo.connect(
					map,"onClick",function(evt) { 
						editToolbar.deactivate(); 
						currentEditGraphic = null; 
						// reset identify/bookmark collection
						identifyClick(evt); 
					}
				)
			); 
		}
	)



	$("#ActiveLayersButton").click(
		function(){
			var shown = $("#curLayersDiv").is(':visible');
			closeTabs($(this).attr('id'));
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD		
				$("#curLayersDiv").hide('slow'); //hide the active layers tab
			}else{
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
				$("#curLayersDiv").fadeIn('slow'); //hide the active layers tab 
			}			
		}
	)


	$("#detail-basemap-button").click(
		function(){
			var shown = $("#baseMaps_05").is(':visible');
			closeTabs($(this).attr('id'));
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD		
				$("#baseMaps_05").hide('slow'); //hide the active layers tab
			}else{
				$("#baseMaps_05").fadeIn('slow'); //hide the active layers tab
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
			}			
		}
	)

	/* Reset the map back to it's default -MD */
	$("#detail-reset-button").click(
		function(){
			var r = confirm("This will reset your map to the default. Are you sure?");
			if(r == true){
				/*
				closeTabs($(this).attr('id'));
				closeTabs($(this).attr('id'));
				map.graphics.clear(); 
				
				$("#detail-identify-button").click(); //Turn on the Identiy Tool -MD
				
				var sLayerList = window.localStorage.getItem("layerGallery");	// Get the current active layer list -MD
				sLayerList = sLayerList.split(",");
				
				$.each(sLayerList, 
					function(key, value){
						value = value.replace('_','/');
						if(value != '') { map.removeLayer(window[value]);} // Remove the layer from the map itself -MD
					}			
				);
				
				idArray = []; // Reset the Query Tool Array
				populateQuery() // Reset the Query Tool
				
				$('#curLayersSection').html(''); // Remove all layers from the Active Layers tab -MD
				$('#activeCount').html('') // Set the number of active layers to none on the active layers tab -MD
				
				$('input:checkbox').removeAttr('checked'); // Uncheck all checkboxes -MD
				
				alert('Your Map has been reset.');	// Tell the user teir map is reset -MD
				*/
				
				window.localStorage.clear(); // Clear the local storage. -MD	
				document.location.href='/';
				
			}
		}
	)

	
	$("#detail-share-button").click(
		function (){ 	
			var shown = $("#shareDiv").is(':visible');	
			closeTabs($(this).attr('id'));
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD		
				$("#shareDiv").hide('slow'); //hide the active layers tab -MD
				$("#detail-identify-button").click(); //Turn on the Identiy Tool -MD
			}else{
				$("#shareDiv").fadeIn('slow'); //show the active layers tab -MD
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
				idyn = "false"; // Turn the Identity Tool off -MD
			}
			
			var mapcenter = map.extent.getCenter();
			var x = mapcenter.x;
			var y = mapcenter.y;
			var z = map.getZoom();
			
			if(isGTIE8){	
			var sLayerList = window.localStorage.getItem("layerGallery");
			}
			
			var tokens = idArray.join(",");
			
			
	
			
			var n = tokens.replace(/\//g,'_')
			//alert(n);
			//var base = $( "#basemapGalleryDiv" ).getSelected(); 
			//console.log(base);
			//http://dev2.maps.indiana.edu/index.html?x=541383&y=4336026&z=12
			var urllink = "http://maps.indiana.edu/index.html?x=" + x + "&y=" + y + "&z=" + z + "&sBasemap=" + selectedBasemap.id + "&URLLayers=" + n;
			shortenUrl(urllink);
			$('#detailedURLLink').val(urllink).select();
			
			map.graphics.clear();
		}
	)
	
	
	$('#detailedURLLink,#shortLink').click(function(){$(this).select()});	// When a box is clicked in the share tab, automatically select it. -MD 


	// Draw button onClick event -MD
	$("#detail-draw-button").click(
		function () { 		
			var shown = $("#draw-list").is(':visible');	
			closeTabs($(this).attr('id'));
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD			
				$("#draw-list").hide('slow'); //hide the active layers tab -MD
				$("#detail-identify-button").click(); //Turn on the Identiy Tool -MD
					dojo.forEach(dojoConnections, dojo.disconnect);	
			}else{
				$("#draw-list").fadeIn('slow'); //show the active layers tab -MD
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
				idyn = "false"; // Turn the Identity Tool off -MD
			}
			map.graphics.clear(); 
			
			
			//dojo.forEach(dojoConnections, dojo.disconnect);	
			dojoConnections.push(
				dojo.connect(
					map.graphics,"onClick", function(evt) {
						dojo.stopEvent(evt);
						activateEditToolbar(evt.graphic); 
						currentEditGraphic = evt.graphic;
					}
				)
			); 
			
			dojoConnections.push(dojo.connect(toolbar, "onDrawEnd", addGraphicToMap)); 
			dojoConnections.push(
				dojo.connect(
					map,"onClick",function(evt) { 
						editToolbar.deactivate(); 
						currentEditGraphic = null; 
						// reset identify/bookmark collection
						identifyClick(evt); 
					}
				)
			); 
		}
	); 

	
	
	// Measure Tool button onClick event -MD
	$("#detail-measurement-button").click(
		function() { 		
			//dojo.forEach(dojoConnections, dojo.disconnect);	
			var shown = $("#measurementDiv").is(':visible');	
			closeTabs($(this).attr('id'));
			
			var tml2 = "Select tool above then click map once to activate.  Double click to finish."
			$("#dijit_layout_ContentPane_1").empty().append(tml2); 
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD				
				$("#measurementDiv").hide('slow'); //hide the active layers tab -MD
				$("#detail-identify-button").click(); //Turn on the Identiy Tool -MD
			}else{
				$("#measurementDiv").fadeIn('slow'); //show the active layers tab -MD
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
				idyn = "false"; // Turn the Identity Tool off -MD
			}
			
			map.graphics.clear(); 
			//dojo.forEach(dojoConnections, dojo.disconnect);
		}
	); 


	
	// Legend button onClick event -MD
	$("#detail-legend-button").click(
		function() { 		
			var shown = $("#legend-list").is(':visible');	
			closeTabs($(this).attr('id'));   			
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD			
				$("#legend-list").hide('slow'); //hide the active layers tab -MD
				//$("#detail-identify-button").click(); //Turn on the Identiy Tool -MD
			}else{
				$("#legend-list").fadeIn('slow'); //show the active layers tab -MD
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
				//idyn = "false"; // Turn the Identity Tool off -MD
			} 
			var numlays  = map.layerIds.length;
			var layersin = []; // will be a snapshot of layer order before reordering
			for(var j = numlays; j > 0; j--) {
			//for(var j = numlays; j > 0; j--) {
				//alert(map.layerIds[j]);
				if(typeof map.layerIds[j]!='undefined'){	
				//if (map.layerIds[j] !== NULL){
				
				layersin.push(map.getLayer(map.layerIds[j]));
				}
			}   
			
			$("#legendBody").empty(); 
			
			map.graphics.clear(); 
			//alert(layersin[lyr].id);
			for (var lyr in layersin) { 	 
			//var leglyrs = layersin[lyr].replace('_', '/');  
			if (layersin[lyr].id !== "layer1"){
				esri.request({
					url:'http://maps.indiana.edu/arcgis/rest/services/' + layersin[lyr].id + '/mapserver/legend',
					content:{f:"json"},
					callbackParamName:"callback",
					load: function(data) {
						if (data.layers) { 
							for (var sub in data.layers) { $("#legend-item-template").tmpl(data.layers[sub]).appendTo("#legendBody");} //Add the legend field using the Legend template found in index.html. Comment by -MD Code by -PR
						}
					},			
					error:esriConfig.defaults.io.errorHandler
				});
			}
			} 
		}
	); 


	// Query button onClick event -MD
	$("#detail-query-button").click(
		function () { 	
			var shown = $("#queryDiv").is(':visible');		
			closeTabs($(this).attr('id')); 				
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD						
				$("#queryDiv").hide('slow'); //hide the active layers tab
				$("#detail-identify-button").click(); //Turn on the Identiy Tool -MD
				map.graphics.clear(); 
			}else{
				$("#queryDiv").fadeIn('slow'); //show the active layers tab
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
				idyn = "false"; // Turn the Identity Tool off -MD
			}    
			
			map.graphics.clear();
		}
	); 

  
	// Add Content Button -MD
	$("#layer-header-button").click(
		function(){
			var shown = $("#browse-div").is(':visible');
			closeTabs($(this).attr('id')); // Close the left Tabs
			if(shown){
				$(this).css('background', 'rgb(151,168,151)'); // We do it this way instead of changing classes because of IE9 -MD		
				$("#browse-div").hide('slow'); //hide the active layers tab
			}else{
				$("#browse-div").fadeIn('slow'); //hide the active layers tab
				$(this).css('background', 'rgb(17,61,67)');
				//$(this).css('background', 'rgb(139,166,170)');
			}			
			
			//The below section used to be for the layer search feature in the Add Content Tab created by Paul Rhower. Deprecated. -MD							
			$("#map-filter-search")
			.attr("placeholder","Search for layers...")
			.autocomplete({
				minLength: 2,
				source: 
					data,
					delay: 50,
					search: function(event, ui) { 
						$("#reference-folders, #reference-back-button, #reference-layers").hide(); 
						$("#reference-list, #folder-name").empty().show();  
						$("#map-folder-button")
							.show()
							.live("click", 
								function (e) { 
									e.preventDefault(); 
									$("#map-filter-search").val(''); 
									$("#map-folder-button, #reference-back-button").hide();
									$("#reference-list, #reference-layers").empty().hide();
									$("#reference-folders").show();
								}
							); 
					}
			})
		}
	);

//
	$("#searchCloseButton").click(
		function(){
				$("#searchContainer").hide();
				map.graphics.clear(); 
		}
	)
	
//		

















    /*
    * Saves current map as previous map if no map title is given
    *
    */ 
    $("#new-map-header-button").click(function() { 
        /*
        *  if current webmap has no operational layers, just reset
        */
        if (maps.length === 0) { 
           fetchMaps(); 
        }


        if (currentMap > 0) { 
           // check for initial map
            if (maps[0].title === "Initial Map" && maps[0].itemData.operationalLayers.length === 1) { 
                currentMap = 0;  
                webmap = maps[0]; 
                initMap(webmap); 

            } else { 
                /* copy first map */ 
                var copy = jQuery.extend(true, {}, maps[0]); /* copy current */
                if (webmap.item.title === "Initial Map") { 
                   copy.label = copy.title = copy.item.title = "Prior Map " + (maps.length); 
                } else { 
                   copy.label = copy.title = copy.item.title = webmap.item.title;
                }   
                copy.id = 1; 
                maps.splice(1,0,copy);  
                maps.forEach(function (element, index, array) { element.id = index }); /* reset ids */
                resetMyMap(); 
            }
        } else if (currentMap === 0 && map.layerIds.length === 1) { 

           // reset first li in map list
           var li = $("#map-list li:first"), title = "Initial Map"; 
           li.find('.input-reference-title, .rename-enter-button').remove();
           li.find('span.reference-title').text(title).fadeIn(); 

           resetMyMap();

        } else if (currentMap === 0 && map.layerIds.length > 1) { 
           var copy = jQuery.extend(true, {}, webmap); /* copy current */
           if (webmap.item.title === "Initial Map") { 
              copy.label = copy.title = copy.item.title = "Prior Map " + (maps.length); 
           } else { 
              copy.label = copy.title = copy.item.title = webmap.item.title;
           }

           copy.id = 1; 
           maps.splice(1,0,copy);  
           maps.forEach(function (element, index, array) { element.id = index }); /* reset ids */
           resetMyMap(); 
        } 

        $("#map-list").empty(); 
        $("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 
        // update autocomplete data source
        $("#map-filter-search").autocomplete("option","source",maps); 

    }); 


    $("#map-header-button").click(function(){
        if (maps.length === 0) { 
           fetchMaps(); // on ie, localhost has no localstorage 
        }

        var mapCategorys = []; 
        mapCategorys.push({name:"My Maps"}); 
        $("#folder-name").empty().text("My Maps"); 


        if ($("#browse-div").is(':visible') && $("#map-list").is(':visible')) { 
            $("#browse-div").slideToggle('slow', setDivHeaders);        

        } else if ($("#browse-div").is(':visible')) { 
            $("#reference-list, #reference-folders, #reference-layers").hide(); 
            // Update Text
            $("#folder-category").empty().text("Maps"); 

            if (maps.length === 1 && typeof maps[0].id === "undefined") {
                maps[0].id = 0; 
            }

            if (maps.length === 1 && typeof maps[0].title === "undefined") { 
                maps[0].title = maps[0].label = "Initial Map";
            }

            $("#map-filter-search")
                .attr("placeholder","Search for maps...")
                .keydown(function (event) { /* @TODO not getting called */ 
                   var isOpen = $(this).autocomplete("widget").is(":visible");
                   var keyCode = $.ui.keyCode;
                   if (isOpen && (event.key === keyCode.UP || event.keyCode === keyCode.Down)) {
                      event.stopImmediatePropagation(); 
                   }
                })
	        .autocomplete({
	           minLength: 2,
	           source: maps,
                   delay: 50,
                   search: function(event, ui) {  $("#map-list").empty() }
	        })
	        .data("autocomplete")._renderItem = function (ul, item) { 
		       $("#map-list-template")
                         .tmpl(maps[item.id])
		         .appendTo("#map-list");
	        };

            $("#map-title, #map-filter-search, #map-list").show(); 
  
            $("#map-folder-button").button({text:false }).hide(); 
            $("#map-list").empty(); 



            $("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 

            // My Maps is a folder, so show back button 
            // @TODO unhide
            $("#reference-back-button")
               .hide()
               .click(function() { 
                  $(this).hide();  
                  $("#map-list").empty();
                  $("#map-folder-template").tmpl(mapCategorys).appendTo("#map-list").fadeIn();
                  $("#map-list")
                     .click(function() { 
                         $("#map-list").empty();
                         $("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 
                     });
               }); 


            setDivHeaders(); 

        } else { 
            $("#reference-list, #reference-folders, #reference-layers").hide(); 
            $("#folder-category").empty().text("Maps"); 
            $("#map-title, #map-filter-search, #map-list").show(); 
            $("#map-folder-button").button({text:false }).hide(); 


            if (maps.length === 1 && typeof maps[0].id === "undefined") {
                maps[0].id = 0; 
            }

            if (maps.length === 1 && typeof maps[0].title === "undefined") { 
                maps[0].title = maps[0].label = "Initial Map";
            }

            $("#map-filter-search")
                .attr("placeholder","Search for maps...")
                .keydown(function (event) { /* @TODO not getting called */ 
                   var isOpen = $(this).autocomplete("widget").is(":visible");
                   var keyCode = $.ui.keyCode;
                   if (isOpen && (event.key === keyCode.UP || event.keyCode === keyCode.Down)) {
                      event.stopImmediatePropagation(); 
                   }
                })
	        .autocomplete({
	           minLength: 2,
	           source: maps,
                   delay: 50,
                   search: function(event, ui) {  $("#map-list").empty() }
	        })
	        .data("autocomplete")._renderItem = function (ul, item) { 
		       $("#map-list-template")
                         .tmpl(maps[item.id])
		         .appendTo("#map-list");
	        };


            $("#map-list").empty().show(); 
            $("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 


            // My Maps is a folder, so show back button
            // @TODO unhide
            $("#reference-back-button")
               .hide() 
               .click(function() { 
                  $(this).hide();  
                  $("#map-list").empty();
                  $("#map-folder-template").tmpl(mapCategorys).appendTo("#map-list").fadeIn();
                  $("#map-list")
                     .click(function() { 
                         $("#map-list").empty();
                         $("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 
                     });
                         
               }); 
            $("#browse-div").slideToggle('slow', setDivHeaders);

					}
    		});







}

function removeReferenceSelection(o) { 
    $(o)
	.css("background-color","")
	.children(".ui-icon-circle-check")
	.remove();			
}


/*
* This is called after displayField is retrieved, so use cached object
*
*/

function filterDetail(tt,id) { 

    var lyr = map.getLayer(id); 
    esri.request({
	url:lyr.url+'/0',
	content:{f:"json"},
	callbackParamName:"callback",
	load: function(data) {
	    var query = new esri.tasks.Query(), 
	    displayField = data.displayField; 

	    query.where = displayField + " like '%"+ tt + "%'"; 
	    query.outFields = [displayField];
	    query.returnGeometry = true; 
	    var featureLayer = new esri.layers.FeatureLayer(lyr.url+'/0',
							    {
								mode: esri.layers.FeatureLayer.MODE_SELECTION,
								visible: false,
								maxAllowableOffset: maxOffset(map,20)
							    }); 

	    featureLayer.queryFeatures(query, function(featureSet) { 
		featureSet.features.sort(function(a,b){
		    var aString = a.attributes[displayField];
		    var bString = b.attributes[displayField];
		    if (aString < bString) { return -1 } else if (aString > bString) { return 1 } else { return 0 };
		});

		browseFeatures = featureSet.features; 
		var items = [];

		dojo.forEach(featureSet.features, function(feature) { 
		    items.push({"UNIQUE":feature.attributes[displayField]}); 
		}); 

		$("#browse-data-list").empty();
		$("#browse-data-template")
		    .tmpl(items)
		    .appendTo("#browse-data-list"); 

		$("#detail-list").hide();
		$("#browse-data-list").show();

		$("#browse-data-list > li")
		    .live({
			click: function () { 
			    $("#detail-filter-search, #detail-filter-search-button").hide(); 

			    // use the currentBrowseGraphic geometry to zoom into the area. 
			    var ind = $(this).index(), ext;
			    if (browseFeatures[ind].geometry.type === "polygon") { 
				ext = browseFeatures[ind].geometry.getExtent();
				map.setExtent(ext,true); 
			    } else if (browseFeatures[ind].geometry.type === "polyline") { 
				ext = browseFeatures[ind].geometry.getExtent();
				map.setExtent(ext,true); 
			    } else if (browseFeatures[ind].geometry.type === "point") { 
				map.centerAndZoom(browseFeatures[ind].geometry,6); 
			    }			

			    var fieldArray = [], fieldList = "", displayFieldType = ""; 
			    $(featureLayer.fields).each(function (index, field) { 
				if (field.type === "esriFieldTypeString" || 
				    field.type === "esriFieldTypeInteger" || 
				    field.type === "esriFieldTypeDouble" || 
				    field.type === "esriFieldTypeDate" || 
				    field.type === "esriFieldTypeSmallInteger") 
				{
				    if (field.name === featureLayer.displayField) { 
					displayFieldType = field.type; 
				    }
				    fieldArray.push('"'+field.name+'"'); 

				}
			    });  

			    fieldList = fieldArray.join(","); 
			    var q = new esri.tasks.Query(); 

			    if (displayFieldType === "esriFieldTypeString") {
				q.where = featureLayer.displayField +" = '"+ browseFeatures[ind].attributes[featureLayer.displayField]  +"'"; 		
			    } else { 
				// TODO: deal with date type in display field
				q.where = featureLayer.displayField +" = "+ browseFeatures[ind].attributes[featureLayer.displayField]; 		
			    }

			    q.outFields = [fieldList];
			    q.returnGeometry = false; 
			    var queryTask = new esri.tasks.QueryTask(lyr.url+'/0');
			    dojo.connect(queryTask,"onComplete", function(set) { 
				try { 
				    var det = [], fieldCount = 0;

				    for (var key in set.features[0].attributes) { 
					if (set.fields[fieldCount].type === "esriFieldTypeOID") { 
					    // Should we print or not? 

					} else if (set.fields[fieldCount].type === "esriFieldTypeDate") { 
					    var dt = formatDate(set.features[0].attributes[key]),
						ky = set.fieldAliases[key] || key; 
					    
					    det.push({"key":ky,"value":dt});
					} else {  
					    var ky = set.fieldAliases[key] || key; 
					    det.push({"key":ky,"value":set.features[0].attributes[key]});
					}
					fieldCount++; 
				    }
				} catch (err) { logger("filter detail error: " + err.message); }
				
                                $("#browse-data-detail-list").empty();  
				$("#browse-data-detail-template").tmpl(det).appendTo("#browse-data-detail-list"); 
				$("#browse-data-list").hide(); 
				$("#browse-data-detail-list").fadeIn('fast');

			    }); 
			    queryTask.execute(q); 

			},
			mouseenter: function(){ 
			    var ind = $(this).index();
			    
			    var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,20,
										  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
														   new dojo.Color([255,140,0]), 2.5), 
										  new dojo.Color([0,50,200,0.05]));
			    
			    var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,50,200,0.25]), 2.5);
			    var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, 
										 new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
														  new dojo.Color([255,140,0]), 2.5),
										 new dojo.Color([0,50,200,0.25]));

			    if (browseFeatures[ind].geometry.type === "polygon") { 
				currentBrowseGraphic = new esri.Graphic(browseFeatures[ind].geometry,polygonSymbol,browseFeatures[ind].attributes,""); 
			    } else if (browseFeatures[ind].geometry.type === "polyline") { 
				currentBrowseGraphic = new esri.Graphic(browseFeatures[ind].geometry,lineSymbol,browseFeatures[ind].attributes,""); 
			    } else if (browseFeatures[ind].geometry.type === "point") { 
				currentBrowseGraphic = new esri.Graphic(browseFeatures[ind].geometry,markerSymbol,browseFeatures[ind].attributes,""); 
			    }
			    map.graphics.add(currentBrowseGraphic); 
			},
			mouseleave: function(){ 
			    map.graphics.remove(currentBrowseGraphic); 
			} 
		    }); 

		$("#detail-back-button").show();
				
	    }); 
	},
	error:esriConfig.defaults.io.errorHandler
    });
}


/// Drag'n Drop section - from ESRI sample

function setupDropZone() {
  if (!window.File || !window.FileReader) {
    /*
    var msg = "This browser does not support HTML5 APIs required to read files from your desktop." + "<br/><a href='http://caniuse.com/' target='_blank'>When can I use?</a>";

    console.error(msg);
    var dialogBox = new dijit.Dialog({
      title: "Unsupported Browser",
      content: msg,
      style: "width: 300px; font-size: 12px;"
    });
    dialogBox.show();
    */
    return;
  }


  var node = dojo.byId("map");
  dojo.connect(node, "dragenter", function(evt) {
    evt.stopPropagation(); 
    evt.preventDefault();
  });
  dojo.connect(node, "dragover", function(evt) {
    evt.stopPropagation(); 
    evt.preventDefault();
  });
  dojo.connect(node, "drop", handleDrop);

  //var dropZone = document.getElementById("draw-selected-graphic"); 
  //dropZone.addEventListener('dragover',function(evt){evt.preventDefault();},false); 
 // dropZone.addEventListener('drop',handleImageDrop,false); 
}

function handleImageDrop(evt) { 
    evt.stopPropagation(); 
    evt.preventDefault();
    var dataTransfer = evt.dataTransfer,
    files = dataTransfer.files,
    types = dataTransfer.types;

    if (files && files.length === 1) { 
	var file = files[0]; 

        if (file.type.indexOf("image/") !== -1) { 
	    var reader = new FileReader();
            var image = document.createElement('img'); 
            image.src = ""; 
            reader.imageElt = image;
            reader.onloadend = handleReaderOnLoadEnd;
            reader.readAsDataURL(file); 
        }
    }
}

function handleReaderOnLoadEnd(event) { 
    var image = this.imageElt; 
    image.src = this.result;
    image.height = 64; 
    image.width = 64; 
    logger(image.height); 
    var dialogBox = new dijit.Dialog({
      title: "Your Image",
      content: image,
      style: "width: 300px; font-size: 12px;"
    });
    dialogBox.show();

    //document.getElementById("draw-selected-graphic").appendChild(image); 
}

function handleDrop(evt) {
  evt.stopPropagation(); 
  evt.preventDefault();

  var dataTransfer = evt.dataTransfer,
      files = dataTransfer.files,
      types = dataTransfer.types;


  // File drop?
  if (files && files.length === 1) {
    var file = files[0]; // 1 file read

    if (file.type.indexOf("image/") !== -1) {
	handleImage(file, evt.layerX, evt.layerY);
    } else if (file.name.indexOf(".csv") !== -1) {
	handleCsv(file);
    } else if (file.name.indexOf(".json") !== -1 || file.name.indexOf(".js") !== -1) { 
	handleJSON(file); 
    } else if (file.type.indexOf("text/plain") !== -1) { 
	handleTxt(file); 
    }
  }
  // Textual drop?
  else if (types) {
    /* console.log("[ TYPES ]");
     console.log("  Length = ", types.length);
    dojo.forEach(types, function(type) {
      if (type) {
          console.log("  Type: ", type, ", Data: ", dataTransfer.getData(type));
      }
    });
    */
    // We're looking for URLs only.
    var url;

    dojo.some(types, function(type) {
      if (type.indexOf("text/uri-list") !== -1) {
        url = dataTransfer.getData("text/uri-list");
        return true;
      } else if (type.indexOf("text/x-moz-url") !== -1) {
        url = dataTransfer.getData("text/plain");
        return true;
      } else if (type.indexOf("text/plain") !== -1) {
        url = dataTransfer.getData("text/plain");
        url = url.replace(/^\s+|\s+$/g, "");

        if (url.indexOf("http") === 0) {
          return true;
        }
      }
      return false;
    });

    if (url) {
      url = url.replace(/^\s+|\s+$/g, "");
      // Check if this URL is a google search result.
      // If so, parse it and extract the actual URL
      // to the search result
      if (url.indexOf("www.google.com/url") !== -1) {
        var obj = esri.urlToObject(url);
        if (obj && obj.query && obj.query.url) {
          url = obj.query.url;
        }
      }

      if (url.match(/MapServer\/?$/i)) {
        // ArcGIS Server Map Service?
        handleMapServer(url);
      } else if (url.match(/(Map|Feature)Server\/\d+\/?$/i)) {
        // ArcGIS Server Map/Feature Service Layer?
        handleFeatureLayer(url);
      } else if (url.match(/ImageServer\/?$/i)) {
        // ArcGIS Server Image Service?
        handleImageService(url);
      }
    }
  }
}

function handleImage(file, x, y) {
  // console.log("Processing IMAGE: ", file, ", ", file.name, ", ", file.type, ", ", file.size);
  var reader = new FileReader();

  reader.onload = function() {
    // console.log("Finished reading the image");
    // Create an image element just to find out the image
    // dimension before adding it as a graphic
    var img = dojo.create("img");

    img.onload = function() {
      var width = img.width,
          height = img.height;

      // Add a graphic with this image as its symbol
      var symbol = new esri.symbol.PictureMarkerSymbol(reader.result, width > 64 ? 64 : width, height > 64 ? 64 : height);
      var point = map.toMap(new esri.geometry.Point(x, y));
      var graphic = new esri.Graphic(point, symbol);
      map.graphics.add(graphic);
    };

    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}


function handleMapServer(url) {

    if (/maps\.indiana\.edu/.test(url)) { 
	var srv = "maps.indiana.edu", 	    
	myreg = /^http:\/\/maps.indiana.edu\/ArcGIS\/rest\/services\/(.*)\/MapServer/i;  
	var match = myreg.exec(url); 	
	if (match != null && match[1]) {
	    var nme = match[1].split('/'), id = match[1], slash = match[1];  
	    for (var i in servers[srv]) { 
		if (servers[srv][i]["folder"] == nme[0]) { 
		    for (var svc in servers[srv][i]["services"]) { 
			if (servers[srv][i]["services"][svc]["url"].indexOf(id) !== -1) { 
			    id = (id.match(/\//g)) ? id.replace(/\//g,'_') : id; // forward slash is a no-no	  
		            var opt = {}; 
		            opt.id = id; 
		            opt.url = url; 
			    opt.title = servers[srv][i]["services"][svc]["title"];
			    opt.visibility = servers[srv][i]["services"][svc]["visibility"] || true; 
			    opt.opacity = servers[srv][i]["services"][svc]["opacity"] || 1; 
			    opt.displayField = servers[srv][i]["services"][svc]["displayField"] || ""; 
			    opt.type = servers[srv][i]["services"][svc]["type"] || ""; 
			    opt.geometryType = servers[srv][i]["services"][svc]["geometryType"] || ""; 
			    opt.description = servers[srv][i]["services"][svc]["description"] || ""; 
		            initWebMapLayer(opt);
			}
		    }
		}
	    }
	}

    } else { 
	// var layer = new esri.layers.ArcGISDynamicMapServiceLayer(http://gis.uits.iu.edu/arcgis/rest/services/ISDP/las_tiles/MapServer, { opacity: 0.75 });
	// var layer = new esri.layers.ArcGISTiledMapServiceLayer(url);
	// map.addLayer(layer);
	var myreg = /^http:\/\/(.*)\/ArcGIS\/rest\/services\/(.*)\/MapServer/i; 
	var match = myreg.exec(url); 
	if (match != null && match[1] && match[2]) { 
	    var id = match[1].replace(/\//g,'_').replace(/\./g,'_') + '_' + match[2].replace(/\//g,'_').replace(/\./g,'_'); 
	    var title = match[2].replace('/','_').replace('.','_'); 
	    
	    // We get a url, and make assumption its a mapserver. 
	    esri.request({
		url:url+'/0',
		content:{f:"json"},
		callbackParamName:"callback",
		load: function(data) {	
		    var opt = {}; 
		    opt.id = id; 
		    opt.url = url; 
		    opt.title = title; 
		    opt.visibility = true; 
		    opt.opacity = 0.75; 
		    opt.displayField =  data.displayField || ""; 
		    opt.type = data.type || ""; 
		    opt.geometryType = data.geometryType || ""; 
		    opt.description = data.description || ""; 
		    initWebMapLayer(opt);
		}
	    }); 
	}
    }

  // TODO sync(); 
}

function handleFeatureLayer(url) {
  var layer = new esri.layers.FeatureLayer(url, {
    opacity: 0.75,
    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
    infoTemplate: new esri.InfoTemplate(null, "${*}")
  });
  map.addLayer(layer);
  // TODO sync(); 
}

function handleImageService(url) {
  var layer = new esri.layers.ArcGISImageServiceLayer(url, {opacity: 0.75});
  map.addLayer(layer);
  // TODO: sync(); 
}

function handleCsv(file) {
  // console.log("Processing CSV: ", file, ", ", file.name, ", ", file.type, ", ", file.size);

  var reader = new FileReader();
  reader.onload = function() {  processCsvData(reader.result); };

  reader.readAsText(file);
}

function handleJSON(file) {
  var reader = new FileReader();
  reader.onload = function(e) {  processJsonData(e.target.result); };
  reader.onerror = function(stuff) { logger("error", stuff); }
  reader.readAsText(file);    
}

function handleTxt(file) {
    var reader = new FileReader();
    reader.onload = function(e) {  processTxtData(e.target.result); };
    reader.onerror = function(stuff) { logger("error", stuff); }
    reader.readAsText(file); 
}

function processJsonData(data) { 
    var map = jQuery.parseJSON(data); 
    initMap(map); 
}

function processTxtData(data) {
    var csvStore = new dojox.data.CsvStore({
	data: data
    }); 
    csvStore.fetch({
	onComplete: function(items, request) { 
	    dojo.forEach(items, function (item, index) { 
		var attrs = csvStore.getAttributes(item),
		attributes = {};
		dojo.forEach(attrs, function(attr) {
		    var url = csvStore.getValue(item, attr);
		    handleMapServer(url); 
		});

	    }); 
	}, 
	onError: function(error) {
	    logger("Error fetching items from CSV store: ", error);
	}
    }); 
}


function processCsvData(data) {
  // This method makes some assumptions about the format
  // of data stored in CSV but its quite straight-forward
  // to generalize the logic
  var csvStore = new dojox.data.CsvStore({ data: data });
  var dataLayer = new esri.layers.GraphicsLayer();   // Create a graphics layer for CSV data
  map.addLayer(dataLayer, 20);

  csvStore.fetch({
    onComplete: function(items, request) {
	var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_X, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0, 0.75]), 4.5));
	var infoTemplate = new esri.InfoTemplate(null, "${*}");


      // Add records in this CSV store as graphics
      dojo.forEach(items, function(item, index) {
        var attrs = csvStore.getAttributes(item),
            attributes = {};

        // Read all the attributes for  this record/item
        dojo.forEach(attrs, function(attr) {
          attributes[attr.toLowerCase()] = csvStore.getValue(item, attr);
        });

        var latitude = parseFloat(attributes.latitude);
        var longitude = parseFloat(attributes.longitude);


        if (isNaN(latitude) || isNaN(longitude)) {
          return;
        }
	var inSR = new esri.SpatialReference({wkid: 4326}); 
	var point = new esri.geometry.Point(longitude, latitude, inSR),
	  outSR = new esri.SpatialReference({wkid: 26916}); 

	  var graphic = map.graphics.add(new esri.Graphic(point.geometry, browseGraphics.markerSymbol, attributes, infoTemplate));	   
	  geometryService.project([graphic], outSR);     
      });

      // Zoom to the collective extent of the data
      var multipoint = new esri.geometry.Multipoint(new esri.SpatialReference({wkid: 26916}));
      dojo.forEach(dataLayer.graphics, function(graphic) {
        var geometry = graphic.geometry;
        if (geometry) {
          multipoint.addPoint({
            x: geometry.x,
            y: geometry.y
          });
        }
      });

      if (multipoint.points.length > 0) {
        map.setExtent(multipoint.getExtent(), true);
      }
    },


    onError: function(error) {
      logger("Error fetching items from CSV store: ", error);
    }
  });
}



// This is the identify click. -JP 
function identifyClick(evt) { 
	if (idyn != "false") {
		identifyCache = [];
		var find = []; 
		map.infoWindow.hide();
		for(var j = 0; j < idArray.length; j++) {	
			//for (var lyr2 in idArray) {
			var ie8var = idArray[j];
			var ie8var2 = ie8var.toString(); 
			//alert(idArray);
			var url = 'http://maps.indiana.edu/arcgis/rest/services/' + ie8var2 + '/MapServer'
			//alert(url);
			find[j] = new esri.tasks.IdentifyTask(url);
	
			identifyParams = new esri.tasks.IdentifyParameters();
			identifyParams.geometry = evt.mapPoint;
			identifyParams.mapExtent = map.extent;
			identifyParams.tolerance = 3;
			identifyParams.returnGeometry = true;
			identifyParams.layerIds = [0];
			identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
			identifyParams.width  = map.width;
			identifyParams.height = map.height;
			var name = find[j];
			
			//alert("yes");
			find[j] = name.execute(identifyParams, function(results) { 
				//alert(results.length);

				identifyCache.push(results); 
				//logger(webmap.itemData.operationalLayers.length +" "+ identifyCache.length);
				if (idArray.length === identifyCache.length) { 
					if (identifyCache.length > 0){
						populateBookmarkList(evt); 
					}		
				}		
			});
		}
	 	//map.infoWindow.setFeatures(identifyCache);	
		// results should be returned as json
	}
}




// Creates the content for the identify tool. -JP
/*
* Works with identifyCache array and webmap bookmarks array
*/
function populateBookmarkList(evt) { 
	bookmarkArray = []; /* TODO: rethink this extension to webmap (saving to bookmarkItems */  
	map.infoWindow.setFeatures(bookmarkArray);
  // identifyCache is an array of arrays, tough to work with
  // so we'll flatten here: 
  if (identifyCache.length > 0) { 
		for (var i in identifyCache) { 
	    if (identifyCache[i].length > 0) { 
				for (var j in identifyCache[i]) {
		   		var newvar1 = j.toString();
		   		if (j != "indexOf") {
						var feature = identifyCache[i][j].feature;
		  			var layerName =identifyCache[i][j].layerName;
					
					if (layerName.length === 0){
						var featureAttributes = feature.attributes;
						for (att in featureAttributes) {
							if (att.match(/Elevation_Feet/)) {
								feature.attributes.layerName = "LiDAR Color Hillshade";
							}
							else {feature.attributes.layerName = "Raster Data";}
						}
						
						//alert("here");
						//feature.attributes.layerName = "LiDAR Color Hillshade";
		  			//feature.attributes.layerName =identifyCache[i][j].layerName;
					
					}
					else {
						feature.attributes.layerName =identifyCache[i][j].layerName;
					
					}
		 				var s = "";
		  			var featureAttributes = feature.attributes;
						s += "<table class='queryResultsTable' cellspacing=0 border=0><tr><th colspan='2'>"+feature.attributes.layerName+"</th></tr>"; // Create the Header Line and start a section. -MD
						for (att in featureAttributes) {
							//if (att.match(/Pixel Value/)) {
								
 								//s += "<tr><td align='left' style='border:0px !important;'>&nbsp;</td><td>Elevation (ft)</td><td>" + featureAttributes[att] + "</td></tr>";
							//}
							
							//else if (featureAttributes[att].match(/http.*/)) {
							if (featureAttributes[att].match(/http.*/)) {
 								s += "<tr><td align='left' style='border:0px !important;'>&nbsp;</td><td>" + att + "</td><td><a href='" + featureAttributes[att] + "'target='=blank'>" + featureAttributes[att] + "</td></tr>";
							} else {
								s += "<tr><td align='left' style='border:0px !important;'>&nbsp;</td><td>" + att + "</td><td>" + featureAttributes[att] + "</td></tr>"; // Create a record. -MD 
							}
						}
						s += "</table><hr />";	
		  			var infoTemplate = new esri.InfoTemplate('Attributes', s);
		  			feature.setInfoTemplate(infoTemplate);
		  			bookmarkArray.push(feature); 
		   		}
				}
	    }
    }
  }
	
	map.infoWindow.setFeatures(bookmarkArray);
	map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
}


function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
    	if (o.hasOwnProperty(key)) {
    		a.push(key);
    	}
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
    	sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

function displayHover(o,i) { /* object, index */ 
    try { 
	if (o[i].geometry.type === "polygon" && o[i].geometry.spatialReference.wkid != 26916) { 
            var outSR = new esri.SpatialReference({ wkid: 26916});
	    browseGraphics.currentBrowseGraphic = new esri.Graphic(o[i].geometry,browseGraphics.polygonSymbol,o[i].attributes,""); 
	    var graphic = map.graphics.add(browseGraphics.currentBrowseGraphic); 
	    geometryService.project([graphic], outSR);     

        } else if (o[i].geometry.type === "polygon") { 
	    browseGraphics.currentBrowseGraphic = new esri.Graphic(o[i].geometry,browseGraphics.polygonSymbol,o[i].attributes,""); 
	    map.graphics.add(browseGraphics.currentBrowseGraphic); 

	} else if (o[i].geometry.type === "polyline" && o[i].geometry.spatialReference.wkid != 26916) { 
            var outSR = new esri.SpatialReference({ wkid: 26916});
	    geometryService.project([o[i].geometry], outSR, function(projected) {
		pt = projected[0];
		browseGraphics.currentBrowseGraphic = new esri.Graphic(pt.geometry,browseGraphics.lineSymbol,o[i].attributes,""); 
		map.graphics.add(browseGraphics.currentBrowseGraphic); 
	    });     


	} else if (o[i].geometry.type === "polyline") { 
	    browseGraphics.currentBrowseGraphic = new esri.Graphic(o[i].geometry,browseGraphics.lineSymbol,o[i].attributes,""); 
	    map.graphics.add(browseGraphics.currentBrowseGraphic); 

	} else if (o[i].geometry.type === "point" && o[i].geometry.spatialReference.wkid != 26916) { 
            var outSR = new esri.SpatialReference({ wkid: 26916});
	    geometryService.project([o[i].geometry], outSR, function(projectedPoints) {
		pt = projectedPoints[0];
		browseGraphics.currentBrowseGraphic = new esri.Graphic(pt.geometry,browseGraphics.markerSymbol,o[i].attributes,""); 
		map.graphics.add(browseGraphics.currentBrowseGraphic); 
	    });     
	    

	} else if (o[i].geometry.type === "point") { 
            
            if (typeof o[i].attributes !== "undefined" && o[i].attributes !== null &&
                typeof o[i].attributes.locatorName !== "undefined" && o[i].attributes !== null) 
	    { 

              browseGraphics.currentBrowseGraphic = new esri.Graphic(o[i].geometry,browseGraphics.locatorHoverSymbol,o[i].attributes,""); 
            }
            else 
            { 
	      browseGraphics.currentBrowseGraphic = new esri.Graphic(o[i].geometry,browseGraphics.markerSymbol,o[i].attributes,""); 
            }

	    map.graphics.add(browseGraphics.currentBrowseGraphic); 
	}
    } catch (err) { 
	/* I'm seeing geometry undefined errors on occasion */
	logger(err.message); 
    }
}

function showLocatorResults(candidates) { 

	 if (candidates.length < 1) { 
			 // @todo handle null results
			 return;
	 }

	 var geom, j = 0, c = [], 
	 sym = new esri.symbol.SimpleFillSymbol(simpleFill);

	 for (var i in candidates) { 
			if (candidates[i].score > 65) { 
				 c.push(candidates[i]);
			}
	 }

	 c.sort(function(a, b) { 
			var aScore = a["score"], bScore = b["score"];
			if (aScore < bScore) { 
				 return 1; 
			} else if (aScore > bScore) { 
				 return -1;
			} else { 
				 return 0; 
			}
	 });

	 var res = ""; 
	 var counter = 1;
	 
	 for (var i in c) { 
	  if (i != "indexOf") {
			if(counter > 1) counter = 0;
			if(counter == 1){
				res += "<tr style='background-Color:rgba(255, 255, 255, 0.5);' data-y='"+ c[i].location.y; 
			}else{
				res += "<tr data-y='"+ c[i].location.y; 
			}
			res += "' data-x='"+ c[i].location.x +"'>"; 
			res += "<td>"+ c[i].address +"</td>";
			//res += "<td>"+ c[i].attributes.User_fld +"</td>";
			//res += "<td>"+ c[i].score +"</td>";
			res += "</tr>";
			counter++;
	  }
	 }
	 

	 //$(".details, #scales, #selectToolBox, #zoomToolBox, .submenu > li").hide();
	 $("#searches, #scales, #welcomeMessage").show();
	 //$("#map").removeClass("grid_12").addClass("grid_8");
	 $("#queryTableBody").empty().append(res);
	 $("#searchContainer").fadeIn(); 
	 map.resize();
	 map.reposition();
	 map.graphics.clear(); 
}


/***
 * TODO: save to webmap, push to remote logger, etc.
 */ 
function logger(options) { 
    if (typeof webmap !== "undefined" && webmap !== null) { 
	if (typeof webmap.log === "undefined") {
            webmap.log = []; 
        }
        webmap.log.push(options); 
    }
}


// http://diveintohtml5.org/storage.html
function supportsLocalStorage() { 
    try { 
	return ('localStorage' in window && window['localStorage'] !== null); 
    } catch (e) { 
	return false; 
    }
}

// Global webmap pushed to local storage
function saveMapState() { 
    /****    
     * @TODO 1.2 webmap spec will need to adjust webmap test below
     */
    try { 
	if (!supportsLocalStorage() || 
            (webmap.itemData.operationalLayers.length === 0)) 
	{ 
	    if (typeof maps === "undefined" || maps === null) { 
		fetchMaps(); /* ensure maps is populated */
            } 
	    return false; 
	}

        /* currentMap is index into maps object */ 
	maps[currentMap] = webmap;
        maps[currentMap].item.extent = [[map.extent.xmin, map.extent.ymin],[map.extent.xmax,map.extent.ymax],{"wkid":26916}]; 
        saveMyMaps();

    } catch (err) { 
       logger("Error saving webmap"); 
       return false; 
    }
}

/***
* This resumeMapState needs to fail fast 
* to let an initial empty basemap be added
* either returns false if no indianamaps saved
* or sets maps object and webmap from storage, 
* then returns true 
**/
function resumeMapState() { 
    if (!supportsLocalStorage()) { return false; } 
    try { 
	if (!window.localStorage["indianamaps"]) { 
           return false; 
        } else { 
           maps = jQuery.parseJSON(window.localStorage["indianamaps"]);
           if (typeof maps !== "undefined" && maps !== null && maps.length > 0) { 
               webmap = maps[0]; 
           }

           return true; 
        }
    } catch (err) { 
        return false; 
    } 
    return false; /* should never reach here */ 
}

/***
* CRUD functions for maps an [] of webmap
* - created or read on init, then populates in memory array (i know).  C
*   compared to tiles, a couple webmap documents is probably okay    
* - displayed in list, so reference by index - R
* - in memory array, updates and deletes saved to localStorage               
*/
function fetchMaps() { 
    if (!supportsLocalStorage()) { return false; } 
    try { 
	if (!window.localStorage["indianamaps"]) { 
           // push current webmap 
           webmap.id = 0; 
           webmap.title = webmap.item.title || "Initial Map"; // 1.0 spec
           webmap.label = webmap.item.title || "Initial Map"; // 1.0 spec
           webmap.category = "My Maps"; 
           maps.push(webmap); // an empty array at this point
           saveMyMaps(); 
  
        } else if (typeof maps !== "undefined" && maps !== null && maps.length > 0) { 
           return true; /* maps is alive */ 
    

        } else { 
           // Set an in-memory array called maps
           maps = jQuery.parseJSON(window.localStorage["indianamaps"]);
           if (maps.length > 0) { 
	      webmap = maps[currentMap]; 
              initMap(webmap); 

           } else { 
	      webmap.id = 0; 
	      webmap.title = webmap.item.title; // 1.0 spec
              webmap.label = webmap.item.title; // 1.0 spec
              webmap.category = "My Maps"; 
              maps.push(webmap); 
              saveMyMaps();
           }
            
        }
        return true; 
    } catch (err) { 
       logger("Error fetching indianaMaps"); return false; 
    } 
}

function saveMyMaps() { 
   if (!supportsLocalStorage()) { return false; } 
   try { 
       window.localStorage["indianamaps"] = JSON.stringify(maps);
       return true; 
   } catch (err) { 
       logger("Error fetching indianaMaps"); 
       return false; 
   } 
}

function deleteMyMaps() { 
   if (!supportsLocalStorage()) { return false; } 
   try { 
       // this is harsh, but works too
       window.localStorage.clear(); 
       window.localStorage.removeItem("indianamaps"); 
       return true; 
   } catch (err) { 
       return false; 
   } 
}


function watchAndRemove(id) { 
    try {       
	var timerId = null,  
	    myPollToRemove = function pollToRemove() { 
		try { 
		    if (map.getLayer(id)) { 
			map.removeLayer(map.getLayer(id)); 
			clearInterval(timerId); 
		    }
		} catch (err) { logger(err.message);  } 
	    }; 
	timerId = setInterval(myPollToRemove, 1000); 
    } catch (err) { 
	logger(err.message); 
    }
}


	


function checkThenSync(layer) { 
var curInd = map.getLayer("overlay");

var lenInd = map.layerIds.length;					
					//if (curInd !== lenInd) {map.reorderLayer(curInd,lenInd)};
map.reorderLayer(curInd,lenInd)
 //map.reorderLayer(mil,i); 
	/***
   *  clear addlist and searchbox
  */	
//	if (layer.loaded) {	 
//		var labels = [];
//		var lods = layer.tileInfo.lods;
//    for (var i=0, il=lods.length; i<il; i++) { labels[i] = lods[i].scale;  }
//    
//		esri.config.defaults.map.sliderLabel = {
//    	tick: 0,
//      labels: labels,
//      style: "width:2em; font-family:Verdana; font-size:65%; color:#fff; padding-left:2px;"
//    };
//
//	} else { }
//	 	 
//  $("#searchbox").val(''); 
//	$("#"+(layer.id).replace('/','_')+"_reference").removeClass("inFlight"); 
//	$("#reference-list").children($("#"+(layer.id).replace('/','_')+"_reference")).removeClass("inFlight"); 
//  sync(); 
}

function checkRemove(layer) { 
	$("#"+(layer.id).replace('/','_')+"_reference").removeClass("inFlight"); 
  $("#reference-list").children($("#"+(layer.id).replace('/','_')+"_reference")).removeClass("inFlight"); 
  sync(); 
}

/*
*  layergallery local storage 
*/

function checkForLayerGallery() { 
    if (window.location.hash.length <= 0) { 
      try { 
        items = window.localStorage.getItem("layerGallery") || []; 
        
	if (items.length > 0) { 
            lyrs = items.split(","); 
	    for (var i in lyrs) 
            { 
		initWebMapLayer(layerMap[lyrs[i]]); 
            }
        }
      } catch (err) { 
	logger(err); 
      }
    }
}

/***
*  utility method called when delete map conditions met
*  or *future* usefulness
*  - clears operational layers
*  - reset extent and basemap
*  - saveMyMaps
*/
function resetMyMap() { 
    
    webmap.log = [];
    webmap.id = 0; 
    webmap.label = webmap.title = "Initial Map"; 
    webmap.category = "My Maps";
    webmap.item = {
	    "title": "Initial Map",
	    "snippet": "IndianaMap",
	    "extent":[[235308,4180000],[980000,4583385],{"wkid":26916}]  
    }; 
    webmap.itemData = {
       "operationalLayers":[],
       "baseMap":{
          "title":"Shaded Relief - Basemaps",
          "baseMapLayers": [{ 
	     "url":"http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Shaded_Relief/MapServer",
             "opacity":1,
             "visibility":true,
             "type":"Raster",
             "description":"Shaded Relief Basemap, (2006) - A scale-dependent basemap that combines the 2006 digital elevation model with selected transportation and other layers",
              "geometryType":"None"}]}
    };
   
    // Rather than initMap(webmap) 
    // remove all operational layers, add basemap, set fullExtent
    // catch the error if arcgis type error thrown
    try { 
       map.removeAllLayers(); 
    } catch (err) { 
       logger(err); 
    }
    var options = {};
    // @TODO detail menu resetting
    options.url = webmap.itemData.baseMap.baseMapLayers[0].url; 
    options.title = webmap.itemData.baseMap.title; 
    options.description = webmap.itemData.baseMap.baseMapLayers[0]["description"] || ""; 
    options.type = webmap.itemData.baseMap.baseMapLayers[0].type || "Raster"; 
    options.opacity = 1; 
    options.id = 'layer0';
    initWebMapLayer(options);          
    map.setLevel(0);

}

function changeMyMap(webmap) { 
    webmap.log = [];
    webmap.id = webmap.id; 
    webmap.label = webmap.title; 
    webmap.category = "My Maps";
    webmap.item = {
	    "title": webmap.title,
	    "snippet": "IndianaMap",
	    "extent":[[235308,4180000],[980000,4583385],{"wkid":26916}]  
    }; 
    // Rather than initMap(webmap) 
    // remove all operational layers, add basemap, set fullExtent
    // catch the error if arcgis type error thrown
    try { 
       map.removeAllLayers(); 
    } catch (err) { 
       logger(err); 
    }
    var options = {};
    // @TODO detail menu resetting
    options.url = webmap.itemData.baseMap.baseMapLayers[0].url; 
    options.title = webmap.itemData.baseMap.title; 
    options.description = webmap.itemData.baseMap.baseMapLayers[0]["description"] || ""; 
    options.type = webmap.itemData.baseMap.baseMapLayers[0].type || "Raster"; 
    options.opacity = 1; 
    options.id = 'layer0';
    initWebMapLayer(options);          
    map.setLevel(0);
    
    webmap.itemData.operationalLayers.forEach(function (element, index, array) { 
	initWebMapLayer(element);
    });
}


function initMenuButtons() { 
  $("#printMenuForm").dialog({
    autoOpen: false,
    height: 300,
    width: 550,
    modal: true,
    zIndex: 900,
    title: 'Print Menu',
    buttons: { 
      Cancel: function() { $( this ).dialog( "close" );	}
    },
    close: function() {	/*allFields.val( "" ).removeClass( "ui-state-error" ); */ }
  });



  $("#exportMenuForm").dialog({
    autoOpen: false,
    height: 380,
    width: 550,
    modal: false,
    zIndex: 900,
    title: 'Export Menu',
    buttons: { 
      Cancel: function() { $( this ).dialog( "close" );	}
    },
    close: function() {	/*allFields.val( "" ).removeClass( "ui-state-error" ); */ }
  });
	
  $("#exportButton")
     .button()
     .click(function (e) { 
        e.preventDefault();
        var exportchoice = $("#exportType option:selected").val() || 'json', 
            guid = generateMapKey(),
            titleText = $("#exportMapTitle").val() || " ";
	if (titleText === "Initial Map" || titleText.length < 2) { 
           titleText = guid;
        }  
	titleText = titleText.replace(/ /g,'-').replace(/\'/g,'').replace(/\//g,'').replace(/\\/g,'').replace(/\"/g,'');

  /* fetch the web map - set on export click */
  try { 
  	var wm = webmap; 
    if (exportchoice === "json") { 
  		wm = convertWebMap(wm); 
	    $("#exportResultClipBoard").val(JSON.stringify(wm)).focus();
      $("#exportMenu, #exportResult").toggle(); 
    } else if (exportchoice === "hyperlink") { 
    	wm = convertWebMap(wm);
 	    dto = { "title": titleText, "map": JSON.stringify(wm), "mapid": guid}; 
      esri.request({
				"url":"http://bl-geoy-crinoid.ads.iu.edu:8888/",
				"content": dto,
				"load":function(data) { logger(data); }
			},{usePost:true}); 
	  
			$("#exportResultClipBoard").val("http://maps.indiana.edu/?mapid="+guid).focus();
    	$("#exportMenu, #exportResult").toggle(); 
		} else if (exportchoice === "embeddable") { 
    	wm = convertWebMap(wm);
	    dto = { "title": titleText, "map": JSON.stringify(wm), "mapid": guid}; 
      esri.request({
      	"url":"http://bl-geoy-crinoid.ads.iu.edu:8888/",
		    "content": dto,
		    "load":function(data) { logger(data); }
      },{usePost:true}); 
      var embedurl = "http://maps.indiana.edu/embeddedViewer.html?mapid="+guid;
      embedurl += "&extent="+ wm.mapOptions.extent.xmin+","+ wm.mapOptions.extent.ymin 
      embedurl += ","+ wm.mapOptions.extent.xmax +","+ wm.mapOptions.extent.ymax; 
      var iframe = '<iframe frameborder="0" scrolling="no" width="500" height="700" src="'+embedurl+'"></iframe>';
	    $("#exportResultClipBoard").val(iframe).focus();
      $("#exportMenu, #exportResult").toggle(); 
    } else if (exportchoice === "kml") { 
	    /* build a string that is a basic kml file of network links */ 
			var kml = '<?xml version="1.0" encoding="utf-8"?>'; 
					kml += '<kml xmlns:atom="http://www.w3.org/2005/Atom" xmlns="http://www.opengis.net/kml/2.2">'
					kml += '<Document>';
					kml += '<name>IndianaMap.kml</name>';
					kml += '<open>1</open>';
			for (var lyr in wm.itemData.operationalLayers) { 
					kml += '<NetworkLink>';
					kml += '<open>1</open>';
					kml += '<name>'+wm.itemData.operationalLayers[lyr]['title'].replace('-','')+'</name>';
					kml += '<Url><viewRefreshMode>onRequest</viewRefreshMode>';
					kml += '<href>'+wm.itemData.operationalLayers[lyr]['url'].replace('maps.indiana.edu','bl-geoy-crinoid.ads.iu.edu').replace('/rest/','/')+'/KmlServer</href>'; 
					kml += '<viewFormat><![CDATA[Composite=false&LayerIDs=0&BBOX=[bboxWest],[bboxSouth],[bboxEast],[bboxNorth];CAMERA=[lookatLon],[lookatLat],[lookatRange],[lookatTilt],[lookatHeading];VIEW=[horizFov],[vertFov],[horizPixels],[vertPixels],[terrainEnabled]]]></viewFormat>';
					kml += '</Url></NetworkLink>';
			 }
			kml += '</Document></kml>'; 
      $("#exportResultClipBoard").empty().val(kml).focus();
      $("#exportMenu, #exportResult").toggle(); 
    }
  } catch (err) { 
		logger(err); 
  }
});


  $("#site-menu-print-pdf").click(function() { 
    $("#printMapRadioDiv").buttonset(); 
    $("#printMenuForm").dialog("open").dialog("option","height", 380); 
    $("#printPrepare").show(); 
    $("#printDijit, #site-menu-div").hide();  
  });


  $("#configure-update-button").click(function() { 
    var configureBackgroundColor = $("#configureBackgroundColor").val(),  
        configureBoxShadow = $("#configureBoxShadow").val(),
        configureHoverBackgroundColor = $("#configureHoverBackgroundColor").val(),
        configureHoverBorder = $("#configureHoverBorder").val(),
        configureBorder = $("#configureBorder").val(); 

    // div-header: 
    $("#super-header, #browse-div-header, #detail-div-header")
      .css("background-color",configureBackgroundColor); 
    
    // box-shadow
    $("#super-header, #detail-div, #browse-div, #site-menu-div")
      .css("-webkit-box-shadow",configureBoxShadow)  
      .css("-moz-box-shadow",configureBoxShadow)  
      .css("box-shadow",configureBoxShadow);  
    
    
    // hover[background-color, border-top, border-bottom]
    $(".reference-item:first-child:hover, .reference-item:hover, .site-menu-item:hover, .bookmark-data-item:hover, .bookmark-data-item:first-child:hover, .browse-data-item:hover, .browse-data-item:first-child:hover, .detail-item:hover, .detail-item:first-child:hover")
      .css("background-color", configureHoverBackgroundColor)
      .css("border-top", configureHoverBorder)
      .css("border-bottom", configureHoverBorder)
      .css("border-right", configureHoverBorder);




    // border: 
    $("#super-header, #detail-div, #browse-div, .reference-item, .reference-item:first-child, .bookmark-data-item, .bookmark-data-item:first-child, .site-menu-item, .browse-data-item, .browse-data-item:first-child, .detail-item, .detail-item:first-child")
      .css("border-bottom", configureBorder);

  });


  $("#site-menu-layer-gallery").click(function() { window.open("layers.html"); });  
  $("#site-menu-map-gallery").click(function() { window.open("http://maps.indiana.edu/gallery/index.html"); });  

  $(".esriPrintout")
      .live("click", 
         function (e) { 
           e.preventDefault(); 
           var loc = $(this).attr("href"); 
           if (loc !== undefined) { 
              window.open(loc); 
           }
       }); 

   
    $("#printPreparePreview")
     .button() 
     .click(function(e) { 
       e.preventDefault(); 
	  		 var lgndIds2 = []; 
	   var lgnditems = [];
	   
	    if (idArray.length > 0) { 
           for (var i = 0; i <= idArray.length;) { 
		//   console.log("layerIds.length: " + idArray.length);
		 //  console.log(i); 
		  // console.log(idArray);
              lgndIds2.push(idArray[i]);
			  i++;
			  // lgndIds2.push({ "id": idArray[i].toString() });
			  //lgndIds2.push({
//	                layer: mapLayer.layerObject,
//	                visible: mapLayer.layerObject.visible,
//	                title: mapLayer.title
//	            });
			   
              //lgndIds.push(idArray[i]); 
           }
        }


	//Loop thru each layer object and push id into the new array.
	for (var i = 0; i <= lgndIds2.length;) {
        //var layer = layers[i];
		//console.log("lgndIds2.layer.id: " + legendLayers[i].layer.id);
		var legendLyr  = new esri.tasks.LegendLayer();
		legendLyr.layerId = lgndIds2[i];
		lgnditems.push(legendLyr);
		 i++;
    }   
       var layoutchoice = $("#printMenuLayout option:selected").val() || 'Letter_Landscape', 
           authorText = $("#mapAuthor").val() || " ",  
           titleText = $("#mapTitle").val() || " ";

       if (layoutchoice === 'PNG32' || layoutchoice === 'JPG' ) { 
          layoutchoice = "MAP_ONLY";           
       } else if (layoutchoice === 'ESRI_Landscape') { 
          layoutchoice = "Letter ANSI A Landscape"; 
       } else if (layoutchoice === 'ESRI_Portrait') { 
          layoutchoice = "Letter ANSI A Portrait"; 
       }

       var template = (layoutchoice === 'Letter_Landscape' || layoutchoice === 'Letter ANSI A Landscape')
          ? { "label": "Map Only PNG32",
              "format": "PNG32",
              "layout": layoutchoice,
              "preserveScale": false,
              "layoutOptions": {
                 "titleText": titleText,
                 "authorText": authorText,
                 "copyrightText": " ",
                 "scalebarUnit": "Kilometers",
				 'legendLayers': lgnditems,
                 "scaleBarOptions" :  {
                    "metricUnit" : "kilometers",
                    "metricLabel" : "km"
                 }
              },
              "exportOptions": {
                "width": 349,
                "height": 270,
                "dpi": 72
              }
            }
          : { "label": "Map Only PNG32",
              "format": "PNG32",
              "layout": layoutchoice,
              "preserveScale": true,
              "layoutOptions": {
                 "titleText": titleText,
                 "authorText": authorText, 
                 "copyrightText": " ",
                 "scalebarUnit": "Kilometers",
				  'legendLayers': lgnditems,
                 "scaleBarOptions" :  {
                    "metricUnit" : "kilometers",
                    "metricLabel" : "km"
                 },
              },
              "exportOptions": {
                "width": 270,
                "height": 349,
                "dpi": 72
              }
            }; 
    // var tsk = new esri.tasks.PrintTask("http://bl-geoy-.ads.iu.edu/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
    var tsk = new esri.tasks.PrintTask("http://maps.indiana.edu/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
    var params = new esri.tasks.PrintParameters();

    params.map = map; 
    params.template = template; 
    //$("#printPrepare, #printPreparePreview").toggle();
    $("#printPrepare").toggle();
		$("#printDijit")
    .empty()
    .html("<img id='printloading' src='http://maps.indiana.edu/images/IndianaMap/ajax-loader.gif' />")
    .show(); 

    tsk.execute(params, 
			function (res) {         
				var w  = Math.floor(template.exportOptions.width), 
						h  = Math.floor(template.exportOptions.height), 
						wh = $(window).height() || 1000; 
				var dh = ((400 + h) > wh) ? wh : (400 + h); 
						
				$("#printDijit")
				.empty()
				.html("<img src='"+ res.url +"' width='"+w+"' height='"+h+"' />")
				.show(); 
				//$("#printPrepare, #printPreparePreview").show();
				$("#printPrepare").show();
				$("#printMenuForm").dialog("option", "height", dh); 
			}
		);
       
   }); 
     

  $("#printPrepare")
     .button()
     .click(function(e) { 
        e.preventDefault(); 
         
        if (printer !== undefined) { printer.destroy(); }
        var authorText = $("#mapAuthor").val() || " ",  
		  
            titleText = $("#mapTitle").val() || " ";
            lyrs = map.layerIds, ops = [], lgndIds = []; 
			//alert(lyrs);
			
			 var lgndIds2 = []; 
	   var lgnditems = [];
	   
	    if (idArray.length > 0) { 
           for (var i = 0; i <= idArray.length;) { 
		//   console.log("layerIds.length: " + idArray.length);
		  // console.log(i); 
		  // console.log(idArray);
              lgndIds2.push(idArray[i]);
			  i++;
			  // lgndIds2.push({ "id": idArray[i].toString() });
			  //lgndIds2.push({
//	                layer: mapLayer.layerObject,
//	                visible: mapLayer.layerObject.visible,
//	                title: mapLayer.title
//	            });
			   
              //lgndIds.push(idArray[i]); 
           }
        }


	//Loop thru each layer object and push id into the new array.
	for (var i = 0; i <= lgndIds2.length;) {
        //var layer = layers[i];
		//console.log("lgndIds2.layer.id: " + legendLayers[i].layer.id);
		var legendLyr  = new esri.tasks.LegendLayer();
		legendLyr.layerId = lgndIds2[i];
		lgnditems.push(legendLyr);
		 i++;
    }   

			
            var pt = {
"Letter_Portrait":  {
             label: "Portrait Layout",
             format: "PDF",
             layout: "Letter_Portrait",
             preserveScale: true,
             layoutOptions: {
               "titleText": titleText,
               "authorText": authorText, 
               "scalebarUnit": "Kilometers",
			    'legendLayers': lgnditems,
               "scaleBarOptions" :  {
                  "metricUnit" : "kilometers",
                  "metricLabel" : "km"
               },
              
             },
             exportOptions: {
                width: 1080,
                height: 1816,
                dpi: 200
             }
           },
"Letter_Landscape":  {
             label: "Landscape Layout",
             format: "PDF",
             layout: "Letter_Landscape",
             preserveScale: true,
             layoutOptions: {
               "titleText": titleText,
               "authorText": authorText,
               "scalebarUnit": "Kilometers",
			    'legendLayers': lgnditems,
               "scaleBarOptions" :  {
                  "metricUnit" : "kilometers",
                  "metricLabel" : "km"
               },
              
             },
             exportOptions: {
                width: 1600,
                height: 1409,
                dpi: 200
             }
           },
"PNG32":   {
             label: "Map Only PNG32",
             format: "PNG32",
             layout: "MAP_ONLY",
             preserveScale: true,
             layoutOptions: {
               titleText: titleText,
               authorText: authorText,
               "scalebarUnit": "Kilometers",
			    'legendLayers': lgnditems,
               "scaleBarOptions" :  {
                  "metricUnit" : "kilometers",
                  "metricLabel" : "km"
               },
             
             },
             exportOptions: {
                width: 1080,
                height: 1816,
                dpi: 200
             }
           },
"JPG":    {
             label: "Map Only JPG",
             format: "JPG",
             layout: "MAP_ONLY",
             preserveScale: true,
             layoutOptions: {
               titleText: titleText,
               authorText: authorText,
               "scalebarUnit": "Kilometers",
			    'legendLayers': lgnditems,
               "scaleBarOptions" :  {
                  "metricUnit" : "kilometers",
                  "metricLabel" : "km"
               },
             
             },
             exportOptions: {
                width: 1080,
                height: 1816,
                dpi: 200
             }
           },
"ESRI_Portrait":     {
             label: "Portrait Letter",
             format: "PDF",
             layout: "Letter ANSI A Portrait",
             preserveScale: true,
             layoutOptions: {
               titleText: titleText,
               authorText: authorText, 
               "scalebarUnit": "Kilometers",
			    'legendLayers': lgnditems,
               "scaleBarOptions" :  {
                  "metricUnit" : "kilometers",
                  "metricLabel" : "km"
               },
               
             },
             exportOptions: {
                width: 1080,
                height: 1816,
                dpi: 200
             }
           },
"ESRI_Landscape":     {
             label: "Landscape Letter",
             format: "PDF",
             layout: "Letter ANSI A Landscape",
             preserveScale: true,
             layoutOptions: {
               "titleText": titleText,
               "authorText": authorText, 
               "scalebarUnit": "Kilometers",
			    'legendLayers': lgnditems,
               "scaleBarOptions" :  {
                  "metricUnit" : "kilometers",
                  "metricLabel" : "km"
               },
          
             },
             exportOptions: {
                width: 1080,
                height: 1816,
                dpi: 200
             }
           }
};  


        var layoutchoice = $("#printMenuLayout option:selected").val();
        $("#printMenuLayout").change(function () { 
          layoutchoice = $("#printMenuLayout option:selected").val(); 
        });

        
        

        if (idArray.length >= 0) { 
           for (var i = 0; i < idArray.length; i++) { 
              ops.push({ "id": idArray[i] }); 
              lgndIds.push(idArray[i]); 
           }
        }
        // var tsk = new esri.tasks.PrintTask("http://bl-geoy-crinoid.ads.iu.edu/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
        var tsk = new esri.tasks.PrintTask("http://maps.indiana.edu/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
        var params = new esri.tasks.PrintParameters();

        var template = pt[layoutchoice]; 
        params.map = map; 
        //template.layoutOptions.legendLayers = lgndIds; 
        //template.layoutOptions.legendOptions.operationalLayers = ops; 
        params.template = template; 
        //$("#printPrepare, #printPreparePreview").toggle();
    		//$("#printPrepare").toggle(); 
        
				$("#printPrepare")
           .empty()
           .html("<img id='printloading' src='http://maps.indiana.edu/images/IndianaMap/ajax-loader.gif'/>")
           .show(); 

        $("#printDownload").live("click", function() { $("#printMenuForm").dialog('close'); });           
        
				tsk.execute(params, 
					function (res) {         
						$("#printPrepare")
							.empty()
							.html("<a id='printDownload' href='"+res.url+"' target='_blank'>Download Your Map</a>"); 
						$("#printDownload")
							.button()
							.live("click", 
								function (e) { 
									$("#printDijit").empty(); 
									//$("#printPrepare, #printPreparePreview").show();
									$("#printPrepare").show();
								}
							);
							
							window.open(res.url);
							/*
								$("#printDijit").empty()
								$("#printPrepare, #printPreparePreview").show();
								$("#printMenuForm").dialog('close');
								window.open(res.url);
							*/
					}
				);
  		}
		); 


}
// Toggle the layer and add it to the active tab. -MD
$(".lyrChk").live({ 
	click: function (id) {
		var id = $(this).attr('name');
		
		if($(this).prop("checked") == true){ 
			addRemoveLayer(id,'add');
_gaq.push(['_trackEvent','Viewer','AddLayer',id]);
		}else{ 
			addRemoveLayer(id,'remove');				
		}
	}
})


/*$(".lyrChk").click(function(id){ 
		var id = $(this).attr('name');
		
		if($(this).prop("checked") == true){ 
			addRemoveLayer(id,'add');
		}else{ 
			addRemoveLayer(id,'remove');				
		}
})*/


// Toggle the layer visibility. -MD
$(".visiCheck").live({ 
	click: function (id) {
		var id = $(this).attr('id').replace('visiCheck_','');
		id = id.replace( '_', '/' );
		
		if($(this).prop("checked") == true){ 
			window[id].setVisibility(true);
		}else{ 
			window[id].setVisibility(false);			
		}
	}
})
/*$(".visiCheck").click( function(id){
	var id = $(this).attr('id').replace('visiCheck_','');
	id = id.replace( '_', '/' );
	
	if($(this).prop("checked") == true){ 
		window[id].setVisibility(true);
	}else{ 
		window[id].setVisibility(false);			
	}
})*/



function doAfterBuildList() { 
	$("#reference-back-button")
		.button({icons:{primary:"ui-icon-arrowthick-1-w"}})
		.hide();
	
	$("#browse-close-button")
		.button({icons:{primary:"ui-icon-closethick"}})
		.click(function() { $("#browse-div").slideToggle('slow'); })
		.show(); 
		
	$("#reference-folder-template")
		.tmpl(nwroot["items"])
		.appendTo("#reference-folders");
		
			
	/* @TODO: map-list delegates */
	$("#map-list")
		.delegate("li","click",function(e) { 
			e.preventDefault(); 
			var li = $(this); 
	
			/* There *should* be a indianamaps local storage object with the array of webmaps */
			try { 
					if (typeof maps === "undefined" && maps === null) { 
							// fetchMaps();  /* Sets maps to array of json maps */ 
					}
	
					var refid = parseInt(li.find('.reference-id').text()) || 0; 
					if (refid !== currentMap) { 
	
							// saveMyMaps();
							// clone initial map
							var copy = jQuery.extend(true, {}, maps[0]); /* copy current */
							maps[0] = copy; 
							currentMap = refid; 
							var wm = webmap = maps[currentMap]; 
							// webmap = dojo.mixin(webmap, wm); 
							initMap(wm); 
					}
				 
			} catch (err) { 
				 logger(err); 
			}
	
		})
		
		.delegate("li","mouseenter", function (event) { 
			var _this = $(this), 
					_event = event; 
					_this.addClass("hasFocus"); 
			setTimeout(function() {
				if (_this && _this.hasClass('hasFocus')) {  
											_this.children(".reference-links").fadeIn("slow").position({my:'right top',at:'left bottom',of:_this.children('span:last'),offset:"-10 5", adjust: {"scroll":false} });
				} else { 
											_this.children(".reference-links").fadeOut("fast"); 
				}
			}, 1000); 
	
		})
		
		.delegate("li", "mouseleave", function() { $(this).removeClass("hasFocus").children(".reference-links").fadeOut('fast');	})
		
		.delegate("li a.rename-map", "click", function() { 
			var li = $(this).parents('li'); 
			li.find('.reference-title').hide();
			li.find('.input-reference-title, .rename-enter-button').remove();
			
			li.prepend("<input class='input-reference-title' value='"+ li.find(".reference-title").text() +"' id='map-"+ li.index() +"' maxlength='65' width='65' style='font-size:14px;margin-top:10px;'/><button class='rename-enter-button small-button' style='line-height:0.5;font-size:0.5em;'>Enter</button>");
			$(".rename-enter-button").button(); 
			$(li).find(".input-reference-title").focus();
		})
		
		.delegate("li input.input-reference-title", "keydown", function (e) { 
			if (e.which === 13) { // enter key
				e.preventDefault(); 
				e.stopImmediatePropagation(); 
				// save the value, replace .reference-title, update webmap, and saveMaps
				// JSON.stringify escapes quotes. 
				var li = $(this).parents('li'); 
				var title = li.find('.input-reference-title').val() || "Initial Map"; 
				title = title.replace(/"/g,' '); 
				li.find('.input-reference-title, .rename-enter-button').remove();
				li.find('span.reference-title').text(title).fadeIn(); 
				webmap.title = webmap.label = webmap.item.title = title; 
				saveMapState();
				$("#map-list").empty(); 
				$("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 
				$("#map-filter-search").autocomplete("option","source",maps); 
			}
			return true; 	
		})
		
		.delegate("li a.export-map", "click", function (e) { 
			e.preventDefault(); 
			e.stopImmediatePropagation(); 
			// save the value, replace .reference-title, update webmap, and saveMaps
			
			/* There *should* be a indianamaps local storage object with the array of webmaps */
			try { 
				if (typeof maps === "undefined" && maps === null) { 
						fetchMaps();  /* Sets maps to array of json maps */ 
				}
			
				var li = $(this).parents('li'); 
				var refid = parseInt(li.find('.reference-id').text()) || 0; 
				if (refid !== currentMap) { 
						currentMap = refid; 
						initMap(maps[currentMap]); 
				}
			
			 
			} catch (err) { 
				logger(err); 
			}
			
			$("#exportMenuForm").dialog("open").dialog("option","height", 380); 
			$("#exportMenu").show(); 
			$("#exportResult").hide();  
			
			return true; 	
		})
		
		.delegate("li button.rename-enter-button", "click", function (e) { 
			e.preventDefault(); 
			e.stopImmediatePropagation(); 
			// save the value, replace .reference-title, update webmap, and saveMaps
			var li = $(this).parents('li'); 
			var title = li.find('.input-reference-title').val() || "Initial Map"; 
			title = title.replace(/"/g,' '); 
			li.find('.input-reference-title, .rename-enter-button').remove();
			li.find('span.reference-title').text(title).fadeIn(); 
			webmap.title = webmap.label = webmap.item.title = title; 
			saveMapState();
			$("#map-list").empty(); 
			$("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 
			$("#map-filter-search").autocomplete("option","source",maps); 
			return true; 	
		})
		
		.delegate("li a.delete-map", "click", function(e) { 
			e.preventDefault(); 
			e.stopImmediatePropagation(); 
			/*** 
			* if "current map" or only one map in maps, check id
			* then reset webmap to default state
			* else 
			*    remove from maps  // array splice(index, <how many>, <add elements*>)
			*    save my maps
			*    
			*/
			// saveMapState(); 
			var li = $(this).parents('li'); 
			var refid = parseInt(li.find('.reference-id').text()), m = [];  
			li.find('.input-reference-title, .rename-enter-button').remove();
			
			/* if initial map, reset */
			if (refid === 0) { 
				 li.find("span.reference-title").text("Initial Map").fadeIn(); 
				 resetMyMap();
				 if (maps.length === 1) { deleteMyMaps(); } 
				 saveMapState(); 
				 $("#map-list").empty(); 
				 $("#map-list-template").tmpl(maps).appendTo("#map-list").fadeIn(); 
				 $("#map-filter-search").autocomplete("option","source",maps); 
			
			} else if (maps.length > 1) { 
				 li.hide();
				 maps.forEach(function (element, index, array) { 
						 if (element.id !== refid) { 
								 m.push(jQuery.extend(true, {}, element)); 
						 }
				 }); 
				 m.forEach(function (element, index, array) { 
						 element.id = index; 
				 }); 
				 maps = m; 
				 if (currentMap === refid) { 
						 currentMap = 0; 
						 webmap = m[currentMap]; 
						 changeMyMap(m[currentMap]);
				 }
				 $(".detail-elements").hide(); 
				 $("#measurementDiv").hide();
				 $("#map-list").empty(); 
				 $("#map-list-template").tmpl(m).appendTo("#map-list").fadeIn(); 
				 $("#map-filter-search").autocomplete("option","source",m); 
				 sync(); 
			}
		}); 
	
	
		// States:  Folder <-> Layer <-> Detail 
		$("#reference-folders li")
			.live("click",function() { 
				var folder = $(this).children(".reference-title").text() || ""; 
				if (folder !== "") { 
					var index = $('li').index(this); 
					index = index >= 3 ? index - 3 : index; // Careful. li index changes on header updates.
					// changed from 'Layers' to subheader
					$("#folder-name")
						.empty()
						.text(folder)
						.show(); 
	
					$("#reference-back-button")
						.show()
						.click(function() { 
							$("#folder-name").empty() 
							//$("#reference-folders").effect('slide',{direction:"left"},500)
							$("#reference-folders").slideDown();
							$("#reference-layers, #reference-back-button").hide();
						}); 
					
					$("#reference-layers")
						.empty()
						.show(); 
		
					$("#reference-folders, #map-folder-button").hide();
					
					$("#reference-layer-template")
							 .tmpl(nwroot["items"][index]["children"])
							 .appendTo("#reference-layers")
							 .effect('slide',{direction:"right"},500, syncReferenceLayers)
				}
	
			}); 
			
		/***
		 * reference-list is the autocomplete search result thing 
		 * @todo "be" turns up two initial null li items
		 */
		$("#reference-list li") 
			 .live({ 
					 click: function (event) { 
							// defense
							try { 
								 if ($(this).hasClass("inFlight") || $(this).attr('data-lyr-name') === null) { 
										logger("null value in reference-list"); 
										return; 
								 } 
								 // exists?
								 if (layerExists($(this).attr('data-lyr-name'))) { 
										logger("layer exists"); 
										return; 
								 }
	
								 // no basemap, no problem
								 var opt = {}; 
								 opt.id = $(this).attr('data-lyr-name'); 
								 opt.url = $(this).attr('data-lyr-id'); 
								 opt.title = $(this).attr('data-lyr-title') || "";
								 opt.visibility = $(this).attr('data-lyr-visibility') || true; 
								 opt.opacity = $(this).attr('data-lyr-data-opacity') || 1; 
								 opt.displayField = $(this).attr('data-lyr-display-field') || ""; 
								 opt.type = $(this).attr('data-lyr-type') || ""; 
								 opt.geometryType = $(this).attr('data-lyr-geometry-type') || ""; 
								 opt.description = $(this).attr('data-lyr-description') || ""; 
								 initWebMapLayer(opt);
	
								 // make things disappear
								 // browse button, back button, and autocomplete text
								 $("#map-filter-search").val(''); 
								 $("#map-folder-button, #reference-back-button").hide();
								 $("#reference-list, #reference-layers").empty().hide();
								 $("#reference-folders").show();  
	
							} catch (err) { 
								 logger(err.message); 
							}
					 }
			 }); 
	
		/***
		 * reference-layers is the browse layer thing 
		 */
		$("#reference-layers li")
			.live({
				click: function(event) { 
					if ($(this).hasClass("inFlight")) { 
						return; 
					}
					
					var lyr = $(this).attr('data-lyr-id'); 
					var fldr = $("#folder-category").text();
					var id = $(this).attr('data-lyr-name'); 
		
					if (map.getLayer(id)) {  
						try { 
							$(this).removeClass("inFlight")
							removeWebMapLayer(id); 
							map.removeLayer(map.getLayer(id));
							removeReferenceSelection($(this));
						} catch (err) { 
							$(this).removeClass("inFlight")
							logger(err.message); 
							watchAndRemove(id); 
						}
					} else if (/^Basemap/.test(id)) { 
						var opt = {};  
						opt.id = 'layer0'; 
						opt.url = lyr; 
						opt.title = $(this).attr('data-lyr-title') || "";
						opt.visibility = $(this).attr('data-lyr-visibility') || true; 
						opt.opacity = 1; 
						opt.displayField = $(this).attr('data-lyr-display-field') || ""; 
						opt.type = $(this).attr('data-lyr-type') || ""; 
						opt.geometryType = $(this).attr('data-lyr-geometry-type') || ""; 
						opt.description = $(this).attr('data-lyr-description') || ""; 
						initWebMapLayer(opt);
	
					} else { 
						var opt = {}; 
						opt.id = id; 
						opt.url = lyr; 
						opt.title = $(this).attr('data-lyr-title') || "";
						opt.visibility = $(this).attr('data-lyr-visibility') || true; 
						opt.opacity = $(this).attr('data-lyr-data-opacity') || 1; 
						opt.displayField = $(this).attr('data-lyr-display-field') || ""; 
						opt.type = $(this).attr('data-lyr-type') || ""; 
						opt.geometryType = $(this).attr('data-lyr-geometry-type') || ""; 
						opt.description = $(this).attr('data-lyr-description') || ""; 
						initWebMapLayer(opt);
						$(this).addClass("inFlight"); 
					}
	
					if (!$("#detail-list").is(":visible")) { 
						$(".detail-elements").hide(); 
						$("#measurement-list").hide();
						$("#detail-list").fadeIn(); 				    
					}
				},
	
			mouseenter: function(event) {
	
		var tt = $(this).attr("data-lyr-title"),
		tid = $(this).attr("data-lyr-id"),
		_this = $(this), _event = event; 
	
		_this.addClass("hasFocus"); 
		setTimeout(function() {
	if (_this && _this.hasClass('hasFocus')) {  
		_this.children(".reference-links").fadeIn("slow").position({my:'right top',at:'left bottom',of:_this.children('span:last'),offset:"20 5", adjust: {"scroll":false} });
	
		var td = '<span class="reference-item-detail-title">';
												 td += _this.attr("data-lyr-description")+'</span>'
	
	} else { 
		_this.children(".reference-links").fadeOut("fast"); 
		$("#referenceMenuDetail").empty().hide();
	}
	
	}, 1); 
	},
	mouseleave: function() { 
		$(this).removeClass("hasFocus").children(".reference-links").fadeOut('fast');
	}
	}); 
}


// Beautiful rfc4122 version 4 compliant solution 
// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function generateMapKey() { 
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
         });
}

/***
* Utility function to convert 1.1 to 1.2 spec
* @param webmap_json version 1.1
* return version 1.2
*/
function convertWebMap(wm) { 
  if (typeof wm === "undefined" || wm === null) { 
     return; 
  }
  // layoutOptions : { authorText: ""}
  var nwm = {"mapOptions": {
               "extent": {
                  "xmin" : wm.item.extent[0][0],
		  "ymin" : wm.item.extent[0][1],
		  "xmax" : wm.item.extent[1][0],
		  "ymax" : wm.item.extent[1][1],
		  "spatialReference" : wm.item.extent[2]
               }
             },
             "operationalLayers": wm.itemData.operationalLayers,
             "baseMap": wm.itemData.baseMap,
             "exportOptions": {},
             "layoutOptions": { "titleText": wm.item.title}
  };
  return nwm; 
}

/***
* Utility function to convert 1.2 to 1.1 spec
* @param webmap_json version 1.1
* return version 1.2
*/
function revertWebMap(wm) { 
  if (typeof wm === "undefined" || wm === null) { 
     return; 
  }
  // @TODO handle error checks
  var nwm = {
"item": {
  "extent": [[wm.mapOptions.extent.xmin,wm.mapOptions.extent.ymin],
             [wm.mapOptions.extent.xmax,wm.mapOptions.extent.ymax],
             {"wkid":wm.mapOptions.extent.spatialReference}],
  "title": (wm.layoutOptions.titleText || "Initial Map"),
  "snippet": "IndianaMap"
},
"itemData": { 
  "bookmarkItems":[],
  "operationalLayers":wm.operationalLayers,
  "baseMap":wm.baseMap
},
log: []
};
  return nwm; 
}


/**
* checkZoomEnd 
* utility function to reset searchbox
*/
function checkZoomEnd(extent, zoomFactor, anchor, level) { 
    $("#searchbox").val('');
    return true;
}

function doBuffer(evt) {	
	var userUnit = document.getElementById("units").value;
	var userDistance = document.getElementById("userDistance").value;
  // map.graphics.clear();
  var gparams = new esri.tasks.BufferParameters();
	gparams.geometries = [ evt.mapPoint ];

	if (graphicColor === "nothing") {		graphicColor = "#000000"	};	
	var myColor = dojo.colorFromHex(graphicColor);	
	//alert(userUnit);
	myNewColor = myColor.toRgb();

  //buffer in linear units such as meters, km, miles etc.
  gparams.distances = [ userDistance ];
	  
  if (userUnit === "MILES") {
		gparams.unit = esri.tasks.GeometryService.UNIT_STATUTE_MILE  
  } else if (userUnit === "FEET") {
		gparams.unit = esri.tasks.GeometryService.UNIT_FOOT
	} else {
		 gparams.unit = esri.tasks.GeometryService.UNIT_KILOMETER;
	}
	
	gparams.outSpatialReference = map.spatialReference;
  geometryService.buffer(gparams, showBuffer);
  dojo.disconnect(firstConnect);
  toolbar.deactivate();
   
}

function showBuffer(geometries) {
	var symbol = new esri.symbol.SimpleFillSymbol(
		esri.symbol.SimpleFillSymbol.STYLE_SOLID,
		new esri.symbol.SimpleLineSymbol(
			esri.symbol.SimpleLineSymbol.STYLE_SOLID,
			new dojo.Color([myNewColor[0],myNewColor[1],myNewColor[2],0.25]), 2
		),
		new dojo.Color([myNewColor[0],myNewColor[1],myNewColor[2],0.25])
	);

	dojo.forEach(geometries, function(geometry) {
		var graphic = new esri.Graphic(geometry,symbol);
		map.graphics.add(graphic);
	});
}


function doModal(){
	//Get the screen height and width
	var maskHeight = $(document).height();
	var maskWidth = $(window).width();
	//Set height and width to mask to fill up the whole screen
	$('#mask').css({'width':maskWidth,'height':maskHeight});
	//transition effect    
	$('#mask').fadeIn(200);   
	$('#mask').fadeTo("fast",0.8); 
}


$(document).ready(function() { 
		$('#footerDescription').html("IndianaMap helps people find commonly used layers and maps for a better understanding of Indiana issues and trends. Quick access to this authoritative geospatial information supports situational awareness and better decision making.");

 		$("#detail-list").hide();
 		$("#curLayersDiv").hide();
		
		$('.printButton').click(function(e) {
			e.preventDefault();
			var id = '#printMenuDiv';
			//Get the window height and width
			var winH = $(window).height();
			var winW = $(window).width();
						 
			//Set the popup window to center
			$(id).css('top',  winH/2-$(id).height()/2);
			$(id).css('left', winW/2-$(id).width()/2);
			$(id).fadeIn(200);
			doModal();
			$("#printPreparePreview").click(); //open the print Preview
		});
		
		
    //select all the a tag with name equal to layerName
    $('a[class=layerName]').click(function(e) {
        //Cancel the link behavior
        e.preventDefault();
        //Get the A tag
				var id = '#layerInfoWindow';
        var layerID = $(this).attr('href');

				//Get the window height and width
				var winH = $(window).height();
				var winW = $(window).width();
               
        //Set the popup window to center
        $(id).css('top',  winH/2-$(id).height()/2);
        $(id).css('left', winW/2-$(id).width()/2);
     		
				doModal();
        
				//transition effect
        $(id).fadeIn(200);				
				//$(id).load("layerGallery.html", function() { });				
				//$('body').data('layerDesc', 1);				
				//The following line of code sets a global data variable in the body called "layerReqID" to the requested layer ID - MD
				$('body').data('layerReqID', layerID);								
				/*
				$.ajax({
            url: 'layerGallery.html', 
            data: 'layerDesc=1&layerID=' + layerID,
            type: 'GET',
            success: function(data) {
                $(id).html(data);
            }
        });
				*/	
    });
     
    //if close button is clicked
    $('.window .close').click(function (e) {
        //Cancel the link behavior
        e.preventDefault();
        $('#mask, .window').hide();
    });    
     
    //if mask is clicked
    $('#mask').click(function () {
        $(this).hide();
        $('.window').hide();
    });  
	
	
     
});



var toggleLayerGroup = function(groupID,oList){
	var theLayer = document.getElementById(groupID);
	
	if(theLayer.style.display == 'none' || theLayer.style.display == ''){
		theLayer.style.display = 'block';
		oList.style.listStyleImage = "url('/images/bullet_drop.png')";
	}else{
		theLayer.style.display = 'none';	
		oList.style.listStyleImage = "url('/images/bullet_Arrow_Grey.png')";	
	}
}

function requestSucceeded(data) {
  console.log("Data: ", data.description); // print the data to browser's console
  alert("layer description: " + data.description);
}
function requestFailed(error) {
  console.log("Error: ", error.message);
}

function doaQuery() {
//new stuff for querybuilder

//add the states demographic data
       
}


// This function creates the Base Maps for the Basemaps tab - MD
function createBasemapGallery() {
	var basemaps = [];
	
	var Streets = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Streets/MapServer"
	});
	var StreetsBasemap = new esri.dijit.Basemap({
		 layers: [Streets],
		 title: "Streets",
		  id: "bm1",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Streets_rectangle.png"
	});
	basemaps.push(StreetsBasemap);
	
	var ShadedRelief = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Shaded_Relief/MapServer"
	});
	var ShadedReliefBasemap = new esri.dijit.Basemap({
		 layers: [ShadedRelief],
		 title: "Streets and Shaded Relief",
		  id: "bm6",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Shaded_Relief_rectangle.png"
	});
	basemaps.push(ShadedReliefBasemap);
	
	var darkColShaRel = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Dark_Color_Shaded_Relief/MapServer"
	});
	var darkColShaRelBasemap = new esri.dijit.Basemap({
		 layers: [darkColShaRel],
		 title: "Dark Color Shaded Relief",
		  id: "bm2",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Dark-Color-Shaded-Relief_rectangle.png"
	});
	basemaps.push(darkColShaRelBasemap);
	
	var Light = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Light_Color_Shaded_Relief/MapServer"
	});
	var LightBasemap = new esri.dijit.Basemap({
		 layers: [Light],
		 title: "Light Color Shaded Relief",
		
		  id: "bm11",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Light-Color-Shaded-Relief_rectangle.png"
	});
	basemaps.push(LightBasemap);
	
	var ImgHyb2005 = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Imagery_2005/MapServer"
	});
	var ImgHyb2005Basemap = new esri.dijit.Basemap({
		 layers: [ImgHyb2005],
		 title: "Imagery Hybrid 2005",
		 id: "bm3",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/imagery_hybrid_2005_rectangle.png"
	});
	basemaps.push(ImgHyb2005Basemap);
	
	var Imagery = new esri.dijit.BasemapLayer({url:"http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Imagery_2005/MapServer"});
	var ImageryHybridBasemap = new esri.dijit.Basemap({
		 layers: [Imagery],
		 title: "2005 Imagery",
		  id: "bm8",
		 thumbnailUrl: "http://maps.indiana.edu/images/Basemaps/imagery_rectangle.png"
	});
	basemaps.push(ImageryHybridBasemap);
	
	var NAIP2010 = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/NAIP_2010/MapServer"
	});
	var NAIP2010Basemap = new esri.dijit.Basemap({
		 layers: [NAIP2010],
		 title: "NAIP 2010",
		  id: "bm4",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/NAIP-2010_rectangle.png"
	});
	basemaps.push(NAIP2010Basemap);
	
	
	var Image2011 = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/ArcGIS/rest/services/Imagery/Best_Available_Imagery_2011/MapServer"
	});
	var ImageryBasemap = new esri.dijit.Basemap({
		 layers: [Image2011],
		 title: "2011 Imagery",
		  id: "bm9",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/imagery_rectangle.png"
	});
	basemaps.push(ImageryBasemap);
	
	var BestAvailImHybrid = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/Best_Available_Imagery_Hybrid/MapServer"
	});
	var BestAvailImHybridBasemap = new esri.dijit.Basemap({
		 layers: [BestAvailImHybrid],
		 title: "Best Availaible Imagery Hybrid",
		 id: "bm7",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Best_Available_Imagery_Hybrid_rectangle.png"
	});
	basemaps.push(BestAvailImHybridBasemap);
	
	
	var PLSS = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/arcgis/rest/services/Basemaps/PLSS/MapServer"
	});
	var PLSSBasemap = new esri.dijit.Basemap({
		 layers: [PLSS],
		 title: "PLSS",
		  id: "bm5",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/PLSS_rectangle.png"
	});
	basemaps.push(PLSSBasemap);
	
	
	
	
	
	
	
	
	


	var Topo = new esri.dijit.BasemapLayer({
		 url: "http://maps.indiana.edu/ArcGIS/rest/services/Basemaps/Topos/MapServer"
	});
	var TopoBasemap = new esri.dijit.Basemap({
		 layers: [Topo],
		 title: "USGS Topographic",
		  id: "bm10",
		 thumbnailUrl:"http://maps.indiana.edu/images/Basemaps/Topos_rectangle.png"
	});
	basemaps.push(TopoBasemap);

	
	
	

	
  
} 


function cAndZ (Lat,Lon){
	
	var location = new esri.geometry.Point([Lat,Lon],new esri.SpatialReference({ wkid:4326 }));
	outSR = new esri.SpatialReference({ wkid: 26916});
		geometryService.project(
			[location ], outSR, function(projectedPoints) {
				pt = projectedPoints[0];
			map.centerAndZoom(pt,6);	
			var highlightPin = new esri.symbol.PictureMarkerSymbol({"angle":0,"xoffset":0,"yoffset":0,"type":"esriPMS","url":"http://gis.indiana.edu/arcgis_js_v33_api/library/3.3/jsapi/js/esri/dijit/images/flag.png","contentType":"image/png","width":24,"height":24});
			
			
			//var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
			
			var graphic = new esri.Graphic(pt, highlightPin);
  
  map.graphics.add(graphic);
clearDelay();
				 
			}
		);    
	
	//var location = new esri.geometry.Point([Lat,Lon],new esri.SpatialReference({ wkid:4326 }));


	
	}
	
	
	function zoomHID(q) { 
	console.log("zoomHID");
	
	   // create and add the layer
        var mil = new esri.layers.MapImageLayer({
          'id': 'overlay',
		  'opacity': '0.8'
        });
        map.addLayer(mil);

        // create an add the actual image
	

		
        var mi = new esri.layers.MapImage({
          'extent': { 'xmin': 397640.802575523, 'ymin': 4163110.209799754, 'xmax': 702761.452816819, 'ymax': 4640442.442464224, 'spatialReference': { 'wkid': 26916 }},
        //  'href': 'http://hdds.usgs.gov/hdds2/view/overlay_file/AM01N33_269827W079_1773002011082800000000MS00'
		    'href': 'http://maps.indiana.edu/house/' + q + '.svg'
        });
        mil.addImage(mi);
		
		  var queryTask = new esri.tasks.QueryTask("http://maps.indiana.edu/arcgis/rest/services/Government/General_Assembly_118th_House/MapServer/0");
	var dirty = (new Date()).getTime();	  
	var query = new esri.tasks.Query();
	query.returnGeometry = true;
	query.outFields = ['*'];
	//var qstr = $("#query_theQueryString").val();
	query.where = "District_N='" + q + "' AND " + dirty + "=" + dirty;
	var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
	dojo.connect(queryTask, "onComplete", function(featureSet) {
		
		//var zoomExtent = esri.graphicsExtent(featureSet.features);
			//map.setExtent(zoomExtent);
			
			dojo.forEach(featureSet.features,function(feature){	
			console.log(feature);
			var HIDExtent = feature.geometry.getExtent();
			console.log(HIDExtent);
			var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
 new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
 new dojo.Color([255,0,0]), 2),new dojo.Color([255,255,0,0.25]));new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 66, 66]), 2), new dojo.Color([255, 66, 66, 0.25]));

var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
			var graphic = feature;	
				graphic.setSymbol(polygonSymbol);
		 
			graphic.setInfoTemplate(infoTemplate);           
//			//map.graphics.add(graphic);
			
			var zoomExtent = esri.graphicsExtent(featureSet.features);
			
			map.setExtent(zoomExtent);
			});
			
			
	}
		
	);

		
		
	queryTask.execute(query);	
	//var distID = 'Indiana General Assembly House Disctrict '+$.getUrlVar("HID");
	
	
	
	
	var distID = 'Indiana General Assembly House District '+$.getUrlVar("HID");
   if ($.getUrlVar("HID") == null){
	  distID = 'Indiana General Assembly House District '+$.getUrlVar("hid");
  console.log(distID);
  }
  
				var remLayerDivID = 'removeLayer_'+distID;
				var visibilityName = 'visibility_'+distID;
				var visiCheckID = 'visiCheck_'+distID;
				var sliderName = 'test';
				var upID = 'removeLayer_'+distID;
				var downID = 'removeLayer_'+distID;
				var activeDivID = 'active_'+distID;
				var curHTML = $('#districtsSection').html();
				var lyr5 = map.getLayer('overlay');
				
				
				
				removeLayerDiv = "<div title='Remove Layer from the Map' class='visiDiv'><img src='/images/remove_button.png' class='removeImg' onclick=removeOverlay(); id='"+remLayerDivID+"'></div>";	
				visibilityDiv = "<div title='Layer Visibility' id='"+visibilityName+"' class='visiDiv'><input type='checkbox' id='"+sliderName+"1' class='overlayVisiCheck' onclick=hideOverlay(); checked></div>";
				titleDiv = "<div class='activeLayerTitleDiv'><a onclick=domessage('" + q + "') class='layerName' style='cursor:pointer;'>"+replaceAll(replaceAll(distID,'/',' '),'_',' ')+"</a></div>";
				opacityDiv = "<div title='Layer Opacity' id='"+sliderName+"' class='visibility-slider'></div>";
				//opacityDiv = "<div class='ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all'><a href='#' class='ui-slider-handle ui-state-default ui-corner-all' style='left: 0%;'></a></div>";
				moveLayerDiv = "<div class='moveLayerBox'><img src='/images/carrotUp.png' onclick=moveUp('"+distID+"') id='"+upID+"' /><img src='/images/carrotDown.png' onclick=moveDown('"+distID+"') id='"+downID+"' /></div>";				
				newLayerDiv = "<div id='"+activeDivID+"' class='activeLayerDiv' style='border-bottom:double grey !important;'>"+removeLayerDiv+visibilityDiv+titleDiv+"<br />"+opacityDiv+"</div>" + curHTML; //Create the Active Layers div -MD	
				
				$('#districtsSection').html(newLayerDiv); // Add it to the Active Layers Tab -MD	
	
	
	
	$('#'+sliderName).slider(
	 
					{
						
						min: 0,
						max: 100,
						//value: (lyrv.opacity * 100),
						range: "min",
						create: function(event, ui) { 
						
						var after = 80;
						$(this).slider( "option", "value", after );
					},	
					slide: function(event, ui) { 
						//var tmp3 = $(this).attr('id').replace('slider_','');
						//var tmp4 = tmp3.replace('XXX','/');			 
						var lyr5 = map.getLayer('overlay');
						var opacity = ui.value * .01;
						var txt = Math.round(.01 * $("#"+sliderName).slider('option', 'value')); 
		   			txt = ((opacity * 100).toFixed(0) + '%'); 	
						lyr5.setOpacity(opacity);
						if (isGTIE8 != true) { //IE8 does not like transparency slider next couple of lines are an ugly workaround          
				 
						lyr5.hide();
						lyr5.show();
						}
						//var after = lyr5.opacity * 100;
						//$("#"+tmp2).slider( "option", "value", after );
					}	
				});

}

function zoomSID(q) { 
	
	   // create and add the layer
        var mil = new esri.layers.MapImageLayer({
          'id': 'overlay',
		  'opacity': '0.8'
        });
        map.addLayer(mil);

        // create an add the actual image
	

		
        var mi = new esri.layers.MapImage({
          'extent': { 'xmin': 397640.802575523, 'ymin': 4163110.209799754, 'xmax': 702761.452816819, 'ymax': 4640442.442464224, 'spatialReference': { 'wkid': 26916 }},
        //  'href': 'http://hdds.usgs.gov/hdds2/view/overlay_file/AM01N33_269827W079_1773002011082800000000MS00'
		    'href': 'http://maps.indiana.edu/senate/' + q + '.svg'
        });
        mil.addImage(mi);
		
		  var queryTask = new esri.tasks.QueryTask("http://maps.indiana.edu/ArcGIS/rest/services/Government/General_Assembly_118th_Senate/MapServer/0");
	var dirty = (new Date()).getTime();	  
	var query = new esri.tasks.Query();
	query.returnGeometry = true;
	query.outFields = ['*'];
	//var qstr = $("#query_theQueryString").val();
	query.where = "District_N='" + q + "' AND " + dirty + "=" + dirty;
	var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
	dojo.connect(queryTask, "onComplete", function(featureSet) {
		
		//var zoomExtent = esri.graphicsExtent(featureSet.features);
			//map.setExtent(zoomExtent);
			
			dojo.forEach(featureSet.features,function(feature){	
			console.log(feature);
			var HIDExtent = feature.geometry.getExtent();
			console.log(HIDExtent);
			var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
 new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
 new dojo.Color([255,0,0]), 2),new dojo.Color([255,255,0,0.25]));new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 66, 66]), 2), new dojo.Color([255, 66, 66, 0.25]));

var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
			var graphic = feature;	
				graphic.setSymbol(polygonSymbol);
		 
			graphic.setInfoTemplate(infoTemplate);           
//			//map.graphics.add(graphic);
			
			var zoomExtent = esri.graphicsExtent(featureSet.features);
			
			map.setExtent(zoomExtent);
			});
			
			
	}
		
	);

		
		
	queryTask.execute(query);	
	
	
	var distID = 'Indiana General Assembly Senate District '+$.getUrlVar("SID");
   if ($.getUrlVar("SID") == null){
	  distID = 'Indiana General Assembly Senate District '+$.getUrlVar("sid");
  console.log(distID);
  }
				var remLayerDivID = 'removeLayer_'+distID;
				var visibilityName = 'visibility_'+distID;
				var visiCheckID = 'visiCheck_'+distID;
				var sliderName = 'test';
				var upID = 'removeLayer_'+distID;
				var downID = 'removeLayer_'+distID;
				var activeDivID = 'active_'+distID;
				var curHTML = $('#districtsSection').html();
				var lyr5 = map.getLayer('overlay');
				
				
				
				removeLayerDiv = "<div title='Remove Layer from the Map' class='visiDiv'><img src='/images/remove_button.png' class='removeImg' onclick=removeOverlay(); id='"+remLayerDivID+"'></div>";	
				visibilityDiv = "<div title='Layer Visibility' id='"+visibilityName+"' class='visiDiv'><input type='checkbox' id='"+sliderName+"1' class='overlayVisiCheck' onclick=hideOverlay(); checked></div>";
				titleDiv = "<div class='activeLayerTitleDiv'><a onclick=domessage('" + q + "') class='layerName' style='cursor:pointer;'>"+replaceAll(replaceAll(distID,'/',' '),'_',' ')+"</a></div>";
				opacityDiv = "<div title='Layer Opacity' id='"+sliderName+"' class='visibility-slider'></div>";
				//opacityDiv = "<div class='ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all'><a href='#' class='ui-slider-handle ui-state-default ui-corner-all' style='left: 0%;'></a></div>";
				moveLayerDiv = "<div class='moveLayerBox'><img src='/images/carrotUp.png' onclick=moveUp('"+distID+"') id='"+upID+"' /><img src='/images/carrotDown.png' onclick=moveDown('"+distID+"') id='"+downID+"' /></div>";				
				newLayerDiv = "<div id='"+activeDivID+"' class='activeLayerDiv' style='border-bottom:double grey !important;'>"+removeLayerDiv+visibilityDiv+titleDiv+"<br />"+opacityDiv+"</div>" + curHTML; //Create the Active Layers div -MD	
				
				$('#districtsSection').html(newLayerDiv); // Add it to the Active Layers Tab -MD	
	
	
	
	$('#'+sliderName).slider(
	 
					{
						
						min: 0,
						max: 100,
						//value: (lyrv.opacity * 100),
						range: "min",
						create: function(event, ui) { 
						
						var after = 80;
						$(this).slider( "option", "value", after );
					},	
					slide: function(event, ui) { 
						//var tmp3 = $(this).attr('id').replace('slider_','');
						//var tmp4 = tmp3.replace('XXX','/');			 
						var lyr5 = map.getLayer('overlay');
						var opacity = ui.value * .01;
						var txt = Math.round(.01 * $("#"+sliderName).slider('option', 'value')); 
		   			txt = ((opacity * 100).toFixed(0) + '%'); 	
						lyr5.setOpacity(opacity);
						if (isGTIE8 != true) { //IE8 does not like transparency slider next couple of lines are an ugly workaround          
				 
						lyr5.hide();
						lyr5.show();
						}
						//var after = lyr5.opacity * 100;
						//$("#"+tmp2).slider( "option", "value", after );
					}	
				});

}

function zoomCID(q) { 
	
	   // create and add the layer
        var mil = new esri.layers.MapImageLayer({
          'id': 'overlay',
		  'opacity': '0.8'
        });
        map.addLayer(mil);

        // create an add the actual image
	

		
        var mi = new esri.layers.MapImage({
          'extent': { 'xmin': 397640.802575523, 'ymin': 4163110.209799754, 'xmax': 702761.452816819, 'ymax': 4640442.442464224, 'spatialReference': { 'wkid': 26916 }},
        //  'href': 'http://hdds.usgs.gov/hdds2/view/overlay_file/AM01N33_269827W079_1773002011082800000000MS00'
		    'href': 'http://maps.indiana.edu/congress/' + q + '.svg'
        });
        mil.addImage(mi);
		
		  var queryTask = new esri.tasks.QueryTask("http://maps.indiana.edu/arcgis/rest/services/Government/Congress_113th_Districts/MapServer/0");
	var dirty = (new Date()).getTime();	  
	var query = new esri.tasks.Query();
	query.returnGeometry = true;
	query.outFields = ['*'];
	//var qstr = $("#query_theQueryString").val();
	query.where = "District_N='" + q + "' AND " + dirty + "=" + dirty;
	var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
	dojo.connect(queryTask, "onComplete", function(featureSet) {
		
		//var zoomExtent = esri.graphicsExtent(featureSet.features);
			//map.setExtent(zoomExtent);
			
			dojo.forEach(featureSet.features,function(feature){	
			console.log(feature);
			var HIDExtent = feature.geometry.getExtent();
			console.log(HIDExtent);
			var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
 new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
 new dojo.Color([255,0,0]), 2),new dojo.Color([255,255,0,0.25]));new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 66, 66]), 2), new dojo.Color([255, 66, 66, 0.25]));

var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
			var graphic = feature;	
				graphic.setSymbol(polygonSymbol);
		 
			graphic.setInfoTemplate(infoTemplate);           
//			//map.graphics.add(graphic);
			
			var zoomExtent = esri.graphicsExtent(featureSet.features);
			
			map.setExtent(zoomExtent);
			});
			
			
	}
		
	);

	//buildSlider(sliderName, id)	
		
	queryTask.execute(query);	
	
	
	
	//if ($.getUrlVar("HID") != null) { 
	//			var distID = 'Indiana General Assembly House District '+$.getUrlVar("HID");
	//}else if ($.getUrlVar("SID") != null) { 
	//			var distID = 'Indiana General Assembly Senate District '+$.getUrlVar("SID");
//	}else if ($.getUrlVar("CID") != null) {
		//		var distID = 'US Congressional District '+$.getUrlVar("CID");
	//}
	
 // if ($.getUrlVar("HID") != null || $.getUrlVar("SID") != null || $.getUrlVar("CID") != null) { 
  var distID = 'US Congressional District '+$.getUrlVar("CID");
  console.log("here "+distID);
  
  if ($.getUrlVar("CID") == null){
	  distID = 'US Congressional District '+$.getUrlVar("cid");
  console.log(distID);
  }
  
				var remLayerDivID = 'removeLayer_'+distID;
				var visibilityName = 'visibility_'+distID;
				var visiCheckID = 'visiCheck_'+distID;
				var sliderName = 'test';
				var upID = 'removeLayer_'+distID;
				var downID = 'removeLayer_'+distID;
				var activeDivID = 'active_'+distID;
				var curHTML = $('#districtsSection').html();
				var lyr5 = map.getLayer('overlay');
				
				
				
				removeLayerDiv = "<div title='Remove Layer from the Map' class='visiDiv'><img src='/images/remove_button.png' class='removeImg' onclick=removeOverlay(); id='"+remLayerDivID+"'></div>";	
				visibilityDiv = "<div title='Layer Visibility' id='"+visibilityName+"' class='visiDiv'><input type='checkbox' id='"+sliderName+"1' class='overlayVisiCheck' onclick=hideOverlay(); checked></div>";
				titleDiv = "<div class='activeLayerTitleDiv'><a onclick=domessage('" + q + "') class='layerName' style='cursor:pointer;'>"+replaceAll(replaceAll(distID,'/',' '),'_',' ')+"</a></div>";
				opacityDiv = "<div title='Layer Opacity' id='"+sliderName+"' class='visibility-slider'></div>";
				//opacityDiv = "<div class='ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all'><a href='#' class='ui-slider-handle ui-state-default ui-corner-all' style='left: 0%;'></a></div>";
				moveLayerDiv = "<div class='moveLayerBox'><img src='/images/carrotUp.png' onclick=moveUp('"+distID+"') id='"+upID+"' /><img src='/images/carrotDown.png' onclick=moveDown('"+distID+"') id='"+downID+"' /></div>";				
				newLayerDiv = "<div id='"+activeDivID+"' class='activeLayerDiv' style='border-bottom:double grey !important;'>"+removeLayerDiv+visibilityDiv+titleDiv+"<br />"+opacityDiv+"</div>" + curHTML; //Create the Active Layers div -MD	
				
				$('#districtsSection').html(newLayerDiv); // Add it to the Active Layers Tab -MD	
	
	
	
	$('#'+sliderName).slider(
	 
					{
						
						min: 0,
						max: 100,
						//value: (lyrv.opacity * 100),
						range: "min",
						create: function(event, ui) { 
						
						var after = 80;
						$(this).slider( "option", "value", after );
					},	
					slide: function(event, ui) { 
						//var tmp3 = $(this).attr('id').replace('slider_','');
						//var tmp4 = tmp3.replace('XXX','/');			 
						var lyr5 = map.getLayer('overlay');
						var opacity = ui.value * .01;
						var txt = Math.round(.01 * $("#"+sliderName).slider('option', 'value')); 
		   			txt = ((opacity * 100).toFixed(0) + '%'); 	
						lyr5.setOpacity(opacity);
						if (isGTIE8 != true) { //IE8 does not like transparency slider next couple of lines are an ugly workaround          
				 
						lyr5.hide();
						lyr5.show();
						}
						//var after = lyr5.opacity * 100;
						//$("#"+tmp2).slider( "option", "value", after );
					}	
				});
				
	
	
	
	
	
	
	//}

}


function zoomSIDold(q) { 
  
  
  
  var queryTask = new esri.tasks.QueryTask("http://maps.indiana.edu/ArcGIS/rest/services/Government/General_Assembly_118th_Senate/MapServer/0");
	var dirty = (new Date()).getTime();	  
	var query = new esri.tasks.Query();
	query.returnGeometry = true;
	query.outFields = ['*'];
	//var qstr = $("#query_theQueryString").val();
	query.where = "District_N='" + q + "' AND " + dirty + "=" + dirty;
	var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
	dojo.connect(queryTask, "onComplete", function(featureSet) {
		map.graphics.clear();          
		var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
		var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
		var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
 new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT,
 new dojo.Color([255,0,0]), 2),new dojo.Color([255,255,0,0.25]));new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 66, 66]), 2), new dojo.Color([255, 66, 66, 0.25]));
		//QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.		  
		dojo.forEach(featureSet.features,function(feature){			 
			var graphic = feature;			
			switch (graphic.geometry.type) {
				case "point":
					graphic.setSymbol(markerSymbol);
					break;
				case "polyline":
					graphic.setSymbol(lineSymbol);
					break;
				case "polygon":		 
					graphic.setSymbol(polygonSymbol);
					break;
			}			 
			graphic.setInfoTemplate(infoTemplate);           
			//map.graphics.add(graphic);
			showResults(featureSet);
			var zoomExtent = esri.graphicsExtent(featureSet.features);
			map.setExtent(zoomExtent);
			});
		});
		
		
			var queryTask2 = new esri.tasks.QueryTask("http://maps.indiana.edu/ArcGIS/rest/services/Government/General_Assembly_118th_Senate/MapServer/0");
	var dirty2 = (new Date()).getTime();
			var query2 = new esri.tasks.Query();
	query2.returnGeometry = true;
	query2.outFields = ['*'];
	//var qstr = $("#query_theQueryString").val();
	query2.where = "District_N<>'" + q + "' AND " + dirty + "=" + dirty;
	var infoTemplate2 = new esri.InfoTemplate("Attributes", "${*}");
	dojo.connect(queryTask2, "onComplete", function(featureSet) {
		         
		var markerSymbol2 = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
		var lineSymbol2 = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([66, 66, 66]), 1);
		var polygonSymbol2 =new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 66, 66]), 2), new dojo.Color([255, 66, 66, 0.25]));
	//QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.		  
		dojo.forEach(featureSet.features,function(feature){			 
			var graphic2 = feature;			
			switch (graphic2.geometry.type) {
				case "point":
					graphic2.setSymbol(markerSymbol2);
					break;
				case "polyline":
					graphic2.setSymbol(lineSymbol2);
					break;
				case "polygon":		 
					graphic2.setSymbol(polygonSymbol2);
					break;
			}			 
			graphic2.setInfoTemplate(infoTemplate2);           
			map.graphics.add(graphic2);
			
			//showResults(featureSet);
			//var zoomExtent = esri.graphicsExtent(featureSet.features);
			//map.setExtent(zoomExtent);
		});
	});
		

	queryTask.execute(query);
	queryTask2.execute(query2);
	//clearDelay();
  
  
}


function removeOverlay() {
var lyr5 = map.getLayer('overlay');
 map.removeLayer(lyr5);
 $('#districtsSection').remove();
 
}


function hideOverlay() {
var lyr5 = map.getLayer('overlay');
var vis = lyr5.visible;
if (vis == true) {
 lyr5.hide();
}
else {
	lyr5.show();
}
}


function cAndZ (Lat,Lon){
	
	var location = new esri.geometry.Point([Lat,Lon],new esri.SpatialReference({ wkid:4326 }));
	outSR = new esri.SpatialReference({ wkid: 26916});
		geometryService.project(
			[location ], outSR, function(projectedPoints) {
				pt = projectedPoints[0];
			map.centerAndZoom(pt,6);	
			var highlightPin = new esri.symbol.PictureMarkerSymbol({"angle":0,"xoffset":0,"yoffset":0,"type":"esriPMS","url":"http://gis.indiana.edu/arcgis_js_v33_api/library/3.3/jsapi/js/esri/dijit/images/flag.png","contentType":"image/png","width":24,"height":24});
			
			
			//var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
			
			var graphic = new esri.Graphic(pt, highlightPin);
  
  map.graphics.add(graphic);
clearDelay();
				 
			}
		);    
	
	//var location = new esri.geometry.Point([Lat,Lon],new esri.SpatialReference({ wkid:4326 }));


	
	}
