// All embedded study handbooks, in study order (DSA topics, then the
// probability refresher and the system-design reference). Each module
// default-exports a guide object:
// { id, title, subtitle, emoji, intro, sections[], cheatsheet[] }.
import arraysHashing from "./arraysHashing.js";
import twoPointersSlidingWindow from "./twoPointersSlidingWindow.js";
import binarySearch from "./binarySearch.js";
import stacks from "./stacks.js";
import linkedLists from "./linkedLists.js";
import binaryTrees from "./binaryTrees.js";
import tries from "./tries.js";
import heapsGraphs from "./heapsGraphs.js";
import backtracking from "./backtracking.js";
import dynamicProgramming from "./dynamicProgramming.js";
import greedy from "./greedy.js";
import bitManipulation from "./bitManipulation.js";
import probability from "./probability.js";
import systemDesign from "./systemDesign.js";

export const GUIDES = [
  arraysHashing,
  twoPointersSlidingWindow,
  binarySearch,
  stacks,
  linkedLists,
  binaryTrees,
  tries,
  heapsGraphs,
  backtracking,
  dynamicProgramming,
  greedy,
  bitManipulation,
  probability,
  systemDesign,
];
