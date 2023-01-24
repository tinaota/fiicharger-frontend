import _ from 'lodash';

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
        onAdd: function () {
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
        render: function () {
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

export const removeDuplicateCoordinate = (arr) => {
    const newArr = arr.map(point => point.join('|')) // [lng, lat]
    const uniqArr = _.uniq(newArr)
    return uniqArr.map(string => string.split('|'))
}

export const getNowSize = (val, initWidth = 1920) => {
    const nowClientWidth = document.documentElement.clientWidth
    return val * (nowClientWidth / initWidth)
}
