let outputHTML = '';
let input = require('./input.json');

function addLine(text) {
    outputHTML += `${text}\r\n`;
}

function generateTags(tag) {
    addLine(`            <span class="tag-filter category">${tag}</span>`);
}

function generateSolution(solution) {
    addLine(`        <div class = "solutionBox">`);
    addLine(`            <div class="solutionBoxTitle">`);
    addLine(`              <a href = "${solution.url}">${solution.name}</a>`);
    addLine(`            </div>`);
    addLine(`            <p>${solution.description}</p>`);
    solution.tags && solution.tags.forEach((tag) => generateTags(tag));
    addLine(`        </div>`);
}

function generateSolutionCategory(solutionCategory) {
    addLine(`  <h2>${solutionCategory.name}</h2>`);
    addLine(`  {: #${solutionCategory.anchor}}`);
    addLine('    <div class = "solutionBoxContainer">');
    solutionCategory.solutions && solutionCategory.solutions.forEach((solution) => generateSolution(solution));
    addLine('    </div>');
}

function generateHTML() {
    addLine(`<body>`);
    input.forEach((solutionCategory) => generateSolutionCategory(solutionCategory));
    addLine(`</body>`);
}

generateHTML();
console.log(outputHTML);
