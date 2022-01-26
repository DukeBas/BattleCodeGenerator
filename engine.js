/*
 * File functions as main entry point for other scripts to use.
 */

// Instance variables
const codeBlock = document.getElementById("code-block");

/**
 * Write line(s) to output code block.
 * Use comma's to write multiple lines.
 *
 * @param {String} toWrite any number of lines to write
 */
function WL(...toWrite) {
  toWrite.forEach(element => {
    codeBlock.innerHTML += element + "<br>";
  });
}
