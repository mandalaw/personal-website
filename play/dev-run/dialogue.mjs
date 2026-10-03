export const LINES = Object.freeze({
  near: [
    "Too close.",
    "Definitely calculated.",
    "We are calling that clearance.",
    "Still have both shoelaces.",
    "The backpack disagrees.",
  ],
  toronto: [
    "The waterfront branch is looking good.",
    "A streetcar would be less work.",
    "Meet me at the next checkpoint.",
    "Somewhere, a map is being unfolded.",
    "The skyline passed its unit tests.",
    "Toronto has layers. So does this bug.",
    "That is not lake-effect debugging.",
    "North is still up. Good start.",
  ],
  sf: [
    "New coast. Same keyboard.",
    "The hills have strong opinions.",
    "The fog has no error message.",
    "The bridge is doing integration work.",
    "Distributed systems. Distributed hills.",
    "A little less latency, please.",
    "The Bay looks remarkably deployable.",
    "I miss flat ground already.",
  ],
  clear: [
    "That one can stay in the backlog.",
    "Clean landing. Keep that.",
    "No incident report needed.",
    "A surprisingly uneventful deploy.",
    "That is one less thing to debug.",
    "You read that correctly.",
    "Nice timing. No meeting required.",
    "The test is still green.",
    "A small victory for readable code.",
    "We can close that ticket.",
  ],
  jump: [
    "A vertical solution.",
    "Good use of abstraction.",
    "Above the implementation details.",
    "Gravity remains a dependency.",
    "Taking the higher-level view.",
    "That is one way around it.",
    "A brief break from the stack.",
    "Landing is part of the feature.",
  ],
  pickup: [
    "A useful addition to the toolkit.",
    "Tools, not trophies. Yet.",
    "Good timing for a recovery.",
    "This one belongs in the toolbox.",
    "A little test cover goes a long way.",
    "Reviewed. Collected. Moving on.",
    "Small tools. Useful work.",
    "One more familiar face.",
  ],
  hit: [
    "That needs a second look.",
    "A small incident. We recover.",
    "The checkpoint remembers the good parts.",
    "That went straight to production.",
    "All right. Add a test for that.",
    "That was a very literal edge case.",
    "One error is not the whole project.",
    "A brief disagreement with the collision box.",
  ],
  checkpoint: [
    "Saved the working version.",
    "A good place to commit.",
    "That chapter is in the bag.",
    "Fresh checkpoint. Fewer regrets.",
    "The rollback plan is ready.",
    "Progress worth keeping.",
    "We will not redo the whole sprint.",
    "A small, very useful safety net.",
  ],
  gauntlet: [
    "The release window is open.",
    "One service at a time.",
    "Keep the changes small.",
    "We can see the finish from here.",
    "Still no reason to skip the tests.",
    "This is the carefully planned chaos.",
    "Last few tickets.",
    "Production would like a word.",
  ],
  secret: [
    "A side branch. Nicely spotted.",
    "There is always one more detail.",
    "That was not on the main route.",
    "Curiosity has a score now.",
    "A small reward for looking around.",
    "The map had a footnote.",
    "A familiar project, hiding in plain sight.",
    "You found the little extra.",
  ],
  victory: [
    "Build passed. Go get some air.",
    "Both cities. One very tired developer.",
    "A clean finish is still a finish.",
    "The trophy was in scope after all.",
    "The cat accepted the pull request.",
    "A little persistence goes a long way.",
    "There is more work through the next door.",
    "Now that was a reasonable side quest.",
  ],
});
export class Dialogue {
  constructor() {
    this.recent = [];
    this.next = 0;
    this.line = "A small trip through a very large backlog.";
    this.until = Infinity;
  }
  say(category, time, force = false) {
    if (!force && time < this.next) return null;
    const bank = LINES[category] || LINES.clear,
      options = bank.filter((x) => !this.recent.slice(-10).includes(x));
    this.line = (options.length ? options : bank)[
      Math.floor(Math.random() * (options.length || bank.length))
    ];
    this.recent.push(this.line);
    this.recent = this.recent.slice(-20);
    this.next = time + 7;
    this.until = time + 5;
    return this.line;
  }
}
