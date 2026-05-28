/* Domain 1 — Clinical Evaluation (27% of exam)
 *
 * Item schema (per item):
 *   id: string (unique across all banks)
 *   domain: number (1-6)
 *   subsection: string (e.g., "1B")
 *   stem: string (4-6 sentence vignette ending in a question)
 *   options: [string, string, string, string]
 *   correctIndex: 0|1|2|3
 *   rationale: { correct: string, distractors: { [index]: string } }
 *   difficulty: 1|2|3 (optional; 1=recall, 2=application, 3=judgment)
 *   tags: string[] (optional)
 */

(function (BANK) {
  BANK.push(
// ============ 1A. Establishing Therapeutic Relationship (target: 2 items) ============
{
  id: 'CE-1A-001',
  domain: 1, subsection: '1A',
  stem: 'A 34-year-old woman initiates therapy after her primary care physician suggested it for "stress." She tells the therapist she does not believe in therapy, came only because her doctor insisted, and would prefer to handle things on her own. She crosses her arms, sighs, and asks how long this is going to take. Which of the following actions should the therapist take FIRST?',
  options: [
    'Acknowledge the client\'s reluctance and explore her understanding of what therapy involves',
    'Reassure the client that therapy is confidential and that the doctor will not be informed of session content',
    'Explain the evidence base for psychotherapy in treating stress-related conditions',
    'Provide psychoeducation about the physiological effects of chronic stress on the body'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Engaging an involuntary or reluctant client begins by acknowledging the reluctance and exploring what brought her in, which builds rapport and surfaces her expectations and concerns. The task at this point is to establish the therapeutic relationship, not to defend therapy or educate.',
    distractors: {
      1: 'Reassurance about confidentiality may be relevant later, but it does not address her stated reluctance and presumes confidentiality is her concern, which the stem does not establish.',
      2: 'Explaining the evidence base for therapy positions the therapist as defending the modality rather than engaging the client. This deepens the resistance the client is already presenting.',
      3: 'Psychoeducation about stress skips ahead to intervention before rapport is established and before the therapist has explored what the client is actually presenting with.'
    }
  },
  difficulty: 2,
  tags: ['rapport', 'reluctant-client']
},
{
  id: 'CE-1A-002',
  domain: 1, subsection: '1A',
  stem: 'A couple comes to therapy at the husband\'s request, stating his wife\'s "anger problem" is destroying their marriage. The wife says she is willing to attend but believes the problem is her husband\'s constant criticism. Both look to the therapist to decide who is right. Which of the following actions should the therapist take to establish the unit of treatment?',
  options: [
    'Frame the marital dynamic itself as the unit of treatment and explain that therapy will examine patterns rather than assign blame',
    'Agree to see each spouse individually first to assess which partner is contributing more to the conflict',
    'Tell the couple that the therapist cannot take sides and ask them to come back when they can agree on a shared goal',
    'Recommend that the wife pursue individual therapy for anger management before couple work begins'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When a couple presents together, the unit of treatment is the relationship system, not either individual. Framing this explicitly redirects the couple away from a blame-assignment frame and into a systemic frame, which is core MFT scope.',
    distractors: {
      1: 'Splitting the couple into individual sessions at intake to determine fault collides with the systems orientation and risks creating a confidentiality/alliance problem if one spouse discloses something the therapist cannot then unhear when seeing them together.',
      2: 'Sending them away undermines engagement and reads as the therapist refusing to do the work the couple came in for. Disagreement on the goal IS the presenting problem.',
      3: 'Recommending individual treatment for the wife before any couple session uncritically adopts the husband\'s framing of the problem and abandons the systemic unit of treatment.'
    }
  },
  difficulty: 2,
  tags: ['unit-of-treatment', 'couple']
},

// ============ 1B. Physical and Psychological Factors (target: 3 items) ============
{
  id: 'CE-1B-001',
  domain: 1, subsection: '1B',
  stem: 'A 52-year-old client presents with new-onset depressed mood, fatigue, weight gain over six months, and "brain fog." She has no prior psychiatric history and reports significant family stressors over the same period. Which of the following actions should the therapist take to evaluate the presenting problem?',
  options: [
    'Refer the client for a medical evaluation while initiating supportive therapy to address the family stressors',
    'Begin a course of cognitive-behavioral therapy targeting the depressive symptoms',
    'Administer the PHQ-9 to establish a baseline severity score before referring out',
    'Explore the family stressors in depth before considering other contributing factors'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'New-onset depressive symptoms in middle age accompanied by physical signs (fatigue, weight gain, cognitive complaints) require medical evaluation to rule out thyroid dysfunction, anemia, perimenopausal changes, or other medical contributors before attributing symptoms solely to psychosocial factors. Supportive therapy can run concurrently without waiting.',
    distractors: {
      1: 'Initiating CBT for depression without medical workup risks treating a presentation that has a medical etiology and missing a treatable underlying condition.',
      2: 'A PHQ-9 measures depression severity but does not address the obligation to rule out medical contributors when the presentation includes physical signs and the client has no prior psychiatric history.',
      3: 'Exploring stressors is part of assessment but treating stressors as the explanation without medical workup ignores the constellation of physical symptoms that warrants medical evaluation.'
    }
  },
  difficulty: 2,
  tags: ['medical-rule-out', 'depression']
},
{
  id: 'CE-1B-002',
  domain: 1, subsection: '1B',
  stem: 'A client reports that she stopped taking her prescribed SSRI three weeks ago because she "felt fine" and did not want to deal with the side effects. She now reports returning anxiety, irritability, and trouble sleeping, and asks the therapist whether she should restart the medication. Which of the following actions should the therapist take?',
  options: [
    'Inform the client that this is a medication question for her prescriber and offer to support her in contacting them, while exploring what led to discontinuation',
    'Tell the client that abrupt SSRI discontinuation commonly causes return of symptoms and that she should restart the dose she was on',
    'Explore the client\'s feelings about medication and suggest that her symptoms may resolve without restarting it',
    'Recommend that the client wait two more weeks to see if symptoms self-resolve before contacting the prescriber'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Medication decisions are outside the LMFT scope of practice. The correct action is to refer the question to the prescriber while supporting the client in reaching out. Exploring the discontinuation context is appropriate within the therapist\'s scope.',
    distractors: {
      1: 'Telling the client what to do about her medication is practicing outside scope, even when the advice may be clinically sensible. The LMFT cannot prescribe, adjust, or direct medication.',
      2: 'Suggesting symptoms may resolve without medication is offering medication advice (advice to remain off the SSRI) and is also outside scope.',
      3: 'Telling the client to delay contact with her prescriber while symptoms are returning is both outside scope and potentially harmful given the symptom trajectory.'
    }
  },
  difficulty: 2,
  tags: ['scope-of-practice', 'medication']
},
{
  id: 'CE-1B-003',
  domain: 1, subsection: '1B',
  stem: 'A 28-year-old client presents for therapy reporting two months of low mood and lack of interest in her usual activities. She mentions, in passing, that she has been drinking "more than I used to" — about four to six drinks most nights — to help her sleep. She frames the drinking as a coping strategy and denies it is a problem. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Gather a detailed substance use history, including quantity, frequency, and consequences, to assess the relationship between drinking and the depressive symptoms',
    'Address the depressive symptoms first since the client identifies low mood as her primary concern',
    'Confront the client about the level of drinking and explain that four to six drinks nightly meets criteria for alcohol use disorder',
    'Refer the client to a substance abuse counselor before beginning therapy for depression'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Four to six drinks nightly is clinically significant and may be driving or worsening the depressive presentation. A detailed substance use assessment — quantity, frequency, consequences, prior attempts to cut down — is required to disentangle the substance use from the mood presentation and inform treatment planning.',
    distractors: {
      1: 'Treating the depression while ignoring substance use that may be causing or maintaining it risks treatment failure and misses a primary contributor to the presenting problem.',
      2: 'Confrontation early in treatment, especially when the client denies a problem, damages alliance and reflects a misuse of diagnostic criteria — the therapist has not yet gathered the information needed to diagnose AUD.',
      3: 'Premature referral out before completing the assessment forecloses the therapist\'s ability to work with co-occurring presentations, which is within MFT scope.'
    }
  },
  difficulty: 2,
  tags: ['substance-use', 'co-occurring']
},

// ============ 1C. Developmental, Psychosocial, Diversity Factors (target: 3 items) ============
{
  id: 'CE-1C-001',
  domain: 1, subsection: '1C',
  stem: 'A 15-year-old client is brought to therapy by her parents, who immigrated from Mexico when the client was three. The parents are concerned that the client refuses to speak Spanish at home, dismisses traditional family expectations, and is "becoming too American." The client tells the therapist privately that her parents "don\'t understand anything about her life." Which of the following actions should the therapist take to evaluate this case?',
  options: [
    'Assess the family\'s acculturation differences and how each member experiences the gap between heritage and host cultures',
    'Validate the client\'s perspective that her parents\' expectations are outdated and developmentally inappropriate',
    'Educate the parents about adolescent individuation and reassure them that the client\'s behavior is normal',
    'Recommend that the family commit to speaking only Spanish at home to preserve their cultural identity'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The presenting problem is best understood as an acculturation gap — the adolescent has acculturated to the host culture faster than her parents, producing intergenerational conflict. Assessment of each family member\'s acculturation level and experience is the appropriate first step before intervening.',
    distractors: {
      1: 'Siding with the adolescent against the parents prematurely abandons the systems frame and validates one position over the family unit before assessment is complete.',
      2: 'Skipping to psychoeducation and reassurance presumes the conflict is solely developmental, missing the acculturation dimension that defines this family\'s context.',
      3: 'Prescribing a cultural practice (Spanish-only at home) is a unilateral intervention that takes the parents\' side, reflects the therapist\'s assumption rather than assessment, and is outside the assessment task.'
    }
  },
  difficulty: 2,
  tags: ['acculturation', 'family-systems']
},
{
  id: 'CE-1C-002',
  domain: 1, subsection: '1C',
  stem: 'A 19-year-old client tells the therapist she thinks she might be bisexual but has not told anyone in her family. She grew up in a religious household where same-sex attraction was framed as sinful. She reports anxiety, intrusive guilt, and difficulty concentrating, and says she does not know whether she wants to come out. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Explore the client\'s experience of her sexual identity alongside the religious context, without prescribing a direction',
    'Help the client systematically weigh the costs and benefits of coming out to her family of origin',
    'Refer the client to an LGBTQ+ support group to normalize her experience before further individual work',
    'Validate the client\'s sexual identity and reassure her that her family\'s religious views are unfounded'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The clinical task is to explore the client\'s experience of identity development and the impact of her religious context on her current symptoms. Imposing a direction — whether toward disclosure, support groups, or affirmation — substitutes the therapist\'s frame for assessment.',
    distractors: {
      1: 'Moving to decision-making about disclosure is intervention, not assessment. The client has not asked for help deciding; she has reported anxiety and uncertainty.',
      2: 'Referring out before the therapist has assessed the client\'s actual concerns presumes a need (peer normalization) that has not been established and offloads the therapeutic work.',
      3: 'Reassurance that the family\'s religious views are "unfounded" dismisses the client\'s cultural and religious context and imposes the therapist\'s values rather than exploring the client\'s.'
    }
  },
  difficulty: 2,
  tags: ['sexual-identity', 'religion', 'minority-stress']
},
{
  id: 'CE-1C-003',
  domain: 1, subsection: '1C',
  stem: 'A 67-year-old retired teacher initiates therapy six months after retirement, reporting low mood, loss of purpose, and difficulty structuring her days. She had looked forward to retirement and is surprised by how she feels. Her husband is healthy and supportive; she has adult children and grandchildren who live nearby. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Assess the client\'s adjustment to the life-stage transition and the meaning that work held in her identity and routines',
    'Screen for a major depressive episode using a structured diagnostic interview',
    'Recommend volunteer activities to restore structure and purpose to her daily life',
    'Explore the marital relationship to determine whether marital dynamics are contributing to her mood'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Retirement is a normative life-stage transition with significant implications for identity, structure, and meaning. Assessment of how the client experiences the transition — and what work and routine meant to her — is the appropriate first step before pathologizing the response or prescribing solutions.',
    distractors: {
      1: 'Jumping to a structured diagnostic interview for MDD before assessing the life-stage transition risks pathologizing a normative adjustment process and misses the developmental context.',
      2: 'Recommending volunteer activities is premature intervention before assessment. The stem says nothing about whether structure or purpose-via-doing is what the client needs.',
      3: 'Exploring the marital relationship without indication is a fishing expedition; the stem describes the husband as supportive and gives no signal that marital dynamics are involved.'
    }
  },
  difficulty: 2,
  tags: ['life-stage', 'retirement', 'transition']
},

