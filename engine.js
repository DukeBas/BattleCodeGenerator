/*
 * File functions as main entry point for other scripts to use.
 */

// Instance variables
const codeBlock = document.getElementById("code-block");

/**
 * Write line(s) to output code block.
 * Use comma's to write multiple lines.
 * Writes empty line if no arguments are given.
 *
 * @param {String} toWrite any number of lines to write
 */
function WL(...toWrite) {
  if (toWrite.length == 0) {
    codeBlock.innerHTML += "<br>";
  } else {
    toWrite.forEach((element) => {
      codeBlock.innerHTML += element + "<br>";
    });
  }
}
