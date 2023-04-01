const fs = require('fs');

// HOW to use it:
// yarn create:crud __ENTITY__ field1:type1,field2:type2...

const entityName = process.argv[2];
const fields = process.argv[3];

const mongooseTypes = {
  string: '{ type: String }',
  int: '{ type: Number }',
  date: '{ type: Date, default: Date.now }',
  double: '{ type: mongoose.Types.Decimal128 }',
  boolean: '{ type: Boolean }',
  id: '{ type: mongoose.Types.ObjectId }',
  array: '[{ type: String }]',
};

const joiTypes = {
  string: 'string()',
  int: 'number()',
  date: 'date()',
  double: 'number()',
  boolean: 'boolean()',
  id: 'string()',
  array: 'array()',
};

const generateModelFields = () => {
  let text = '';
  fields.split(',').forEach((field) => {
    text += `    ${field.split(':')[0]}: ${
      mongooseTypes[field.split(':')[1]]
    },\n`;
  });
  return text;
};

const generateSchemaFields = () => {
  let text = '';
  fields.split(',').forEach((field) => {
    text += `  ${field.split(':')[0]}: Joi.${joiTypes[field.split(':')[1]]}.required(),\n`;
  });
  return text;
};

// SERVICE
fs.readFile('./templates/crud-service-template.txt', (error, buff) => {
  const data = buff
    .toString()
    .replace(/__ENTITY__/g, entityName)
    .replace(
      /__MODEL__/g,
      entityName.charAt(0).toUpperCase() + entityName.slice(1),
    )
    .replace(/__SCHEMA__/g, generateSchemaFields());
  fs.writeFile(`./api/services/${entityName}.js`, data, (err) => {
    if (err) console.log(err);
    console.log('Service created');
  });
});

fs.readFile('./templates/crud-controller-template.txt', (error, buff) => {
  const data = buff
    .toString()
    .replace(/__ENTITY__/g, entityName)
    .replace(
      /__MODEL__/g,
      entityName.charAt(0).toUpperCase() + entityName.slice(1),
    );
  fs.writeFile(`./api/controllers/${entityName}.js`, data, (err) => {
    if (err) console.log(err);
    console.log('Controller created.');
  });
});

fs.readFile('./templates/model-template.txt', (error, buff) => {
  const data = buff
    .toString()
    .replace(/__ENTITY__/g, entityName)
    .replace(
      /__MODEL__/g,
      entityName.charAt(0).toUpperCase() + entityName.slice(1),
    )
    .replace(/__FIELDS__/g, generateModelFields());
  fs.writeFile(`./api/models/${entityName}.js`, data, (err) => {
    if (err) console.log(err);
    console.log('Model created.');
  });
});

fs.readFile('./templates/crud-route-template.txt', (error, buff) => {
  const data = buff
    .toString()
    .replace(/__ENTITY__/g, entityName);
  fs.writeFile(`./api/routes/${entityName}.js`, data, (err) => {
    if (err) console.log(err);
    console.log('Router created.');
  });
});

fs.readFile('./api/routes/index.js', (error, buff) => {
  const data = buff
    .toString()
    .replace('// __IMPORT__', `const ${entityName} = require('./${entityName}');\n// __IMPORT__`)
    .replace('// __ROUTE__', `router.use('/${entityName}s', ${entityName});\n// __ROUTE__`);
  fs.writeFile('./api/routes/index.js', data, (err) => {
    if (err) console.log(err);
    console.log('Route Added.');
  });
});
