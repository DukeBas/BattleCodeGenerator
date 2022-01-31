/*
We use Bellman-Ford instead of 'better' pathfinding algorithms like Dijkstra's or A* because they are much harder to
optimize and while faster asymptotically, they are too expensive to use (maintaining priority queue) at our scale.
*/

/*
from (https://www.simplilearn.com/tutorials/data-structure-tutorial/bellman-ford-algorithm):
Default Bellman-Ford pseudocode:
function bellmanFordAlgorithm(G, s) //G is the graph and s is the source vertex

  for each vertex V in G
    dist[V] <- infinite // dist is distance
      prev[V] <- NULL // prev is previous
  dist[s] <- 0

  for each vertex V in G
    for each edge (u,v) in G
      temporaryDist <- dist[u] + edgeweight(u, v)
      if temporaryDist < dist[v]
        dist[v] <- temporaryDist
        prev[v] <- u 

  // check for negative-weight cycles, not necessary for us
  for each edge (U,V) in G
    If dist[U] + edgeweight(U, V) < dist[V}
      Error: Negative Cycle Exists                

  return dist[], previ[]
*/

/*
  We can do better than this! We know the game is played on a grid. So we know all positions before hand (except for map edges).
  Also, we know that each tiles has exactly 8 edges (less for locations on the edge(s) of the map) 
  because diagonal moves are allowed. This extra structure can be used to make our algorithm more efficient.

  Firstly, we do not need to check for negative-weight cycles.
  Next, since we do not necessarily need the optimal solution, we can optimise for a 'good-enough' solution.
  To this end we only do a small number of edge-relaxations. Every tile is reachable in one iteration,
  and the next possible iteration(s) should hone in on the best route.
      
  We assume cost to move is at least 10 (and at most ~100).
  
*/

/**
 * Generates Battlecode Bellman-Ford algorithm in Java.
 *
 * @param {number} range in r^2 of unit to generate for.
 */
function generateBMF(range) {
  // Generate all tiles we need to consider (in order).
  let offsets = getOffsetsInRange(range);

  // Add package statement
  WL("package Trainwreck.util;", "");

  // Manage imports
  WL(
    "import battlecode.common.Direction;",
    "import battlecode.common.MapLocation;",
    "import battlecode.common.RobotController;",
    "",
    ""
  );

  // Class Javadoc
  WJavadoc(
    "Pathfinding class for a vision range of " + range + " r^2",
    "using a simplified Bellman-Ford."
  );

  // Class declaration
  WL("public class BMF" + range + " {", "");
  increaseIndentation();

  // Generate variable declarations.
  WComment(
    "Variable declarations. Location names based on off-set from origin."
  );
  WL("static MapLocation loc_0_0; // own location", "");
  offsets.forEach((offset) => {
    WL("// Variables for " + offset);
    /*
     * for each location (graph vertex) we keep MapLocation (null if not valid (not on map/occupied)),
     * path-length (shortest currently known length of path from origin to location),
     * cost (what added that location would add to total cost, likely something like passability/rubble)
     * Direction (to previous tile in path)
     */
    WL("static MapLocation " + offset.toVariableName("loc_") + ";");
    WL("static int " + offset.toVariableName("pathLength_") + ";");
    WL("static int " + offset.toVariableName("cost_") + ";");
    WL("static Direction " + offset.toVariableName("bestDir_") + ";");

    WL();
  });
  WL();

  // Generate Javadoc
  WJavadoc(
    "Uses own location, target and runs a simplified Bellman-Ford algorithm ",
    "to get the best direction to walk to get to the target.",
    "",
    "@param rc         RobotController of the robot calling this function,",
    "                  this robot's location will be used as origin.",
    "@param target     location on the map to pathfind towards.",
    "@param iterations number of additional iterations of Bellman-Ford done beyond initalisation",
    "@returns the direction to go in"
  );

  // Generate function signature
  WL(
    "public Direction pathfindTo(final RobotController rc, final MapLocation target, final int iterations) { "
  );
  increaseIndentation();
  WL();

  // First iteration (necessary, different in that it requests game values)
  WComment("Initialise variables from game world for current situation");
  WL("loc_0_0 = rc.getLocation();");
  offsets.forEach((offset) => {
    const locVar = offset.toVariableName("loc_");
    const initalisedLocation =  getNearestFilledLocation(offset);
    const initdVar = initalisedLocation.toVariableName("loc_");
    const dir =  dxdyToDirection(
      offset.x - initalisedLocation.x, 
      offset.y - initalisedLocation.y);
    WL(locVar + " = " + initdVar + ".add("+ dir+ ");");
  });
  WL();

  offsets.forEach((offset) => {
    const locVar = offset.toVariableName("loc_");

    WL("// Check validity for " + offset);
    WL(
      "if (!rc.onTheMap(" +
        locVar +
        ") || rc.isLocationOccupied(" +
        locVar +
        ")) {"
    );
    increaseIndentation();
    // body of if, done if location is valid

    decreaseIndentation();
    WL("} else {");
    increaseIndentation();
    // body of else, done if location is invalid
    WL(locVar + " = null;");
    decreaseIndentation();
    WL("}", "");
  });

  // Further iterations
  WComment(
    "Possibly do more iterations to increase accuracy in difficult situations."
  );
  WLoop("iterations", () => {
    // Loop body
    WL("//TODO");
  });

  // Return best direction
  WL("return null;"); // TODO

  // Close the function
  decreaseIndentation();
  WL("}", "");

  // Close class
  decreaseIndentation();
  WL("}");
}

// call main function
generateBMF(34);

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
