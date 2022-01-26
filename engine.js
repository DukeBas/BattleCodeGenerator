/*
 * File functions as main entry point for other scripts to use.
 */

// Instance variables
const codeBlock = document.getElementById("code-block");

let indendationlevel = 0;
const spacesPerIndentation = 4;

/**
 * Write line(s) to output code block. Use comma's to write multiple lines.
 * Writes empty line if no arguments are given. Uses current indentation level
 *
 * @param {String} toWrite any number of lines to write
 */
function WL(...toWrite) {
  let indendation = "";
  if (indendationlevel > 0) {
    indendation = "&nbsp;".repeat(spacesPerIndentation);
  }
  if (toWrite.length == 0) {
    codeBlock.innerHTML += indendation + "<br>";
  } else {
    toWrite.forEach((element) => {
      codeBlock.innerHTML += indendation + element + "<br>";
    });
  }
}

/**
 * Increases current indentation level.
 */
function increaseIndentation() {
  indendationlevel++;
}

/**
 * Decreases current indentation level (if possible).
 */
function decreaseIndentation() {
  if (indendationlevel > 0) {
    indendationlevel--;
  }
}

/**
 * Writes an efficient loop for a number of iterations.
 * Example: WLoop(10, () => {WL("//test")});
 *
 * @param {number} iterations number of iterations in the loop
 * @param {function} inside of loop (callback function to execute)
 * @param {String} it_name variable name of iterator (only really matters in nested loops)
 */
function WLoop(iterations, inside, it_name = "i") {
  WL("for (int " + it_name + " = " + iterations + "; --i > 0; ){");
  increaseIndentation();
  inside();
  decreaseIndentation();
  WL("}");
}