// ============ 1D. Interpersonal and Family Relationships (target: 2 items) ============
{
  id: 'CE-1D-001',
  domain: 1, subsection: '1D',
  stem: 'A 41-year-old client describes a pattern of intense, short-lived romantic relationships that end when her partners "lose interest." She reports feeling chronically empty when alone and tends to give up activities, friendships, and even values to accommodate each new partner. She wonders if she will ever have a stable relationship. Which of the following actions should the therapist take to evaluate this presentation?',
  options: [
    'Assess her early attachment experiences and interpersonal patterns across her relational history',
    'Recommend the client take a break from dating to focus on developing her sense of self before the next relationship',
    'Validate the client\'s frustration and explore what she finds attractive in the partners she has chosen',
    'Refer the client for a personality disorder assessment given the pattern of unstable relationships'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The pattern described — chronic emptiness, identity diffusion in relationships, repeated relational disruption — points to assessment of early attachment and formative interpersonal patterns as the appropriate next step. This is foundational evaluation, not yet diagnosis or intervention.',
    distractors: {
      1: 'Recommending a dating break is intervention without assessment. The therapist has not yet established what is driving the pattern.',
      2: 'Validating frustration and exploring partner selection addresses surface content without the underlying relational pattern that the client herself is asking about.',
      3: 'Referring out for a personality disorder assessment is premature; the LMFT can and should conduct the relational assessment first, and the presentation alone does not yet warrant a specialist referral.'
    }
  },
  difficulty: 2,
  tags: ['attachment', 'relational-patterns']
},
{
  id: 'CE-1D-002',
  domain: 1, subsection: '1D',
  stem: 'A father brings his 11-year-old son to therapy at the recommendation of the school counselor, citing the son\'s declining grades and increased withdrawal. The father reports that he and his ex-wife divorced two years ago and that the son spends weekdays with him and weekends with his mother. The father states the mother is "not really involved" in therapy decisions. Which of the following actions should the therapist take to evaluate this case?',
  options: [
    'Gather information about both parental households and the family system, and clarify both parents\' legal authority regarding the child\'s treatment',
    'Begin individual therapy with the child and meet with the father periodically to discuss progress',
    'Schedule a family session with the father and child to assess parent-child dynamics',
    'Inform the father that the mother must be included in all treatment decisions regardless of custody'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Assessment of a child requires understanding both household systems, and the legal authority for consent to treatment must be clarified — in California, minors generally require consent from a parent or legal guardian, and joint legal custody typically requires both parents\' consent. Both clinical and legal questions must be resolved before treatment proceeds.',
    distractors: {
      1: 'Beginning therapy without verifying consent authority risks treating a minor without legally valid consent, and meeting only with the father misses half the relevant family system.',
      2: 'Scheduling a family session with only father and child further commits to a partial system without first verifying consent authority or understanding both households.',
      3: 'Categorically requiring the mother\'s involvement is incorrect — the requirement depends on the custody arrangement, which the therapist has not yet established. The correct task is to clarify, not assert.'
    }
  },
  difficulty: 3,
  tags: ['child-treatment', 'custody', 'consent']
},

// ============ 1E. Trauma, Abuse, Violence (target: 1 item) ============
{
  id: 'CE-1E-001',
  domain: 1, subsection: '1E',
  stem: 'A 29-year-old client begins therapy for anxiety. In the third session, she mentions in passing that her uncle "messed with her" when she was a child but quickly changes the subject, saying it does not matter and she has moved on. She otherwise reports difficulty sleeping, intrusive thoughts, and trouble with intimacy in her current relationship. Which of the following actions should the therapist take?',
  options: [
    'Note the disclosure, follow the client\'s lead, and gradually assess the impact of the experience on her current functioning',
    'Press the client for details so the therapist can properly assess the severity and timeline of the abuse',
    'Reassure the client that what happened was not her fault and that she is safe to disclose more in therapy',
    'Refer the client to a trauma-focused specialist before proceeding with the anxiety work she came in for'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Disclosures of childhood sexual abuse made in passing are often tentative tests of safety. Following the client\'s pacing while noting the disclosure and gradually assessing its impact on her current symptoms (sleep, intrusions, intimacy) respects her autonomy and avoids retraumatization. Assessment of impact, not detailed account, is what the task requires.',
    distractors: {
      1: 'Pressing for details is potentially retraumatizing, prioritizes the therapist\'s assessment timeline over the client\'s safety, and is not necessary at this stage to inform treatment.',
      2: 'Reassurance language risks shutting down the disclosure by closing the topic before it has been explored, and presumes meanings the therapist has not yet assessed.',
      3: 'Reflexively referring out before assessing the client\'s needs and capacity may communicate that the disclosure is too much for the therapist and offloads the work prematurely. The therapist should first assess and then determine whether referral is indicated.'
    }
  },
  difficulty: 3,
  tags: ['trauma-disclosure', 'pacing']
},

{
  id: 'CE-1E-002',
  domain: 1, subsection: '1E',
  stem: 'A 22-year-old combat veteran has been in therapy for six weeks for irritability and sleep disturbance. In today\'s session he reports flashbacks of an IED explosion that killed two members of his unit, intrusive nightmares, and hypervigilance that has made it impossible to ride in cars. He minimizes the impact, saying "it\'s just what happens over there." Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Assess the impact of the combat exposure on his current functioning across daily activities, relationships, and safety',
    'Validate his minimizing stance as a culturally appropriate response common in military culture',
    'Begin imaginal exposure to the IED memory to begin processing the trauma',
    'Refer the client to a VA-affiliated specialist before continuing further sessions'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The presenting symptoms (flashbacks, nightmares, hypervigilance, avoidance) and the functional impairment (impossible to ride in cars) warrant systematic assessment of the impact across functioning, relationships, and safety. This is the foundation for any subsequent treatment planning.',
    distractors: {
      1: 'Validating the minimizing stance as "culturally appropriate" colludes with avoidance and forecloses the assessment task, even when minimization may have served the client in deployment.',
      2: 'Initiating exposure-based processing without first completing the impact assessment skips a necessary step and may destabilize a client whose stabilization has not been confirmed.',
      3: 'A specialist referral may eventually be indicated, but reflexive referral before completing the assessment offloads the work prematurely and the LMFT is qualified to conduct the assessment.'
    }
  },
  difficulty: 2,
  tags: ['military', 'PTSD-assessment']
},

// ============ 1F. Consultations and Further Evaluations (target: 1 item) ============
{
  id: 'CE-1F-001',
  domain: 1, subsection: '1F',
  stem: 'A 9-year-old client has been in weekly therapy for six months for behavioral concerns at home and school. Despite the parents\' consistent implementation of agreed-upon strategies and good engagement in sessions, the child continues to have severe difficulty with attention, impulsivity, and following multi-step directions across settings. Which of the following actions should the therapist take?',
  options: [
    'Refer the family for a psychological or neuropsychological evaluation to assess for attention, learning, or other neurocognitive concerns',
    'Continue the current treatment plan with increased session frequency',
    'Recommend that the parents pursue medication for the child by consulting their pediatrician',
    'Refer the family for couple therapy to address possible inconsistency between parental approaches'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When symptoms persist across settings despite appropriate intervention and good engagement, a referral for psychological or neuropsychological evaluation is indicated to assess for ADHD, learning disorders, or other neurocognitive contributors that fall outside the LMFT\'s assessment scope.',
    distractors: {
      1: 'Increasing session frequency without changing the assessment frame or pursuing further evaluation continues an approach that has not produced change.',
      2: 'Recommending medication is outside LMFT scope. The appropriate action is to refer for evaluation; medication decisions belong to the medical evaluator.',
      3: 'Referring for couple therapy assumes parental inconsistency without evidence — the stem describes consistent implementation. This misallocates the clinical question.'
    }
  },
  difficulty: 2,
  tags: ['referral', 'evaluation']
},

// ===== Batch 2 additions =====

