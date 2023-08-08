/* eslint-disable max-len */
const fs = require('fs');
const fsPath = require('path');
const yaml = require('js-yaml');
const schema2Ts = require('json-schema-to-typescript');
const $RefParser = require('@apidevtools/json-schema-ref-parser');

const mySchema = yaml.load(
    fs.readFileSync(
        fsPath.join(__dirname, `../src/docs/${process.argv[2]}/openapi.yaml`),
        'utf-8'
    )
);

const splitParams = (parameters) => {
    const preParam = `{
        "type": "object",
        "properties": `;

    const postParam = `
    "additionalProperties": false
  }`;
    const queryParams = {};
    const pathParams = {};
    const nonPathParams = {
        type: 'object',
        additionalProperties: false,
        properties: {}
    };
    const nonQueryParams = {
        type: 'object',
        additionalProperties: false,
        properties: {}
    };

    if (!parameters)
        return { queryParams: nonQueryParams, pathParams: nonPathParams };
    parameters.forEach((p) => {
        if (p.in === 'query') {
            queryParams[p.name] = p.schema;
        } else if (p.in === 'path') {
            pathParams[p.name] = p.schema;
        }
    });

    return {
        queryParams: JSON.parse(
            `${preParam}${JSON.stringify(queryParams)},${postParam}`
        ),
        pathParams: JSON.parse(
            `${preParam}${JSON.stringify(pathParams)},${postParam}`
        )
    };
};

const parseBody = () => {
    $RefParser.dereference(mySchema, (err, yamlDocs) => {
        if (err) {
            console.error(err);
        } else {
            const paths = Object.keys(yamlDocs.paths);
            paths.forEach((path) => {
                const methods = Object.keys(yamlDocs.paths[path]);
                methods.forEach((method) => {
                    const requestBody =
                        yamlDocs.paths[path][method]?.['requestBody']?.[
                            'content'
                        ]?.['application/json'];
                    let responseBody =
                        yamlDocs.paths[path][method]?.['responses']?.['200']?.[
                            'content'
                        ]?.['application/json'];

                    if (!responseBody) {
                        responseBody =
                            yamlDocs.paths[path][method]?.['responses']?.[
                                '201'
                            ]?.['content']?.['application/json'];
                    }
                    const parameters =
                        yamlDocs.paths[path][method]?.['parameters'];
                    const { queryParams, pathParams } = splitParams(parameters);

                    const dirName = fsPath.join(
                        __dirname,
                        '../src/controllers',
                        `${path}`,
                        `${method}`
                    );
                    if (!fs.existsSync(dirName)) {
                        fs.mkdirSync(dirName, { recursive: true });
                    }
                    const compileOptions = {
                        bannerComment: '// Request Body Parameter',
                        enableConstEnums: true
                    };

                    const nonRequestParams = {
                        type: 'object',
                        additionalProperties: false,
                        properties: {}
                    };
                    const nonResponseParams = {
                        type: 'object',
                        additionalProperties: false,
                        properties: {}
                    };

                    let reqSchema = nonRequestParams;
                    if (requestBody?.schema) {
                        reqSchema = JSON.parse(
                            JSON.stringify(requestBody.schema)
                        );
                    }
                    reqSchema.title = 'RequestBody';
                    schema2Ts
                        .compile(reqSchema, 'RequestBody', compileOptions)
                        .then((ts) => {
                            fs.writeFileSync(`${dirName}/types.ts`, ts);
                        })
                        .catch((err) => {
                            console.error(err);
                            throw err;
                        });

                    schema2Ts
                        .compile(queryParams, 'QueryParams', {
                            ...compileOptions,
                            bannerComment: '// Query Parameter'
                        })
                        .then((ts) => {
                            fs.appendFileSync(`${dirName}/types.ts`, ts);
                        })
                        .catch((err) => {
                            console.error(err);
                            throw err;
                        });

                    schema2Ts
                        .compile(pathParams, 'PathParams', {
                            ...compileOptions,
                            bannerComment: '// PathParams Parameter'
                        })
                        .then((ts) => {
                            fs.appendFileSync(`${dirName}/types.ts`, ts);
                        })
                        .catch((err) => {
                            console.error(err);
                            throw err;
                        });

                    let resSchema = nonResponseParams;
                    if (responseBody?.schema) {
                        resSchema = JSON.parse(
                            JSON.stringify(responseBody.schema)
                        );
                    }
                    resSchema.title = 'ResponseBody';
                    schema2Ts
                        .compile(resSchema, 'ResponseBody', {
                            ...compileOptions,
                            bannerComment: '// Response Body'
                        })
                        .then((ts) => {
                            fs.appendFileSync(`${dirName}/types.ts`, ts);
                        })
                        .catch((err) => {
                            console.error(err);
                            throw err;
                        });

                    if (!fs.existsSync(`${dirName}/index.ts`)) {
                        const indexTemplate = fs.readFileSync(
                            fsPath.join(__dirname, 'index.template.ts'),
                            'utf-8'
                        );
                        fs.writeFileSync(`${dirName}/index.ts`, indexTemplate);
                    }
                });
            });
        }
    });
};

parseBody();
