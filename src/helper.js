// File with helper functions for other files
// Assumes that the game is played on a grid. Uses Offsets from own position to indicate other position (relative instead of absolute positioning).

/**
 * Record type to hold an x and y.
 */
class Location {
  // x and y coordinates
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return "(" + this.x + "," + this.y + ")";
  }

  /**
   * Used to generate a variable name based on this location, with possible pre and postfix.
   *
   * @param {String} pre prefix, before the variable body
   * @param {String} post postfix, after the variable body
   */
  toVariableName(pre = "", post = "") {
    let writeX = 0;
    let writeY = 0;

    if (this.x > 0) writeX = "p" + this.x;
    if (this.y > 0) writeY = "p" + this.y;

    if (this.x < 0) writeX = "n" + (Math.abs(this.x));
    if (this.y < 0) writeY = "n" + (Math.abs(this.y));

    return pre + writeX + "_" + writeY + post;
  }
}

/**
 * Gets all the offsets from center to get locations within range of a tile (measured in r^2).
 * Returns in order of range, so closest to center is first.
 * Does not include origin tile.
 *
 * @param {number} range in r^2
 */
function getOffsetsInRange(range) {
  let out = [];

  // Check tiles within increasingly large ranges around origin if they're in range
  for (let i = 1; i <= range; i++) {
    // what range to consider this iteration
    let r = Math.ceil(Math.sqrt(i));

    for (let x = -r; x <= r; x++) {
      // check all x offsets
      for (let y = -r; y <= r; y++) {
        // check all y offsets
        if (x * x + y * y == i) {
          // if this is the range we're looking for, add to output
          out.push(new Location(x, y));
        }
      }
    }
  }

  return out;
}


/**
 * Returns the location of nearest location that already has been initalised.
 * Assumes initialisation starts at origin and moves outwards by range.
 *
 * @param {location} loc
 * @returns closest initaliased location
 */
 function getNearestFilledLocation(loc) {
  let ownRange = distanceToOrigin(loc.x, loc.y);

  if (ownRange <= 2) {
    // origin is in range, use that
    return new Location(0, 0);
  }

  // Try all directions around us, use first one found that is valid.
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let newX = loc.x + i;
      let newY = loc.y + j;
      if (distanceToOrigin(newX, newY) < ownRange) {
        return new Location(newX, newY);
      }
    }
  }
}

/**
 * Returns distance squared to origin from some location with x and y coordinates.
 *
 * @param {number} x coordinate
 * @param {number} y coordinate
 * @returns number, distance in r^2 to origin
 */
function distanceToOrigin(x, y) {
  return x * x + y * y;
}

/**
 * Gets in game direction corresponding to a difference in x and y from own position (of max 1).
 *
 * @param {number} dx -1,0,1
 * @param {number} dy -1,0,1
 * @returns ingame direction corresponding to the x and y
 */
function dxdyToDirection(dx, dy) {
  let output = "Direction.";
  switch (dx) {
    case -1:
      switch (dy) {
        case -1:
          // Bottom left
          output += "SOUTHWEST";
          break;
        case 0:
          // Left
          output += "WEST";
          break;
        case 1:
          // Top left
          output += "NORTHWEST";
          break;
      }
      break;
    case 0:
      switch (dy) {
        case -1:
          // Below
          output += "SOUTH";
          break;
        case 0:
          // Own location!!
          output += "CENTER";
          break;
        case 1:
          // Above
          output += "NORTH";
          break;
      }
      break;
    case 1:
      switch (dy) {
        case -1:
          // Bottom right
          output += "SOUTHEAST";
          break;
        case 0:
          // Right
          output += "EAST";
          break;
        case 1:
          // Top right
          output += "NORTHEAST";
          break;
      }
      break;
  }

  return output;
}

// /**
//  * Gets all tiles within range of a tile (measured in r^2).
//  *
//  * @param {Location} loc location to take as center
//  * @param {number} range in r^2
//  */
// function getLocationsInRange(loc, range) {
//   let out = getOffsetsInRange(range);
//   out.map((location) => {
//     // add center tile to the location to receive final location
//     location.x += loc.x;
//     location.y += loc.y;
//   })
//   return out;
// }
