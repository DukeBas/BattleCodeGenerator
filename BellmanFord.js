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
  WComment("Variable declarations. Location names based on off-set from origin.");
  WL("static MapLocation ownLoc;", "");
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
    "public Direction pathfindTo(RobotController rc, MapLocation target, int iterations) { "
  );
  increaseIndentation();
  WL();

  // First iteration (necessary, different in that it requests game values)
  WComment("Initialise variables from game world for current situation");
  WL("ownLoc = rc.getLocation();", "");
  offsets.forEach((offset) => {
    let locVar = offset.toVariableName("loc_");

    WL("// Initialise for " + offset);
    WL(locVar + " = TODO")
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
    WL(locVar + " = null;")
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
