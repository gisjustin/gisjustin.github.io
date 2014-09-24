dojo.provide("modules.RasterLayer");

dojo.addOnLoad(function() {
  
  dojo.declare("modules.RasterLayer", esri.layers.Layer, {
    
    // Doc: http://docs.dojocampus.org/dojo/declare#chaining
    "-chains-": {
      constructor: "manual"
    },
    
    constructor: function(data, options) {
      // Manually call superclass constructor with required arguments
      this.inherited(arguments, [ "http://some.server.com/path", options ]);

      this.data = data;

      this.loaded = true;
      this.onLoad(this);
    },
    
    /********************
     * Public Properties
     * 
     * data
     * 
     ********************/
    
    /**********************
     * Internal Properties
     * 
     * _map
     * _element
     * _context
     * _mapWidth
     * _mapHeight
     * _connects
     * 
     **********************/
    
    /******************************
     * esri.layers.Layer Interface
     ******************************/
    
    _setMap: function(map, container) {
      this._map = map;
      
      var element = this._element = dojo.create("canvas", {
        width: map.width + "px",
        height: map.height + "px",
        style: "position: absolute; left: 0px; top: 0px;"
      }, container);
      
      if (esri._isDefined(this.opacity)) {
        dojo.style(element, "opacity", this.opacity);
      }
      
      this._context = element.getContext("2d");
      if (!this._context) {
        console.error("This browser does not support <canvas> elements.");
      }
      
      this._mapWidth = map.width;
      this._mapHeight = map.height;
      
      // Event connections
      this._connects = [];
      this._connects.push(dojo.connect(map, "onPan", this, this._panHandler));
      this._connects.push(dojo.connect(map, "onExtentChange", this, this._extentChangeHandler));
      this._connects.push(dojo.connect(map, "onZoomStart", this, this.clear));
      this._connects.push(dojo.connect(this, "onVisibilityChange", this, this._visibilityChangeHandler));
      this._connects.push(dojo.connect(this, "onOpacityChange", this, this._opacityChangeHandler));
      
      // Initial rendering
      //this._delta = { x: 0, y: 0 };
      this._drawRasterData();
      
      return element;
    },
    
    _unsetMap: function(map, container) {
      dojo.forEach(this._connects, dojo.disconnect, dojo);
      if (this._element) {
        container.removeChild(this._element);
      }
      this._map = this._element = this._context = this.data = this._connects = null;
    },
    
    // TODO
    // Move to esri.layers.Layer API
    setOpacity: function(o) {
      if (this.opacity != o) {
        this.onOpacityChange(this.opacity = o);
      }
    },
    
    // TODO
    // Move to esri.layers.Layer API
    onOpacityChange: function() {},
    
    /*****************
     * Public Methods
     *****************/
    
    setData: function(data) {
      this.data = data;

      if (!this._canDraw()) {
        return;
      }

      this.refresh();
    },
    
    refresh: function() {
      if (!this._canDraw()) {
        return;
      }

      this._drawRasterData();
    },
    
    clear: function() {
      if (!this._canDraw()) {
        return;
      }

      this._context.clearRect(0, 0, this._mapWidth, this._mapHeight);
    },
    
    getRange: function() {
      var data = this.data;
      if (!data) {
        return;
      }
      
      var dataArray = data.data, noDataValue = data.noDataValue[0];
      
      var i = 0;
      while (dataArray[i++] === noDataValue);
      
      var maxValue = dataArray[i - 1], minValue = dataArray[i - 1];
      for (; i < dataArray.length; i++) {
        var val = dataArray[i];
        if (val === noDataValue) {
          continue;
        }
        
        if (val > maxValue) {
          maxValue = val;
        }
        if (val < minValue) {
          minValue = val;
        }
      }
      
      return { min: minValue, max: maxValue };
    },
    
    getDatasetRange: function() {
      var data = this.data;
      if (!data) {
        return;
      }
      
      var rasterProps = data.rasterProperties;
      if (rasterProps) {
        return { min: rasterProps.datasetMin, max: rasterProps.datasetMax };
      }
    },
    
    /*******************
     * Internal Methods
     *******************/
    
    _canDraw: function() {
      return (this._map && this._element && this._context) ? true : false; 
    },
    
    _panHandler: function(extent, delta) {
      dojo.style(this._element, { left: delta.x + "px", top: delta.y + "px" });
    },
    
    _extentChangeHandler: function(extent, delta, levelChange, lod) {
      if (!levelChange) {
        dojo.style(this._element, { left: "0px", top: "0px" });
        this.clear();
      }
      
      this._drawRasterData();
    },
    
    _drawRasterData: function() {
      if (!this.data) {
        this.clear();
        return;
      }
      
      //console.log("Drawing elevation data in a canvas...");
      var data = this.data, noDataValue = data.noDataValue[0], dataArray = data.data;
      var numColumns = data.nCols, numRows = data.nRows, size = data.cellSize;
      
      // Statistics
      var range = this.getDatasetRange() || this.getRange();
      var minValue = range.min, maxValue = range.max;
      //console.log("Min = ", minValue, ", Max = ", maxValue);
      
      var map = this._map;
      var lowerLeftCorner = new esri.geometry.Point(data.xLLCenter - (size / 2), data.yLLCenter - (size / 2));
      var topLeftCorner = lowerLeftCorner.offset(0, numRows * size);
      var bottomRightCorner = lowerLeftCorner.offset(numColumns * size, 0);
      topLeftCorner = map.toScreen(topLeftCorner);
      bottomRightCorner = map.toScreen(bottomRightCorner);
      //console.log(dojo.toJson(topLeftCorner.toJson()));
      //console.log(dojo.toJson(bottomRightCorner.toJson()));
      var dataWidth = bottomRightCorner.x - topLeftCorner.x;
      var dataHeight = bottomRightCorner.y - topLeftCorner.y;
      // console.log("Dataset size: ", dataWidth, dataHeight);
      var cellWidth = dataWidth / numColumns, cellHeight = dataHeight / numRows; 
      // console.log("cellSize: ", cellWidth, cellHeight);
      
      // Create color functions
      var posFunc = (maxValue > 0) ? this._getCFForPositiveValues(minValue, maxValue) : null;
      var negFunc = (minValue < 0) ? this._getCFForNegativeValues(minValue, maxValue) : null;
      
      var getShade = function(val) {
        if (val >= 0) {
          return posFunc(val);
        }
        else {
          return negFunc(val);
        }
      };
      
      // Draw      
      var top = topLeftCorner.y, ctx = this._context;
      for (var row = 0; row < numRows; row++) {
        var left = topLeftCorner.x;
        for (var col = 0; col < numColumns; col++)  {
          //var value = dataArray[(col * numRows) + row];
          // for heatmap dataset, until john syncs up 
          var value = dataArray[(row * numColumns) + col]; 
          /*var value = this._rowMajor 
                    ? dataArray[(row * numColumns) + col] 
                    : dataArray[(col * numRows) + row];*/
          
          if (value !== noDataValue) {
            ctx.fillStyle = getShade(value);
            ctx.fillRect(left, top, cellWidth, cellHeight);
          }
          left += cellWidth;
        }
        top += cellHeight;
      }
      
      //console.log("Done.");
    },
    
    _getCFForPositiveValues: function(min, max) {
      if (min < 0) {
        min = 0;
      }
      
      var interval = 255 / (max - min);
      
      return function(val) {
        return "rgb(" + Math.floor((val - min) * interval) + ", 0, 0)";
      };
    },
    
    _getCFForNegativeValues: function(min, max) {
      if (max > 0) {
        max = 0;
      }
      
      var interval = 255 / (max - min);
      
      return function(val) {
        return "rgb(0, 0, " + Math.floor((val - min) * interval) + ")";
      };
    },
    
    /****************
     * Miscellaneous
     ****************/
    
    _visibilityChangeHandler: function(visible) {
      if (visible) {
        esri.show(this._element);
      }
      else { 
        esri.hide(this._element);
      }
    },
    
    _opacityChangeHandler: function(value) {
      dojo.style(this._element, "opacity", value);
    }
  }); // end of class declaration
  
}); // end of addOnLoad


dojo.declare("modules.RasterRenderer", null, {
  getColor: function(value) {
    // Implemented by subclasses
    // Returns: color string. rgb(<r>, <g>, <b>) or rgb(<r>, <g>, <b>, <a>)
  }
});

dojo.declare("modules.MyRasterRenderer", modules.RasterRenderer, {
  constructor: function(parameters) {
    
  },
  
  getColor: function(value) {
    
  }
  
  /*******************
   * Internal Methods
   *******************/
});