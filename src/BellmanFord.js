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

  return dist[], prev[]
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

// Settings
const initPathLength = 1147483647;
const initCost = 110; // max tile cost + step cost

// call main function
generateBMF(20);

//////TODO
// Unreachable goal?
// Write out number of here iterations and optimise for it
// Change order at which tiles are looked at for more natural spread

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
    "import battlecode.common.GameActionException;",
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
  WL(
    "// Variables for (0,0), own location",
    "static MapLocation loc_0_0;",
    // "static final int pathLength_0_0 = 0;",
    // "// we do not need a cost for starting location",
    // "static final Direction bestDir_0_0 = Direction.CENTER;",
    ""
  );
  offsets.forEach((offset) => {
    WL("// Variables for " + offset);
    /*
     * for each location (graph vertex) we keep MapLocation (null if not valid (not on map/occupied)),
     * path-length (shortest currently known length of path from origin to location),
     * cost (what added that location would add to total cost, likely something like passability/rubble)
     * Direction (first step taken in path)
     */
    WL("static MapLocation " + offset.toVariableName("loc_") + ";");
    WL("static int " + offset.toVariableName("pathLength_") + " = "+ initPathLength+ ";");
    WL("static int " + offset.toVariableName("cost_") + " = "+ initCost+ ";");
    WL("static Direction " + offset.toVariableName("bestDir_") + ";");

    WL();
  });
  WL();

  // Generate Javadoc
  WJavadoc(
    "Uses own location, target and runs a simplified Bellman-Ford algorithm ",
    "to get the best direction to walk to get to the target.",
    "",
    "@param rc        RobotController of the robot calling this function,",
    "                 this robot's location will be used as origin.",
    "@param target    location on the map to pathfind towards.",
    "@param extra_its number of additional iterations of edge-relaxation are done beyond initialisation",
    "@return the direction to go in"
  );

  // Generate function signature
  WL(
    "public static Direction pathfindTo(final RobotController rc, MapLocation target, final int extra_its) ",
    "throws GameActionException {"
  );
  increaseIndentation();
  WL();

  // First iteration (necessary, different in that it requests game values)
  WComment("Initialise variables from game world for current situation");
  WL("loc_0_0 = rc.getLocation();");
  WL(
    "// check if we are already at the destination",
    "if (loc_0_0.equals(target)) return Direction.CENTER;"
  );
  offsets.forEach((offset) => {
    const locVar = offset.toVariableName("loc_");
    const initalisedLocation = getNearestFilledLocation(offset);
    const initdVar = initalisedLocation.toVariableName("loc_");
    const dir = dxdyToDirection(
      offset.x - initalisedLocation.x,
      offset.y - initalisedLocation.y
    );
    WL(locVar + " = " + initdVar + ".add(" + dir + ");");
    WL(offset.toVariableName("pathLength_") + " = "+ initPathLength + ";");
    WL(offset.toVariableName("cost_") + " = "+ initCost + ";");
    // WL(offset.toVariableName("bestDir_") + " = null;");
  });
  WL();

  // Firstly, check if location is in vision range, if not pick a location to path to instead
  WComment(
    "Check if location is in vision range, if it is not then pick a location to path to instead."
  );
  WL("if (loc_0_0.distanceSquaredTo(target) > " + range + ") {");
  increaseIndentation();
  WL(
    "// target is not currently in vision range",
    "MapLocation nextLoc = loc_0_0.add(loc_0_0.directionTo(target));",
    "MapLocation safe = nextLoc;",
    "// generate a closer target, in the direction of the actual target",
    "while (loc_0_0.distanceSquaredTo(nextLoc) <= " + range + "){",
    "    safe = nextLoc;",
    "    nextLoc = nextLoc.add(nextLoc.directionTo(target));",
    "}",
    "target = safe;"
  );
  decreaseIndentation();
  WL("}", "");

  WComment("Check for each location if it is valid");
  offsets.forEach((offset) => {
    const locVar = offset.toVariableName("loc_");

    WL("// Check validity for " + offset);
    WL(
      "if (rc.onTheMap(" +
        locVar +
        ") && !rc.isLocationOccupied(" +
        locVar +
        ")) {"
    );
    increaseIndentation();
    // body of if, done when location is valid
    WL(
      offset.toVariableName("cost_") + " = rc.senseRubble(" + locVar + ") + 10;"
    );
    decreaseIndentation();
    WL("} else {");
    increaseIndentation();
    // body of else, done when location is invalid
    // WL("rc.setIndicatorDot("+ locVar + ", 255, 0, 0);");
    WL(locVar + " = null;");
    decreaseIndentation();
    WL("}", "");
  });

  WComment("Do initial edge-relaxation.");
  offsets.forEach((offset) => {
    const locVar = offset.toVariableName("loc_");

    if (distanceToOrigin(offset.x, offset.y) <= 2) {
      // Tiles around origin
      WL("// Assigning " + offset);
      WL("if (" + offset.toVariableName("loc_") + " != null) {");
      increaseIndentation();
      WL(
        offset.toVariableName("pathLength_") +
          " = " +
          offset.toVariableName("cost_") +
          " + 10;"
      );
      const dir = dxdyToDirection(0 - offset.x, 0 - offset.y);
      WL(offset.toVariableName("bestDir_") + " = " + dir + ";");
      decreaseIndentation();
      WL("}", "");
    } else {
      // 8 tiles around origin, always shortest path by connecting with origin.
      WL("if (" + locVar + " != null) {");
      increaseIndentation();
      // We check every tile that is in our range
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue; // do not check for own location...

          let modifiedX = offset.x + i;
          let modifiedY = offset.y + j;
          let currentRange = distanceToOrigin(modifiedX, modifiedY);

          // Only check locations that are initalised already
          if (currentRange < distanceToOrigin(offset.x, offset.y)) {
            // Location we need to check!
            let locToCheck = new Location(modifiedX, modifiedY);
            // WL("if their pathlength + our cost is lower than our path length, switch over")
            WL("// Checking " + offset + " to " + locToCheck);
            WL(
              "if (" +
                locToCheck.toVariableName("pathLength_") +
                " + " +
                offset.toVariableName("cost_") +
                " < " +
                offset.toVariableName("pathLength_") +
                ") {"
            );
            increaseIndentation();
            // If we are here in execution, we have found a better route!
            WL(
              offset.toVariableName("pathLength_") +
                " = " +
                locToCheck.toVariableName("pathLength_") +
                " + " +
                offset.toVariableName("cost_") +
                ";"
            );
            // const dir = dxdyToDirection(
            //   locToCheck.x - offset.x,
            //   locToCheck.y - offset.y
            // );
            // WL(offset.toVariableName("bestDir_") + " = " + dir + ";");
            WL(
              offset.toVariableName("bestDir_") +
                " = " +
                locToCheck.toVariableName("bestDir_") +
                ";"
            );
            decreaseIndentation();
            WL("}");
          }
        }
      }

      decreaseIndentation();
      WL("}", "");
    }
  });

  WComment(
    "Possibly improve on shortest route, do more edge-relaxation iterations."
  );
  WLoop("extra_its", () => {
    // Loop body
    offsets.forEach((offset) => {
      const locVar = offset.toVariableName("loc_");

      WL("if (" + locVar + " != null) {");
      increaseIndentation();
      // We check every tile that is in our range
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue; // do not check for own location...

          let modifiedX = offset.x + i;
          let modifiedY = offset.y + j;

          let currentRange = distanceToOrigin(modifiedX, modifiedY);

          if (currentRange <= 2) {
            // 8 tiles around origin, shortest path already set.
            continue;
          }

          // Only check locations that we can actually see
          if (currentRange <= range) {
            // Location we need to check!
            let locToCheck = new Location(modifiedX, modifiedY);
            // WL("if their pathlength + our cost is lower than our path length, switch over")
            WL("// Checking " + offset + " to " + locToCheck);
            WL(
              "if (" +
                locToCheck.toVariableName("pathLength_") +
                " + " +
                offset.toVariableName("cost_") +
                " < " +
                offset.toVariableName("pathLength_") +
                ") {"
            );
            increaseIndentation();
            // If we are here in execution, we have found a better route!
            WL(
              offset.toVariableName("pathLength_") +
                " = " +
                locToCheck.toVariableName("pathLength_") +
                " + " +
                offset.toVariableName("cost_") +
                ";"
            );
            // const dir = dxdyToDirection(
            //   locToCheck.x - offset.x,
            //   locToCheck.y - offset.y
            // );
            // WL(offset.toVariableName("bestDir_") + " = " + dir + ";");
            WL(
              offset.toVariableName("bestDir_") +
                " = " +
                locToCheck.toVariableName("bestDir_") +
                ";"
            );
            decreaseIndentation();
            WL("}");
          }
        }
      }

      decreaseIndentation();
      WL("}", "");
    });
  });
  WL();

  ///////// TEMP FOR DEBUGGING:
  WL("rc.setIndicatorLine(loc_0_0, target, 100, 100, 100);");
  let nextTo = getOffsetsInRange(range);
  nextTo.forEach((l) => {
    // NORTHEAST
    WL(
      "if (" + l.toVariableName("loc_") + " != null) { ",
      "    switch (" + l.toVariableName("bestDir_") + ") {",
      "    case NORTH: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 255, 0, 0); break;",
      "    case NORTHWEST: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 0, 255, 0); break;",
      "    case WEST: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 0, 0, 255); break;",
      "    case SOUTHWEST: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 0, 0, 0); break;",
      "    case SOUTH: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 255, 255, 0); break;",
      "    case SOUTHEAST: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 255, 255, 255); break;",
      "    case EAST: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 255, 0, 255); break;",
      "    case NORTHEAST: rc.setIndicatorDot(" +
        l.toVariableName("loc_") +
        ", 0, 255, 255); break;",
      "    }",
      "}"
    );
  });
  WL(
    'rc.setIndicatorString("pathLen: " + String.valueOf(pathLength_n3_n3) + " cost: " + cost_n3_n3);'
  );
  //////////////////////////////

  // Return best direction
  WComment(
    "We return the opposite of the 'best direction', as the ",
    "best direction is from the perspective of the tile in question."
  );
  WL("return getBestDirection(target).opposite();");

  // Close the function
  decreaseIndentation();
  WL("}", "");

  // Add getBestDirection function
  genGetBestDirection(offsets);

  // Close class
  decreaseIndentation();
  WL("}");
}

