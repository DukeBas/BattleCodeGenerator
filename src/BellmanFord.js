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

// call main function
generateBMF(20);

//////TODO
// Unreachable goal?
// Goal outside of vision?
// Write out number of here iterations and optimise for it

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
    "static final int pathLength_0_0 = 0;",
    "// we do not need a cost for starting location",
    "static final Direction bestDir_0_0 = Direction.CENTER;",
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
    WL("static int " + offset.toVariableName("pathLength_") + " = 1147483647;");
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
    "@param rc        RobotController of the robot calling this function,",
    "                 this robot's location will be used as origin.",
    "@param target    location on the map to pathfind towards.",
    "@param extra_its number of additional iterations of edge-relaxation are done beyond initalisation",
    "@returns the direction to go in"
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
  offsets.forEach((offset) => {
    const locVar = offset.toVariableName("loc_");
    const initalisedLocation = getNearestFilledLocation(offset);
    const initdVar = initalisedLocation.toVariableName("loc_");
    const dir = dxdyToDirection(
      offset.x - initalisedLocation.x,
      offset.y - initalisedLocation.y
    );
    WL(locVar + " = " + initdVar + ".add(" + dir + ");");
    // WL(offset.toVariableName("pathLength_") + " = Integer.MAX_VALUE;");
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
    WL(offset.toVariableName("cost_") + " = rc.senseRubble(" + locVar + ");");
    decreaseIndentation();
    WL("} else {");
    increaseIndentation();
    // body of else, done when location is invalid
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
      WL(
        offset.toVariableName("pathLength_") +
          " = " +
          "pathLength_0_0" +
          " + " +
          offset.toVariableName("cost_") +
          ";"
      );
      const dir = dxdyToDirection(0 - offset.x, 0 - offset.y);
      WL(offset.toVariableName("bestDir_") + " = " + dir + ";", "");
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

  // Return best direction
  WL("return getBestDirection();"); // TODO

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
function genGetBestDirection(offsets){
  WL("private Direction getBestDirection {");
  increaseIndentation();

  // function body
  const tilesInRange = new Map();
  offsets.forEach((offset) => {
    const x = offset.x;
    const y = offset.y;

    if (!tilesInRange.has(x)){ // xMap is not defined yet, create map
      tilesInRange.set(x, new Set());
    }
    xMap = tilesInRange.get(x);
    xMap.add(y);    
  });

  // all pairs of x and set of y coords
  const pairs = [...tilesInRange];

  WL("switch1");
  increaseIndentation();
  pairs.forEach((pair) => {
    WL("case "+pair[0]+" switch2 ");
    increaseIndentation();
    pair[1].forEach((y) => {
      WL("case " +y + " ");
    })
    decreaseIndentation();
  });
  decreaseIndentation();


  decreaseIndentation();
  WL("}");
}
