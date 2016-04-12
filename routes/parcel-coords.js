var express = require('express');
var router = express.Router();
var request = require('request');
var parseString = require('xml2js').parseString;
var config = require('helpers/config');

const OUT_SPATIAL_REFERENCE = 102100;
const DELIMITER = /#/;
const errors = {
  MISSING_PARAMETERS: "MISSING_PARAMETERS",
  WRONG_INPUT: "WRONG_INPUT",
  SERVICE_DOWN: "SERVICE_DOWN"
};

var mem = new Map();

module.exports = function()
{
  router.get('/', function (req, res) {
    const q = req.query;

    if (!q.town || !q.polygon || !q.parcel) {
      return errorHandler(errors.MISSING_PARAMETERS, res);
    }

    var parameters = {
      town: q.town.trim(),
      polygon: q.polygon.trim(),
      parcel: q.parcel.trim()
    };

    if (`${parameters.town}${parameters.polygon}${parameters.parcel}`.match(DELIMITER)) {
      return errorHandler(errors.WRONG_INPUT, res);
    }

    var key = `${parameters.town}#${parameters.polygon}#${parameters.parcel}`;
    if (mem.get(key)) {
      res.json(mem.get(key));
    } else {
      getCatastralReference(parameters).then((catastralReference) => {
        return getParcelCoordinates(catastralReference).then((parcelCoords) => {
          return transformCoordinates(parcelCoords);
        }).then((projectedCoords) => {
          mem.set(key, projectedCoords);
          res.json(projectedCoords);
        });
      }).catch((err) => errorHandler(err, res));
    }
  });
  return router;
};

function getCatastralReference(parameters) {
  return new Promise((resolve, reject) => {
    request(`http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx/Consulta_DNPPP?Provincia=Valencia&Municipio=${parameters.town}&Poligono=${parameters.polygon}&Parcela=${parameters.parcel}`,
      (err, response, body) => {
        if (err || response.statusCode !== 200) {
          reject(errors.SERVICE_DOWN, err);
        } else {
          parseString(body, (err, xmlObject) => {
            if (err) {
              reject(errors.WRONG_INPUT);
            } else {
              var docContent = xmlObject['consulta_dnp'];
              if (docContent.control[0].cuerr) {
                reject(errors.WRONG_INPUT);
              } else {
                var catastralReference;
                if (docContent.control[0].cudnp[0] > 1) {
                  catastralReference = docContent.lrcdnp[0].rcdnp[0].rc[0];
                } else {
                  catastralReference = docContent.bico[0].bi[0].idbi[0].rc[0];
                }
                resolve(catastralReference.pc1[0] + catastralReference.pc2[0]);
              }
            }
          });
        }
      });
  });
}

function getParcelCoordinates(catastralReference) {
  return new Promise((resolve, reject) => {
    request(`http://ovc.catastro.meh.es//ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_CPMRC?Provincia=&Municipio=&SRS=&RC=${catastralReference}`,
      (err, response, body) => {
        if (err || response.statusCode !== 200) {
          reject(errors.SERVICE_DOWN);
        } else {
          parseString(body, (err, xmlObject) => {
            if (err) {
              reject(errors.WRONG_INPUT);
            } else {
              var docContent = xmlObject['consulta_coordenadas'];
              if (docContent.control[0].cuerr[0] !== '0') {
                reject(errors.WRONG_INPUT);
              } else {
                var coords = docContent.coordenadas[0].coord[0].geo[0];
                var response = {
                  x: coords.xcen[0],
                  y: coords.ycen[0],
                  spatialReference: coords.srs[0].split(':')[1]
                };
                resolve(response);
              }
            }
          });
        }
      });
  });
}

function transformCoordinates(parcelCoords) {
  var geometries = {
    geometryType: 'esriGeometryPoint',
    geometries: [{
      x: parcelCoords.x,
      y: parcelCoords.y
    }]
  };

  return new Promise((resolve, reject) => {
    request.post({url: 'http://ermes.dlsi.uji.es:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/project',
      form: {inSR: parcelCoords.spatialReference, outSR: OUT_SPATIAL_REFERENCE,
        geometries: JSON.stringify(geometries), f: 'pjson'}},
      (err, response, body) => {
        if (err || response.statusCode !== 200) {
          reject(errors.SERVICE_DOWN);
        } else {
          var projectedGeometries = JSON.parse(body);
          var stylizedResponse = {parcelCoords: projectedGeometries.geometries[0]};
          stylizedResponse.parcelCoords.spatialReference = {wkid: OUT_SPATIAL_REFERENCE};
          resolve(stylizedResponse);
        }
      });
  });
}

function errorHandler(err, res) {
  res.status(404).json({error: err});
}