/**
 *
 * @param {Location[]} offsets array of locations generated earlier
 */
function genGetBestDirection(offsets) {
  WL("private static Direction getBestDirection (final MapLocation target) {");
  increaseIndentation();

  WComment("Get difference from our origin to goal in x and y.");
  WL("int dx = target.x - loc_0_0.x;");
  WL("int dy = target.y - loc_0_0.y;");
  WL();

  // function body
  const tilesInRange = new Map();
  offsets.forEach((offset) => {
    const x = offset.x;
    const y = offset.y;

    if (!tilesInRange.has(x)) {
      // xMap is not defined yet, create map
      tilesInRange.set(x, new Set());
    }
    xMap = tilesInRange.get(x);
    xMap.add(y);
  });

  // all pairs of x and set of y coords
  const pairs = [...tilesInRange];

  WL("switch (dx) {");
  increaseIndentation();
  pairs.forEach((pair) => {
    WL("case " + pair[0] + ":");
    increaseIndentation();
    WL("switch (dy) {");
    increaseIndentation();
    pair[1].forEach((y) => {
      WL("case " + y + ": ");
      increaseIndentation();
      WL("return " + new Location(pair[0], y).toVariableName("bestDir_") + ";");
      decreaseIndentation();
    });
    decreaseIndentation();
    decreaseIndentation();
    WL("}");
  });
  decreaseIndentation();
  WL("}", "");

  WL(
    "// If this is reached, goal was somehow not in range",
    "return Direction.CENTER;",
  );

  decreaseIndentation();
  WL("}");
}