// --- 1A additions ---
{
  id: 'CE-1A-003',
  domain: 1, subsection: '1A',
  stem: 'A new client arrives 25 minutes late to a 50-minute intake session. She apologizes briefly, sits down, and immediately begins describing the workplace conflict that brought her to therapy. The therapist has a client scheduled immediately after. Which of the following actions should the therapist take FIRST?',
  options: [
    'Acknowledge the time constraint, briefly clarify what is most important to address today, and proceed with the abbreviated session',
    'End the abbreviated session early to debrief the client about punctuality and reschedule a full intake',
    'Extend the session to a full 50 minutes and apologize to the next client for running over',
    'Ask the client to reschedule entirely since a truncated intake is clinically inadequate'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The clinical task is to engage the client who has shown up despite difficulty, while honoring the boundary the next client\'s appointment creates. Briefly orienting to what can be done in the time available is both responsive and structured.',
    distractors: {
      1: 'Spending the abbreviated session on a punctuality lecture prioritizes the therapist\'s agenda over engagement and misses an opportunity to start the clinical work.',
      2: 'Extending the session takes time from the next client without their consent and creates a precedent that the therapist\'s scheduling is flexible without their participation.',
      3: 'Rescheduling categorically refuses engagement at the moment when the client is present and motivated, and may not be feasible (intake delays, insurance authorization, etc.) — flexibility is the appropriate first move.'
    }
  },
  difficulty: 2,
  tags: ['rapport', 'frame', 'scheduling']
},
{
  id: 'CE-1A-004',
  domain: 1, subsection: '1A',
  stem: 'During the first session, a client states she has had three previous therapists and "all of them didn\'t get it." She tells the therapist she is "really hoping this one will be different." Which of the following actions should the therapist take to begin establishing the therapeutic relationship?',
  options: [
    'Explore what was missing in prior treatments and what she hopes will be different here, without committing to outcomes',
    'Reassure the client that the therapist\'s training and experience make this attempt more likely to succeed',
    'Recommend that the client describe what each previous therapist did wrong so the therapist can avoid the same mistakes',
    'Frame the client\'s pattern as a possible avoidance of therapeutic depth and gently confront it'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Exploring what was missing in prior treatments — without overpromising or pre-judging — gathers important relational information, acknowledges the client\'s framing, and sets up realistic engagement. It treats the prior-therapy history as data, not as a problem to defend against.',
    distractors: {
      1: 'Reassuring the client about the therapist\'s qualifications positions the work as the therapist proving themselves, which is an unsustainable frame and ignores what the client is actually communicating.',
      2: 'Asking the client to itemize what each prior therapist did wrong invites a critical stance that may serve avoidance and positions the therapist as the corrective rather than as a collaborator.',
      3: 'Confronting the client\'s pattern as avoidance in the first session presumes a formulation that has not been established and risks rupture before alliance.'
    }
  },
  difficulty: 2,
  tags: ['rapport', 'prior-therapy']
},

// --- 1B additions ---
{
  id: 'CE-1B-004',
  domain: 1, subsection: '1B',
  stem: 'A 19-year-old college student presents for therapy with recent-onset anxiety, irritability, and trouble sleeping. He mentions that he started using a new pre-workout supplement six weeks ago to support his gym routine. He drinks four to five energy drinks per day and has cut back on sleep to study. Which of the following actions should the therapist take to evaluate this presentation?',
  options: [
    'Gather a detailed history of caffeine and stimulant intake, sleep hygiene, and recent supplement use to assess for substance-induced contributors',
    'Begin cognitive-behavioral interventions targeting the anxiety and irritability',
    'Refer the client for a psychiatric evaluation for possible generalized anxiety disorder',
    'Provide psychoeducation on stress management and recommend reducing study load'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'High caffeine intake, undisclosed supplement ingredients, and reduced sleep are common substance-related and lifestyle drivers of anxiety symptoms in young adults. Assessment of these contributors before pathologizing the presentation is the appropriate next step.',
    distractors: {
      1: 'Initiating CBT for anxiety without ruling out substance-induced contributors risks treating a presentation that has a removable cause.',
      2: 'Referring for GAD evaluation prematurely skips the substance/lifestyle workup that the presentation directly invites.',
      3: 'Recommending stress management addresses one possible factor while ignoring the more proximate caffeine and sleep contributors.'
    }
  },
  difficulty: 2,
  tags: ['substance-induced', 'caffeine', 'differential']
},
{
  id: 'CE-1B-005',
  domain: 1, subsection: '1B',
  stem: 'A 64-year-old client initiates therapy with low mood, social withdrawal, and "not feeling like himself" over the past four months. He mentions that he was recently diagnosed with hypothyroidism and started medication six weeks ago. His mood has not improved since starting treatment. Which of the following actions should the therapist take?',
  options: [
    'Coordinate with the prescribing physician about the client\'s response to thyroid treatment while initiating supportive therapy',
    'Begin a course of behavioral activation targeting the social withdrawal',
    'Wait three more months to allow thyroid replacement to fully stabilize before initiating treatment',
    'Refer the client to a psychiatrist for an antidepressant trial'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Hypothyroidism can produce depressive symptoms and persistent mood symptoms post-treatment may indicate inadequate replacement or persistent contribution. Coordinating with the prescribing physician while providing supportive therapy addresses both the medical and psychosocial dimensions.',
    distractors: {
      1: 'Initiating behavioral activation without coordinating with the medical provider treats the symptoms while ignoring a likely medical contributor still being titrated.',
      2: 'Waiting three months postpones engagement when the client is currently distressed and forecloses both supportive therapy and useful collaborative communication with the prescriber.',
      3: 'Referring for an antidepressant trial before confirming adequate thyroid replacement may obscure the actual etiology and is also outside the LMFT\'s prescribing scope.'
    }
  },
  difficulty: 3,
  tags: ['medical', 'thyroid', 'collaboration']
},
{
  id: 'CE-1B-006',
  domain: 1, subsection: '1B',
  stem: 'A 47-year-old client has been in therapy for six months. She reports that her psychiatrist increased her SNRI dose two weeks ago and she is now experiencing nausea, jitteriness, and increased anxiety. She asks the therapist whether these are "normal side effects." Which of the following actions should the therapist take?',
  options: [
    'Encourage the client to contact her psychiatrist about the new symptoms and offer to facilitate the communication if needed',
    'Reassure the client that nausea, jitteriness, and increased anxiety are common transient SNRI side effects that typically resolve in two to four weeks',
    'Recommend the client return to her previous dose until her next psychiatry appointment',
    'Explore the client\'s ambivalence about medication that may be driving her concern'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Medication side-effect assessment is the prescriber\'s responsibility. The LMFT redirects the question to the prescriber and supports the client in making contact. Even when the LMFT may know typical side-effect profiles, offering reassurance functions as medication guidance and exceeds scope.',
    distractors: {
      1: 'Even accurate side-effect information delivered as reassurance is medication guidance outside LMFT scope and may discourage the client from contacting her actual prescriber.',
      2: 'Directing the client to change her dose is direct medication advice and outside scope; it may also be unsafe.',
      3: 'Reframing the client\'s concern as ambivalence about medication may be clinically interesting but bypasses the immediate clinical question (real side effects from a recent dose change) and is presumptive without assessment.'
    }
  },
  difficulty: 2,
  tags: ['scope', 'medication', 'collaboration']
},

// --- 1C additions ---
{
  id: 'CE-1C-004',
  domain: 1, subsection: '1C',
  stem: 'A 12-year-old client is brought to therapy by her mother for "school refusal." The mother reports the child started missing days four months ago after the family moved to a new neighborhood, and she has now refused to attend for two consecutive weeks. The child says she has no friends at the new school. Which of the following actions should the therapist take to evaluate this presentation?',
  options: [
    'Assess the child\'s peer relationships, the academic environment, and any anxiety or mood symptoms that contribute to the avoidance',
    'Recommend the parents impose firm consequences for missed school days to reverse the refusal pattern',
    'Coordinate with the school to arrange a gradual return-to-school plan',
    'Refer the child for a psychoeducational evaluation to rule out a learning disorder'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'School refusal at this age commonly involves social difficulties, environmental fit, and anxiety or mood symptoms. Assessment across these dimensions establishes the formulation before any intervention is selected.',
    distractors: {
      1: 'Recommending consequences is intervention without assessment and may worsen the situation if anxiety or peer victimization is driving the refusal.',
      2: 'A school return plan may eventually be appropriate but presumes the underlying assessment has been completed; coordinating with the school before understanding what is driving the refusal is premature.',
      3: 'A psychoeducational evaluation may eventually be indicated, but the stem provides no signal of a learning disorder; school refusal post-move is more parsimoniously explained by social/environmental factors first.'
    }
  },
  difficulty: 2,
  tags: ['child', 'school-refusal']
},
{
  id: 'CE-1C-005',
  domain: 1, subsection: '1C',
  stem: 'A 25-year-old transgender man tells the therapist he has been considering "stopping testosterone" because he is afraid his family will reject him as he transitions further. He has been on hormone therapy for nine months and describes significant improvement in his mood and body congruence since starting. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Explore the family-of-origin dynamics, the meaning of the potential rejection, and how the conflict between identity congruence and family connection is impacting the client',
    'Refer the client to a gender clinic to receive specialized guidance about the medical decision',
    'Affirm the client\'s gender identity and recommend continuing hormone therapy given the reported benefits',
    'Coordinate a family session to address the anticipated rejection directly with the family members'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The clinical task is exploration of the conflict the client is experiencing — between identity congruence (which has produced benefits) and feared family rejection — without prescribing a decision. Family-of-origin dynamics and the meaning of the rejection are core to the formulation.',
    distractors: {
      1: 'Referring out for guidance about a medical decision treats this as a medical question, when the client is presenting with a relational and identity conflict that is within MFT scope.',
      2: 'Recommending the client continue hormone therapy makes a directive about a medical decision and bypasses the conflict the client is bringing.',
      3: 'A family session may eventually be part of the work, but unilaterally arranging one before assessing the client\'s desires and the dynamics involved is premature and may further endanger an already-fragile relationship.'
    }
  },
  difficulty: 3,
  tags: ['gender-identity', 'family-rejection']
},
{
  id: 'CE-1C-006',
  domain: 1, subsection: '1C',
  stem: 'A 33-year-old client tells the therapist that her religious community is central to her identity but that recently she has begun to doubt some of the teachings. She feels she cannot share these doubts with her husband or her community without consequences. She wonders if therapy is "the wrong place" to talk about this. Which of the following actions should the therapist take?',
  options: [
    'Communicate that exploring religious and spiritual questions is appropriate in therapy, and invite the client to share what she is experiencing',
    'Refer the client to a clergy member or religious counselor better equipped for spiritual questions',
    'Help the client identify which specific doubts she is having and develop a plan to resolve them',
    'Explore whether the client\'s doubts reflect an underlying mood disorder that should be assessed separately'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Religious and spiritual identity are legitimate domains of clinical exploration when they affect the client\'s functioning and relationships. The first task is to communicate that the therapy space accommodates this content and invite the client into the work, rather than redirecting her elsewhere.',
    distractors: {
      1: 'Reflexively referring out reinforces the message that her doubts are inappropriate for secular therapy and may foreclose important exploration.',
      2: 'Moving to "resolve" the doubts is intervention before exploration; the client has not asked for resolution, she has asked whether this is the right place to talk.',
      3: 'Recasting religious doubt as a possible mood disorder pathologizes what may be a developmentally appropriate questioning process and bypasses the actual conversation the client is offering.'
    }
  },
  difficulty: 2,
  tags: ['religion', 'identity', 'scope']
},

