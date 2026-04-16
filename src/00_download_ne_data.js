const https = require('https');
const fs = require('fs');
const path = require('path');
const { ne_path, world_path } = require('./helpers/paths');

// download natural earth data country shapes in three different resolutions
const base_url =
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/refs/heads/master/geojson';
const urls = [
    `${base_url}/ne_10m_admin_0_countries.geojson`,
    `${base_url}/ne_50m_admin_0_countries.geojson`,
    `${base_url}/ne_110m_admin_0_countries.geojson`,
    `${base_url}/ne_10m_admin_1_states_provinces.geojson`,
    // these are incomplete
    // `${base_url}/ne_50m_admin_1_states_provinces.geojson`,
    // `${base_url}/ne_110m_admin_1_states_provinces.geojson`
];

async function download(url) {
    const filename = url.split('/').slice(-1)[0];
    const resolution = filename.split('_')[1];
    const outpath = path.join(world_path, resolution);
    if (!fs.existsSync(outpath)) {
        fs.mkdirSync(outpath, { recursive: true });
    }
    const fileStream = fs.createWriteStream(path.join(outpath, filename));

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });
            fileStream.on('error', reject);
        });
    });
}

function main() {
    urls.forEach(async (url) => {
        await download(url);
    });
}

main();
