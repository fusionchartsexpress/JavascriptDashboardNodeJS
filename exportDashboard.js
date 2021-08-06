// Import 'path' and 'fs' core module of Node.js
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const https = require('https');

// Import FusionExport SDK client for Node.js
const {
    ExportManager,
    ExportConfig
} = require('fusionexport-node-client');


uciRepo = 'https://archive.ics.uci.edu/ml/machine-learning-databases/00549/HortonGeneralHospital.csv';

let txt = []

// Fetch the data from UCI ML Repo
async function readUciData(){
    return await fetch(uciRepo)
    .then(res => res.text())
}

// Convert the downloaded data into JSON
async function getData(){
    txt = await readUciData();
    var data = [];
    var rows = txt.split("\n");
    //Get only the first 30 rows
    for(var i=1;i<30;i++) {
        var cols = rows[i].split(',');
        var obj = {label:cols[6].concat('/', cols[5]), value:cols[4]}
        data.push(obj);
    }
    return data;
}


async function exportDash() {

  // Get the data JSON
  data = await getData();

  // Read the configurations for the dashboard
  let jsonStr = fs.readFileSync("resources/dash-config-file.json", "utf8");
  let fcConfig = JSON.parse(jsonStr);

  // Set the data object in charts read in fcConfig var
  for (var i=0;i<fcConfig.length;++i) {
    //special case for doughnut chart
    if (i==2) {
      doughnut = [];
      for (var j=2;j<8;++j)
          doughnut.push(data[j]);
      fcConfig[i].dataSource["data"] = doughnut  
    }
    else
      fcConfig[i].dataSource["data"] = data;
  }
  // --- EXPORT CONFIG ---
  // Instantiate ExportConfig 
  const exportConfig = new ExportConfig();
  exportConfig.set('chartConfig', fcConfig);
  exportConfig.set('templateFilePath', path.join('resources', 'dashboard-template.html'));

  // --- EXPORT-MANAGER ---
  // Instantiate ExportManager
  const exportManager = new ExportManager();


  // --- OUTPUT ---
  // Export the chart
  exportManager.export(exportConfig, outputDir = '.', unzip = true).then((exportedFiles) => {
    exportedFiles.forEach(file => console.log(file));
  }).catch((err) => {
    console.log(err);
  });
}

exportDash();