// --- 1D additions ---
{
  id: 'CE-1D-003',
  domain: 1, subsection: '1D',
  stem: 'A 38-year-old client presents reporting chronic feelings of loneliness despite being married for 12 years and having close coworkers. She says she has "always felt this way." Her marriage is functional but emotionally distant; her childhood was marked by an emotionally unavailable father and a critical mother. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Explore the relational patterns across her formative and current relationships to identify how she experiences and constructs emotional connection',
    'Recommend the client and her husband begin couple therapy to address the emotional distance in the marriage',
    'Provide psychoeducation on attachment styles and have the client identify which style describes her',
    'Refer the client to a support group to address the loneliness through peer connection'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Chronic relational loneliness despite outwardly adequate relationships, in the context of an emotionally depriving childhood, points to a pattern in how the client constructs and experiences connection. Exploring the pattern across formative and current relationships is the appropriate evaluative step.',
    distractors: {
      1: 'Recommending couple therapy without first understanding the client\'s relational pattern presumes the issue is dyadic when it may be a more pervasive pattern she carries into all relationships.',
      2: 'Psychoeducation on attachment styles substitutes a labeling exercise for exploration and may produce intellectual insight without relational understanding.',
      3: 'A support group addresses a different presentation (isolation due to absence of connections) than what the client has — chronic emotional loneliness amid existing relationships.'
    }
  },
  difficulty: 2,
  tags: ['attachment', 'loneliness']
},
{
  id: 'CE-1D-004',
  domain: 1, subsection: '1D',
  stem: 'A married heterosexual couple in their thirties initiates therapy reporting "constant conflict." During the assessment, the wife says the conflict is mostly about parenting their two young children; the husband says the conflict is mostly about the wife\'s relationship with her mother, who is "very involved" in their lives. Each partner blames the other\'s extended family for the problem. Which of the following actions should the therapist take to evaluate this case?',
  options: [
    'Assess the family structure including subsystem boundaries, the influence of each extended family, and how parenting and in-law dynamics interact in the marriage',
    'Have each partner describe a recent conflict in detail to identify which spouse\'s account is more accurate',
    'Recommend the wife establish stricter boundaries with her mother as a precondition for productive couple work',
    'Begin teaching the couple communication skills to interrupt the blame-cycle pattern'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A systemic assessment of subsystem boundaries (parental, marital, in-law) and how the different domains interact provides the formulation needed to plan intervention. The presenting complaints (parenting and in-laws) are likely interconnected, not competing accounts.',
    distractors: {
      1: 'Adjudicating which account is "more accurate" miscasts the systemic dynamic as a fact-finding problem and positions the therapist as a judge.',
      2: 'Prescribing a boundary intervention with the mother-in-law presumes a formulation and takes the husband\'s side without assessment.',
      3: 'Communication skills training without first understanding the structural and intergenerational dynamics treats the symptom and may not produce sustained change.'
    }
  },
  difficulty: 3,
  tags: ['structural', 'in-laws', 'couple']
},
{
  id: 'CE-1D-005',
  domain: 1, subsection: '1D',
  stem: 'A 16-year-old client tells the therapist that her older brother, with whom she shares a bedroom wall, has been "yelling at her" and recently grabbed her arm hard enough to leave a bruise. She does not want the parents to know. The parents are aware the siblings "don\'t get along" but do not know about the physical aggression. Which of the following actions should the therapist take?',
  options: [
    'Assess the severity, frequency, and pattern of the sibling aggression and clarify the limits of confidentiality regarding safety concerns',
    'File a report of suspected child abuse with the appropriate child protection agency',
    'Honor the client\'s request for confidentiality given the modest severity described',
    'Bring the parents into the next session to disclose the sibling conflict and intervene'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Sibling aggression with physical injury requires careful assessment of severity, frequency, and pattern before either dismissing it or escalating it. Clarifying the limits of confidentiality — including that safety concerns may require parental notification — is also clinically and ethically appropriate.',
    distractors: {
      1: 'CANRA defines child abuse to include physical injury inflicted by other than accidental means by any person; whether a sibling-on-sibling injury rises to a CANRA report depends on the assessment. Filing categorically without assessment may be premature.',
      2: 'Categorically honoring confidentiality when the client has disclosed physical aggression with injury risks failing the protective function of the assessment and may not be consistent with mandated reporter obligations.',
      3: 'Unilaterally bringing the parents in disregards the client\'s autonomy and presented concerns without first assessing what is actually happening.'
    }
  },
  difficulty: 3,
  tags: ['sibling-aggression', 'CANRA-threshold']
},

// --- 1E additions ---
{
  id: 'CE-1E-003',
  domain: 1, subsection: '1E',
  stem: 'A 41-year-old client tells the therapist she has been "having flashbacks" of a sexual assault that occurred when she was 22, despite having "dealt with it" in prior therapy. The flashbacks started three months ago after a colleague disclosed her own assault to the client. The client is functioning at work but is sleeping poorly and feels emotionally distant from her family. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Assess the current symptom profile, the impact of the recent triggering event, and what the client experienced as helpful and unhelpful in her prior trauma work',
    'Begin trauma-focused processing of the original assault since the prior work appears incomplete',
    'Recommend the client avoid contact with the colleague to reduce ongoing exposure',
    'Refer the client to an EMDR specialist given the recurrence of trauma symptoms'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Reactivation of trauma symptoms by a relevant external trigger requires assessment of the current symptom profile, impact, and the client\'s history with prior trauma work — what worked, what didn\'t — before selecting an intervention.',
    distractors: {
      1: 'Beginning trauma processing before assessing current functioning, stabilization, and prior treatment response may rush a client who has already had treatment and risks destabilization.',
      2: 'Recommending avoidance of the colleague treats the trigger as the problem rather than as a signal that something prior was incompletely resolved, and may be impractical or interpersonally costly.',
      3: 'Reflexive referral out forecloses the LMFT\'s assessment and treatment role and may not match what the client needs once assessment is complete.'
    }
  },
  difficulty: 2,
  tags: ['trauma-reactivation']
},

// --- 1F additions ---
{
  id: 'CE-1F-002',
  domain: 1, subsection: '1F',
  stem: 'A 35-year-old client has been in therapy for two months for what initially appeared to be major depression. He has begun reporting flat affect, increasing social withdrawal, declining hygiene, and statements that "nothing has meaning anymore." A family member contacted the therapist (with the client\'s consent) expressing concern about disorganized speech in recent conversations. Which of the following actions should the therapist take?',
  options: [
    'Refer the client for a psychiatric evaluation to assess for an evolving psychotic, mood, or other disorder requiring medical management',
    'Continue the current treatment plan with weekly sessions and monitor for further changes',
    'Increase session frequency to twice weekly and intensify behavioral activation',
    'Schedule a family session to gather additional collateral information before deciding'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Emerging symptoms including disorganized speech, flat affect, declining hygiene, and anhedonia in someone presenting with depression raise concern for an evolving psychotic or other disorder requiring psychiatric evaluation. The LMFT should refer for evaluation while continuing the therapeutic relationship.',
    distractors: {
      1: 'Continuing the current plan when the symptom picture has shifted significantly fails to respond to clinically meaningful new information.',
      2: 'Intensifying behavioral activation addresses depressive withdrawal but does not address the disorganization or evolving symptom picture and risks misallocating the intervention.',
      3: 'A family session for more collateral may be useful but is not the highest priority; the symptom shift already meets the threshold for psychiatric evaluation.'
    }
  },
  difficulty: 2,
  tags: ['emerging-psychosis', 'referral']
},
{
  id: 'CE-1F-003',
  domain: 1, subsection: '1F',
  stem: 'A therapist has been working with a couple for two months. During an individual portion of one session, the wife discloses that she has been struggling with binge eating most evenings for the past several years. She has not told her husband and would prefer to address it separately. Which of the following actions should the therapist take?',
  options: [
    'Refer the wife to an individual therapist or eating-disorder specialist for concurrent treatment while continuing the couple work',
    'Begin treating the wife\'s eating disorder within the existing couple therapy format',
    'Require disclosure to the husband as a condition of addressing the eating concerns clinically',
    'Pause the couple therapy until the eating disorder is resolved in individual treatment'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Concurrent referral to an individual therapist or eating-disorder specialist while continuing the couple work respects the wife\'s preferred separation of the issues, brings appropriate clinical resources to the eating disorder, and avoids the dual-role complications of treating the same client individually within a couple frame.',
    distractors: {
      1: 'Folding individual eating-disorder treatment into the couple therapy format creates a complex dual-role situation and may not provide the appropriate specialist intervention.',
      2: 'Requiring disclosure to the husband as a clinical condition overrides the wife\'s autonomy and may be coercive; whether and when to disclose is hers to decide.',
      3: 'Pausing couple therapy until the eating disorder resolves treats them as serial when concurrent work is feasible and may take many months.'
    }
  },
  difficulty: 3,
  tags: ['referral', 'concurrent-treatment']
},

// ===== Batch 3 additions =====

// --- 1B addition ---
{
  id: 'CE-1B-007',
  domain: 1, subsection: '1B',
  stem: 'A 38-year-old client describes recurring episodes of intense fear that come on suddenly. He reports chest pain and shortness of breath during the episodes and has gone to the emergency room three times in the past year, with cardiac workup unremarkable each time. He is starting to avoid leaving the house. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Begin a course of exposure therapy targeting the avoidance behavior',
    'Confirm the recency of cardiac evaluation and assess the panic-attack picture in conjunction with any current medical follow-up',
    'Refer the client for psychiatric medication consultation as the primary action',
    'Recommend the client stop going to the emergency room when symptoms occur'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Confirming the recency of medical workup and integrating the panic-attack assessment with ongoing medical follow-up is the appropriate clinical step. Although cardiac workup has been unremarkable, periodically confirming there is no medical change before treating panic psychologically is sound. The assessment dimension comes before intervention.',
    distractors: {
      0: 'Initiating exposure for avoidance before completing the panic assessment skips a necessary clinical step.',
      2: 'A psychiatric medication referral is one possible intervention but not the threshold action — psychological interventions are first-line for panic disorder and the assessment must precede the intervention selection.',
      3: 'Telling the client not to go to the ER is medical advice the LMFT is not in a position to give and may discourage appropriate care if cardiac symptoms ever do reflect a medical event.'
    }
  },
  difficulty: 2,
  tags: ['panic', 'medical-coordination']
},

// --- 1E addition ---
{
  id: 'CE-1E-004',
  domain: 1, subsection: '1E',
  stem: 'A 17-year-old client tells the therapist that her boyfriend, who is 19, "gets really angry sometimes" and has grabbed her and shoved her against a wall on two occasions over the past six months. She says she is not afraid of him and does not want to break up. She asks the therapist not to tell her parents. Which of the following actions should the therapist take?',
  options: [
    'Assess the relationship for additional indicators of intimate partner violence, develop a safety plan, and clarify limits of confidentiality regarding her safety',
    'File a CANRA report regarding the assault by the boyfriend',
    'Honor the client\'s request for confidentiality given her stated lack of fear',
    'Recommend the client end the relationship as a precondition of further therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The clinical task is to assess the broader IPV picture, develop a safety plan, and clarify the limits of confidentiality including any safety-related disclosure obligations. The minor\'s autonomy regarding the relationship is respected within the safety frame.',
    distractors: {
      1: 'CANRA covers abuse of children by parents/caregivers and certain other contexts — partner-to-partner violence between dating teens in California is not categorically reportable under CANRA in the same way, though it warrants careful safety assessment. (CA Family Code addresses domestic violence broadly but the LMFT\'s mandatory report obligations are specific.) A blanket CANRA report without assessment may be incorrect.',
      2: 'Honoring confidentiality without addressing safety abandons the protective function of therapy in the face of escalating partner violence.',
      3: 'Conditioning therapy on the client ending the relationship is coercive and may both end the alliance and remove the safety scaffold she has in therapy.'
    }
  },
  difficulty: 3,
  tags: ['teen-IPV', 'safety-planning']
},

