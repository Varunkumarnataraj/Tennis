/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const glob = require('glob');
const YAML = require('yaml-js');
const extendify = require('extendify-updated');

const generateDocs = () => {
    const extend = extendify({
        inPlace: false,
        isDeep: true
    });

    const files = glob.sync(`src/docs/${process.argv[2]}/**/*.yaml`);

    const contents = files.map((file) => {
        return YAML.load(fs.readFileSync(file).toString());
    });

    const merged = contents.reduce(extend, {});


    fs.unlinkSync(`src/docs/${process.argv[2]}/openapi.yaml`);
    fs.unlinkSync(`src/docs/${process.argv[2]}/openapi.json`);

    fs.writeFileSync(
        `src/docs/${process.argv[2]}/openapi.yaml`,
        YAML.dump(merged)
    );
    fs.writeFileSync(
        `src/docs/${process.argv[2]}/openapi.json`,
        JSON.stringify(merged, null, 2)
    );
};

generateDocs();
