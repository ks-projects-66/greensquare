/** Illustrative business situation, not a benchmark or a customer result. */
export const frameProcess = {
  initialQuestion: 'Should we expand?',
  question: 'How should we grow without overloading the business?',
  inputs: [
    { id: 'facts', name: 'Facts', lines: ['Demand is growing', 'The team is near capacity'] },
    { id: 'constraints', name: 'Constraints', lines: ['Hiring takes time', 'Investment is limited'] },
    { id: 'assumptions', name: 'Assumptions', lines: ['Demand will continue', 'Managers can absorb more'] },
    { id: 'goals', name: 'Goals', lines: ['Grow revenue', 'Protect service quality'] },
  ],
  criteria: ['Growth', 'Capacity', 'Cost', 'Risk', 'Reversibility'],
  options: [
    { id: 'now', name: 'Expand now', before: 'Needs spare capacity now', after: 'No capacity for immediate growth', tradeoff: 'Fast growth; hiring needed' },
    { id: 'stages', name: 'Expand in stages', before: 'Needs capacity in stages', after: 'Release capacity before each stage', tradeoff: 'Slower, reversible growth' },
    { id: 'partner', name: 'Work with a partner', before: 'Shares capacity externally', after: 'Shares capacity externally', tradeoff: 'Less control of service' },
    { id: 'maintain', name: 'Maintain the current position', before: 'Adds no capacity pressure', after: 'Adds no capacity pressure', tradeoff: 'Defers growth' },
  ],
  states: [
    { id: 'situation', name: 'Situation inputs', caption: 'Start by separating what is known from what is assumed.' },
    { id: 'question', name: 'Initial question', caption: 'A plausible question. But it leaves the capacity problem outside the decision.' },
    { id: 'reframe', name: 'Reframed decision', caption: 'The capacity constraint changes the question itself.' },
    { id: 'options', name: 'Expanded options', caption: 'Create real alternatives before choosing a preference.' },
    { id: 'comparison', name: 'Criteria comparison', caption: 'Test every option against the same criteria, agreed before comparison.' },
    { id: 'uncertainty', name: 'Uncertainty feedback', caption: 'Test the assumption. Bring the finding back. Change the support for each option.' },
    { id: 'decision', name: 'Final decision state', caption: 'A supported direction, with its conditions intact. The decision remains yours.' },
  ],
  fields: [
    { name: 'Direction', text: 'Expand in stages', detail: 'Supported with conditions' },
    { name: 'Reasons and trade-offs', text: 'Grow at a manageable pace', detail: 'Slower growth; less risk of overload' },
    { name: 'Conditions', text: 'Release capacity before each stage', detail: 'Demand durability remains uncertain' },
    { name: 'Next step', text: 'Review workload before committing', detail: 'Reopen the decision if capacity is unavailable' },
  ],
} as const;