// --- 1F additions ---
{
  id: 'CE-1F-004',
  domain: 1, subsection: '1F',
  stem: 'A 6-year-old client has been brought to therapy for "trouble in school." The teacher reports the child does not respond when called, often hums to himself, and seems "in his own world." The parents report he has always been "a quiet kid." His receptive language seems limited for his age. Which of the following actions should the therapist take?',
  options: [
    'Refer the child for an audiological evaluation and a speech-language assessment before initiating play therapy',
    'Begin parent-child interaction therapy to address the social engagement difficulties',
    'Provide individual play therapy with the child while gathering more developmental history',
    'Refer the family directly to an autism specialist for evaluation'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Before pursuing psychological or psychiatric explanations, ruling out hearing loss and primary language disorders is the appropriate first step for a 6-year-old who does not respond when called and has apparent receptive language limits. These are medical workups the LMFT initiates via referral.',
    distractors: {
      1: 'PCIT is a specific intervention for behavior problems with engaged parents; it does not address the possible sensory/language basis of the presentation.',
      2: 'Beginning play therapy before ruling out hearing or speech-language contributors risks treating a presentation with an unaddressed primary cause.',
      3: 'A direct autism referral skips the audiological and speech-language workup that should occur first, since hearing and language conditions can mimic or coexist with autism.'
    }
  },
  difficulty: 2,
  tags: ['referral', 'audiological', 'child']
},
{
  id: 'CE-1F-005',
  domain: 1, subsection: '1F',
  stem: 'A 45-year-old client has been in therapy for six months for depression and is making good progress. She now mentions that she would like to "see if I have ADHD" and asks whether the therapist can diagnose and treat it. Which of the following actions should the therapist take?',
  options: [
    'Conduct an ADHD diagnostic interview in the next session and proceed with treatment if criteria are met',
    'Decline to address ADHD since the original treatment is for depression and treatment scope should not expand',
    'Conduct a clinical assessment of attention symptoms, refer for psychological/psychoeducational testing if the picture warrants it, and refer for medication consultation as a separate question',
    'Recommend the client see her primary care physician for an ADHD prescription before further therapy work'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'The LMFT can conduct a clinical assessment of attention symptoms within scope. Comprehensive ADHD diagnosis often warrants psychological or psychoeducational testing, which the LMFT refers out for. Medication consultation is a separate referral question handled by a prescriber.',
    distractors: {
      0: 'A single diagnostic interview in one session, while sufficient for the LMFT\'s assessment, is often less complete than the testing-supported workup typically used for ADHD diagnosis in adults.',
      1: 'Refusing to address attention concerns because they are outside the original treatment focus is overly narrow — treatment plans can expand collaboratively when clinically warranted.',
      3: 'Recommending the client get medication before further therapy work bypasses the assessment step and treats medication as the threshold intervention.'
    }
  },
  difficulty: 2,
  tags: ['ADHD-assessment', 'referral']
},

// --- 1A addition (close blueprint gap) ---
{
  id: 'CE-1A-005',
  domain: 1, subsection: '1A',
  stem: 'A new client begins the first session by stating, "Before we start, I just want to be clear that I don\'t want to talk about my childhood." The therapist has not asked about her childhood and has no prior information about her. Which of the following actions should the therapist take?',
  options: [
    'Reassure the client that childhood will not be discussed and ask what she would like to focus on instead',
    'Acknowledge the request, explore what makes that important for her to name now, and clarify the collaborative nature of what gets discussed in therapy',
    'Inform the client that a full clinical assessment requires gathering developmental history and that this may need to be revisited',
    'Note the preemptive boundary and proceed with the intake as planned'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'The preemptive boundary is clinically meaningful information offered in the first 60 seconds. Acknowledging it, exploring what makes it important to name now, and clarifying that the work is collaborative — without overriding her stated preference or treating it as a defense to break through — establishes the relational frame.',
    distractors: {
      0: 'Reassuring without exploring foreclosed a clinically interesting opening and may commit the therapist to a constraint that turns out to be different from what the client actually needs.',
      2: 'Informing the client about clinical-assessment requirements treats the work as the therapist\'s agenda and may rupture before alliance has formed.',
      3: 'Proceeding with intake as planned ignores the explicit signal the client just gave about how she enters therapy.'
    }
  },
  difficulty: 3,
  tags: ['rapport', 'preemptive-boundary']
},

// --- 1B addition ---
{
  id: 'CE-1B-008',
  domain: 1, subsection: '1B',
  stem: 'A 26-year-old client reports feeling "off" for the past three weeks — fatigue, irritability, difficulty concentrating, and low mood. She mentions that she gave birth to her first child six weeks ago. Which of the following actions should the therapist take?',
  options: [
    'Provide psychoeducation about postpartum adjustment and recommend better sleep and nutrition',
    'Assess for postpartum depression, postpartum anxiety, and (when symptoms warrant) postpartum psychosis using validated tools, while coordinating with her OB or PCP about medical follow-up',
    'Begin cognitive-behavioral therapy targeting the depressive symptoms',
    'Reassure the client that what she is experiencing is normal "baby blues" that will resolve naturally'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Postpartum mood and anxiety symptoms three weeks past the typical "baby blues" window (which resolves by 2 weeks) warrant systematic assessment using validated tools (EPDS, PHQ-9, etc.), differential evaluation including postpartum anxiety and psychosis, and medical coordination. Postpartum presentations have specific clinical considerations.',
    distractors: {
      0: 'Recommending sleep and nutrition without assessment treats the presentation lightly and may miss a clinically significant postpartum mood or anxiety disorder.',
      2: 'Beginning CBT without first conducting the postpartum-specific assessment misses both the diagnostic specificity and the medical coordination that postpartum presentations require.',
      3: 'Categorically reassuring it is "baby blues" misuses that term (which applies to symptoms in the first 2 weeks post-delivery) and risks missing PPD or PPA at six weeks postpartum.'
    }
  },
  difficulty: 2,
  tags: ['postpartum', 'assessment']
},

// --- 1C additions ---
{
  id: 'CE-1C-007',
  domain: 1, subsection: '1C',
  stem: 'A 50-year-old client tells the therapist she has been feeling "off" since perimenopause began two years ago. She reports mood swings, sleep disturbance, occasional intense anxiety, and "not feeling like myself anymore." She has not previously had mental health concerns. Her gynecologist suggested therapy "to manage stress." Which of the following actions should the therapist take?',
  options: [
    'Validate the impact of the hormonal transition on mood and well-being, assess current symptoms in their developmental and medical context, and coordinate with her gynecologist as needed',
    'Provide cognitive-behavioral therapy targeting the mood symptoms',
    'Recommend the client request hormone replacement therapy from her gynecologist',
    'Refer the client for psychiatric evaluation given the new-onset symptoms in midlife'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Perimenopause and menopause are recognized developmental and biological transitions that significantly affect mood, sleep, and emotional functioning. Validating the impact, assessing symptoms in this developmental context, and coordinating with the medical provider integrates the relevant dimensions.',
    distractors: {
      1: 'Initiating CBT without contextualizing the symptoms within the perimenopausal transition treats them as primary mood disorder when they may be primarily hormonally-influenced.',
      2: 'Recommending HRT is a medication recommendation outside LMFT scope.',
      3: 'Psychiatric referral may eventually be indicated but is not the first step when the presentation is parsimoniously explained by a recognized developmental/biological transition.'
    }
  },
  difficulty: 2,
  tags: ['perimenopause', 'midlife']
},
{
  id: 'CE-1C-008',
  domain: 1, subsection: '1C',
  stem: 'A 28-year-old first-generation Chinese-American client tells the therapist that her parents have started pressuring her to "settle down" and have arranged for her to meet potential partners through family connections. She does not want to disappoint them but is also dating someone they would not approve of. She says she "doesn\'t know how to honor both sides." Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Explore the cultural and familial values at play, the meaning of "honoring both sides" to her, and her current functioning within the conflict',
    'Recommend the client come out to her parents about the relationship to resolve the conflict',
    'Frame the parents\' arranged-marriage approach as outdated and encourage the client to assert her autonomy',
    'Refer the client to a cultural community group to help her navigate the bicultural conflict'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Bicultural identity conflicts often involve real values from multiple cultural frames, not a problem to be solved by choosing sides. The therapeutic task is to explore the values at play, the client\'s own meaning-making, and her functioning within the conflict — without prescribing the resolution.',
    distractors: {
      1: 'Recommending disclosure to her parents takes one side of the conflict and overrides her own assessment of what she wants to do.',
      2: 'Framing arranged-marriage practices as "outdated" imposes the therapist\'s cultural frame and dismisses the values the client has named as important to honor.',
      3: 'Referring out to a community group bypasses the individual exploration the client is doing in therapy.'
    }
  },
  difficulty: 3,
  tags: ['bicultural', 'family-values']
},

// ===== Batch 4: blueprint-closing additions =====

