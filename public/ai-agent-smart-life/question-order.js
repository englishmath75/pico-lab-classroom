/* Shuffle only public practice choices; keep the original question bank untouched. */
(function(root) {
  "use strict";
  function shuffleQuestion(q, random = Math.random) {
    const originalIndices = q[1].map((_, i) => i);
    for (let i = originalIndices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [originalIndices[i], originalIndices[j]] = [originalIndices[j], originalIndices[i]];
    }
    return {
      question: [q[0], originalIndices.map(i => q[1][i]), originalIndices.indexOf(q[2]), q[3]],
      originalIndices
    };
  }
  root.AASL_shuffleQuestion = shuffleQuestion;
})(window);
