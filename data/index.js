// let Papa = require('papaparse');
const csv = require('csv-parser')
let fs = require('fs');
const results = [];

console.log("Going to get data...");

fs.createReadStream('data.csv')
  .pipe(csv({
    mapHeaders: ({
      header,
      index
    }) => header.replace(/\./g, "_").toLowerCase(),
  }))
  .on('data', (data) => results.push(data))
  .on('end', () => {


    let filteredWithNoLocation = results.filter((row) => {
      return (isNaN(row.lon) || isNaN(row.lat)) ? false : true;
    })

    const unique = [...new Set(filteredWithNoLocation.map(item => item.unique_id))];

    let withArrays = unique.map((id, index) => {

      let outcomes = [];
      let interventions = [];
      let populations = [];
      let mainObject = null;

      let filteredByID = filteredWithNoLocation.filter((row) => {
        return row.unique_id == id;
      });

      mainObject = filteredByID[0];

      filteredByID.forEach((row, i) => {
        outcomes.includes(row.outcomes) ? null : outcomes.push(row.outcomes);
        interventions.includes(row.interventions) ? null : interventions.push(row.interventions);
        populations.includes(row.populations) ? null : populations.push(row.populations);
      });


        let parsedRow = {
          "type": "Feature",
          "properties": {
            "unique_id": mainObject.unique_id,
            "type": mainObject.map,
            "studyDesign": mainObject.study_design,
            "studyType": mainObject.type_of_study,
            "title": mainObject.title,
            "year": mainObject.year,
            "url": mainObject.url,
            "authors": mainObject.authors,
            "interventionCategories": interventions,
            "populationGroups": populations,
            "abstract": mainObject.abstract,
            "outcomes": outcomes,
            "city": mainObject.city,
            "status": mainObject.status,
            "countryX": mainObject.country_x,
            "countryY": mainObject.country_y,
            "stateX": mainObject.region___state_x,
            "stateY": mainObject.region___state_y,
            "quality": mainObject.confidence_in_study_findings,
          },
          "geometry": {
            "type": "Point",
            "coordinates": [mainObject.lon, mainObject.lat]
          }
        }

        return parsedRow;
    });

    let json = {
      "type": "FeatureCollection",
      "features": withArrays,
    }

    console.log("Writing to file...");
    fs.writeFile('../src/data/geo.json', JSON.stringify(json), function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log("File written successfully!");
      }
    });

  });
