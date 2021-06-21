/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const getOptions = require('./GetOptions')
const parseAnnotationLocations = require('./parsers/AnnotationLocationParser')
const annotationParser = require('./parsers/AnnotationParser');
const path = require("path");

function processChunk(source, map) {
  if (this.cacheable) this.cacheable();

  const options = getOptions(this)

  const annotations = annotationParser.deserialize(source);

  const files = this.fs.readdirSync(this.context)

  const fileLocations = [];
  files.forEach((file) => {
    const fileContent = this.fs.readFileSync(path.resolve(this.context, file));
    const locations = parseAnnotationLocations(fileContent.toString(), options);
    fileLocations.push({ file, locations });
  });

  const walkthrough = [];

  let currentStep = 1;
  annotations.forEach((annotation) => {
    const step = {
      index: annotation.index !== undefined ? annotation.index : currentStep,
      id: annotation.id,
      title: annotation.title,
      markdown: annotation.markdown.trim(),
    }

    if (annotation.id !== "NONE") {
      const fileLocation = fileLocations.find((fileLoc) => fileLoc.locations.some((loc) => loc.id === annotation.id));
      if (fileLocation) {
        const location = fileLocation.locations.find((loc) => loc.id === annotation.id);
        if (location) {
          step.startLineNumber = location.start;
          step.endLineNumber = location.end;
          step.file = fileLocation.file;
        }
      }
    }

    const walkthroughIndex = walkthrough.find((anno) => anno.id === step.id);
    if (walkthroughIndex > -1) {
      walkthrough.splice(walkthroughIndex, 1, step);
    } else {
      walkthrough.push(step);
    }
    currentStep = Math.floor(step.index + 1);
  })

  const sortedWalkthrough = walkthrough.sort(sort);

  let result = JSON.stringify(sortedWalkthrough)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `module.exports = ${result}`;
}

function sort(a, b) {
  if (a.index < b.index) {
    return -1;
  } else if (a.index > b.index) {
    return 1;
  }
  return 0;
}

module.exports = processChunk