{
  id: 'CE-1A-006',
  domain: 1, subsection: '1A',
  stem: 'A 30-year-old client initiates therapy stating, "I\'ve been told I need anger management." He says his employer required this following an incident at work. He sits stiffly, makes minimal eye contact, and gives short answers. Which of the following actions should the therapist take FIRST?',
  options: [
    'Acknowledge the involuntary nature of his attendance and explore his own perspective on what brought him here',
    'Conduct an anger assessment to determine the severity of his anger problem',
    'Begin psychoeducation about anger management techniques to establish therapeutic value early',
    'Inform the client that progress reports will be sent to his employer per the referral'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Acknowledging the involuntary referral context and inviting the client\'s own perspective on what brought him in is the foundational engagement move with mandated or coerced clients. It restores some autonomy and surfaces important information about his actual experience.',
    distractors: {
      1: 'Conducting an anger assessment first accepts the referring party\'s framing of the problem without the client\'s input and may deepen the involuntary stance.',
      2: 'Psychoeducation about anger management imposes content before the client has been engaged about what HE thinks the issue is, if anything.',
      3: 'Information about reporting to the employer may be relevant but is a logistical disclosure, not the first engagement move with the client himself.'
    }
  },
  difficulty: 2,
  tags: ['rapport', 'mandated-referral']
},
{
  id: 'CE-1B-009',
  domain: 1, subsection: '1B',
  stem: 'A 22-year-old client presents to therapy with reports of difficulty concentrating, restlessness, and anxiety. She mentions using cannabis "a few times a day" to help her sleep and concentrate. She also drinks "a couple of energy drinks" daily and takes melatonin at night. Which of the following actions should the therapist take to evaluate her presentation?',
  options: [
    'Begin cognitive-behavioral therapy targeting the anxiety and concentration difficulties',
    'Gather a detailed substance/stimulant intake history (cannabis, caffeine, supplements), assess the temporal relationship between use and symptoms, and integrate with the psychological assessment',
    'Refer the client to a substance abuse counselor before continuing the therapeutic work',
    'Provide psychoeducation about cannabis as a contributor to anxiety and recommend cessation'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Daily cannabis (especially multiple times a day), caffeine, and melatonin can each contribute to anxiety, concentration difficulty, and sleep dysregulation. Detailed intake history including temporal relationship to symptoms is the foundation before either treating the anxiety as primary or treating the substances as the cause.',
    distractors: {
      0: 'Initiating CBT before disentangling substance contributors risks treating symptoms that have a substance-induced component.',
      2: 'Reflexive substance abuse referral may be premature; the LMFT can conduct the assessment and decide on referral once the picture is clearer.',
      3: 'Recommending cessation before assessment treats one substance as primary cause without the systematic evaluation that the multi-substance picture requires.'
    }
  },
  difficulty: 2,
  tags: ['substance-induced', 'cannabis', 'caffeine']
},
{
  id: 'CE-1C-009',
  domain: 1, subsection: '1C',
  stem: 'A 16-year-old client is in therapy for school avoidance. Today she tells the therapist that her boyfriend, who is 22, sleeps over at her house and her mother "doesn\'t mind because he\'s family-friendly." The client describes the sexual relationship as her choice and seems comfortable with it. Which of the following actions should the therapist take?',
  options: [
    'Validate the client\'s autonomy and continue addressing the school avoidance',
    'Explore the relationship dynamics in detail with the client, assess for indicators of coercion or grooming, and review California statutory rape law to determine reporting obligations',
    'Refer the client to a sexual health clinic for contraception counseling',
    'Schedule a family session with the mother to discuss the relationship'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'A 16-year-old in a sexual relationship with a 22-year-old in California raises both clinical concerns (power differential, possible grooming) and legal concerns (Cal. Penal Code §261.5 — unlawful sexual intercourse with a minor, statutory rape; under-18 with adult is a misdemeanor or felony depending on age gap). Exploration, assessment, and review of reporting obligations is the indicated action. (Note: CANRA may apply depending on age gap and other factors; consult specific statutes.)',
    distractors: {
      0: 'Validating autonomy and continuing with school avoidance treats only the surface presentation while a significantly older partner may indicate coercion, grooming, or statutory rape situation requiring further assessment.',
      2: 'Contraception counseling addresses one dimension but bypasses the broader assessment about whether the relationship itself is a reportable concern.',
      3: 'Bringing the mother in unilaterally without first assessing with the client may rupture alliance and presupposes the mother is an ally when she has been described as permissive about the situation.'
    }
  },
  difficulty: 3,
  tags: ['minor-relationship', 'statutory-rape', 'grooming-assessment'],
  lawCitation: 'Cal. Penal Code § 261.5 (unlawful sexual intercourse with a minor); CANRA implications depend on facts'
},
{
  id: 'CE-1D-006',
  domain: 1, subsection: '1D',
  stem: 'A married heterosexual couple in their forties initiates therapy reporting "general dissatisfaction." During the assessment, the husband mentions that the couple has not had sex in over three years and that he has stopped initiating because his wife "never seems interested." The wife says she "didn\'t realize it had been that long." Which of the following actions should the therapist take to evaluate this case?',
  options: [
    'Recommend the wife be evaluated for hypoactive sexual desire disorder',
    'Refer the couple to a sex therapist before continuing the general couple work',
    'Assess the broader relational and intimacy patterns, including emotional connection, sexual history together, individual factors affecting desire, and the meaning each partner makes of the absence of sex',
    'Provide psychoeducation about typical mid-life changes in sexual desire to normalize the dynamic'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'A three-year absence of sex in a couple is significant and is best assessed within the broader relational and intimacy context — emotional connection, relational history, individual factors, and meaning-making — before diagnosing the wife or referring to a specialist. Systemic assessment first.',
    distractors: {
      0: 'Diagnosing the wife as having HSDD pathologizes one partner and individualizes a relational presentation.',
      1: 'Sex therapy referral may eventually be indicated but is premature without a fuller assessment of the broader context.',
      3: 'Psychoeducation about midlife changes may be relevant but normalizes the situation before assessment is complete, potentially obscuring what is actually happening in this specific couple.'
    }
  },
  difficulty: 3,
  tags: ['sexual-relationship', 'couple-assessment']
},

// ===== Batch 5: Clinical evaluation depth =====

{
  id: 'CE-1A-007',
  domain: 1, subsection: '1A',
  stem: 'A 45-year-old client arrives 30 minutes early to her first session, walks the perimeter of the waiting room, and asks the receptionist three times whether the therapist "is qualified to handle her situation." When the therapist greets her, she says, "I need to know if you can really help me before we start." Which of the following actions should the therapist take?',
  options: [
    'Provide the client with the therapist\'s credentials, training, and areas of expertise to address her concern',
    'Acknowledge the importance of her question, invite her to describe what would help her feel confident the work could be useful, and proceed collaboratively rather than as a credential check',
    'Reassure the client that all therapists can help with most concerns',
    'Tell the client the therapist cannot know if they can help without knowing more about her situation'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'The credential-check framing often reflects anxiety about being helped, not actual evaluation of credentials. Acknowledging the question, inviting her to describe what would help her assess fit, and engaging collaboratively addresses the relational dimension while still allowing exchange of relevant information.',
    distractors: {
      0: 'Reciting credentials accepts the credential-check framing and may communicate that this is how the work proceeds.',
      2: 'Reassuring "all therapists can help with most concerns" is both inaccurate and dismissive of her stated need to evaluate.',
      3: 'Telling her the therapist "cannot know" without information positions the work as conditional on data-gathering rather than relational engagement.'
    }
  },
  difficulty: 3,
  tags: ['rapport', 'anxiety', 'evaluation-framing']
},
{
  id: 'CE-1B-010',
  domain: 1, subsection: '1B',
  stem: 'A 67-year-old client initiates therapy with reports of new-onset confusion, difficulty word-finding, and getting lost on familiar routes over the past four months. Her husband, who attends with her permission, reports she has been "increasingly forgetful" and once forgot to turn off the stove. Which of the following actions should the therapist take?',
  options: [
    'Begin cognitive-behavioral interventions targeting any anxiety about the cognitive changes',
    'Refer the client for medical and neuropsychological evaluation to assess for major neurocognitive disorder while continuing supportive contact',
    'Recommend the husband take over household tasks and other safety-relevant responsibilities',
    'Provide psychoeducation about normal aging changes'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'New-onset confusion, word-finding difficulty, navigation problems, and significant memory lapses in a 67-year-old warrant comprehensive medical and neuropsychological evaluation — the picture suggests major neurocognitive disorder, with reversible contributors also requiring rule-out (B12, thyroid, medication, depression-related, normal-pressure hydrocephalus, etc.). The LMFT continues supportive contact but the medical workup is the priority action.',
    distractors: {
      0: 'CBT for anxiety treats one symptom while missing the underlying medical workup.',
      2: 'Recommending the husband take over without first conducting the medical workup may be premature and bypasses the assessment that the picture requires.',
      3: 'Calling significant cognitive changes "normal aging" is incorrect and forecloses the workup.'
    }
  },
  difficulty: 2,
  tags: ['neurocognitive', 'medical-rule-out', 'older-adult']
},
{
  id: 'CE-1B-011',
  domain: 1, subsection: '1B',
  stem: 'A 25-year-old client reports unpredictable episodes of intense fear, racing heart, and "tingly limbs" lasting 5-10 minutes that come on without warning. She has had two ER visits with negative cardiac workup. Her mother had similar episodes that resolved when she was started on a heart medication. Which of the following actions should the therapist take?',
  options: [
    'Begin cognitive-behavioral therapy for panic disorder',
    'Refer the client back to medical care to assess for cardiac arrhythmias, which can mimic panic attacks and may run in families, before initiating psychological treatment',
    'Begin interoceptive exposure to reduce the physical-sensation fear',
    'Provide psychoeducation about panic attacks and their physical sensations'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'A family history of "episodes that resolved on heart medication" in the mother is a significant red flag for an inherited cardiac condition (e.g., SVT, certain arrhythmias) that can produce panic-like symptoms. Cardiac workup should be re-engaged before assuming psychological etiology, even with negative initial ER workups.',
    distractors: {
      0: 'Initiating CBT for panic disorder before ruling out a cardiac contributor risks treating a presentation with a primary medical cause.',
      2: 'Interoceptive exposure for what may be a cardiac arrhythmia could provoke the cardiac event rather than help.',
      3: 'Psychoeducation about panic implicitly diagnoses the presentation as panic before completing the workup.'
    }
  },
  difficulty: 3,
  tags: ['medical-rule-out', 'family-history', 'panic-vs-cardiac']
},
{
  id: 'CE-1C-010',
  domain: 1, subsection: '1C',
  stem: 'A 16-year-old client tells the therapist she thinks she might be autistic. She mentions having always felt "different," struggling with social cues she has had to learn explicitly, and being very sensitive to certain textures. She does well academically and has not been formally evaluated. Which of the following actions should the therapist take?',
  options: [
    'Validate her self-identification and continue treatment without further evaluation',
    'Take her exploration seriously, gather a developmental history, and discuss options for formal assessment if she and her family would find that useful',
    'Recommend she rule out social anxiety disorder before pursuing autism evaluation',
    'Tell her that since she is functioning well academically, autism is unlikely'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Late-identified autism in females and high-masking individuals is a recognized clinical reality. Taking the client\'s exploration seriously, gathering developmental history, and discussing assessment options is the appropriate response — neither validating without inquiry nor dismissing based on functioning level.',
    distractors: {
      0: 'Validating without inquiry forecloses the developmental and assessment exploration she has invited.',
      2: 'Recommending SAD rule-out first follows an outdated assumption about presentation; an autistic person can also have social anxiety, and they are not mutually exclusive.',
      3: 'Dismissing autism based on academic functioning reflects a stereotype about autism that misses many people, especially females and high-masking individuals.'
    }
  },
  difficulty: 3,
  tags: ['autism-late-identification', 'self-identification']
},
{
  id: 'CE-1D-007',
  domain: 1, subsection: '1D',
  stem: 'A 45-year-old single woman tells the therapist she has very few close relationships and "always has." She prefers solitude, has never wanted to marry or have children, and finds social events draining. She is otherwise functioning well in her career and reports satisfaction with her life. She mentions a friend told her she "needs therapy" to "fix her isolation." Which of the following actions should the therapist take?',
  options: [
    'Assess the client\'s actual subjective experience of her relational pattern — whether she experiences distress or impairment, what brought her to therapy, and whether the relational pattern is something she wants to change',
    'Begin treatment to address her social isolation as a clinical issue',
    'Recommend she join a social skills training group to develop her interpersonal capacity',
    'Refer her for a personality disorder assessment given the long-standing pattern'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A long-standing preference for solitude in a person reporting life satisfaction is not by itself a clinical problem. Assessing the client\'s subjective experience, what actually brought her to therapy, and whether she wants to change anything is the foundational evaluation — distinguishing genuine clinical concern from another person\'s framing imposed on her.',
    distractors: {
      1: 'Treating "social isolation" as a clinical issue without assessment accepts another person\'s framing of the client\'s life as a problem.',
      2: 'Social skills training presumes a deficit and a desired change that have not been established.',
      3: 'A personality disorder assessment based on a long-standing preference for solitude without distress or impairment pathologizes a non-pathological pattern.'
    }
  },
  difficulty: 3,
  tags: ['solitude-vs-isolation', 'external-framing']
},
{
  id: 'CE-1E-005',
  domain: 1, subsection: '1E',
  stem: 'A 38-year-old male client tells the therapist for the first time that his ex-wife was physically and emotionally abusive during their 10-year marriage. He describes how he felt unable to leave and minimized the abuse to himself and others. He is now safely divorced for two years and is in a healthy relationship but has begun having intrusive memories. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Assess the impact of the abuse experience on his current functioning, validate the often-unrecognized reality of male victims of IPV, and gather information about the trajectory of his recovery',
    'Refer him to a male-survivors-of-abuse support group as the primary intervention',
    'Recommend he write a letter to his ex-wife (without sending it) to process the experience',
    'Focus on the current healthy relationship and use it as the reference point for what relationships should be'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Male victims of IPV often face under-recognition and minimization. The clinical task is to assess current functional impact, validate the often-invisible experience of male IPV victims, and gather information about his recovery trajectory — particularly since intrusive memories are emerging now, two years post-divorce.',
    distractors: {
      1: 'Reflexive group referral may be useful but bypasses the assessment task and offloads the work the LMFT can do.',
      2: 'A letter-writing exercise is an intervention before assessment.',
      3: 'Centering the current healthy relationship as the reference point may invalidate his experience of the abuse and the intrusive memories he is now bringing.'
    }
  },
  difficulty: 3,
  tags: ['male-IPV-survivor', 'late-emerging-trauma']
},
{
  id: 'CE-1F-006',
  domain: 1, subsection: '1F',
  stem: 'A 28-year-old client in therapy for depression has not responded to four months of CBT-based treatment despite good engagement and homework completion. The therapist has consulted with a colleague and adjusted the approach. The client now reports she is "still depressed" and asks the therapist what to do. Which of the following actions should the therapist take?',
  options: [
    'Continue the current treatment for two more months before recommending alternatives',
    'Refer the client for a psychiatric evaluation regarding possible medication adjustment or adjunctive options, while continuing the therapeutic work',
    'Switch to a psychodynamic approach to access deeper material that CBT has missed',
    'Recommend the client increase session frequency to twice weekly'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Treatment-resistant depression after adequate psychotherapy with good engagement warrants psychiatric consultation for medication or adjunctive options (TMS, ketamine, augmentation strategies). The LMFT continues the relationship while coordinating with the prescriber.',
    distractors: {
      0: 'Continuing without considering the medication question delays an option the client may benefit from.',
      2: 'Switching modalities may eventually be reasonable but a different therapy is one option; the psychiatric consultation also opens medication options that the client has not yet tried.',
      3: 'Increasing frequency in non-responding treatment may produce more of the same.'
    }
  },
  difficulty: 2,
  tags: ['treatment-resistant', 'referral']
},
{
  id: 'CE-1F-007',
  domain: 1, subsection: '1F',
  stem: 'A 6-year-old client has been in play therapy for two months. The teacher reports he sometimes "zones out" for several seconds during class, doesn\'t respond when called, and then "comes back" as if nothing happened. The parents have noticed this at home as well. Which of the following actions should the therapist take?',
  options: [
    'Continue play therapy and address the "zoning out" as a dissociative response to family stress',
    'Refer the family for a pediatric neurological evaluation to rule out absence seizures or other neurological conditions, while continuing supportive contact',
    'Recommend a structured behavior plan at school to maintain his attention',
    'Provide psychoeducation to the parents about ADHD inattentive presentation'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Brief episodes of unresponsiveness with no recall, in a child, are concerning for absence seizures (also called petit mal seizures) or other neurological conditions and require pediatric neurological evaluation. Misattributing these to psychological causes can delay diagnosis of a treatable medical condition.',
    distractors: {
      0: 'Framing the episodes as dissociation without neurological workup risks missing a seizure disorder.',
      2: 'A behavior plan addresses a behavioral problem; the presentation here is neurological-suspicious.',
      3: 'ADHD inattentive presentation doesn\'t include the discrete unresponsive episodes described; this is more consistent with absence seizures.'
    }
  },
  difficulty: 3,
  tags: ['absence-seizures', 'pediatric-neurological']
},

