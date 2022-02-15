import turf from 'turf'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import _ from 'lodash'
const isPro = Object.is(process.env.NODE_ENV, 'production')
import { $GLOBAL_PROJECT } from '@/utils/global';
export const apiConfig = {
    isProduction: isPro,
    baseUrl: isPro ? '' : '/api',
    staticUrl: isPro ? '' : `/${$GLOBAL_PROJECT}`,
}
export const buildingsIn3D = {
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    // filter: ['==', 'extrude', 'true'],
    type: 'fill-extrusion',
    minzoom: 14,
    paint: {
        //2. Fix build
        'fill-extrusion-color': [
            'interpolate',
            ['exponential', 1],
            ["get", "height"],
            0,
            '#DFE0E1',
            200,
            '#DFE0E1',
        ],
        // 'fill-extrusion-height': [ "number", ["get", "height"], 5 ], //固定高度
        'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            15.05, ['get', 'height'] //高度隨zoom大小改變
        ],
        // 'fill-extrusion-base': [ "number", ["get", "min_height"], 0 ],  //固定高度
        'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            15.05, ['get', 'min_height'] //高度隨zoom大小改變
        ],
        'fill-extrusion-opacity': 0.6
    }
}

export const clusters = {
    id: 'clusters',
    type: 'circle',
    source: 'custom',
    filter: ['has', 'point_count'],
    paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        'circle-color': [
            'step',
            ['get', 'point_count'],
            '#1e5eff',
            100,
            '#1e5eff',
            750,
            '#1e5eff'
        ],
        'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
        ],
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2,
    }
}

export const clusterCount = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'custom',
    filter: ['has', 'point_count'],
    layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 18
    },
    paint: {
        'text-color': '#fff',
    }
}

export const generatePoleModel = (coordinate, MapBoxObject, gltfUrl, id) => {
    // configuration of the custom layer for a 3D model per the CustomLayerInterface
    var customLayer = {
      id: id,
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (map, gl) {
        let options = {
            type: 'gltf', //'gltf'/'mtl'
            obj: gltfUrl, //model url
            // bin: '', //replace by mtl attribute
            // units: 'meters', //units in the default values are always in meters
            scale: 0.0001,
            rotation: { x: 90, y: 0, z: 0 }, //default rotation
            // rotation: { x: 90, y: 180, z: 0 }, //default rotation
            anchor: 'center'
        }
        window.tb.loadObj(options, model => {
            const location = [coordinate[0], coordinate[1], 0]
            model.setCoords(location);
            window.tb.add(model, id)
            // create two three.js lights to illuminate the model
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            window.tb.scene.add(directionalLight);
            var directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            window.tb.scene.add(directionalLight2);
        })
      },
      render: function (gl, matrix) {
        window.tb.update()
      }
    };
    return customLayer
}

export const getLastLayerId = (map) => {
    var layers = map.getStyle().layers;
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }
    return labelLayerId
}

export const getPointsInMapBounds = (map, pointArr) => {
    const bounds = map.getBounds();
    const { lat: nwLat, lng: nwLng } = bounds.getNorthWest()
    const { lat: neLat, lng: neLng } = bounds.getNorthEast()
    const { lat: seLat, lng: seLng } = bounds.getSouthEast()
    const { lat: swLat, lng: swLng } = bounds.getSouthWest()
    const arr = [[
        [nwLng, nwLat], [neLng, neLat],
        [seLng, seLat], [swLng, swLat], [nwLng, nwLat]
    ]]
    const polygon = turf.polygon(arr)
    const newArr = []
    pointArr.map(coordinate => {
        const point = turf.point(coordinate) // [lng, lat]
        const bool = booleanPointInPolygon(point, polygon)
        if(bool) newArr.push(coordinate)
    })
    return newArr
}

export const removeDuplicateCoordinate = (arr) => {
    const newArr = arr.map(point => point.join('|')) // [lng, lat]
    const uniqArr = _.uniq(newArr)
    return uniqArr.map(string => string.split('|'))
}

export const MJPEG = (function(module) {
    "use strict";
    // class Stream { ...
    module.Stream = function(args) {
      var self = this;
      var autoStart = args.autoStart || false;
      self.url = args.url;
      self.refreshRate = args.refreshRate || 500;
      self.onStart = args.onStart || null;
      self.onFrame = args.onFrame || null;
      self.onStop = args.onStop || null;
      self.callbacks = {};
      self.running = false;
      self.frameTimer = 0;
  
      self.img = new Image();
      if (autoStart) {
        self.img.onload = self.start;
      }
      self.img.src = self.url;
  
      function setRunning(running) {
        self.running = running;
        if (self.running) {
          self.img.src = self.url;
          self.frameTimer = setInterval(function() {
            if (self.onFrame) {
              self.onFrame(self.img);
            }
          }, self.refreshRate);
          if (self.onStart) {
            self.onStart();
          }
        } else {
          self.img.src = "#";
          clearInterval(self.frameTimer);
          if (self.onStop) {
            self.onStop();
          }
        }
      }
  
      self.start = function() { setRunning(true); }
      self.stop = function() { setRunning(false); }
    };
  
    // class Player { ...
    module.Player = function(canvas, url, options) {
  
      var self = this;
      if (typeof canvas === "string" || canvas instanceof String) {
        canvas = document.getElementById(canvas);
      }
      var context = canvas.getContext("2d");
  
      if (!options) {
        options = {};
      }
      options.url = url;
      options.onFrame = updateFrame;
      options.onStart = options.onStart || function() { console.log("started"); }
      options.onStop = options.onStop || function() { console.log("stopped"); }
  
      self.stream = new module.Stream(options);
  
      canvas.addEventListener("click", function() {
        if (self.stream.running) { self.stop(); }
        else { self.start(); }
      }, false);
  
      function scaleRect(srcSize, dstSize) {
        var ratio = Math.min(dstSize.width / srcSize.width,
                             dstSize.height / srcSize.height);
        var newRect = {
          x: 0, y: 0,
          width: srcSize.width * ratio,
          height: srcSize.height * ratio
        };
        newRect.x = (dstSize.width/2) - (newRect.width/2);
        newRect.y = (dstSize.height/2) - (newRect.height/2);
        return newRect;
      }
  
      function updateFrame(img) {
          var srcRect = {
            x: 0, y: 0,
            width: img.naturalWidth,
            height: img.naturalHeight
          };
          var dstRect = scaleRect(srcRect, {
            width: canvas.width,
            height: canvas.height
          });
        try {
          context.drawImage(img,
            srcRect.x,
            srcRect.y,
            srcRect.width,
            srcRect.height,
            dstRect.x,
            dstRect.y,
            dstRect.width,
            dstRect.height
          );
          console.log(".");
        } catch (e) {
          // if we can't draw, don't bother updating anymore
          self.stop();
          console.log("!");
          throw e;
        }
      }
      self.start = function() { self.stream.start(); }
      self.stop = function() { self.stream.stop(); }
    };
    return module;
  })(MJPEG || {});

export const getNowSize = (val, initWidth=1920) => {
  const nowClientWidth = document.documentElement.clientWidth
  return val * (nowClientWidth/initWidth)
}
