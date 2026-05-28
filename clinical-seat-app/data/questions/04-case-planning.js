/* Domain 4 — Case Conceptualization and Planning (12% of exam) */

(function (BANK) {
  BANK.push(
// ============ 4A. Planning Therapeutic Goals (target: 2 items) ============
{
  id: 'CP-4A-001',
  domain: 4, subsection: '4A',
  stem: 'A 32-year-old client has completed three assessment sessions for symptoms of depression following a job loss. She reports she wants to "feel better" and "get her life back together." The therapist is preparing to formulate the treatment plan with the client. Which of the following goals is MOST appropriate to include in the initial treatment plan?',
  options: [
    'Reduce frequency/intensity of depressive symptoms and increase engagement in daily activities over eight weeks',
    'Resolve the underlying personality vulnerabilities contributing to the client\'s recurring depressive episodes',
    'Achieve full remission of all depressive symptoms within eight weeks of beginning weekly therapy sessions',
    'Develop insight into the role of childhood losses and family-of-origin patterns in the current depressive episode'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Treatment goals should be measurable, time-bound, and clinically appropriate to the presentation. Reducing symptom frequency/intensity and increasing functional engagement are both measurable and grounded in what the client has presented with.',
    distractors: {
      1: 'Resolving "underlying personality vulnerabilities" is neither measurable nor time-bound, and presumes a personality-level formulation the therapist has not yet established.',
      2: 'Guaranteeing full remission in a specific time frame promises an outcome the therapist cannot control and sets up the client for failure if remission does not occur on that timeline.',
      3: 'Insight into childhood losses may emerge in therapy but is not a measurable treatment goal and assumes a psychodynamic frame not yet agreed with the client.'
    }
  },
  difficulty: 2,
  tags: ['goal-setting', 'SMART']
},
{
  id: 'CP-4A-002',
  domain: 4, subsection: '4A',
  stem: 'A couple has completed two sessions, each describing chronic conflict and disconnection. They state their goal is to "be happy together again." The therapist is drafting the treatment plan. Which of the following actions should the therapist take to define the course of treatment?',
  options: [
    'Collaboratively translate the couple\'s stated goal into specific, observable changes in interaction and behavior over an agreed time frame',
    'Adopt the couple\'s stated goal as written, since collaborative goal-setting honors client autonomy',
    'Replace the couple\'s stated goal with research-supported targets such as reduced criticism and contempt',
    'Defer goal-setting until the couple has demonstrated they can communicate without conflict in session'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Goal-setting is collaborative AND operationalized. The therapist works with the couple to translate "be happy together" into concrete, observable indicators (e.g., frequency of repair attempts, time spent in shared activities, ratio of positive to negative interactions) that both can recognize as progress.',
    distractors: {
      1: 'Goal-setting respects autonomy but also requires that the goal be operationalized to be useful. A vague goal cannot be measured or guide intervention selection.',
      2: 'Replacing client goals with the therapist\'s preferred targets without collaboration disrespects autonomy and may not address what the couple cares about.',
      3: 'Deferring goal-setting until the presenting problem has resolved is circular — the couple comes to therapy precisely because they cannot do this on their own.'
    }
  },
  difficulty: 2,
  tags: ['goal-setting', 'couple', 'collaborative']
},

// ============ 4B. Implementing Theory (target: 2 items) ============
{
  id: 'CP-4B-001',
  domain: 4, subsection: '4B',
  stem: 'A family presents with a 14-year-old "identified patient" whose acting-out behavior has prompted treatment. The therapist conceptualizes that the adolescent\'s symptoms serve a function within the family\'s emotional system — specifically, that the symptoms keep the parents focused on the child rather than on their own marital distress. Which theoretical orientation is the therapist applying?',
  options: [
    'Structural family therapy',
    'Bowen family systems theory',
    'Strategic family therapy',
    'Narrative therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Bowen family systems theory describes how symptoms can be triangulated — a child\'s symptoms emerge to manage anxiety in the parental dyad, becoming the "third leg" of a triangle that stabilizes the parental relationship. The conceptualization that symptoms keep the parents focused on the child is classic Bowenian triangulation.',
    distractors: {
      0: 'Structural family therapy (Minuchin) focuses on family structure — subsystems, boundaries, hierarchy — and would conceptualize the problem in terms of enmeshment, disengagement, or boundary violations between subsystems, not symptom function in regulating parental anxiety.',
      2: 'Strategic family therapy (Haley, Madanes) does consider symptom function but uses paradoxical and directive interventions and conceptualizes problems in terms of power and control hierarchies and unsuccessful solution attempts — not specifically in the language of triangulation and emotional system regulation.',
      3: 'Narrative therapy (White, Epston) externalizes problems and explores client-preferred narratives. It would not frame the adolescent\'s symptoms in terms of intra-family emotional regulation.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'Bowen', 'systems']
},
{
  id: 'CP-4B-002',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a couple in distress asks each partner to identify a specific behavior that, if changed, would make the largest positive difference in the relationship. She helps the couple track exceptions — times when each partner already does that behavior — and amplifies those instances. Which theoretical orientation is the therapist applying?',
  options: [
    'Solution-focused brief therapy',
    'Emotionally focused therapy',
    'Cognitive-behavioral therapy',
    'Gottman method couples therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Identifying exceptions to the problem, amplifying existing strengths, and orienting the work toward what the client wants more of (rather than what they want less of) are core solution-focused techniques. The frame is "what is already working that we can do more of."',
    distractors: {
      1: 'EFT (Johnson) focuses on attachment emotions and the cycle of negative interaction, accessing primary emotion underneath secondary reactive emotion. It is not exception-focused or strength-amplifying in the SFBT sense.',
      2: 'CBT for couples would target cognitive distortions and behavioral patterns directly, often with skills training, not via exception-finding and amplification.',
      3: 'The Gottman method uses specific assessments (Sound Relationship House) and interventions targeting the "Four Horsemen," repair attempts, etc. — a structured behavioral-systemic approach, not exception-finding.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'SFBT', 'postmodern']
},

// ============ 4C. Planning for Termination (target: 2 items) ============
{
  id: 'CP-4C-001',
  domain: 4, subsection: '4C',
  stem: 'A therapist has been seeing a client weekly for two years. The client has met her treatment goals, has stabilized in her career and relationship, and now reports that she finds little new content to bring to sessions. The client says she "would miss" the therapist but acknowledges that she may be ready to end. Which of the following actions should the therapist take?',
  options: [
    'Initiate collaborative termination planning, including review of progress, maintenance of gains, and processing the ending',
    'Reduce session frequency to monthly to ease the client\'s transition before any formal termination is initiated',
    'Continue weekly sessions and explore the client\'s reluctance to bring up deeper material she has not yet addressed',
    'Recommend the client switch to a different therapist to gain a fresh perspective on what may be remaining work'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When treatment goals are met and the client is functioning well, the appropriate clinical action is to initiate the termination process: review progress, consolidate gains, plan for maintenance and relapse prevention, and process the ending of the therapeutic relationship.',
    distractors: {
      1: 'Reducing frequency may be appropriate as part of a termination plan, but choosing it without explicit termination planning extends the relationship without addressing what the client is asking about.',
      2: 'Framing the client\'s readiness as "reluctance to address deeper material" pathologizes appropriate readiness for termination and serves the therapist\'s desire to continue rather than the client\'s clinical needs.',
      3: 'Recommending a switch to another therapist treats successful completion as a failure and unnecessarily disrupts what is a positive clinical outcome.'
    }
  },
  difficulty: 2,
  tags: ['termination', 'collaborative']
},
{
  id: 'CP-4C-002',
  domain: 4, subsection: '4C',
  stem: 'A therapist informs a client that he is closing his private practice in three months to relocate. The client has been in therapy for severe trauma for 18 months and is in the middle of active exposure-based processing of a traumatic memory. Which of the following actions should the therapist take?',
  options: [
    'Begin transition planning immediately: stabilize current trauma work, provide referrals, and process the ending\'s meaning',
    'Complete the active trauma processing within the three-month window so the client is not left mid-treatment when therapy ends',
    'Refer the client out immediately to another trauma specialist to avoid the disruption of a planned termination mid-processing',
    'Offer telehealth from the new location after the move so the client can preserve continuity of the established relationship'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Therapist-initiated termination during active trauma processing requires careful transition: stabilize the current work, provide referrals, and explicitly process the meaning of the ending — particularly because abandonment dynamics may be central to the client\'s trauma. Three months is sufficient time to plan thoughtfully.',
    distractors: {
      1: 'Forcing completion of active trauma processing within a hard deadline risks rushing the work and producing destabilization rather than resolution. The clinical task adapts to what the client can integrate, not to the calendar.',
      2: 'Immediate referral abandons the client mid-processing and forecloses the opportunity for a planned, processed termination — which is itself therapeutic for trauma clients.',
      3: 'Offering telehealth across state lines may not be legally permissible (the LMFT is licensed in California, and providing therapy to clients located in another state generally requires authorization from that state) and may not address whether the client actually wants ongoing telehealth.'
    }
  },
  difficulty: 3,
  tags: ['termination', 'therapist-initiated', 'trauma']
},

// ===== Batch 2 additions =====

// --- 4A additions ---
{
  id: 'CP-4A-003',
  domain: 4, subsection: '4A',
  stem: 'A therapist has been working with a client for three months on goals of reducing anxiety and improving sleep. The client reports she is sleeping better but her anxiety in social situations has not changed. She wonders whether therapy is "working." Which of the following actions should the therapist take?',
  options: [
    'Review progress against the goals collaboratively and discuss whether the treatment approach should be modified for the unchanged symptom',
    'Reassure the client that change is non-linear and that the social anxiety will likely improve in time',
    'Add a new treatment goal targeting social anxiety specifically to the existing treatment plan',
    'Recommend the client wait three more months before reassessing whether treatment is working'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When progress is partial — improvement on one goal, stagnation on another — the appropriate action is to review collaboratively, examine which interventions worked and which did not, and discuss modifying the approach for the unchanged area. This is the monitoring-and-modification task of ongoing treatment planning.',
    distractors: {
      1: 'Reassuring without examining the actual data treats the client\'s observation as a problem to manage rather than as clinically useful information about treatment effectiveness.',
      2: 'Adding a new goal without discussing the existing plan and approach skips the collaborative review and may layer interventions without coherence.',
      3: 'Recommending the client wait without examination forecloses the iterative refinement that the partial-response data invites.'
    }
  },
  difficulty: 2,
  tags: ['progress-review', 'modification']
},
{
  id: 'CP-4A-004',
  domain: 4, subsection: '4A',
  stem: 'A client has been in therapy for five sessions. The therapist notices that the client cancels frequently, comes late when she does attend, and often pivots to surface topics when the therapist explores anything emotionally substantive. The client recently said the sessions feel "nice but kind of pointless." Which of the following actions should the therapist take?',
  options: [
    'Bring the in-session pattern directly into the conversation, explore the client\'s experience of the therapeutic alliance, and address any rupture or misattunement',
    'Continue the existing approach and trust that engagement will deepen with time',
    'Refer the client to a different therapist who may be a better fit',
    'Increase the structure of sessions with an agenda and homework to make the work feel more substantive'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The behavioral signs (cancellations, lateness, surface pivots) plus the client\'s direct statement ("pointless") are alliance and engagement signals that should be addressed directly. Monitoring the alliance and surfacing ruptures is a core treatment-planning task and an evidence-based driver of outcomes.',
    distractors: {
      1: 'Trusting that engagement will deepen without addressing what the client is signaling now will likely produce continued disengagement or dropout.',
      2: 'Referring out before exploring the rupture treats the symptom as a fit problem when it may be an alliance dynamic the therapist can address.',
      3: 'Adding structure addresses one possible explanation but bypasses the more important alliance conversation; structural changes without alliance work tend not to land.'
    }
  },
  difficulty: 2,
  tags: ['alliance', 'rupture']
},

// --- 4B additions ---
{
  id: 'CP-4B-003',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a family asks them to enact a typical mealtime interaction in session. As they begin, she asks the father to switch chairs with the daughter and the mother to remain quiet for the first three minutes. She observes how the interaction shifts when the arrangement changes. Which intervention is the therapist using?',
  options: [
    'Enactment within structural family therapy',
    'Paradoxical prescription within strategic family therapy',
    'Sculpting within experiential family therapy',
    'Reflecting team within postmodern family therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Enactment is a hallmark structural family therapy technique (Minuchin) in which the therapist has family members interact in session as they do at home, then alters the configuration (chair changes, who speaks) to test and shift the family\'s structural patterns in real time.',
    distractors: {
      1: 'Paradoxical prescription assigns the symptom or directs the family to do more of the problem behavior; the technique described is not paradoxical.',
      2: 'Sculpting (Satir / experiential approaches) involves arranging family members in physical postures that represent emotional relationships, often without spoken interaction; the in-session interaction described is enactment, not sculpting.',
      3: 'Reflecting team involves a team of therapists openly discussing the family\'s presentation while the family observes; this is not what is described.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'structural', 'Minuchin']
},
{
  id: 'CP-4B-004',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a couple in chronic gridlock around the husband\'s reluctance to commit to having children prescribes that, for the next two weeks, the couple have a structured "gridlock conversation" daily — without trying to resolve it. The therapist explains that the goal is not change but learning more about the gridlock. Which intervention is the therapist using?',
  options: [
    'Paradoxical prescription within strategic family therapy',
    'Cognitive restructuring within CBT',
    'Externalizing the problem within narrative therapy',
    'Solution amplification within solution-focused brief therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Prescribing the symptom — having the couple deliberately do more of the gridlocked interaction with no expectation of resolution — is a paradoxical directive within strategic family therapy (Haley, Madanes). The intervention disrupts the couple\'s solution-attempts that have been maintaining the problem.',
    distractors: {
      1: 'Cognitive restructuring targets distorted thoughts, not interactional gridlock; the intervention does not work on cognition.',
      2: 'Externalizing names the problem as separate from the person; the intervention here does not externalize.',
      3: 'SFBT amplifies exceptions and what is already working; the intervention here amplifies the problem itself, which is the opposite move.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'strategic', 'paradoxical']
},
{
  id: 'CP-4B-005',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a client who experiences intense self-criticism asks her to identify the "part of her" that criticizes her, give it a name and description, and explore what that part is trying to protect her from. The therapist treats the critical part as having its own perspective and intentions. Which theoretical orientation is the therapist applying?',
  options: [
    'Internal Family Systems',
    'Gestalt therapy',
    'Cognitive-behavioral therapy',
    'Acceptance and commitment therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Internal Family Systems (Schwartz) conceptualizes the psyche as composed of "parts," each with its own perspective and protective intent. Identifying a part, naming it, exploring its protective function, and engaging with it as a sub-personality is the IFS approach.',
    distractors: {
      1: 'Gestalt therapy uses two-chair work and direct dialogue with disowned aspects of self but does not use the parts/Self framework or focus on protective intent in the IFS sense.',
      2: 'CBT would target the self-critical thoughts as cognitive distortions to be identified and restructured, not as a part with its own intentions.',
      3: 'ACT focuses on cognitive defusion and value-based action; it does not personify aspects of cognition into parts with protective intent.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'IFS']
},

// --- 4C addition ---
{
  id: 'CP-4C-003',
  domain: 4, subsection: '4C',
  stem: 'A therapist informs a long-term client three sessions in advance that the therapist will be on parental leave for six weeks and has arranged for a coverage therapist. The client says she is "fine" but in the next session begins missing appointments and not returning the therapist\'s outreach calls. Which of the following actions should the therapist take?',
  options: [
    'Reach out directly to acknowledge the impact of the upcoming leave and invite the client to talk about her response before the leave begins',
    'Respect the client\'s communication that she is "fine" and let her re-engage when she is ready',
    'Document the missed sessions and consider whether the client has terminated treatment by ghosting',
    'Have the coverage therapist contact the client directly to introduce themselves and offer continuity'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The behavioral shift (missed appointments, no callbacks) signals that the upcoming leave has produced something the client could not name when asked. Reaching out to acknowledge the impact and inviting her to talk addresses the rupture before the leave compounds it.',
    distractors: {
      1: 'Respecting the surface statement while ignoring the behavioral signal misses what the client is communicating non-verbally and may result in lost engagement.',
      2: 'Treating the missed sessions as termination skips over the alliance rupture and may abandon a client who has signaled distress about the upcoming separation in the only way she could.',
      3: 'Having the coverage therapist initiate contact handles the logistics but does not address the therapist-client relational dynamic that has emerged.'
    }
  },
  difficulty: 3,
  tags: ['therapist-leave', 'rupture', 'abandonment-dynamics']
},

// ===== Batch 3 additions =====

// --- 4A additions ---
{
  id: 'CP-4A-005',
  domain: 4, subsection: '4A',
  stem: 'A therapist has been seeing a couple for four months. Over the past month, both partners have grown distant in session, give short answers to questions, and report little change in their dynamic at home. They have not raised concerns directly but engagement has clearly dropped. Which of the following actions should the therapist take?',
  options: [
    'Continue the current treatment approach for two more sessions before raising concerns',
    'Increase session frequency to twice weekly to intensify the work',
    'Bring the observed shift directly into the conversation, ask each partner how they think therapy is going, and invite a recalibration of goals or approach',
    'Recommend the couple take a break from therapy until they feel more motivated'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'The observable behavioral shift (distance, short answers, no reported change) is a clinical signal that the work has stalled. The appropriate action is to bring it directly into the conversation, gather each partner\'s perspective on how therapy is going, and recalibrate goals or approach if needed. Alliance-focused, transparent.',
    distractors: {
      0: 'Continuing without addressing the shift trusts that engagement will return spontaneously, which is unlikely once disengagement has set in.',
      1: 'Intensifying frequency without examining what is or is not working may compound the disengagement.',
      3: 'Recommending a break frames disengagement as motivation failure rather than as a signal about the work itself.'
    }
  },
  difficulty: 3,
  tags: ['progress-monitoring', 'alliance']
},
{
  id: 'CP-4A-006',
  domain: 4, subsection: '4A',
  stem: 'A therapist is constructing a treatment plan with a client who presents with severe trauma symptoms, ongoing housing instability, and active substance use. The client wants to "work through what happened to me." Which of the following actions should the therapist take?',
  options: [
    'Begin trauma-focused processing immediately, since the client has identified this as her goal',
    'Establish goals that prioritize basic safety and stabilization (housing, substance use, present-day functioning) before initiating trauma processing, while validating the client\'s stated goal',
    'Treat all three problem areas concurrently with equal weight in the treatment plan',
    'Defer treatment planning until the client has resolved her housing and substance use independently'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Trauma treatment follows a phase-based model — safety and stabilization first, processing second, integration third. Beginning processing while the client is unhoused and using substances risks destabilization. The treatment plan establishes the phase-appropriate goals while honoring her stated direction.',
    distractors: {
      0: 'Beginning trauma processing before stabilization is contraindicated and risks worsening symptoms and functional collapse.',
      2: 'Treating all areas equally without sequencing ignores the phase-based principle and may overwhelm a client whose stabilization is itself the prerequisite for the deeper work.',
      3: 'Deferring all treatment until the client resolves her circumstances independently abandons her at the moment when therapy could most support the stabilization phase.'
    }
  },
  difficulty: 3,
  tags: ['phase-based', 'trauma-treatment-planning']
},

// --- 4B additions ---
{
  id: 'CP-4B-006',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a family struggling with their teenage daughter\'s eating disorder treats the eating disorder as an "outside force" that has captured the daughter\'s thinking and behavior. The therapist enlists the parents as allies against the disorder, not against the daughter, and conceptualizes treatment as the family banding together to push the disorder out. Which theoretical orientation is the therapist applying?',
  options: [
    'Maudsley / family-based treatment with externalization of the eating disorder',
    'Structural family therapy targeting the parental subsystem',
    'Strategic family therapy with paradoxical directives',
    'Bowen family systems theory addressing emotional cutoff'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Maudsley / family-based treatment (FBT) for adolescent eating disorders externalizes the eating disorder as a separate entity from the adolescent, mobilizes parents as the primary agents of recovery (particularly in Phase 1, around refeeding), and treats the family as a united front against the disorder. This is the leading evidence-based approach for adolescent anorexia.',
    distractors: {
      1: 'Structural family therapy strengthens subsystem boundaries and hierarchy but does not specifically externalize the symptom or use the family-band-together-against-the-disorder frame.',
      2: 'Strategic family therapy uses paradoxical and directive techniques but does not characteristically externalize the symptom in the FBT/narrative way.',
      3: 'Bowen FST focuses on differentiation, triangulation, and multigenerational emotional process — not on family alliance against an externalized symptom.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'FBT', 'externalization', 'eating-disorder']
},
{
  id: 'CP-4B-007',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with an adult client conceptualizes the client\'s recurring problem of "not feeling good enough" as a developmental wound from a critical parent. The therapist works experientially in session — having the client speak to an empty chair as if the parent were sitting in it, expressing the unspoken feelings and needs from childhood. Which intervention is the therapist using?',
  options: [
    'Cognitive restructuring within CBT',
    'Two-chair work within Gestalt therapy',
    'Externalization within narrative therapy',
    'Sculpting within experiential family therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Two-chair (or empty-chair) work is a signature Gestalt therapy technique that brings unfinished business into the present moment by having the client speak directly to an imagined other (or to a disowned part of self). The experiential, in-session enactment of unspoken material is the Gestalt method.',
    distractors: {
      0: 'CBT targets cognitive distortions through restructuring; the empty-chair technique is not within the CBT toolkit.',
      2: 'Narrative externalization names the problem as separate from the person; the empty chair is dialogic with a person, not an externalization of the problem.',
      3: 'Sculpting arranges family members in physical postures; the empty chair is not sculpting — it is dialogue with an absent or symbolic other.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'Gestalt', 'two-chair']
},

// --- 4C additions ---
{
  id: 'CP-4C-004',
  domain: 4, subsection: '4C',
  stem: 'A client who has been in therapy for nine months announces in session that this will be her last session. She has decided abruptly that she no longer needs therapy, but offers no specific reason. She has been making progress and the relationship has been productive. Which of the following actions should the therapist take?',
  options: [
    'Honor the client\'s decision and complete a brief closing in the same session',
    'Refuse to terminate without a planned termination process and require the client to attend three more sessions',
    'Acknowledge the client\'s decision while exploring what prompted the abrupt timing, and offer at least one additional session for termination work even if she chooses to use it',
    'Recommend the client return when she is ready for more conventional termination'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Client-initiated abrupt termination warrants acknowledgment of her autonomy, exploration of what is driving the timing (often relevant clinically — a rupture, a defense, life context), and the offer of additional sessions for termination work. The therapist honors her choice without rushing past what may be clinically important.',
    distractors: {
      0: 'Honoring the decision without exploration misses what is often important clinical information and may also leave open business that the client could integrate with one more session.',
      1: 'Refusing to terminate or requiring sessions violates client autonomy and may be coercive.',
      3: 'Telling her to come back when she is ready for conventional termination dismisses her current decision and creates a hostile re-entry path.'
    }
  },
  difficulty: 2,
  tags: ['termination', 'client-initiated', 'abrupt']
},
{
  id: 'CP-4C-005',
  domain: 4, subsection: '4C',
  stem: 'A therapist and a client are in the final phase of treatment, with two sessions remaining. The therapist is planning the termination work. Which of the following is MOST appropriate for the second-to-last session?',
  options: [
    'Identify follow-up referrals and arrange for them to be in place before the final session',
    'Begin a new clinical issue that has emerged in recent sessions, to use the remaining time productively',
    'Review the client\'s progress, consolidate gains, identify maintenance strategies and relapse signals, and process feelings about the ending',
    'Reduce the work to social conversation to ease the transition out of therapy'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'The penultimate session in a planned termination typically covers progress review, consolidation of gains, maintenance and relapse-prevention planning, and processing of feelings about the ending. These are the standard termination tasks, sequenced before the final session\'s closing.',
    distractors: {
      0: 'Identifying follow-up referrals may be a part of the termination work but is a logistical task, not the central work of the second-to-last session.',
      1: 'Opening a new clinical issue in the penultimate session sets up incomplete work that cannot be addressed in the remaining time.',
      3: 'Reducing the work to social conversation forecloses the actual termination work, which has therapeutic value of its own.'
    }
  },
  difficulty: 2,
  tags: ['termination', 'phase-tasks']
},

// ===== Batch 5: Case planning depth =====

// --- 4A additions ---
{
  id: 'CP-4A-007',
  domain: 4, subsection: '4A',
  stem: 'A therapist and client have been working for four months on goals related to reducing anxiety and improving sleep. In session, the client mentions she has been experiencing more frequent intrusive memories of a childhood trauma she has not previously discussed in therapy. She is unsure if she wants to address it. Which of the following actions should the therapist take?',
  options: [
    'Begin trauma processing in the next session to capitalize on the emerging material',
    'Note the disclosure and continue the original treatment focus without expanding scope',
    'Discuss with the client whether and how to integrate the trauma material into the treatment plan, including what would change about goals, pacing, and informed consent for trauma work',
    'Refer the client to a trauma specialist while maintaining the original treatment focus'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Expanding treatment focus is a collaborative treatment-planning conversation that includes informed consent for the new direction. Goals, pacing, and the client\'s readiness/preference shape whether and how to expand.',
    distractors: {
      0: 'Beginning trauma processing without the treatment-planning conversation skips informed consent and the readiness assessment.',
      1: 'Continuing the original focus without acknowledgment of the emerging material may communicate that important content is unwelcome.',
      3: 'Reflexive referral out without the collaborative conversation may not match the client\'s preferences and forecloses the option of expanding the existing work.'
    }
  },
  difficulty: 3,
  tags: ['treatment-planning', 'expanding-scope', 'informed-consent']
},
{
  id: 'CP-4A-008',
  domain: 4, subsection: '4A',
  stem: 'A therapist working with a couple has identified that their negative interaction cycle is the focus of treatment. After eight sessions of cycle work, the wife asks, "How will we know when therapy is working?" Which of the following actions should the therapist take?',
  options: [
    'Identify specific observable indicators of cycle change (frequency of escalations, recovery time after conflict, ability to repair) that both partners can recognize',
    'Reassure the wife that therapy takes time and that she should trust the process',
    'Recommend the couple keep a daily journal of every interaction to track progress',
    'Refer to standardized couple-functioning questionnaires for objective measurement'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Operationalizing progress indicators makes outcome measurable and gives the couple a way to track their own change. Specific behavioral and interactional indicators are recognizable to both partners and provide useful feedback for the treatment plan.',
    distractors: {
      1: 'Reassuring to trust the process avoids the legitimate question of what change looks like.',
      2: 'Daily journaling of every interaction is overly burdensome and may shift focus to recording rather than experiencing.',
      3: 'Standardized questionnaires can supplement but as the primary answer they outsource the question to instruments rather than the couple\'s own recognition.'
    }
  },
  difficulty: 2,
  tags: ['outcome-measurement', 'couple-progress']
},

// --- 4B (theory) additions ---
{
  id: 'CP-4B-008',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a 35-year-old client with a history of childhood neglect uses an attachment-based formulation: the client\'s difficulties in adult relationships are conceptualized as activations of insecure-avoidant attachment, with the therapist providing a corrective experience as a secure base. Which theoretical orientation is the therapist applying?',
  options: [
    'Cognitive-behavioral therapy with attachment integration',
    'Attachment-based psychotherapy',
    'Bowen family systems theory',
    'Internal Family Systems'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Attachment-based psychotherapy conceptualizes adult relational difficulties through attachment-style activations (anxious, avoidant, disorganized) and uses the therapeutic relationship as a corrective experience providing a secure base.',
    distractors: {
      0: 'CBT focuses on cognitions and behaviors; while attachment can inform CBT formulations, the corrective-secure-base relational use is more centrally attachment-based.',
      2: 'Bowen FST works with multigenerational emotional process and differentiation, not specifically with attachment styles.',
      3: 'IFS works with parts and Self; the framework described is attachment-specific.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'attachment-based']
},
{
  id: 'CP-4B-009',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a family conceptualizes their difficulty as a coalition between the mother and the eldest child against the father, leaving the father in a peripheral role and the younger children caught between the parents. The therapist plans interventions to realign the family hierarchy with the parents in an executive subsystem and clearer generational boundaries. Which theoretical orientation is the therapist applying?',
  options: [
    'Structural family therapy',
    'Strategic family therapy',
    'Bowen family systems theory',
    'Solution-focused brief therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Structural family therapy (Minuchin) conceptualizes family difficulties in terms of subsystem boundaries, hierarchy, and coalitions. The formulation (mother-child coalition against father, peripheral father, generational boundary issues) and the intervention plan (executive subsystem, generational boundaries) are core structural concepts.',
    distractors: {
      1: 'Strategic FT focuses on the symptom\'s function and uses paradoxical/directive interventions; the framework here is structural, not symptom-functional.',
      2: 'Bowen FST works with multigenerational process and triangulation patterns; while related, the structural-coalition formulation is more directly structural.',
      3: 'SFBT identifies exceptions and amplifies what works; the framework here is conceptual/structural, not exception-based.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'structural', 'coalitions']
},
{
  id: 'CP-4B-010',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a couple uses the lens of communication patterns developed by Virginia Satir, identifying each partner\'s "stress response" stance (placater, blamer, computer, distractor) and helping them recognize how these stances interact in conflict. Which theoretical orientation is the therapist applying?',
  options: [
    'Bowen family systems theory',
    'Experiential family therapy (Satir model)',
    'Solution-focused brief therapy',
    'Cognitive-behavioral therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Satir\'s experiential family therapy identifies stress-response communication stances (placater, blamer, computer, distractor, and the integrated "leveler") and uses recognition of these stances to help families develop more authentic communication.',
    distractors: {
      0: 'Bowen FST uses differentiation and emotional process; the stress-response stance framework is Satir-specific.',
      2: 'SFBT does not use the stress-response stance taxonomy.',
      3: 'CBT addresses communication via skills and cognitive frames but not via the Satir stance taxonomy.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'Satir', 'experiential']
},
{
  id: 'CP-4B-011',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a client who has chronic interpersonal difficulty conceptualizes the difficulty as patterns deriving from early object relations — internalized representations of self and others from formative relationships, replayed in current relationships. Treatment focuses on understanding these patterns and developing more flexible representations. Which theoretical orientation is the therapist applying?',
  options: [
    'Cognitive-behavioral therapy',
    'Object relations psychotherapy',
    'Solution-focused brief therapy',
    'Person-centered therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Object relations psychotherapy (Klein, Winnicott, Kernberg) conceptualizes interpersonal patterns as deriving from internalized self-other representations formed in early relationships. Treatment works with these representations and the patterns they produce in current relationships.',
    distractors: {
      0: 'CBT targets cognitions and behaviors but does not specifically use the internalized-representation framework of object relations.',
      2: 'SFBT does not engage with formative-relationship patterns; it is present- and solution-focused.',
      3: 'Person-centered therapy emphasizes empathy, UPR, and congruence but does not specifically work with object relations.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'object-relations', 'psychodynamic']
},

// --- 4C additions ---
{
  id: 'CP-4C-006',
  domain: 4, subsection: '4C',
  stem: 'A 30-year-old client has been in therapy for 18 months for anxiety. She has met her treatment goals and reports she is "doing well." In the session before her planned final session, she tells the therapist she has scheduled a job interview the day after termination and feels "really anxious about it." Which of the following actions should the therapist take?',
  options: [
    'Proceed with the planned termination and trust that she has the tools to manage the interview anxiety',
    'Extend treatment by several sessions to support her through the interview transition',
    'Discuss her experience of the timing — acknowledging that the proximity of the interview to termination may be activating concerns about ending — and explore whether she would prefer to slightly delay the final session or proceed as planned',
    'Recommend she postpone the interview until she has been out of therapy long enough to test her independence'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'The timing may reflect end-of-treatment activation as much as actual interview anxiety. Bringing the timing into the conversation, exploring what she is experiencing, and offering options (proceed or briefly delay) respects her autonomy and addresses what may be happening clinically.',
    distractors: {
      0: 'Proceeding without acknowledging the timing dismisses what may be a meaningful clinical signal.',
      1: 'Extending several sessions unilaterally adds time without exploring whether that is what she needs.',
      3: 'Recommending she postpone a job interview to "test her independence" inappropriately directs major life decisions.'
    }
  },
  difficulty: 3,
  tags: ['termination', 'timing', 'transfer-anxiety']
},
{
  id: 'CP-4C-007',
  domain: 4, subsection: '4C',
  stem: 'A therapist is planning termination with a couple after eight months of treatment. The couple has reduced conflict, restored intimacy, and reports being "in a much better place." In the second-to-last session, the husband says, "What if we hit a rough patch in six months?" Which of the following actions should the therapist take?',
  options: [
    'Recommend they schedule monthly maintenance sessions to prevent backsliding',
    'Develop a relapse-prevention plan together — identifying their specific warning signs, which skills/strategies to deploy first, and what would constitute a signal to return to therapy',
    'Reassure them that the gains they have made are lasting and unlikely to reverse',
    'Recommend they return only if the situation becomes "really bad"'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'A specific relapse-prevention plan — warning signs, deployment of skills, threshold for returning to therapy — gives the couple a concrete framework for the post-termination period. This is the termination-phase task of consolidating gains and planning for maintenance.',
    distractors: {
      0: 'Default monthly maintenance treats termination as conditional rather than completed; not necessarily wrong but bypasses the relapse-prevention conversation.',
      2: 'Reassurance that gains are lasting may be inaccurate (rough patches happen) and skips the relapse-prevention planning.',
      3: '"Really bad" is too vague — clear thresholds for returning help the couple act in time.'
    }
  },
  difficulty: 2,
  tags: ['termination', 'relapse-prevention']
},

// ===== Batch 6: more Case planning =====

{
  id: 'CP-4A-009',
  domain: 4, subsection: '4A',
  stem: 'A therapist is working with a 60-year-old client whose presenting problem was the death of her spouse 18 months ago. After six months of grief work, the client now reports she is "ready to think about the future" and asks the therapist what they should work on next. Which of the following actions should the therapist take?',
  options: [
    'Recommend they continue grief work for at least six more months to consolidate the bereavement processing',
    'Collaboratively re-formulate treatment goals based on what the client wants in this next phase — identity post-loss, social re-engagement, future-orientation, or other priorities she names',
    'Recommend she terminate therapy since the original presenting problem has been processed',
    'Begin behavioral activation to support her re-engagement with life'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'When the original presenting problem is substantially processed and the client signals readiness for new work, the appropriate action is collaborative re-formulation. Treatment plans are not fixed at intake; they evolve with the work. Letting the client name her priorities for the next phase respects her autonomy and the iterative nature of treatment planning.',
    distractors: {
      0: 'Mandating continued grief work disregards the client\'s assessment of her own readiness.',
      2: 'Recommending termination because the original problem is processed assumes the work is binary (problem → no problem) rather than a continuing relationship.',
      3: 'Behavioral activation is one possible intervention but presumes a formulation she has not endorsed.'
    }
  },
  difficulty: 2,
  tags: ['treatment-plan-evolution', 'collaborative']
},
{
  id: 'CP-4B-012',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a client struggling with chronic depression conceptualizes the depression as the activation of an early-life "abandonment" schema — a deeply held belief that significant others will eventually leave, formed in childhood and reinforced over time. Treatment focuses on identifying schema activations and creating corrective relational experiences in therapy and outside. Which theoretical orientation is the therapist applying?',
  options: [
    'Cognitive-behavioral therapy',
    'Schema therapy',
    'Internal Family Systems',
    'Solution-focused brief therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Schema therapy (Young) conceptualizes psychological difficulties as activations of "early maladaptive schemas" formed in childhood (abandonment, defectiveness, mistrust, etc.). Treatment identifies schema activations and uses experiential techniques plus corrective relational experiences to modify the schemas.',
    distractors: {
      0: 'CBT targets cognitions and behaviors but does not specifically use the early-maladaptive-schema framework.',
      2: 'IFS works with parts and Self, not specifically with early-life schemas.',
      3: 'SFBT amplifies exceptions and does not engage with formative-life schemas.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'schema-therapy', 'Young']
},
{
  id: 'CP-4B-013',
  domain: 4, subsection: '4B',
  stem: 'A therapist working with a couple uses techniques from a model that combines attachment theory, emotion theory, and humanistic principles. Sessions focus on accessing primary emotion, restructuring the negative interaction cycle, and creating new bonding events between partners. Which model is the therapist applying?',
  options: [
    'Gottman Method Couples Therapy',
    'Emotionally Focused Couple Therapy',
    'Imago Relationship Therapy',
    'Behavioral Couple Therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Emotionally Focused Therapy (Johnson) combines attachment theory, emotion theory, and humanistic principles. Core processes include cycle de-escalation, accessing primary emotion underneath secondary reactive emotion, restructuring interactional patterns, and creating new bonding events ("Hold Me Tight" conversations).',
    distractors: {
      0: 'Gottman Method uses specific assessments (Sound Relationship House), targets the Four Horsemen, builds friendship/intimacy/conflict skills. Different conceptual base.',
      2: 'Imago therapy (Hendrix) emphasizes childhood-imago dynamics and uses the Intentional Dialogue. Not specifically the EFT framework.',
      3: 'Behavioral Couple Therapy uses skills training and reciprocity-based contracts. Not centered on attachment.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'EFT', 'attachment']
},
{
  id: 'CP-4C-008',
  domain: 4, subsection: '4C',
  stem: 'A 35-year-old client has been in therapy for four years. The client has met her treatment goals but says she wants to continue indefinitely because she "doesn\'t want to lose this" and finds therapy "really helpful." Which of the following actions should the therapist take?',
  options: [
    'Continue indefinite weekly sessions since the client finds them helpful',
    'Discuss what "indefinite continuation" means for her, what she would lose by terminating, what she might gain by terminating, and what other supports could replace the therapeutic function — without prescribing termination but examining the question',
    'Terminate immediately given the absence of remaining treatment goals',
    'Reduce sessions to monthly maintenance indefinitely'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'When treatment continues past goal achievement, the ethical question is whether the continuation serves the client\'s growth or substitutes for other connections that would serve her better. Examining what indefinite continuation means, what would be lost/gained, and what other supports could replace the therapeutic function is the clinical work — without unilateral termination or unexamined continuation.',
    distractors: {
      0: 'Continuing indefinitely when goals are met may foster dependence and potentially exploit the client\'s attachment to the relationship.',
      2: 'Immediate termination without examining what continuation means is unilateral and may rupture.',
      3: 'Reducing to monthly maintenance avoids the question by changing frequency without examining the underlying.'
    }
  },
  difficulty: 3,
  tags: ['indefinite-continuation', 'dependence', 'examination']
}
  );
})(window.LMFT_BANK);
