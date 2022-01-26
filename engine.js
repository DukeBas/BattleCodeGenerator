/*
 * File functions as main entry point for other scripts to use.
 */

// Instance variables
const codeBlock = document.getElementById("code-block");

/**
 * Write line to output code block.
 *
 * @param {String} toWrite
 */
function WL(toWrite) {
  codeBlock.innerHTML += toWrite + "<br>";
}
