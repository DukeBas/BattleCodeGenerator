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
 */
function generateBMF() {
  // Generate all tiles we need to consider (in order).
  let offsets;

  // Generate Javadoc
  WL(
    "/**",
    "* Uses own location, target and runs a simplified Bellman-Ford algorithm ",
    "* to get the best direction to walk to get to the target.",
    "* ",
    "* @param rc RobotController of the robot calling this function,",
    "*           this robot's location will be used as origin.",
    "* @param target location on the map to pathfind towards.",
    "* @returns the direction to go in",
    "*/"
  );

  // Generate function signature
  WL(
    "public Direction getDirectionTo(RobotController rc, MapLocation target){ "
  );
  increaseIndentation();
  WL();

  // Generate variable declarations.
  WL("Variable declarations. Names based on off-set from origin.");

  // Assign variables with ingame values.
  WL("Assigning variables with values from the game world.");

  // Close the function
  decreaseIndentation();
  WL("}");
}

generateBMF();