// More D1 to close blueprint gap

{
  id: 'CE-1B-012',
  domain: 1, subsection: '1B',
  stem: 'A 19-year-old client reports she has been "feeling weird" for two weeks — racing heart, tremor, weight loss despite increased appetite, and difficulty sleeping. She also notes her menstrual cycle has become irregular. Which of the following actions should the therapist take?',
  options: [
    'Begin cognitive-behavioral therapy targeting the anxiety symptoms',
    'Refer the client for medical evaluation including thyroid function testing before initiating psychological treatment',
    'Provide psychoeducation about anxiety symptoms and stress management',
    'Recommend the client reduce caffeine intake to manage the somatic symptoms'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'The symptom constellation (racing heart, tremor, weight loss with increased appetite, sleep difficulty, menstrual changes) is classic for hyperthyroidism, which can mimic anxiety disorders. Medical workup including TSH and thyroid function testing must precede psychological treatment for this presentation.',
    distractors: {
      0: 'CBT for anxiety in a presentation that may be hyperthyroidism treats symptoms while missing the medical cause.',
      2: 'Psychoeducation about anxiety implicitly accepts the anxiety framing before medical rule-out.',
      3: 'Caffeine reduction is one possible contributor but doesn\'t address the broader hyperthyroidism presentation.'
    }
  },
  difficulty: 2,
  tags: ['hyperthyroidism', 'medical-rule-out']
},
{
  id: 'CE-1C-011',
  domain: 1, subsection: '1C',
  stem: 'A 30-year-old client raised in a strict religious household has been in therapy for two years. She has gradually disclosed that she no longer holds the religious beliefs of her family but has not told them. She tells the therapist she feels both relieved by her change and grief about leaving the community that shaped her. Which of the following actions should the therapist take to continue evaluating this client?',
  options: [
    'Validate her authentic shift and encourage her to share her new beliefs with her family',
    'Continue to explore both the relief and the grief — neither pushing toward disclosure to family nor away from her new identity — and support her in integrating both dimensions',
    'Recommend she connect with a community for former religious-community members',
    'Refer her to a religious counselor who can help her resolve the conflict'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Religious deconstruction often involves both relief and grief simultaneously. The clinical task is to validate the complexity, explore both dimensions, and support integration — without prescribing disclosure to family or framing the change as a conflict requiring resolution.',
    distractors: {
      0: 'Encouraging disclosure to family takes one direction and overrides her own pacing.',
      2: 'A peer community may be useful but is not a substitute for the individual integration work she is doing.',
      3: 'A religious counselor frames the situation as needing religious resolution when she has actually changed her religious position.'
    }
  },
  difficulty: 3,
  tags: ['religious-deconstruction', 'identity-grief']
},
{
  id: 'CE-1D-008',
  domain: 1, subsection: '1D',
  stem: 'A 50-year-old client tells the therapist that since her last child left for college six months ago, she has felt "lost" and her marriage has felt empty. She and her husband used to focus their lives around the children. She wonders if her marriage was "ever really anything." Which of the following actions should the therapist take to evaluate this presentation?',
  options: [
    'Recommend immediate couple therapy to address the marital concerns',
    'Assess the empty-nest transition, the structure of the marriage when children were present, what other dimensions of connection existed beyond parenting, and the meaning the client is making of the current emptiness',
    'Provide psychoeducation about empty-nest syndrome to normalize her experience',
    'Recommend she pursue new individual activities to fill the time the children previously occupied'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Empty-nest transition often reveals what couples\' structure has been organized around. Assessing the transition itself, the marriage\'s prior structure, what other connection existed, and the client\'s meaning-making distinguishes a marriage that needs reactivation from one that needs deeper examination.',
    distractors: {
      0: 'Recommending couple therapy presupposes the formulation; assessment first.',
      2: 'Psychoeducation alone normalizes without engaging the specific case.',
      3: 'Activity-filling treats the symptom (empty time) while ignoring the relational dimension she has named.'
    }
  },
  difficulty: 2,
  tags: ['empty-nest', 'midlife-marriage']
},
{
  id: 'CE-1E-006',
  domain: 1, subsection: '1E',
  stem: 'A 28-year-old client begins therapy reporting "panic" and difficulty in romantic relationships. In session three, she tells the therapist she was sexually abused by an older sibling between ages 8 and 12. She has never told anyone except a previous partner. She wonders if "all my problems come from this." Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Validate the disclosure, assess the impact on her current symptoms and relationships, and explore her conceptualization without prescribing the causal framework she has offered',
    'Confirm her hypothesis that her current difficulties stem from the abuse',
    'Refer her to a trauma-focused specialist before continuing the work',
    'Begin trauma processing in the next session to address the underlying cause'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Validating the disclosure and assessing the impact on current functioning is the appropriate evaluative response. The client\'s causal hypothesis ("all my problems come from this") may be partially or wholly accurate but the therapist explores rather than confirms or refutes a complex causal claim about her own development.',
    distractors: {
      1: 'Confirming her causal hypothesis without assessment imposes a framework prematurely and may misallocate treatment focus.',
      2: 'Referring out before the LMFT has completed assessment offloads work the LMFT can do.',
      3: 'Beginning processing in the next session is premature; stabilization-phase work and assessment come first.'
    }
  },
  difficulty: 3,
  tags: ['sibling-abuse-disclosure', 'causal-framing']
},
{
  id: 'CE-1F-008',
  domain: 1, subsection: '1F',
  stem: 'A 40-year-old client is in therapy for grief following her father\'s death six months ago. She also reports significant work performance concerns since the loss. Her employer is asking for a "fitness for duty" evaluation and the client asks if the therapist can do this. Which of the following actions should the therapist take?',
  options: [
    'Conduct the fitness-for-duty evaluation since you already know her clinically',
    'Decline to perform the fitness-for-duty evaluation due to the dual-role conflict between treating clinician and forensic evaluator, and provide referrals to qualified independent evaluators',
    'Provide a treatment summary that effectively serves as the fitness-for-duty evaluation',
    'Refer the client to her primary care physician for the evaluation'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'A fitness-for-duty evaluation is a forensic role distinct from treatment. Performing both for the same client creates a dual-role conflict — the methods, allegiances, and products differ. Declining and providing referrals to independent evaluators is the appropriate response.',
    distractors: {
      0: 'Performing forensic evaluation on a current treatment client conflates roles and compromises both.',
      2: 'A treatment summary that effectively serves as the evaluation still crosses the role boundary, just less openly.',
      3: 'A primary care physician is not typically qualified to perform a mental-health fitness-for-duty evaluation.'
    }
  },
  difficulty: 2,
  tags: ['fitness-for-duty', 'dual-role']
},

