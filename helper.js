// File with helper functions for other files
// Assumes that the game is played on a grid. Uses Offsets from own position to indicate other position (relative instead of absolute positioning).

/**
 * Record type to hold an x and y
 */
class Location {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return "(" + this.x + "," + this.y + ")";
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
        console.log(x,y)
        if (x * x + y * y == i) {
          // if this is the range we're looking for, add to output
          out.push(new Location(x, y));
        }
      }
    }
  }

  return out;
}

wl(getOffsetsInRange(4));

/**
 * Gets all tiles within range of a tile (measured in r^2).
 *
 * @param {Location} loc location to take as center
 * @param {number} range in r^2
 */
function getLocationsInRange(loc, range) {
  // todo
}
