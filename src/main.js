const { spawnSync } = require('child_process');
const path = require('path');

function run(scriptName) {
    const scriptPath = path.join(__dirname, scriptName);
    const result = spawnSync(process.execPath, [scriptPath], {
        stdio: 'inherit',
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(`${scriptName} failed with exit code ${result.status}`);
    }
}

run('00_download_ne_data.js');
run('01_extract_ne_countries.js');
run('02_postprocess_countries.js');
run('03_project_world_maps.js');
run('04_create_europe_maps.js');
