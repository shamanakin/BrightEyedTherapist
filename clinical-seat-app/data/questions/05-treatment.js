/* Domain 5 — Treatment (29% of exam) */

(function (BANK) {
  BANK.push(
// ============ 5A. Interpersonal/Couple/Family Relationships (target: 2 items) ============
{
  id: 'TX-5A-001',
  domain: 5, subsection: '5A',
  stem: 'A couple has been in therapy for six weeks. During sessions, the wife consistently criticizes the husband, who responds by withdrawing and shutting down. The pattern repeats within minutes of each session\'s start. Which of the following interventions would BEST address this couple\'s pattern?',
  options: [
    'Help each partner identify their underlying emotion beneath the surface behavior and slow down the cycle so they can access vulnerability with each other',
    'Direct the wife to stop criticizing and the husband to stop withdrawing, and assign communication homework',
    'Interpret to the couple that the wife\'s criticism reflects her unmet attachment needs from her family of origin',
    'Recommend a temporary separation so the cycle can de-escalate before resuming therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The criticize-withdraw cycle is a classic negative interaction pattern. EFT slows the cycle, helps each partner identify the primary emotion (e.g., fear, sadness) underneath the secondary reactive emotion (criticism, withdrawal), and creates new corrective emotional interactions. This addresses the cycle, not just the symptoms.',
    distractors: {
      1: 'Directives to stop the behaviors and assign communication skills without addressing the underlying emotional cycle treat the symptom, not the dynamic, and often fail because partners cannot stop the behaviors without the emotional shift.',
      2: 'Premature interpretation linking to family-of-origin material when the couple is in active cycle pulls focus from the in-session relational dynamic and may feel dismissive to the wife.',
      3: 'Recommending separation introduces an intervention not indicated by the presentation, may worsen attachment distress, and substitutes for the clinical work the couple came for.'
    }
  },
  difficulty: 3,
  tags: ['EFT', 'couple', 'cycle']
},
{
  id: 'TX-5A-002',
  domain: 5, subsection: '5A',
  stem: 'A blended family has been in therapy for two months. The stepfather and his stepdaughter (age 12) are openly hostile, and the mother repeatedly steps in to defend her daughter, leaving the stepfather feeling marginalized. The mother and daughter have a tightly bonded relationship that pre-dates the marriage. Which of the following interventions would BEST address this family\'s structure?',
  options: [
    'Strengthen the parental subsystem by supporting joint mother-stepfather decisions and repositioning the daughter',
    'Recommend that the mother and stepfather attend couple therapy in parallel with but separate from the family work',
    'Encourage the mother to step out of conflicts between the stepfather and daughter so they can resolve them directly',
    'Provide individual play therapy for the daughter to address her difficulty adjusting to the new blended-family configuration'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A structural family therapy formulation identifies an enmeshed mother-daughter dyad and a marginalized stepfather. Strengthening the parental subsystem — by supporting joint parental decision-making and age-appropriately repositioning the daughter out of a parental coalition — restructures the family hierarchy.',
    distractors: {
      1: 'Splitting off couple therapy from the family work bypasses the structural restructuring task and treats the marital subsystem in isolation when the family structure itself is the issue.',
      2: 'Asking the mother to disengage entirely is structurally too abrupt — the goal is restructuring her role within the system, not disengagement. It also leaves a 12-year-old to negotiate alone with a hostile stepfather, which is developmentally inappropriate.',
      3: 'Individual play therapy for the daughter may have a role, but it does not address the family structure that is producing the presenting problem.'
    }
  },
  difficulty: 3,
  tags: ['structural', 'blended-family']
},

// ============ 5B. Grief, Trauma, Violence (target: 1 item) ============
{
  id: 'TX-5B-001',
  domain: 5, subsection: '5B',
  stem: 'A 28-year-old client has been in therapy for nine months for PTSD following a sexual assault. She has stabilized, established safety, and built coping skills. She tells the therapist she is ready to "deal with what happened" so it stops dominating her life. Which of the following interventions would BEST address the client\'s symptoms at this stage?',
  options: [
    'Implement a trauma-focused intervention such as prolonged exposure, cognitive processing therapy, or EMDR to process the traumatic memory',
    'Continue building coping skills before introducing any direct work with the trauma memory',
    'Refer the client to a peer support group of survivors',
    'Begin medication management consultation to address residual symptoms'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The client has completed the stabilization phase of trauma treatment (Phase 1) and is now ready for the processing phase (Phase 2). Trauma-focused interventions with evidence base for PTSD — prolonged exposure, CPT, EMDR — are indicated when the client is stabilized and consents to the work.',
    distractors: {
      1: 'Indefinite skill-building without progressing to processing avoids the core work the client is asking for and can keep the trauma "in the background" indefinitely. Stabilization is preparation, not the destination.',
      2: 'A peer support group can complement individual treatment but is not a substitute for the indicated trauma-processing intervention.',
      3: 'Medication management is a referral, not an intervention the LMFT performs, and it does not address the client\'s expressed readiness to process the trauma psychotherapeutically.'
    }
  },
  difficulty: 2,
  tags: ['PTSD', 'trauma-processing', 'phase-based']
},

// ============ 5C. Physical and Psychological Issues (target: 3 items) ============
{
  id: 'TX-5C-001',
  domain: 5, subsection: '5C',
  stem: 'A 36-year-old client has been diagnosed with multiple sclerosis. She presents to therapy with grief about the diagnosis, fear of future disability, and difficulty maintaining hope. She is otherwise functional and has good social support. Which of the following interventions would BEST address the client\'s presentation?',
  options: [
    'Integrate grief processing, coping-skill development for the chronic condition, and meaning-making that incorporates the diagnosis into the client\'s ongoing life narrative',
    'Use cognitive restructuring to identify and challenge the client\'s catastrophic thoughts about future disability and her loss of hope',
    'Refer the client to a peer-led support group for people with MS to address grief and isolation through connection with others',
    'Provide psychoeducation about MS prognosis, treatment options, and the typical disease course to correct inaccurate beliefs'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Chronic illness adjustment work integrates grief processing (loss of imagined future health), skill-building (managing the practical and emotional demands of the condition), and meaning-making (constructing a life narrative that incorporates the diagnosis without being defined by it).',
    distractors: {
      1: 'Cognitive restructuring of catastrophic thoughts may have a role but is reductive — fear of future disability with MS is not necessarily distorted, and exclusive focus on cognition misses the grief and meaning-making tasks.',
      2: 'A support group may complement individual therapy but is not a substitute for the integrative individual work the client is presenting for.',
      3: 'Psychoeducation about prognosis is the medical team\'s domain, not the LMFT\'s, and addresses neither the grief nor the meaning-making.'
    }
  },
  difficulty: 2,
  tags: ['chronic-illness', 'integrative']
},
{
  id: 'TX-5C-002',
  domain: 5, subsection: '5C',
  stem: 'A 24-year-old client has been working with the therapist for three months to address symptoms of bulimia. She has reduced her binge-purge episodes from daily to twice weekly but is now expressing frustration that her body has not changed. She says she "doesn\'t see the point" of continuing. Which of the following interventions would BEST address the client\'s current presentation?',
  options: [
    'Validate her frustration, acknowledge her behavioral progress, and explore the link between body image and self-worth',
    'Reassure her that her body will change with continued recovery and encourage her to focus on the behavioral progress she has made',
    'Recommend a nutritionist consultation to develop a meal plan that may produce visible body changes she will find motivating',
    'Confront her belief that body change is the goal of treatment and reframe treatment success in terms of behavior change'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The clinical task is to validate the frustration (which is real), acknowledge the substantial behavioral progress, and address the underlying issue — the conflation of body change with self-worth. This is core to eating disorder treatment: behavioral change without addressing the body image / self-worth link tends not to last.',
    distractors: {
      1: 'Reassuring the client that "your body will change" reinforces the body-as-target frame that drives the eating disorder, even when offered in a recovery context.',
      2: 'A nutritionist referral focused on producing body change directly reinforces the conflation of recovery with body change.',
      3: 'Confronting the client\'s framing without first validating and connecting risks rupturing the alliance at a moment of expressed ambivalence and likely deepens the rupture.'
    }
  },
  difficulty: 3,
  tags: ['eating-disorder', 'body-image', 'self-worth']
},
{
  id: 'TX-5C-003',
  domain: 5, subsection: '5C',
  stem: 'A 41-year-old client with a 15-year history of alcohol use disorder has been in therapy for two months. He has reduced his drinking from daily to weekends only and tells the therapist he is "doing fine" and wants to stop talking about alcohol so much. Which of the following interventions would BEST address the client\'s current stage?',
  options: [
    'Use motivational interviewing techniques to explore the client\'s ambivalence and his own reasons for considering continued change, without imposing the therapist\'s goal',
    'Confront the client about the risks of continued weekend drinking and the high relapse rate for partial abstinence',
    'Agree to focus on other concerns since the client has shown improvement and is no longer ready for substance use work',
    'Refer the client to a 12-step program to support continued sobriety from a peer-based framework'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Motivational interviewing is the indicated approach when a client is ambivalent or in the contemplation/preparation stage. The clinician evokes the client\'s own change talk rather than imposing the change agenda, which is exactly what the client is responding to here.',
    distractors: {
      1: 'Confrontation about risks is the opposite of motivational interviewing and tends to increase resistance and reduce engagement when applied to ambivalent clients.',
      2: 'Dropping the substance use focus entirely abandons the clinical concern when the client is showing partial change but has not yet sustained or fully committed to recovery.',
      3: 'Referring to a 12-step program imposes an external framework the client has not asked for and may not match his readiness or values.'
    }
  },
  difficulty: 2,
  tags: ['MI', 'substance-use', 'stages-of-change']
},

// ============ 5D. Developmental or Psychosocial Issues (target: 4 items) ============
{
  id: 'TX-5D-001',
  domain: 5, subsection: '5D',
  stem: 'A 17-year-old client has been in therapy for low mood and identity questions. She tells the therapist that her parents have made it clear they expect her to attend a specific college, pursue a specific major, and join the family business. She loves her parents and does not want to disappoint them but feels paralyzed about her own desires. Which of the following interventions would BEST address this client\'s presentation?',
  options: [
    'Support the client in differentiating her own values from her parents\' expectations while preserving the relationship',
    'Encourage the client to defer the decision until after she completes college, when she will have more practical autonomy',
    'Recommend a family session to confront the parents about the developmental harm of their controlling expectations',
    'Help the client develop assertiveness skills so she can directly oppose her parents\' expectations about her future'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Late adolescence is the developmental task of identity formation and beginning differentiation from family of origin. The therapeutic task is to support the client in differentiating her own values from her parents\' while preserving the relationship — not to take sides, prescribe deference, or impose assertiveness.',
    distractors: {
      1: 'Deferring identity work until after college bypasses the developmental task that is currently presenting and may produce sustained inauthenticity and resentment.',
      2: 'A "confrontation" family session frames the parents as antagonists and the therapist as advocate, which is neither therapeutic for the family nor consistent with differentiation work.',
      3: 'Assertiveness skills training for the purpose of opposing parents skips the differentiation task and may produce conflict without integration.'
    }
  },
  difficulty: 3,
  tags: ['adolescence', 'differentiation', 'identity']
},
{
  id: 'TX-5D-002',
  domain: 5, subsection: '5D',
  stem: 'A 58-year-old man has been in therapy following a recent layoff after 30 years at the same company. He reports difficulty getting out of bed, has stopped exercising, and has withdrawn from friends. He says, "I don\'t know who I am if I\'m not working." Which of the following interventions would BEST address this client\'s presentation?',
  options: [
    'Address the identity loss, support gradual re-engagement, and explore meaning-making beyond the work role',
    'Recommend the client take a vacation to recover from the stress of the layoff before returning to active job-search',
    'Encourage immediate job-search activities to restore the work identity and the structure his routine has lost',
    'Provide cognitive restructuring targeting the client\'s belief that he has no identity outside of work and his job'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Job loss in midlife after a long tenure produces a layered presentation: depressive symptoms, identity disruption, loss of structure, and existential meaning questions. The integrated task is to address the identity loss, support gradual re-engagement, and work on broader meaning-making — not to push job-search or simply challenge the belief.',
    distractors: {
      1: 'A vacation delays addressing the underlying identity and meaning issues and does not address the depressive symptoms.',
      2: 'Pushing immediate job-search reinforces the work-as-identity equation rather than addressing it and bypasses the depressive presentation.',
      3: 'Cognitive restructuring alone treats the statement as a distortion when it may instead be an accurate reflection of how this client has constructed his identity. The therapeutic task is broader meaning work, not just thought-challenge.'
    }
  },
  difficulty: 3,
  tags: ['midlife', 'job-loss', 'identity', 'meaning']
},
{
  id: 'TX-5D-003',
  domain: 5, subsection: '5D',
  stem: 'A 26-year-old Black client tells the therapist she is exhausted by repeated experiences of racial microaggressions at her workplace. She describes feeling she has to "perform" being unbothered while internally feeling angry and sad. She is reluctant to bring concerns to HR because she fears being labeled "difficult." Which of the following interventions would BEST address this client\'s presentation?',
  options: [
    'Validate the impact of racial microaggressions, support the client in processing the suppressed emotions, and collaboratively explore options for self-protection and action',
    'Help the client develop cognitive reframes that interpret her colleagues\' behavior in less personalized ways',
    'Encourage the client to file an HR complaint to address the workplace behavior at the source',
    'Refer the client to a Black women\'s support group as the primary intervention'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Racial microaggressions are real and cumulative; the therapeutic task is to validate the experience, support processing of the suppressed emotional response, and collaboratively explore options — without imposing a path of action or pathologizing the response. The client retains autonomy over how to respond externally.',
    distractors: {
      1: 'Cognitive reframing of microaggressions as "less personal" risks gaslighting the client and invalidating the racial reality. The behavior is racially harmful regardless of intent.',
      2: 'Prescribing an HR complaint imposes an action the client has explicitly identified as carrying risk for her, and overrides her own assessment of the workplace context.',
      3: 'A support group can be a meaningful complement but is not a substitute for the individual processing work the client is engaged in.'
    }
  },
  difficulty: 3,
  tags: ['racial-microaggressions', 'minority-stress', 'workplace']
},
{
  id: 'TX-5D-004',
  domain: 5, subsection: '5D',
  stem: 'A 31-year-old client immigrated from Iran six years ago. She is fluent in English but reports feeling chronically "in between" cultures — she no longer feels fully Iranian but does not feel American either. She experiences this as a low-grade grief and isolation that she has never named in therapy before. Which of the following interventions would BEST address this client\'s presentation?',
  options: [
    'Validate the bicultural experience as adaptive, support grief for what was left behind, and help the client integrate both contexts into her identity',
    'Encourage the client to engage more deeply with the Iranian community to restore her sense of cultural connection and identity',
    'Encourage the client to integrate more fully into American culture and develop new connections to resolve the in-between feeling',
    'Reframe the bicultural experience as enriching and identity-expanding rather than as a source of grief or loss'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Bicultural identity formation is a recognized developmental task for immigrants. The integrative therapeutic task validates the experience as adaptive (not pathological), supports the grief of what was left behind, and helps construct an integrated bicultural identity — rather than pushing the client toward either culture.',
    distractors: {
      1: 'Pushing toward greater Iranian engagement chooses one culture over the other and imposes the therapist\'s direction.',
      2: 'Pushing toward fuller American integration similarly chooses for the client and ignores the grief for what was left behind.',
      3: 'Reframing the experience as enriching alone dismisses the grief the client just named and is a form of premature positive reframe that invalidates her experience.'
    }
  },
  difficulty: 3,
  tags: ['immigration', 'biculturalism', 'identity']
},

// ============ 5E. Applying Theory in Practice (target: 4 items) ============
{
  id: 'TX-5E-001',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client who experiences chronic anxiety asks her to keep a daily log of situations that triggered anxiety, the specific automatic thoughts she had in those situations, the emotional and behavioral consequences, and an alternative interpretation she could test. Which intervention is the therapist using?',
  options: [
    'Cognitive restructuring via thought records',
    'Exposure and response prevention',
    'Mindfulness-based observation of thoughts',
    'Free association to identify unconscious conflicts'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The structured log of situation, automatic thought, consequence, and alternative is the classic thought record used in cognitive restructuring. It targets the cognitive appraisals that drive the anxiety response.',
    distractors: {
      1: 'ERP exposes the client to anxiety-provoking stimuli while preventing the avoidant response. It does not require the cognitive log structure described.',
      2: 'Mindfulness-based observation has the client notice thoughts without engaging or restructuring them — the opposite of the active alternative-interpretation step described.',
      3: 'Free association is a psychodynamic technique and does not involve the structured CBT log.'
    }
  },
  difficulty: 2,
  tags: ['CBT', 'thought-record']
},
{
  id: 'TX-5E-002',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a couple notices that whenever the wife begins to talk about her hurt feelings, the husband interrupts with logical arguments about whose perspective is "correct." The therapist asks the husband to slow down, notice what happens in his body when his wife expresses hurt, and stay with that sensation rather than moving to the argument. Which intervention is the therapist using?',
  options: [
    'Accessing primary emotion underneath the secondary reactive response in Emotionally Focused Therapy',
    'Implementing a paradoxical directive to disrupt the dysfunctional pattern',
    'Coaching the couple in active listening and reflective communication',
    'Externalizing the problem and inviting the couple to fight it together'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'EFT identifies secondary reactive emotion (here, the husband\'s defensive arguing) and helps the partner access the primary emotion underneath (often fear, shame, or hurt) so that the couple can interact with each other\'s vulnerability rather than each other\'s reactivity.',
    distractors: {
      1: 'A paradoxical directive (strategic therapy) would prescribe the symptom or assign a paradoxical task. Slowing down to notice somatic experience is not paradoxical.',
      2: 'Active listening / reflective communication is a behavioral skills approach that focuses on communication form, not on accessing primary emotion.',
      3: 'Externalizing the problem is a narrative therapy intervention. The therapist is not externalizing anything here.'
    }
  },
  difficulty: 3,
  tags: ['EFT', 'primary-emotion']
},
{
  id: 'TX-5E-003',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a 12-year-old client who has been bullied helps the client name the problem "Sneaky Mr. Shame" and asks the client to map out when Sneaky Mr. Shame is influential, when the client is able to push back against it, and what helps the client be stronger than the problem. Which theoretical orientation is the therapist applying?',
  options: [
    'Narrative therapy',
    'Solution-focused brief therapy',
    'Play therapy',
    'Cognitive-behavioral therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Externalizing the problem (giving it a name and treating it as a separate entity from the client), mapping its influence, and identifying "unique outcomes" when the client successfully resists the problem are hallmarks of narrative therapy (White and Epston).',
    distractors: {
      1: 'SFBT identifies exceptions to the problem and amplifies them but does not externalize the problem as a named entity in the narrative therapy sense.',
      2: 'Play therapy uses play as the primary medium of expression and intervention with children but is not defined by externalizing language techniques.',
      3: 'CBT targets cognitions and behaviors directly and does not use the externalizing-and-mapping technique described.'
    }
  },
  difficulty: 2,
  tags: ['narrative', 'externalization']
},
{
  id: 'TX-5E-004',
  domain: 5, subsection: '5E',
  stem: 'A client tells her therapist that she keeps feeling the same way toward her boss that she felt toward her highly critical father. She notices the therapist seems familiar in a similar way and wonders aloud if she is "doing it here too." The therapist invites her to explore the feeling toward the therapist directly, in the room, as it is occurring. Which theoretical orientation is the therapist applying?',
  options: [
    'Psychodynamic — working with transference',
    'Cognitive-behavioral — identifying core beliefs',
    'Humanistic — providing unconditional positive regard',
    'Family systems — mapping family-of-origin patterns'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Inviting the client to explore feelings toward the therapist as they arise — particularly when those feelings echo significant earlier relationships — is the psychodynamic technique of working with transference in the here-and-now of the therapeutic relationship.',
    distractors: {
      1: 'CBT identification of core beliefs would target the belief structure underlying her feelings (e.g., "authority figures will criticize me"), not the live experience in the therapeutic relationship.',
      2: 'Humanistic UPR provides nonjudgmental acceptance but does not specifically invite the client to examine her feelings toward the therapist as a clinical focus.',
      3: 'Family systems would map the pattern across generations or systems but would not focus on the in-room transference experience as such.'
    }
  },
  difficulty: 3,
  tags: ['psychodynamic', 'transference']
},

// ===== Batch 2 additions =====

// --- 5A additions ---
{
  id: 'TX-5A-003',
  domain: 5, subsection: '5A',
  stem: 'A father and his 17-year-old son have not spoken in four months following a fight about the son\'s plans after high school. The father initiates therapy hoping to repair the relationship. The son agrees to attend "only because Dad asked." Which of the following interventions should the therapist begin with?',
  options: [
    'Help each person speak about their own experience and felt impact of the rupture, while the other listens, before addressing content',
    'Facilitate the father in apologizing for his contribution to the fight to model accountability',
    'Have each person describe what the other did wrong so the therapist can mediate the dispute',
    'Recommend the son take time to consider whether he is ready for the relationship to be repaired'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When two people are estranged, the first task is to help each speak their own experience and felt impact while the other listens — slowing the interaction to enable emotional re-engagement before content negotiation. This is the foundational repair move across most repair-focused approaches.',
    distractors: {
      1: 'Asking the father to apologize first presumes a particular contribution to the conflict and skips the listening phase that makes apology meaningful.',
      2: 'A mediation frame ("describe what the other did wrong") amplifies blame and positions the therapist as judge.',
      3: 'Recommending the son take more time delays the work he has shown up to do and may be experienced as the therapist not wanting to do the repair.'
    }
  },
  difficulty: 2,
  tags: ['repair', 'estrangement']
},
{
  id: 'TX-5A-004',
  domain: 5, subsection: '5A',
  stem: 'A married couple is in therapy following the discovery of the husband\'s affair, which ended one month ago. The wife oscillates between rage and intense longing for closeness with her husband. The husband expresses remorse but is uncertain whether the marriage can recover. Which of the following interventions should the therapist begin with?',
  options: [
    'Provide a structured framework for affair recovery that addresses safety, full disclosure, processing of emotional impact, and rebuilding trust over time',
    'Have the wife write a letter to her husband expressing her rage so she can process the emotion',
    'Recommend a trial separation to allow emotional space before couple work continues',
    'Encourage the husband to demonstrate his commitment by accepting all of the wife\'s demands without negotiation'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Affair recovery has an established structured framework with phases: safety/honesty (no ongoing affair), full disclosure, processing emotional impact, examining context, and rebuilding trust over time. Providing this structure orients both partners and contains the oscillation between rage and longing.',
    distractors: {
      1: 'A letter exercise targets one emotion in isolation without the structural framework that affair recovery requires.',
      2: 'Trial separation may sometimes be indicated but is not a default first move and may compound abandonment dynamics; structure can be provided without separation.',
      3: 'Asking the husband to accept all demands without negotiation is not a clinical intervention and creates a coercive structure that does not produce real trust.'
    }
  },
  difficulty: 3,
  tags: ['affair-recovery', 'couple']
},
{
  id: 'TX-5A-005',
  domain: 5, subsection: '5A',
  stem: 'A family of four — parents and two adult children — is in therapy after the older child disclosed she had been sexually abused by an uncle (the father\'s brother) when she was 11. The father is in shock and unsure whether to confront his brother. The mother is angry that the father did not "notice" at the time. The younger child feels guilty for being "the one who turned out fine." Which of the following interventions should the therapist begin with?',
  options: [
    'Provide a space for each family member\'s experience and impact, normalize the range of reactions, and prioritize the survivor\'s pace and wishes',
    'Direct the father to confront his brother to demonstrate his support for the survivor',
    'Address the mother\'s anger toward the father as the primary obstacle to family healing',
    'Refer each family member to individual therapy and pause the family work until they have done individual processing'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A late disclosure of childhood abuse activates multiple, distinct experiences across the family. The therapist creates space for each, normalizes the range of responses (shock, anger, guilt), and centers the survivor\'s pace and wishes about disclosure and family response. This is the foundational stance before any specific intervention.',
    distractors: {
      1: 'Directing the father to confront his brother imposes an action without assessing the survivor\'s wishes or readiness and centers the perpetrator-family-dynamic over the survivor.',
      2: 'Centering the mother\'s anger at the father subordinates the survivor\'s disclosure to an adult dyadic dynamic and may further marginalize her.',
      3: 'Reflexively pausing family work and referring out for individual processing forecloses the very work the family came in for and may leave the survivor more isolated.'
    }
  },
  difficulty: 3,
  tags: ['disclosure', 'family-of-origin', 'survivor-centered']
},

// --- 5B additions ---
{
  id: 'TX-5B-002',
  domain: 5, subsection: '5B',
  stem: 'A 35-year-old woman has been in therapy for nine months following her divorce from an abusive partner. She has stabilized, ended contact with the ex-partner, and now reports she wants to "understand why she stayed." She is curious, not self-critical, in her framing. Which of the following interventions would BEST address this presentation?',
  options: [
    'Explore the relational, attachment, and contextual factors that shaped the choices she made within the abusive relationship, without reframing them as her failure',
    'Educate the client about the cycle of abuse to help her see the pattern she was in',
    'Help the client identify warning signs in the early relationship that she missed',
    'Recommend the client focus on the present and future rather than analyzing the past relationship'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Once stabilized, survivors of IPV often want to make sense of their own behavior in the relationship. Exploring relational history, attachment patterns, the perpetrator\'s coercive tactics, and the context that constrained her options — without reframing the choices as her failure — is the indicated work.',
    distractors: {
      1: 'Education about the cycle of abuse provides one frame but doesn\'t address the client\'s specific question about her own experience; it also risks delivering a template rather than supporting her self-understanding.',
      2: '"Warning signs she missed" framing subtly assigns responsibility to the victim for not seeing what the perpetrator concealed; this can produce shame even when curiously framed.',
      3: 'Recommending she "focus on the present" forecloses the integration work she is asking for and treats the past as a distraction rather than as legitimate clinical territory.'
    }
  },
  difficulty: 3,
  tags: ['IPV-survivor', 'meaning-making']
},
{
  id: 'TX-5B-003',
  domain: 5, subsection: '5B',
  stem: 'A 42-year-old client is in therapy six years after her brother\'s death by suicide. She tells the therapist she wants to "do something to honor him" but does not know what. She is functioning well, has worked through her grief in prior therapy, and now wants this work to feel meaningful. Which of the following interventions would BEST address her presentation?',
  options: [
    'Explore what would feel personally meaningful to her, including possibilities like creative work, advocacy, ritual, or supporting other survivors, and support her finding what fits',
    'Recommend she join a survivors-of-suicide-loss support organization as a volunteer',
    'Suggest she write a letter to her brother to deepen her connection to him',
    'Help her identify and challenge any survivor guilt that may be driving the impulse'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Meaning-making after suicide loss is highly individual. Exploring what would feel personally meaningful — including a range of possibilities — and supporting her in finding what fits respects the client\'s autonomy and the integrative work she is doing.',
    distractors: {
      1: 'Recommending a specific organization prescribes one form of action that may or may not fit her; the client is asking for exploration, not a prescription.',
      2: 'A letter exercise is a specific intervention from a different stage of grief work; the client has completed grief work and is asking about meaningful action.',
      3: 'Reframing the impulse as survivor guilt to be challenged invalidates the integrative work the client is doing and pathologizes a healthy meaning-making impulse.'
    }
  },
  difficulty: 2,
  tags: ['suicide-loss', 'meaning-making', 'post-grief']
},

// --- 5C additions ---
{
  id: 'TX-5C-004',
  domain: 5, subsection: '5C',
  stem: 'A 31-year-old client with type 1 diabetes since childhood has been in therapy for two months for depression. She tells the therapist she has been "skipping insulin" sometimes because she "just doesn\'t want to deal with it" and her blood sugar has been running high. Which of the following actions should the therapist take?',
  options: [
    'Address the diabetes management within the depressive frame, coordinate with her endocrinologist with consent, and assess the safety dimension of the insulin omission',
    'Refer the client to a diabetes educator before continuing depression-focused work',
    'Confront the client about the medical risks of skipping insulin to motivate adherence',
    'Frame the insulin omission as passive suicidality and initiate a safety plan'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Treatment nonadherence in a chronic medical condition often reflects depressive symptoms and is itself a clinical concern that integrates with the depression treatment. Coordinating with the medical team (with consent), addressing the meaning of the omission within depression treatment, and assessing the safety dimension is the integrated approach.',
    distractors: {
      1: 'A diabetes educator referral may be useful but does not substitute for the integrated work; pausing depression treatment until she has seen one is unnecessary and may delay needed care.',
      2: 'Confrontation about medical risks typically increases shame and decreases adherence; motivational and meaning-focused work tends to be more effective.',
      3: 'Categorically framing the omission as passive suicidality may be premature; the stem describes ambivalence and depression-related disengagement, which requires assessment rather than a diagnostic label and safety plan as the first move.'
    }
  },
  difficulty: 3,
  tags: ['chronic-illness', 'adherence', 'depression']
},
{
  id: 'TX-5C-005',
  domain: 5, subsection: '5C',
  stem: 'A 26-year-old client has been in therapy for OCD for four months. She has reduced her checking rituals significantly through ERP. Today she reports that she has begun "checking in her head" — mentally reviewing whether she locked the door — even though she has stopped the physical checking. She feels she has "found a loophole." Which of the following interventions should the therapist apply?',
  options: [
    'Identify the mental review as a covert compulsion and extend the ERP framework to include response prevention for the covert form',
    'Praise the reduction in physical checking and reassure her that the mental review is less impairing',
    'Add cognitive restructuring to address the underlying beliefs about safety driving the mental review',
    'Pause the ERP and reassess whether the OCD diagnosis is correct given the symptom shift'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Mental review/checking is a recognized covert compulsion in OCD. The ERP framework extends naturally to covert compulsions: identify the mental behavior, label it as a compulsion, and apply response prevention to it as well. This is core to effective OCD treatment.',
    distractors: {
      1: 'Reassuring that the mental review is "less impairing" misses that it is a continuation of the same OCD process and that allowing covert compulsions undermines ERP gains.',
      2: 'Adding cognitive restructuring without addressing the covert compulsion treats only the cognitive component and may inadvertently encourage further mental engagement with the obsession.',
      3: 'Reassessing the diagnosis is premature; the symptom shift is a well-known pattern in OCD treatment, not evidence of a different diagnosis.'
    }
  },
  difficulty: 3,
  tags: ['OCD', 'ERP', 'covert-compulsion']
},
{
  id: 'TX-5C-006',
  domain: 5, subsection: '5C',
  stem: 'A 28-year-old client who has maintained sobriety from alcohol for six months tells the therapist she "had a beer at a wedding last weekend" but feels it was "no big deal." She does not feel the urge to drink more and is otherwise stable. Which of the following interventions should the therapist apply?',
  options: [
    'Explore the meaning of the lapse, the context that surrounded it, and the client\'s framework for understanding what it does or does not mean for her recovery',
    'Treat the lapse as a relapse and recommend the client return to a 12-step program for support',
    'Reassure the client that a single drink is unlikely to undermine six months of sobriety',
    'Confront the client about her minimization and the risks of "no big deal" framing'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A lapse-versus-relapse distinction is important. Exploring the meaning, context, and the client\'s own framework for what the lapse means avoids both catastrophizing it (which can trigger an abstinence-violation effect and full relapse) and dismissing it (which can normalize continued drinking). The exploration is the clinical work.',
    distractors: {
      1: 'Treating the lapse as a full relapse and prescribing a return to 12-step ignores both the harm-reduction frame and the client\'s own assessment, and may produce a self-fulfilling prophecy.',
      2: 'Reassuring the lapse is "unlikely to undermine" sobriety substitutes the therapist\'s assessment for collaborative meaning-making and may inadvertently support a normalization that is not warranted.',
      3: 'Confrontation about minimization risks alliance rupture and may push the client toward more covert use; exploration is more likely to produce honest engagement.'
    }
  },
  difficulty: 3,
  tags: ['lapse-vs-relapse', 'substance-use']
},

// --- 5D additions ---
{
  id: 'TX-5D-005',
  domain: 5, subsection: '5D',
  stem: 'A 22-year-old client has been in therapy for one year for anxiety. She tells the therapist she has decided she wants to go to law school but her parents, who are paying her bills, want her to pursue medicine. She feels paralyzed by the conflict. Which of the following interventions would BEST address this presentation?',
  options: [
    'Help the client clarify her own values, examine the financial and relational dimensions of the conflict, and develop a position that integrates her autonomy with the practical reality',
    'Encourage the client to pursue what she truly wants regardless of her parents\' preferences',
    'Help the client see her parents\' perspective and consider whether medicine might also fit',
    'Recommend the client take a year off to gain financial independence before deciding'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Differentiation work in young adulthood integrates clarification of the client\'s own values with realistic engagement with the relational and material context. The therapeutic task is to support both — not to push toward either pole nor to prescribe a third option.',
    distractors: {
      1: 'Encouraging her to "pursue what she truly wants regardless" takes one side, ignores the material reality, and offers a directive rather than supporting her own integration.',
      2: 'Pushing her to consider her parents\' perspective and possibly medicine takes the other side and abandons differentiation work for accommodation.',
      3: 'Recommending a gap year for financial independence imposes a third path without engaging the actual conflict the client is bringing.'
    }
  },
  difficulty: 3,
  tags: ['differentiation', 'autonomy', 'young-adult']
},
{
  id: 'TX-5D-006',
  domain: 5, subsection: '5D',
  stem: 'A 45-year-old client is in therapy following a recent demotion at work that came after a corporate restructuring she did not see coming. She reports feeling "humiliated," is withdrawing from coworkers, and has begun questioning her career trajectory and competence. Which of the following interventions would BEST address her presentation?',
  options: [
    'Validate the impact of the demotion, distinguish the structural event from her competence, and support meaning-making about her career trajectory',
    'Recommend she begin actively searching for a new job to restore her sense of agency',
    'Provide cognitive restructuring to challenge her sense of humiliation as a distortion',
    'Encourage her to confront her supervisor to understand the reasons behind the demotion'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A demotion in the context of restructuring is both a real event with real consequences and a meaning-laden experience that activates identity and competence concerns. The therapeutic task is to validate the impact, separate the structural event from her self-assessment, and support meaning-making.',
    distractors: {
      1: 'Recommending an immediate job search prescribes action before the impact has been processed and may reflect the therapist\'s discomfort with the stuck state more than the client\'s readiness.',
      2: 'Reframing humiliation as cognitive distortion can invalidate the actual social experience of a public demotion and miss the relational dimension of the feeling.',
      3: 'Encouraging a confrontation with the supervisor is action-oriented at a moment when reflection is the more useful work.'
    }
  },
  difficulty: 2,
  tags: ['workplace', 'identity', 'meaning']
},
{
  id: 'TX-5D-007',
  domain: 5, subsection: '5D',
  stem: 'A 38-year-old gay client tells the therapist he is exhausted from "managing" how out he is in different contexts — fully out with friends, half-out with extended family, closeted at work. He describes a sense of constant code-switching as draining. Which of the following interventions would BEST address his presentation?',
  options: [
    'Validate the exhaustion of context-dependent disclosure, support exploration of what feels possible to shift, and explore protective and connective functions of his current pattern',
    'Encourage the client to come out fully in all contexts to resolve the exhaustion',
    'Help him develop better stress-management techniques to sustain the current arrangement',
    'Refer him to a coming-out support group as the primary intervention'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The exhaustion of selective disclosure is a real cumulative cost for sexual minority clients. The therapeutic task is to validate it, support exploration of what might shift, and examine the protective and connective functions of the current pattern — without prescribing a particular disclosure outcome.',
    distractors: {
      1: 'Pushing toward full disclosure in all contexts overrides the client\'s assessment of his own safety and risk and imposes an outcome.',
      2: 'Better stress-management techniques treat the symptom without engaging the underlying selective-disclosure dynamic the client is naming.',
      3: 'A support group may complement individual work but is not a substitute for the individual exploration the client is engaged in.'
    }
  },
  difficulty: 3,
  tags: ['sexual-identity', 'selective-disclosure', 'minority-stress']
},
{
  id: 'TX-5D-008',
  domain: 5, subsection: '5D',
  stem: 'A 29-year-old client has been in therapy for six months for symptoms of burnout. She works in a hospital ICU and has been on continuous critical-care shifts since the pandemic. She tells the therapist that she is considering leaving nursing entirely but feels guilty for "abandoning patients." Which of the following interventions would BEST address her presentation?',
  options: [
    'Validate burnout as a recognized occupational response, distinguish leaving the role from abandoning patients as a values frame, and support exploration of what she actually wants',
    'Help her develop better self-care routines to sustain the current job until she fully recovers',
    'Recommend she request a leave of absence to recover before deciding about her career',
    'Provide cognitive restructuring targeting her guilt about leaving nursing'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Burnout in healthcare is well-documented, and the values frame "leaving nursing = abandoning patients" is a common moral injury construction that warrants direct examination. Validating the burnout, distinguishing role-departure from abandonment as a values question, and supporting her exploration is the integrated work.',
    distractors: {
      1: 'Self-care routines treat the symptom and have limited effect when the burnout is structural; this can also reinforce the message that she should be able to sustain the unsustainable.',
      2: 'A leave of absence may be part of the picture but presumes she should return; the client is questioning whether to return at all and the recommendation prescribes one answer.',
      3: 'Cognitive restructuring of the guilt treats the values frame as a distortion when it may be a real moral construction that deserves engagement, not dismissal.'
    }
  },
  difficulty: 3,
  tags: ['burnout', 'moral-injury', 'career-transition']
},

// --- 5E additions ---
{
  id: 'TX-5E-005',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client who avoids a wide range of social and professional situations begins exposing her to feared situations in a graduated hierarchy — starting with mildly anxiety-provoking interactions and progressing to more challenging ones, with the client tracking her actual versus predicted distress at each step. Which intervention is the therapist using?',
  options: [
    'Graded in-vivo exposure within cognitive-behavioral therapy',
    'Systematic desensitization within behavior therapy',
    'Behavioral activation within cognitive-behavioral therapy',
    'Interpersonal effectiveness within dialectical behavior therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Graded in-vivo exposure constructs a hierarchy of feared situations and progressively exposes the client to them, tracking predicted vs. actual distress to disconfirm catastrophic predictions. This is the CBT-based exposure approach for avoidance-driven disorders.',
    distractors: {
      1: 'Systematic desensitization pairs progressive exposure (often imaginal) with relaxation training to counter-condition anxiety; the stem describes in-vivo exposure with prediction-tracking rather than relaxation pairing.',
      2: 'Behavioral activation targets depressive withdrawal by scheduling values-consistent activities; it is not framed around fear hierarchies and prediction-testing.',
      3: 'DBT interpersonal effectiveness teaches specific communication skills (DEAR MAN, etc.); it does not involve graduated exposure to feared situations.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'CBT', 'exposure']
},
{
  id: 'TX-5E-006',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a family draws a multi-generational diagram of the family\'s relationships, marking which relationships are close, distant, conflictual, or cut off. The therapist notes recurring patterns across generations — including triangulations, distance regulation, and emotional cutoffs — to help the family see how the current symptom sits within the broader system. Which intervention is the therapist using?',
  options: [
    'Genogram construction within Bowen family systems theory',
    'Sculpting within experiential family therapy',
    'Family map within structural family therapy',
    'Family timeline within narrative therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'A multi-generational diagram tracking close/distant/conflictual/cut-off relationships, triangles, and emotional cutoffs across generations is a genogram — a core Bowen family systems tool for visualizing the multigenerational emotional process.',
    distractors: {
      1: 'Sculpting (Satir) physically arranges family members in postures representing emotional relationships — it is a present-moment, embodied intervention, not a multigenerational diagram.',
      2: 'A structural "family map" diagrams subsystem boundaries (clear, diffuse, rigid) in the current family — it is structural, not multigenerational, and uses different notation.',
      3: 'A narrative "family timeline" tracks the family\'s preferred and problem stories over time; it is narrative-centered, not relational/intergenerational in the genogram sense.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'Bowen', 'genogram']
},
{
  id: 'TX-5E-007',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a couple in distress begins each session by asking, "If you were to wake up tomorrow and a miracle had happened so that the problems that brought you to therapy were gone, what would be different? What is the first small thing you would notice?" Which intervention is the therapist using?',
  options: [
    'The miracle question within solution-focused brief therapy',
    'A paradoxical directive within strategic family therapy',
    'A reframe within cognitive-behavioral therapy',
    'Externalization within narrative therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'The miracle question (de Shazer, Berg) is a hallmark solution-focused intervention that orients the client toward a future without the problem and helps identify the smallest indicators of change to work toward.',
    distractors: {
      1: 'A paradoxical directive prescribes the symptom; the miracle question imagines its absence — opposite directionality.',
      2: 'A reframe restates a situation in different terms; the miracle question is a future-oriented question, not a restatement.',
      3: 'Externalization names the problem as separate from the person; the miracle question does not externalize but asks about a future without the problem.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'SFBT', 'miracle-question']
},

// ===== Batch 3 additions =====

// --- 5E additions: more theory depth (DBT, ACT, MI, IPT) ---
{
  id: 'TX-5E-008',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client who repeatedly self-harms when emotionally overwhelmed teaches her a specific skill: when distress peaks, she splashes very cold water on her face, paces rapidly for 30 seconds, and applies a brief paced-breathing exercise. The therapist names this set "TIPP" and integrates it into a broader skills training framework. Which theoretical orientation is the therapist applying?',
  options: [
    'Internal Family Systems',
    'Dialectical behavior therapy',
    'Acceptance and commitment therapy',
    'Cognitive processing therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'TIPP (Temperature, Intense exercise, Paced breathing, Paired muscle relaxation) is a distress-tolerance skill taught in DBT\'s skills training module. Naming and structured teaching of a defined skill set within a broader framework is characteristic of DBT.',
    distractors: {
      0: 'IFS works with parts of self; it does not use named distress-tolerance skill sets like TIPP.',
      2: 'ACT focuses on cognitive defusion, values clarification, and committed action; physiological distress-tolerance skills like TIPP are not within the ACT framework.',
      3: 'CPT is a trauma-focused cognitive intervention for PTSD; it does not teach physiological distress-tolerance skills.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'DBT', 'TIPP']
},
{
  id: 'TX-5E-009',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client struggling with chronic anxiety teaches her to notice anxious thoughts as "just thoughts" rather than facts, to take valued action even while the anxiety is present, and to clarify what truly matters to her so behavior can be guided by values rather than by avoidance. Which theoretical orientation is the therapist applying?',
  options: [
    'Acceptance and commitment therapy',
    'Cognitive-behavioral therapy',
    'Person-centered therapy',
    'Solution-focused brief therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Cognitive defusion ("just thoughts"), valued action despite anxiety, and values clarification as the orienting compass are core ACT processes (within the hexaflex). ACT does not aim to change thought content but to change the relationship to thoughts.',
    distractors: {
      1: 'CBT would target the anxious thoughts directly through restructuring or behavioral experiments to change them; ACT explicitly does not.',
      2: 'Person-centered therapy emphasizes unconditional positive regard, empathy, and congruence but does not use the specific defusion-and-values structure described.',
      3: 'SFBT amplifies exceptions and asks future-oriented questions; it does not use the cognitive-defusion vocabulary.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'ACT']
},
{
  id: 'TX-5E-010',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client ambivalent about quitting smoking uses open-ended questions, reflective listening, and selectively responds to the client\'s own statements about wanting to change while not arguing against the client\'s reasons for continuing. The therapist explicitly avoids confrontation or directives. Which theoretical orientation is the therapist applying?',
  options: [
    'Solution-focused brief therapy',
    'Cognitive-behavioral therapy',
    'Motivational interviewing',
    'Psychodynamic therapy'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Open-ended questions, affirmations, reflective listening, and selective elicitation/reinforcement of change talk while explicitly avoiding the righting reflex (correcting/confronting/persuading) are core MI processes. MI is specifically designed for ambivalence about change.',
    distractors: {
      0: 'SFBT is exception- and solution-oriented; it does not center on the ambivalence-to-change-talk dynamic specifically.',
      1: 'CBT typically takes a more directive stance, identifying distortions and assigning behavioral changes. The non-directive stance described is non-CBT.',
      3: 'Psychodynamic therapy explores unconscious conflicts and transference; the technique described is structured around change ambivalence, not unconscious material.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'MI']
},
{
  id: 'TX-5E-011',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a depressed client conceptualizes the depression in terms of recent interpersonal disputes, role transitions, and complicated grief. The therapist focuses treatment on resolving the interpersonal problem area, framing improvement in mood as following from improvement in the interpersonal context. Which theoretical orientation is the therapist applying?',
  options: [
    'Interpersonal psychotherapy',
    'Cognitive-behavioral therapy',
    'Psychodynamic psychotherapy',
    'Behavioral activation'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Interpersonal psychotherapy (IPT) conceptualizes depression within four interpersonal problem areas: interpersonal disputes, role transitions, complicated grief, and interpersonal deficits. Treatment focuses on resolving the problem area as the path to mood improvement.',
    distractors: {
      1: 'CBT targets cognitive distortions and behavioral patterns; it does not use the four-problem-area framework specific to IPT.',
      2: 'Psychodynamic psychotherapy works with unconscious conflict and historical patterns; IPT is more present-focused and structured.',
      3: 'Behavioral activation specifically targets scheduling values-consistent activities to break the depressive withdrawal cycle; it is not structured around interpersonal problem areas in the IPT sense.'
    }
  },
  difficulty: 3,
  tags: ['theory', 'IPT']
},
{
  id: 'TX-5E-012',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a couple in which one partner copes with relationship conflict by drinking heavily takes a non-blaming, curious stance and asks the drinking partner: "On a scale of 1 to 10, how important is it to you right now to change your drinking? What makes it that number and not lower?" Which intervention is the therapist using?',
  options: [
    'A miracle question within solution-focused brief therapy',
    'An importance ruler within motivational interviewing',
    'A scaling question within structural family therapy',
    'A paradoxical directive within strategic family therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'The importance ruler ("on a scale of 1 to 10") is a core MI technique that elicits the client\'s own perception of the importance of change, followed by the "why not lower" question that elicits change talk. The non-blaming curious stance is also distinctive of MI.',
    distractors: {
      0: 'The miracle question imagines a future without the problem; the importance ruler asks about present readiness, not imagined future.',
      2: 'Structural family therapy does not characteristically use 1-10 scaling questions for change importance; that is MI.',
      3: 'A paradoxical directive prescribes the symptom; the importance ruler does not prescribe anything.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'MI', 'importance-ruler']
},

// --- 5C additions ---
{
  id: 'TX-5C-007',
  domain: 5, subsection: '5C',
  stem: 'A 38-year-old client reports four months of persistent insomnia despite generally healthy sleep hygiene. The therapist plans an evidence-based behavioral intervention. Which of the following would BEST address the client\'s presentation?',
  options: [
    'Recommend the client take over-the-counter sleep aids until natural sleep returns',
    'Implement cognitive-behavioral therapy for insomnia, including stimulus control, sleep restriction, and cognitive components',
    'Explore unconscious conflicts that may be expressed as sleep disturbance',
    'Provide general psychoeducation about sleep hygiene and reassess in three months'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'CBT-I is the first-line evidence-based treatment for chronic insomnia disorder. Core components include stimulus control, sleep restriction therapy, sleep-related cognitive restructuring, and relaxation training — and it outperforms medication for long-term outcomes.',
    distractors: {
      0: 'Recommending OTC sleep aids is outside LMFT scope (medication guidance) and counter to evidence-based first-line treatment.',
      2: 'Unconscious-conflict exploration may have a role for some clients but is not the first-line evidence-based intervention for primary insomnia.',
      3: 'General sleep hygiene psychoeducation is insufficient for chronic insomnia disorder; CBT-I specifically goes beyond hygiene.'
    }
  },
  difficulty: 2,
  tags: ['CBT-I', 'insomnia']
},
{
  id: 'TX-5C-008',
  domain: 5, subsection: '5C',
  stem: 'A married heterosexual couple in their forties presents with a year-long decline in sexual frequency and the wife\'s report of low desire. Medical workup is unremarkable. They report otherwise loving and connected. Which of the following interventions would BEST address this couple\'s presentation?',
  options: [
    'Refer the wife for individual therapy to address her desire concerns',
    'Begin a course of cognitive restructuring targeting the wife\'s thoughts about sex',
    'Use a couple-based sex therapy approach that addresses both the relational and behavioral context of desire and arousal',
    'Recommend the couple try scheduled intimacy as the primary intervention'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Sexual difficulties in committed couples are best understood and treated within the relational context. Couple-based sex therapy (e.g., sensate focus and related approaches) addresses both behavioral and relational dimensions and treats desire as embedded in the couple system rather than as an individual deficit.',
    distractors: {
      0: 'Referring the wife individually frames the problem as her deficit and removes the couple work that is likely necessary.',
      1: 'Cognitive restructuring targeting her thoughts about sex isolates one mechanism; couple-based sex therapy provides the broader frame.',
      3: 'Scheduled intimacy may be ONE technique within a couple-based approach but is not by itself the primary intervention for the broader desire-and-arousal picture.'
    }
  },
  difficulty: 3,
  tags: ['sex-therapy', 'desire']
},

// --- 5D additions ---
{
  id: 'TX-5D-009',
  domain: 5, subsection: '5D',
  stem: 'A 19-year-old college freshman is in therapy for what she describes as "imposter syndrome." She got into a competitive school and now believes she does not belong, fears being "found out," and is withdrawing from class participation. Which of the following interventions would BEST address her presentation?',
  options: [
    'Provide cognitive restructuring of the imposter thoughts as cognitive distortions to be challenged',
    'Validate the developmental and contextual factors that produce imposter experiences and explore the meaning the experience has for her, alongside experiments that test her assumptions',
    'Recommend she schedule a meeting with her academic advisor to discuss her qualifications',
    'Help her develop a daily routine of positive self-affirmations'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Imposter experiences are common in transitions to high-status environments, especially for first-generation, minority, or otherwise marginalized students. Validating the developmental and contextual factors, exploring meaning, and pairing with experiential testing of assumptions integrates the relational and cognitive dimensions.',
    distractors: {
      0: 'Treating imposter thoughts as pure cognitive distortions can invalidate the contextual basis of the experience (especially in environments where minoritized students are statistically underrepresented).',
      2: 'Recommending a meeting with the advisor as the primary intervention is a logistic move that does not address the underlying experience.',
      3: 'Daily affirmations as the primary intervention is a thin behavioral technique that tends not to land when the cognitive belief is rooted in real contextual factors.'
    }
  },
  difficulty: 3,
  tags: ['imposter', 'transition']
},
{
  id: 'TX-5D-010',
  domain: 5, subsection: '5D',
  stem: 'A 42-year-old client is in therapy following the recent death of her last surviving parent. She reports being surprised by how disoriented she feels, despite the death being expected and her relationship with the parent being complicated. She says she "should be relieved." Which of the following interventions would BEST address her presentation?',
  options: [
    'Help her identify and let go of the complicated feelings about her parent so she can grieve cleanly',
    'Validate the complexity of grief after a difficult relationship, normalize the loss-of-orienting-figure dimension, and support exploration of the mixed feelings without prescribing a resolution',
    'Provide psychoeducation that her relief reflects a healthy detachment and is not something she needs to feel guilty about',
    'Recommend she focus on her own family and present life to manage the grief'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Grief after the death of a parent with whom the relationship was complicated is often layered: real loss, relief, regret, anger, disorientation at losing an orienting figure even when the relationship was difficult. Validating the complexity, normalizing the dimensions, and supporting exploration without prescribing a resolution is the integrative work.',
    distractors: {
      0: 'Asking her to "let go" of complicated feelings to grieve "cleanly" imposes a sanitized version of grief that does not match her actual experience.',
      2: 'Reassuring that relief is healthy bypasses the disorientation and mixed feelings she has actually named and may further activate the "should" framing.',
      3: 'Redirecting away from the grief minimizes what she is bringing and frames the past as a distraction.'
    }
  },
  difficulty: 2,
  tags: ['complicated-grief', 'parent-loss']
},

// ===== Batch 4 additions — distributed across D5 subsections =====

{
  id: 'TX-5A-006',
  domain: 5, subsection: '5A',
  stem: 'A married couple has been in therapy for three months for chronic conflict. They identify their problem as poor communication. After three sessions of communication skills training, they report they "say the words" but it does not change how they feel about each other. Which of the following interventions would BEST address their presentation?',
  options: [
    'Continue communication skills training with more structured assignments to build proficiency',
    'Shift the focus from communication skills to identifying the underlying emotional cycle that the communication patterns are expressing',
    'Recommend individual therapy for each partner to address their personal contributions',
    'Reframe their concern as resistance and explore what they are gaining from staying in conflict'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Communication skills training without addressing the underlying emotional cycle tends to produce the "we say the words but don\'t mean them" experience. Shifting to the emotional cycle (EFT-style) — primary emotion underneath secondary reactive behavior — addresses the dynamic the words alone cannot.',
    distractors: {
      0: 'More skills training when the existing training has not produced felt change is doubling down on the unsuccessful intervention.',
      2: 'Splitting into individual therapy may have a role but bypasses the dyadic dynamic the couple is presenting with.',
      3: 'Reframing the couple\'s concern as "resistance" pathologizes their accurate self-observation and may rupture alliance.'
    }
  },
  difficulty: 3,
  tags: ['EFT', 'communication-skills-limit', 'couple']
},
{
  id: 'TX-5B-004',
  domain: 5, subsection: '5B',
  stem: 'A 33-year-old client has been in therapy for eight months for PTSD following a workplace assault. After completing stabilization, you have begun cognitive processing therapy (CPT). After the third processing session, the client reports increased nightmares, intrusive memories, and feels she is "getting worse." Which of the following actions should the therapist take?',
  options: [
    'Discontinue CPT and return to stabilization work',
    'Normalize the temporary symptom intensification, assess for safety, and proceed with CPT while monitoring response',
    'Switch to a different evidence-based trauma treatment such as EMDR',
    'Refer the client for a psychiatric medication consultation'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Temporary symptom intensification at the start of trauma processing is well-documented and usually does not indicate the treatment is failing — it reflects the activation of trauma material in the processing phase. Normalizing the experience, assessing safety, and proceeding with continued monitoring is the protocol-consistent response.',
    distractors: {
      0: 'Discontinuing CPT and returning to stabilization in response to expected initial intensification may reinforce avoidance and undermine the treatment\'s effectiveness.',
      2: 'Switching modalities when the current one is producing expected initial intensification (not treatment failure) means abandoning a likely effective treatment mid-course.',
      3: 'Psychiatric referral may be appropriate as adjunct but is not the primary response to expected initial intensification.'
    }
  },
  difficulty: 3,
  tags: ['CPT', 'PTSD', 'symptom-intensification']
},
{
  id: 'TX-5C-009',
  domain: 5, subsection: '5C',
  stem: 'A 30-year-old client with a panic disorder has been doing interoceptive exposure exercises in session. She reports that the in-session exposures are tolerable but she is unable to do the between-session homework because she "doesn\'t feel safe doing it alone." Which of the following actions should the therapist take?',
  options: [
    'Reduce the difficulty of the between-session exposures so the client can complete them alone',
    'Increase the intensity of in-session exposures to build her confidence further before assigning homework',
    'Collaboratively design homework that includes a safety contact or check-in mechanism while ensuring the exposures themselves are done without safety behaviors',
    'Discontinue exposure work since it is not generalizing to between-session practice'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'When between-session homework is the bottleneck, designing exposures with a structural support (planned check-in, knowing someone is reachable) that does not become a safety behavior maintains the exposure principle while addressing the engagement gap. The exposure itself remains without safety behaviors; the structure around it provides scaffolding.',
    distractors: {
      0: 'Reducing difficulty to ensure completion produces homework that does not work — the exposure must be challenging enough to produce learning.',
      1: 'Increasing in-session intensity does not address the between-session generalization gap; the in-session work was already tolerable.',
      3: 'Discontinuing exposure abandons the evidence-based treatment when the gap is solvable.'
    }
  },
  difficulty: 3,
  tags: ['interoceptive-exposure', 'panic-disorder', 'homework']
},
{
  id: 'TX-5D-011',
  domain: 5, subsection: '5D',
  stem: 'A 24-year-old transgender woman client tells the therapist she has been considering pausing her transition because her job, her family, and her current relationship "feel like they\'re falling apart all at once." She has been on hormones for 18 months and has previously felt the transition was right for her. Which of the following interventions would BEST address her presentation?',
  options: [
    'Reassure her that the cumulative stressors are temporary and encourage her to continue her transition',
    'Explore the specific stressors (job, family, relationship), the distinct meaning of pausing transition vs. addressing the stressors, and support her own decision-making without prescribing a path',
    'Recommend she consult with her endocrinologist about temporarily pausing hormones',
    'Refer her to a transgender-affirming support group as the primary intervention'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Stressor pile-up can produce questions about previously stable decisions. The therapeutic task is to distinguish "pausing transition" (a major decision) from "addressing the cumulative stressors" (a different intervention), explore what she\'s actually responding to, and support her own decision-making without prescribing either continuation or pause.',
    distractors: {
      0: 'Reassuring her and encouraging continuation pushes one direction without exploration and may override her own assessment.',
      2: 'Recommending she consult about pausing hormones takes the other direction without exploration and offloads the conversation to medical providers when the therapeutic question is meaning-making.',
      3: 'A support group referral may complement but is not a substitute for the individual exploration the client is doing.'
    }
  },
  difficulty: 3,
  tags: ['gender-transition', 'stressor-pile-up', 'autonomy']
},
{
  id: 'TX-5E-013',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client struggling with chronic procrastination at work assigns the client a small, valued action each day (e.g., 10 minutes of one specific work task) regardless of motivation, and tracks the relationship between completing the action and subsequent mood. The therapist explicitly does not focus on motivation as a prerequisite for action. Which intervention is the therapist using?',
  options: [
    'Behavioral activation within cognitive-behavioral therapy',
    'Acceptance and commitment therapy with values-based action',
    'Solution-focused brief therapy with scaling questions',
    'Motivational interviewing with change planning'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Behavioral activation specifically inverts the motivation-then-action sequence — assigning the action regardless of motivation and tracking how mood/motivation follow. This is the BA principle, originally developed for depression but applicable to motivation-bound presentations.',
    distractors: {
      1: 'ACT values-based action shares the action-first principle, but ACT centers values clarification and cognitive defusion as the core mechanisms. The specific intervention described (small valued action + tracking mood-action relationship) is more cleanly BA than ACT.',
      2: 'SFBT scaling questions assess and amplify exceptions but do not specifically prescribe the action-first sequence.',
      3: 'MI elicits the client\'s own change talk and addresses ambivalence — it does not prescribe behavior independent of motivation. MI is typically a preparation phase, not the action itself.'
    }
  },
  difficulty: 3,
  tags: ['BA', 'CBT', 'procrastination']
},

// ===== Batch 5: Treatment depth =====

// --- 5A (interpersonal/couple/family) additions ---
{
  id: 'TX-5A-007',
  domain: 5, subsection: '5A',
  stem: 'A couple in therapy has identified a pattern in which one partner becomes critical when stressed and the other partner withdraws emotionally. The therapist has helped them slow the cycle and access primary emotion. Today the critical partner cries in session for the first time, saying "I just feel so alone." Which of the following actions should the therapist take?',
  options: [
    'Move to communication-skills training while the emotional opening is available',
    'Slow down, validate the emotion, and facilitate the withdrawing partner\'s response from a more present and connected stance',
    'Interpret the tears as a breakthrough and recommend the couple celebrate the progress',
    'Recommend individual therapy for the critical partner to address the underlying loneliness'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'In EFT, accessing primary emotion (loneliness underneath criticism) is the entry to the corrective emotional experience. The therapeutic task is to slow the moment, validate, and facilitate the other partner\'s response so a new corrective interaction can form — not to leverage the moment for skills training or interpretation.',
    distractors: {
      0: 'Skills training in this moment short-circuits the emotional opening that the EFT framework specifically aims to create.',
      2: '"Celebrating progress" trivializes the vulnerability and moves the couple out of the emotionally significant moment.',
      3: 'Splitting the partner off to individual therapy in response to a vulnerable disclosure misses the systemic value of the disclosure happening in the couple session.'
    }
  },
  difficulty: 3,
  tags: ['EFT', 'primary-emotion', 'corrective-experience']
},
{
  id: 'TX-5A-008',
  domain: 5, subsection: '5A',
  stem: 'A family with two adolescent children is in therapy following the death of their father by suicide six months ago. The mother is determined to "stay positive" and frames the loss as a "blessing in disguise" since the father had been depressed. The children alternate between silent withdrawal and angry outbursts. Which of the following interventions would BEST address this family\'s presentation?',
  options: [
    'Validate the mother\'s coping while creating space for the children\'s grief, complexity, and any feelings (including anger toward the deceased) that the family has been unable to hold together',
    'Confront the mother about her avoidance and her impact on the children\'s grief',
    'Refer each family member to individual therapy and pause the family work',
    'Provide psychoeducation about grief as a normalizing intervention'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Family grief after suicide loss often involves splits — one member\'s coping closes down what others need to express. The therapeutic task is to validate the mother\'s coping while making space for the range of family responses, including the children\'s anger and complexity that the "positive" frame has been suppressing.',
    distractors: {
      1: 'Confronting the mother targets her coping rather than holding space for the family\'s range; this may rupture alliance and miss the dynamic.',
      2: 'Splitting into individual therapy reflexively pauses the family work that this family specifically needs to address the silence-and-rupture pattern.',
      3: 'Psychoeducation about grief is one component but does not address the specific family dynamic that has formed around the loss.'
    }
  },
  difficulty: 3,
  tags: ['suicide-loss', 'family-grief', 'coping-mismatch']
},
{
  id: 'TX-5A-009',
  domain: 5, subsection: '5A',
  stem: 'A married couple has been in therapy for three months. The therapist has been using an emotionally focused approach. Today the wife arrives furious: she discovered her husband has been texting an ex-partner "as friends." The husband says it was innocent and is offended by her reaction. Which of the following actions should the therapist take?',
  options: [
    'Address the texting as an affair-equivalent and proceed with affair-recovery protocol',
    'Mediate the dispute by helping each present their facts about what happened',
    'Slow the interaction, identify the attachment significance of the texting for the wife and the meaning of the contact for the husband, and work with the relational meaning rather than the factual content',
    'Recommend the husband end contact with the ex-partner immediately as a condition of continued therapy'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'In EFT, the clinical material is the attachment significance, not the factual content. Slowing the interaction, accessing what the texting means for the wife\'s sense of safety in the bond and what the contact means for the husband, is the EFT-consistent move.',
    distractors: {
      0: 'Treating the texting categorically as an affair imposes a framework before the couple has processed what it means for them.',
      1: 'Fact-mediation positions the therapist as judge and shifts the work away from emotional/attachment meaning to factual adjudication.',
      3: 'Prescribing the husband to end contact as a condition takes one partner\'s side without the relational meaning being processed.'
    }
  },
  difficulty: 3,
  tags: ['EFT', 'attachment-injury']
},

// --- 5B (grief/trauma/violence) additions ---
{
  id: 'TX-5B-005',
  domain: 5, subsection: '5B',
  stem: 'A 45-year-old veteran client has completed nine sessions of trauma-focused CBT for combat-related PTSD. He has experienced moderate symptom reduction but tells the therapist he feels "guilty about things I did." Which of the following interventions would BEST address his presentation?',
  options: [
    'Provide cognitive restructuring to challenge the guilt as a cognitive distortion',
    'Engage with the moral-injury dimension distinctly from PTSD symptoms — exploring meaning, values, and integration of the actions within his sense of self, rather than treating the guilt as distortion to challenge',
    'Refer him to a chaplain or religious counselor since moral-injury work is outside therapy scope',
    'Continue the trauma-focused CBT and assume the guilt will resolve with continued symptom reduction'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Moral injury — guilt and shame about actions taken or witnessed in morally complex situations — is distinct from PTSD and not well-addressed by cognitive restructuring (which treats the guilt as distortion). The integrative approach engages the values, meaning, and integration of the actions within the veteran\'s sense of self.',
    distractors: {
      0: 'Cognitive restructuring of moral injury treats real moral complexity as distortion, which can invalidate the client and worsen the experience.',
      2: 'Moral injury is within therapy scope; referring out forecloses important integration work.',
      3: 'Continuing trauma-focused CBT for moral injury symptoms is likely to produce limited additional benefit since the framework does not directly address moral injury.'
    }
  },
  difficulty: 3,
  tags: ['moral-injury', 'PTSD', 'veteran']
},

// --- 5C (physical/psychological) additions ---
{
  id: 'TX-5C-010',
  domain: 5, subsection: '5C',
  stem: 'A 32-year-old client with binge eating disorder has been in therapy for six months. She reports she has reduced binge frequency from daily to once or twice weekly and feels she has made "real progress." She now wants to begin a calorie-restrictive diet to lose weight. Which of the following actions should the therapist take?',
  options: [
    'Support the client\'s autonomous decision and help her develop a structured weight-loss plan',
    'Explore the client\'s motivation for restriction in the context of her eating disorder history, share clinical concerns about the strong evidence linking restriction with binge recurrence, and support her decision-making within that frame',
    'Recommend she postpone weight loss until she has been binge-free for one year',
    'Refer her to a registered dietitian for a medically appropriate weight-loss program'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Restriction is a known precipitant of binge eating; introducing dietary restriction into binge-eating recovery substantially raises the risk of relapse. The therapist\'s role is to share this clinical concern while respecting the client\'s autonomy and helping her think through the decision.',
    distractors: {
      0: 'Supporting a calorie-restrictive diet without surfacing the clinical concern about binge-restriction interaction fails to communicate important clinical information.',
      2: 'A specific time threshold (one year binge-free) is more rule-like than the clinical conversation warrants.',
      3: 'Referring to a dietitian for restrictive dieting does not address the underlying eating-disorder dynamic and may externalize the restriction without addressing it clinically.'
    }
  },
  difficulty: 3,
  tags: ['eating-disorder', 'binge-restriction', 'autonomy']
},
{
  id: 'TX-5C-011',
  domain: 5, subsection: '5C',
  stem: 'A 50-year-old client with chronic back pain has been in therapy for adjustment to her condition. She tells the therapist she has been "drinking more wine than usual" to manage the pain — about a bottle most evenings. She does not see this as a problem. Which of the following actions should the therapist take?',
  options: [
    'Confront her about the level of drinking and the risks of self-medicating pain with alcohol',
    'Validate that pain management is hard and recommend she consult her physician about prescription pain management',
    'Use motivational interviewing to explore her own perception of the drinking, the relationship between pain and drinking, and any change she might be considering',
    'Refer her to a substance abuse counselor before continuing the pain-adjustment work'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Motivational interviewing is well-suited to a client who reports a behavior she does not yet see as a problem. Exploring her own perception and the relationship between pain and drinking — without imposing an alcohol-use framework — preserves alliance and elicits her own change talk if any exists.',
    distractors: {
      0: 'Confrontation about drinking with a client who does not see it as a problem typically deepens defensiveness and reduces engagement.',
      1: 'Recommending consultation about prescription pain management redirects to the medical system without addressing the alcohol use the client just disclosed.',
      3: 'Reflexive referral when the client has not identified the drinking as a concern offloads the conversation that motivational interviewing is designed for.'
    }
  },
  difficulty: 3,
  tags: ['MI', 'chronic-pain', 'alcohol-self-medication']
},
{
  id: 'TX-5C-012',
  domain: 5, subsection: '5C',
  stem: 'A 28-year-old client has been working on social anxiety with exposure-based interventions for four months. She has progressed from imaginal exposure to brief in-vivo exposures with the therapist. She now asks to be "graduated" from therapy because she has been successful. Which of the following actions should the therapist take?',
  options: [
    'Honor her request and complete a brief closing session',
    'Encourage continued treatment for another three months to consolidate gains',
    'Discuss her sense of readiness, review what she has and has not yet generalized to, and plan a termination process that includes relapse-prevention work',
    'Recommend she switch to a maintenance-only schedule of monthly sessions'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'When a client reports readiness for termination, the appropriate response is to discuss her sense of readiness, examine what has been generalized beyond the therapy room, plan termination that includes relapse-prevention work and skill maintenance. This honors her readiness while completing the work thoughtfully.',
    distractors: {
      0: 'A brief closing without termination work skips the consolidation and relapse-prevention pieces that protect gains.',
      1: 'Encouraging three more months without consulting her readiness assessment substitutes the therapist\'s judgment for collaborative termination.',
      3: 'Monthly maintenance may be a piece of the plan but presupposes the question of whether termination is appropriate at all.'
    }
  },
  difficulty: 2,
  tags: ['exposure-therapy', 'termination-readiness']
},

// --- 5D (developmental/psychosocial) additions ---
{
  id: 'TX-5D-012',
  domain: 5, subsection: '5D',
  stem: 'A 35-year-old first-generation immigrant client has been promoted to a senior position at work. She tells the therapist she feels like an "outsider" at the senior level and is convinced her colleagues will discover she "doesn\'t really belong." She is also struggling with guilt about how her success may distance her from her family. Which of the following interventions would BEST address her presentation?',
  options: [
    'Apply standard imposter-syndrome cognitive restructuring',
    'Integrate the imposter experience with the family-of-origin dynamics and the bicultural pressures, exploring what success means for her sense of identity and family connection',
    'Recommend she connect with an immigrant professional network for community support',
    'Help her develop assertive communication skills to address the workplace discomfort'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'For first-generation professionals, imposter experiences are often inseparable from family-of-origin dynamics and bicultural pressures. The integrative approach addresses identity, success, family connection, and the workplace context as connected, rather than treating the imposter experience as a self-contained cognition problem.',
    distractors: {
      0: 'Standard imposter-syndrome restructuring treats the experience as cognition without the family-of-origin and bicultural dimensions that drive much of it.',
      2: 'A professional network may help but does not address the internal integration work the client is bringing.',
      3: 'Assertive communication addresses the workplace dimension narrowly but misses the identity-and-family integration.'
    }
  },
  difficulty: 3,
  tags: ['imposter', 'first-generation', 'biculturalism']
},
{
  id: 'TX-5D-013',
  domain: 5, subsection: '5D',
  stem: 'A 17-year-old gay client has been in therapy for six months for depression. He tells the therapist his parents have arranged for him to participate in a "conversion therapy" program at their church. He says he does not want to participate but is afraid of the consequences of refusing. Which of the following actions should the therapist take?',
  options: [
    'Inform the parents directly that conversion therapy is harmful and unethical and that the therapist will not support the referral',
    'Validate the client\'s experience, affirm his identity, explore his options including legal protections (in California, conversion therapy for minors is prohibited by SB 1172), and support him in deciding how to navigate the situation',
    'Refer the client to a residential program for LGBTQ+ youth to remove him from the home environment',
    'Recommend the client comply with the parents\' request to maintain family peace'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'California SB 1172 (Cal. B&P Code § 865) prohibits state-licensed mental health providers from engaging in sexual-orientation change efforts with minors. The clinical task is to validate the client, affirm his identity, inform him of relevant protections, and support his decision-making about how to respond.',
    distractors: {
      0: 'Unilateral parental contact bypasses the client\'s autonomy and may not be authorized; also, the parents may be pursuing this through religious rather than licensed providers, which is outside the scope of SB 1172.',
      2: 'Residential placement is a major intervention not warranted by the stem and removes the client from his support structure unilaterally.',
      3: '"Maintaining family peace" by complying with conversion therapy is both clinically harmful and ethically inappropriate.'
    }
  },
  difficulty: 3,
  tags: ['conversion-therapy', 'minor-LGBTQ', 'SB-1172'],
  lawCitation: 'Cal. B&P Code § 865 (SB 1172 — prohibits sexual-orientation change efforts on minors by licensed providers)'
},

// --- 5E (theory in practice) additions ---
{
  id: 'TX-5E-014',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client struggling with panic attacks teaches him to deliberately spin in a chair until dizzy, then climb stairs to elevate heart rate — replicating the physical sensations of panic in a controlled setting until they no longer produce fear. Which intervention is the therapist using?',
  options: [
    'Interoceptive exposure within cognitive-behavioral therapy',
    'Systematic desensitization with imaginal exposure',
    'Mindfulness-based observation of bodily sensations',
    'Behavioral activation through values-based action'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Interoceptive exposure is a CBT technique for panic disorder that deliberately produces the physical sensations of panic (dizziness, elevated heart rate, hyperventilation) in a controlled setting so the client can learn the sensations themselves are not dangerous.',
    distractors: {
      1: 'Systematic desensitization typically uses imaginal exposure paired with relaxation; this is in-vivo physical-sensation exposure.',
      2: 'Mindfulness-based observation notices sensations without engaging in deliberate provocation; the technique described is provocation-based.',
      3: 'Behavioral activation schedules values-based activities to break depressive withdrawal; it does not involve deliberate panic-sensation provocation.'
    }
  },
  difficulty: 2,
  tags: ['CBT', 'panic-disorder', 'interoceptive-exposure']
},
{
  id: 'TX-5E-015',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a couple has them stand facing each other in session. She asks the wife to position the husband in a posture that represents how she feels in the relationship. The wife places the husband with his back turned, walking away. Which intervention is the therapist using?',
  options: [
    'Sculpting within experiential family therapy',
    'Reflecting team within postmodern therapy',
    'Enactment within structural family therapy',
    'Empty-chair work within Gestalt therapy'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Sculpting (associated with Satir and experiential family therapy) has family members arrange each other in physical postures that represent emotional relationships. The wife positioning the husband with his back turned is a classic sculpt of disconnection.',
    distractors: {
      1: 'A reflecting team has a team of therapists openly discuss the family\'s presentation while the family observes; physical positioning is not the method.',
      2: 'Enactment has family members interact as they do at home; the technique here is symbolic positioning, not in-vivo interaction.',
      3: 'Empty-chair work has the client speak to an imagined other in a chair; the technique here uses the physical body of the actual other partner.'
    }
  },
  difficulty: 3,
  tags: ['Satir', 'sculpting', 'experiential']
},
{
  id: 'TX-5E-016',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client struggling with chronic shame teaches her to place a hand on her chest and speak to herself with the warmth she would offer a dear friend in the same situation. The therapist names this practice and emphasizes that self-criticism amplifies suffering while self-compassion buffers it. Which intervention is the therapist using?',
  options: [
    'Cognitive defusion within Acceptance and Commitment Therapy',
    'Self-compassion practice within compassion-focused therapy',
    'Two-chair work within Gestalt therapy',
    'Imagery rescripting within cognitive therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Compassion-focused therapy (Gilbert) emphasizes self-compassion as a counter to shame and self-criticism. The specific practice — hand on chest, addressing self with the warmth offered to a friend — is a classic CFT/self-compassion intervention.',
    distractors: {
      0: 'Cognitive defusion changes the relationship to thoughts; self-compassion practice changes the affective stance toward self.',
      2: 'Two-chair work has the client dialogue with an external or disowned aspect of self; the practice here is a unified self-soothing stance.',
      3: 'Imagery rescripting works with traumatic or negative imagery; this is a present-moment self-compassion practice.'
    }
  },
  difficulty: 3,
  tags: ['CFT', 'self-compassion', 'shame']
},

// ===== Batch 6: more Treatment depth =====

{
  id: 'TX-5A-010',
  domain: 5, subsection: '5A',
  stem: 'A married couple has been in therapy for four months. The husband has consistently been the more emotionally expressive partner; the wife minimizes her own emotion and stays in a managing role. Today the wife says, "I just don\'t feel things the way he does." Which of the following interventions would BEST address this presentation?',
  options: [
    'Encourage the wife to be more emotionally expressive to match the husband\'s style',
    'Validate that emotional expression varies and explore what feeling looks like for her, including managing/competence as a possible emotional expression in her family of origin',
    'Refer the wife for individual therapy to address her emotional flatness',
    'Provide psychoeducation about gender differences in emotional expression'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Different attachment-and-family-of-origin patterns shape how partners experience and express emotion. Validating variation and exploring what feeling looks like for HER — rather than pushing her toward the husband\'s style — respects her actual emotional life and may reveal that "managing" IS her emotional language.',
    distractors: {
      0: 'Pushing her to match the husband\'s style imposes one emotional style as the standard.',
      2: 'Referring out for "emotional flatness" pathologizes what may be a different but valid emotional configuration.',
      3: 'Gender-difference framing oversimplifies and may reinforce stereotype rather than support her individual emotional reality.'
    }
  },
  difficulty: 3,
  tags: ['couple', 'emotional-expression', 'difference']
},
{
  id: 'TX-5A-011',
  domain: 5, subsection: '5A',
  stem: 'A 14-year-old client has been in therapy for two months for school refusal. Today she discloses that she has been bullied online by a group of girls for the past year. She asks the therapist not to tell her parents because they "will overreact." Which of the following interventions would BEST address her presentation?',
  options: [
    'Honor the confidentiality request given her age and developmental need for autonomy',
    'Inform the parents immediately given the safety dimension of online bullying',
    'Validate the disclosure, assess for self-harm and suicide risk, discuss the limits of confidentiality (including safety triggers), and work with her toward parental involvement that fits her needs',
    'Recommend she delete her social media accounts to remove the source of bullying'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Adolescent disclosures of bullying often involve significant emotional impact and may carry safety risk. Validating, assessing for self-harm/suicide risk, transparently discussing confidentiality limits, and working WITH her toward parental involvement (not bypassing her) is the integrative response.',
    distractors: {
      0: 'Honoring confidentiality without addressing the safety dimension misses the protective function.',
      1: 'Immediate parental notification overrides her autonomy and may damage alliance; involvement should be worked toward collaboratively unless safety threshold is met.',
      3: 'Recommending she delete accounts addresses a symptom while ignoring the emotional impact and safety dimensions.'
    }
  },
  difficulty: 3,
  tags: ['adolescent', 'cyberbullying', 'confidentiality-limits']
},
{
  id: 'TX-5B-006',
  domain: 5, subsection: '5B',
  stem: 'A 50-year-old client has been in therapy following the sudden death of her adult son one year ago. She reports persistent intense yearning, intrusive memories, and feels her "life ended that day." She has stopped attending family gatherings and isolates from her remaining children. Which of the following interventions would BEST address her presentation?',
  options: [
    'Recommend she join a parent-bereavement support group as the primary intervention',
    'Provide grief-focused therapy that addresses the prolonged-grief presentation, supports continuing-bonds work, and addresses the secondary impact on her relationships with her remaining children',
    'Encourage her to "let go" so she can move forward with her remaining family',
    'Refer her to a psychiatrist for medication management of the persistent grief'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Prolonged grief at one year post-loss of a child warrants grief-focused therapy. Treatment typically integrates approaches like complicated-grief therapy or prolonged-grief disorder treatment with continuing-bonds work (maintaining a transformed connection to the deceased rather than "letting go") and attention to the secondary impact on remaining relationships.',
    distractors: {
      0: 'A support group can complement individual therapy but is not a substitute for the indicated grief-focused treatment.',
      2: '"Letting go" framing contradicts contemporary grief theory (continuing-bonds research) and dismisses the depth of the bond.',
      3: 'Reflexive medication referral medicalizes the grief without first providing the indicated psychological treatment.'
    }
  },
  difficulty: 3,
  tags: ['prolonged-grief', 'child-loss', 'continuing-bonds']
},
{
  id: 'TX-5B-007',
  domain: 5, subsection: '5B',
  stem: 'A 35-year-old client has been in therapy for eight months for complex PTSD related to childhood abuse. After completing stabilization and coping-skill work, she is ready for trauma processing but is undecided between EMDR and prolonged exposure. Which of the following actions should the therapist take?',
  options: [
    'Recommend prolonged exposure since it has the strongest evidence base for PTSD',
    'Recommend EMDR since it requires less direct verbal recounting of trauma memories',
    'Provide a clear explanation of how each treatment works, what the evidence base shows for each, what the session experience is like, and support her informed choice based on what fits her',
    'Refer her to a colleague who specializes in one of the two modalities'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Both EMDR and prolonged exposure have strong evidence for PTSD; choice between them is partly preference-based. Explaining how each works, what the session experience is like, and supporting her informed choice respects her autonomy and increases buy-in to whichever she chooses.',
    distractors: {
      0: 'PE has strong evidence but recommending it over EMDR without considering her preference misses the autonomy dimension.',
      1: 'EMDR has strong evidence too, and recommending it based on assumed preference about verbal recounting bypasses her own assessment.',
      3: 'Referring to a specialist may be appropriate if the LMFT is not trained in either, but the stem implies the therapist can offer both — informed choice is the appropriate process.'
    }
  },
  difficulty: 3,
  tags: ['PTSD-treatment-choice', 'informed-consent', 'EMDR-vs-PE']
},
{
  id: 'TX-5C-013',
  domain: 5, subsection: '5C',
  stem: 'A 26-year-old client with OCD has been doing ERP for three months. She has had significant progress with contamination obsessions but now reports she has begun "redoing" her ERP exposures mentally afterwards to "be sure they counted." Which of the following actions should the therapist take?',
  options: [
    'Praise the progress on contamination and continue the current treatment',
    'Identify the mental "redoing" as a covert compulsion, extend ERP framework to include response prevention for the mental ritual, and discuss how OCD adapts to find new compulsions',
    'Increase the difficulty of the exposures to override the mental redoing',
    'Add cognitive restructuring to challenge her belief that mental redoing matters'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'OCD commonly migrates to new compulsions when previous ones are blocked. Mental review/redoing is a recognized covert compulsion. The treatment framework extends naturally: identify it, label it as a compulsion, apply response prevention. Psychoeducation about OCD\'s adaptive nature helps the client recognize future migrations.',
    distractors: {
      0: 'Praising progress and continuing without addressing the covert compulsion allows it to consolidate.',
      2: 'Increasing exposure difficulty doesn\'t address the covert compulsion that is now undermining the exposures.',
      3: 'Cognitive restructuring of the meaning treats one dimension but doesn\'t directly address the mental behavior.'
    }
  },
  difficulty: 3,
  tags: ['OCD', 'ERP', 'covert-compulsion', 'symptom-migration']
},
{
  id: 'TX-5C-014',
  domain: 5, subsection: '5C',
  stem: 'A 30-year-old client with a history of depression has been doing well on a stable medication regimen for eight months. She tells the therapist she wants to "try going off the medication" because she is feeling better and "shouldn\'t need it anymore." Which of the following actions should the therapist take?',
  options: [
    'Support her decision and recommend she begin tapering immediately',
    'Discourage discontinuation given the risk of relapse',
    'Refer her to her prescribing physician for medication-management decisions, explore the meaning of "shouldn\'t need it" within the therapy work, and support her decision-making collaboratively with the prescriber',
    'Recommend she stay on medication for at least two years to consolidate the gains'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Medication decisions belong to the prescriber. The LMFT\'s role is to refer the medication question appropriately, explore the meaning of her framing ("shouldn\'t need it" may reflect internalized stigma or stages of identity around medication), and support her collaborative decision-making with the prescriber.',
    distractors: {
      0: 'Supporting tapering and recommending it begin is medication advice outside LMFT scope.',
      1: 'Discouraging discontinuation is also medication advice — even when clinically conservative.',
      3: 'Recommending a specific medication duration is medication advice outside scope.'
    }
  },
  difficulty: 2,
  tags: ['medication-discontinuation', 'scope', 'collaboration']
},
{
  id: 'TX-5D-014',
  domain: 5, subsection: '5D',
  stem: 'A 32-year-old client tells the therapist she has been "called to the priesthood" but is afraid her family will see it as a "step backward" from her successful career as an attorney. She is questioning whether she should pursue this calling. Which of the following interventions would BEST address her presentation?',
  options: [
    'Explore the meaning of the calling, the values it expresses, the meaning of her family\'s anticipated reaction, and the integration of professional success with religious vocation — without assuming the calling reflects something to be challenged or accepted',
    'Help her develop strategies for explaining the decision to her family',
    'Recommend she consult with a spiritual director rather than a therapist for vocational discernment',
    'Help her weigh the practical implications of leaving her successful legal career'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Vocational discernment involving religious calling is a legitimate clinical territory when it intersects with family dynamics and identity. Exploring meaning, values, family-of-origin reaction, and integration — without presupposing the right answer — is the appropriate stance.',
    distractors: {
      1: 'Strategizing about family explanation takes one direction before the discernment is complete.',
      2: 'Redirecting to spiritual direction forecloses the psychological work intersected with the calling.',
      3: 'Focusing on practical implications privileges one frame (career-as-primary) over the values she has named.'
    }
  },
  difficulty: 3,
  tags: ['vocational-discernment', 'religious-calling', 'values']
},
{
  id: 'TX-5D-015',
  domain: 5, subsection: '5D',
  stem: 'A 47-year-old client with a history of low income tells the therapist she has just received a significant inheritance from a distant relative. She reports feeling "guilty" and unsure how to relate to her family members who did not receive the inheritance. Which of the following interventions would BEST address her presentation?',
  options: [
    'Recommend she share the inheritance with her family to alleviate the guilt',
    'Explore the meaning of the windfall in the context of her financial history, family dynamics, identity, and the values informing her sense of guilt — without prescribing how she handles the money',
    'Provide cognitive restructuring to challenge her guilt as a distortion',
    'Recommend she consult a financial advisor before continuing the therapy work'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Sudden financial change activates complex meaning around identity, family-of-origin dynamics, and values. Exploring these dimensions — including the meaning of guilt for her — supports her own decision-making without prescribing a financial action.',
    distractors: {
      0: 'Recommending she share the inheritance prescribes a specific behavior and treats guilt as something to resolve through action.',
      2: 'Reframing guilt as distortion may invalidate the legitimate values dimension of her response.',
      3: 'Financial advisor consultation may be useful but is not the threshold therapeutic action.'
    }
  },
  difficulty: 2,
  tags: ['financial-change', 'family-dynamics', 'guilt']
},
{
  id: 'TX-5E-017',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a client struggling with severe shame uses imagery to have the client revisit a specific childhood moment of humiliation. In the imagery, the therapist invites an adult, compassionate "older self" to enter the scene and offer the child what was needed but not provided. Which intervention is the therapist using?',
  options: [
    'Cognitive restructuring within CBT',
    'Imagery rescripting within trauma-focused cognitive therapy',
    'Two-chair work within Gestalt therapy',
    'EMDR processing'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Imagery rescripting (Arntz, Smucker, and others) revisits a specific memory and introduces new elements (a compassionate older self, the safety/protection that was missing, etc.) to transform the encoded experience. The technique is used in trauma-focused cognitive therapy and schema therapy.',
    distractors: {
      0: 'CBT cognitive restructuring works with thoughts, not specific memory imagery.',
      2: 'Two-chair work has the client dialogue with parts of self or others in chairs; this is imagery-based memory revisitation, not chair work.',
      3: 'EMDR uses bilateral stimulation while accessing memories; the technique described is imagery rescripting specifically.'
    }
  },
  difficulty: 3,
  tags: ['imagery-rescripting', 'shame', 'schema-therapy']
},
{
  id: 'TX-5E-018',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a 35-year-old client uses an attachment-based approach. The therapist has noticed that the client consistently arrives a few minutes late, gives short answers to emotion-focused questions, and tends to "wrap up" sessions early. The therapist gently names this pattern as evidence of a learned protection and explores what might be underneath. Which intervention is the therapist using?',
  options: [
    'Interpretation of avoidant attachment-deactivating strategies',
    'Confrontation of resistance within psychodynamic therapy',
    'Behavioral activation through values-based action',
    'Solution-focused exploration of exceptions'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'In attachment-based therapy, behaviors like lateness, short emotional answers, and early session-wrap are conceptualized as attachment-deactivating strategies — learned protections from emotional engagement, often associated with avoidant attachment. Gently naming these as protections rather than resistance is consistent with attachment-based interpretation.',
    distractors: {
      1: '"Confrontation of resistance" is a more classically psychodynamic framing; attachment-based approaches typically frame these as protections rather than resistance.',
      2: 'Behavioral activation targets depressive withdrawal; the technique described is interpretive.',
      3: 'SFBT exception exploration looks for what works; the technique described targets a problematic pattern interpretively.'
    }
  },
  difficulty: 3,
  tags: ['attachment-based', 'deactivating-strategies']
},
{
  id: 'TX-5E-019',
  domain: 5, subsection: '5E',
  stem: 'A therapist working with a family conceptualizes presenting problems through the lens of differentiation of self — each member\'s capacity to maintain a clear sense of self while remaining emotionally connected to the family. Interventions focus on increasing differentiation in each member, particularly during family stress. Which theoretical orientation is the therapist applying?',
  options: [
    'Structural family therapy',
    'Bowen family systems theory',
    'Strategic family therapy',
    'Narrative family therapy'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Differentiation of self is THE central concept of Bowen family systems theory. Conceptualizing problems as differentiation deficits and intervening to support increased differentiation is core Bowenian work.',
    distractors: {
      0: 'Structural FT focuses on subsystem boundaries and hierarchy.',
      2: 'Strategic FT focuses on symptom function and uses paradoxical interventions.',
      3: 'Narrative FT externalizes problems and works with preferred stories.'
    }
  },
  difficulty: 2,
  tags: ['theory', 'Bowen', 'differentiation']
}
  );
})(window.LMFT_BANK);