// ===== Batch 6: more Clinical eval depth =====

{
  id: 'CE-1A-008',
  domain: 1, subsection: '1A',
  stem: 'A 28-year-old client initiates therapy reporting "anxiety." When asked what brings him to therapy now, he says he is "fine" and is here because his partner suggested it. Which of the following actions should the therapist take?',
  options: [
    'Begin an anxiety assessment using a structured instrument',
    'Acknowledge the gap between his self-report and his partner\'s suggestion, explore his own perspective on whether therapy fits for him, and proceed only after engagement is established',
    'Recommend the client and his partner attend couple therapy together',
    'Inform the client that therapy requires his motivation and ask him to leave if he is not invested'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'When the client\'s presentation does not match the referral framing, the therapist surfaces the discrepancy and explores his own perspective. Engagement is the foundation; trying to assess or treat before engagement is established typically fails.',
    distractors: {
      0: 'Beginning anxiety assessment when the client says he is "fine" assumes the referrer\'s framing.',
      2: 'Recommending couple therapy presumes the issue based on minimal information.',
      3: 'Asking the client to leave is overly punitive and forecloses the engagement work.'
    }
  },
  difficulty: 2,
  tags: ['rapport', 'partner-referred']
},
{
  id: 'CE-1A-009',
  domain: 1, subsection: '1A',
  stem: 'A 45-year-old client tells the therapist she wants to "work on" her relationship with her mother. Her mother passed away five years ago. Which of the following actions should the therapist take?',
  options: [
    'Clarify that direct relationship work is not possible after death and redirect to grief work',
    'Validate that significant relational work can happen with a deceased person and explore what the client wants to address',
    'Refer her to a medium or spiritual practitioner for direct communication with the deceased mother',
    'Recommend she write a letter to her mother and read it at the gravesite'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Significant relational work happens with deceased people through continuing-bonds work, internalized-relationship exploration, and other approaches. Validating that this kind of work is meaningful and exploring what she wants to address is the foundational step.',
    distractors: {
      0: 'Categorically redirecting to "grief work" forecloses the relational work the client has named.',
      2: 'Referring to a medium is outside therapy scope and may be inappropriate.',
      3: 'Letter-writing and gravesite rituals may emerge as interventions but are premature without first understanding what the client wants to address.'
    }
  },
  difficulty: 3,
  tags: ['continuing-bonds', 'deceased-relationship']
},
{
  id: 'CE-1B-013',
  domain: 1, subsection: '1B',
  stem: 'A 34-year-old client reports feeling "physically off" — chronic fatigue, joint aches, brain fog, and unrefreshing sleep. She has tested negative for thyroid issues, anemia, and Lyme disease. She wonders if "it\'s all in my head." Which of the following actions should the therapist take?',
  options: [
    'Reassure her that the symptoms are likely stress-related and begin stress-management work',
    'Validate the reality of her symptoms, assess for the impact on her functioning, integrate psychological support with continued medical workup (e.g., possible fibromyalgia, ME/CFS, autoimmune conditions still being explored)',
    'Refer her to a psychiatrist for possible somatic symptom disorder',
    'Recommend cognitive-behavioral therapy for medically unexplained symptoms'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Symptoms that have not been medically explained do not automatically mean "psychological." Conditions like fibromyalgia, ME/CFS, autoimmune diseases, and others often take years to diagnose. Validating the reality of the symptoms, supporting psychological function, and supporting continued medical workup is the integrative response.',
    distractors: {
      0: 'Reassuring symptoms are "stress-related" without further workup misclassifies what may be a real medical condition still being worked up.',
      2: 'A somatic symptom disorder diagnosis is appropriate only when the criteria are met (somatic symptoms PLUS excessive cognitions/feelings/behaviors); pathologizing pre-diagnosed conditions is iatrogenic.',
      3: 'CBT for "medically unexplained symptoms" treats the framework as established when the medical workup is still in progress.'
    }
  },
  difficulty: 3,
  tags: ['medically-unexplained', 'chronic-illness']
},
{
  id: 'CE-1C-012',
  domain: 1, subsection: '1C',
  stem: 'A 33-year-old client tells the therapist she has been struggling with infertility for three years. She and her husband are considering whether to continue treatment, pursue adoption, or remain child-free. She reports grief, identity confusion, and tension in her marriage. Which of the following actions should the therapist take to evaluate her presentation?',
  options: [
    'Recommend she pursue adoption since it has the highest probability of resulting in parenthood',
    'Assess the impact of infertility on her identity, marriage, relationships, and meaning-making — without prescribing a particular path forward',
    'Refer her to a fertility specialist for a second medical opinion',
    'Recommend the client and her husband attend couple therapy as the primary intervention'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Infertility involves identity grief, relational impact, meaning-making, and decision-complexity. Assessment across these dimensions is the foundation — without imposing a path forward (continuing treatment, adoption, child-free) since this is fundamentally her and her husband\'s decision.',
    distractors: {
      0: 'Recommending adoption imposes one path and dismisses the values dimensions she is working through.',
      2: 'A second medical opinion may be relevant but does not address the psychological/relational work.',
      3: 'Couple therapy may eventually be appropriate but presupposes a formulation; individual assessment first.'
    }
  },
  difficulty: 2,
  tags: ['infertility', 'identity', 'reproductive-decision']
},
{
  id: 'CE-1D-009',
  domain: 1, subsection: '1D',
  stem: 'A 40-year-old client tells the therapist she has been emotionally engaged in an online-only relationship with someone she has never met in person for over a year. She is married. She says the online relationship "isn\'t really cheating because nothing physical happens." Which of the following actions should the therapist take to evaluate this presentation?',
  options: [
    'Inform her that emotional affairs are equivalent to physical affairs and recommend she end the online contact',
    'Assess the impact of the online relationship on her marriage, her self-concept, and her sense of what is happening — exploring her framing without imposing the therapist\'s view',
    'Refer her and her husband to couple therapy to address the affair',
    'Recommend she disclose the online relationship to her husband immediately'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'The clinical work begins with assessment of impact on her marriage, self-concept, and meaning-making — including her current framing of "not really cheating." Exploring (not imposing or accepting) her framing is the appropriate evaluative stance.',
    distractors: {
      0: 'Telling her emotional affairs are equivalent to physical affairs imposes the therapist\'s framing.',
      2: 'Recommending couple therapy presupposes the husband\'s involvement and her readiness to disclose.',
      3: 'Requiring disclosure prescribes a major action without exploration.'
    }
  },
  difficulty: 3,
  tags: ['emotional-affair', 'marriage', 'framing']
},
{
  id: 'CE-1E-007',
  domain: 1, subsection: '1E',
  stem: 'A 35-year-old client begins therapy reporting "anger problems." Over the course of three sessions, she describes a childhood with a parent who was emotionally explosive and unpredictable. She tells the therapist she "doesn\'t remember much" of her childhood between ages 8 and 14. Which of the following actions should the therapist take to evaluate this client?',
  options: [
    'Recommend hypnosis to recover the missing memories',
    'Note the autobiographical memory gap, assess current functioning and trauma symptoms, explore her current relationship to her childhood without pushing for recovered memories, and integrate the gap as clinical data',
    'Begin trauma-focused processing of the unprocessed childhood material',
    'Refer her to a specialist in recovered-memory work'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Autobiographical memory gaps in the context of childhood with an emotionally explosive parent are clinically meaningful but should NOT be approached with memory-recovery techniques (which have significant false-memory risks). The appropriate response is to note the gap, assess current functioning, explore her current relationship to her childhood without pushing, and integrate as clinical data.',
    distractors: {
      0: 'Hypnosis for memory recovery has significant false-memory risk and is generally not recommended for clinical use.',
      2: 'Trauma-focused processing of unrecovered material is incoherent — you cannot process what is not present.',
      3: 'Specialist referral for "recovered-memory work" engages discredited frameworks.'
    }
  },
  difficulty: 3,
  tags: ['memory-gaps', 'no-memory-recovery']
},
{
  id: 'CE-1F-009',
  domain: 1, subsection: '1F',
  stem: 'A 25-year-old client has been in therapy for six months for anxiety. She reports she has been doing well but mentions that she has been struggling with eating — restricting some days and binging on others — for several months. She had not mentioned this before. Which of the following actions should the therapist take?',
  options: [
    'Continue the anxiety treatment and address eating as a secondary concern',
    'Refer her to an eating-disorder specialist for evaluation and treatment, coordinating with the existing therapy or transitioning care as appropriate',
    'Begin treating the eating disorder within the existing therapy',
    'Recommend she see a nutritionist for meal planning support'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Mixed restrictive/binge eating patterns warrant eating-disorder evaluation by a specialist. The LMFT may continue working with the anxiety presentation in coordination with the eating-disorder treatment, or transition care entirely, depending on the LMFT\'s scope and the client\'s presentation. Eating-disorder treatment typically benefits from specialist expertise.',
    distractors: {
      0: 'Treating eating as a "secondary concern" misallocates urgency and risks under-treatment of what may be a primary disorder.',
      2: 'Treating the eating disorder within existing therapy may exceed the LMFT\'s scope if they lack specialized training.',
      3: 'A nutritionist alone is insufficient for an eating disorder; eating-disorder treatment is multidisciplinary.'
    }
  },
  difficulty: 2,
  tags: ['eating-disorder', 'specialist-referral']
},
{
  id: 'CE-1F-010',
  domain: 1, subsection: '1F',
  stem: 'A 50-year-old client has been in therapy for two months for marital distress. The client mentions she has experienced chronic pain since a car accident two years ago and her physician has been gradually increasing her opioid medications. She now finds herself taking "a little more than prescribed" and "feeling foggy" between doses. Which of the following actions should the therapist take?',
  options: [
    'Continue the marital work and address the pain medication concerns at her next medical appointment',
    'Recommend she stop the opioid medications and switch to non-medication pain management',
    'Coordinate with her prescribing physician about the dose escalation and possible dependence pattern (with consent), and integrate substance-use considerations into the treatment work',
    'Refer her to a pain-specialist clinic for medication management'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Pattern of dose escalation, taking more than prescribed, and intoxication-like effects ("foggy") raises concern for opioid dependence. Coordinating with the prescriber (with consent) and integrating substance-use considerations is the appropriate response — without overstepping into medication decisions.',
    distractors: {
      0: 'Deferring to her next medical appointment without coordination misses an opportunity for collaborative care.',
      1: 'Recommending she stop opioids is medication advice outside scope and may also be unsafe (abrupt discontinuation has its own risks).',
      3: 'Pain-specialist referral may be useful but does not address the dependence-pattern concern directly.'
    }
  },
  difficulty: 3,
  tags: ['opioid-dependence', 'pain-management', 'coordination']
}
  );
})(window.LMFT_BANK);
