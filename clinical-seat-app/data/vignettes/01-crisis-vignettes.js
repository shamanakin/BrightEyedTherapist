/* Crisis vignettes — multi-stage scenarios that test clinical judgment
 * under unfolding pressure. Each stage presents a situation and 4 actions.
 * The user's choice both scores and determines the next stage's context.
 *
 * Schema:
 *   id: string (VG-prefix)
 *   title: string (short label)
 *   domain: number (1-6) — for stats integration
 *   tags: string[]
 *   stages: [
 *     {
 *       text: string (situation description)
 *       prompt: string (what to do?)
 *       options: [string, string, string, string]
 *       scores: [number, number, number, number] (-1 = harmful, 0 = problematic, 1 = adequate, 2 = best)
 *       rationale: { [optionIndex]: string }  -- explanation for each option
 *       nextStageByChoice: { [optionIndex]: stageIndexOrNull }
 *         -- which stage follows based on choice; null = terminal
 *     }
 *   ]
 *   optimalPath: number[]  -- the indices of best-scoring options through stages
 */

(function (REGISTRY) {
  REGISTRY.push(

// ============ Vignette 1 — Active suicidal client with specific plan ============
{
  id: 'VG-001',
  title: 'Active suicidality with a plan',
  domain: 3,
  tags: ['suicide-risk', '5150', 'safety-planning'],
  stages: [
    {
      text: 'A 24-year-old client you have been seeing for six weeks tells you in session that she has been thinking about ending her life for the past several days. She has thought about taking her roommate\'s prescription opioids, which she has access to. She says she "would never actually do it" but has started writing notes to her family.',
      prompt: 'What is the FIRST action you take in this session?',
      options: [
        'Validate that the thoughts have been hard to carry and complete a structured suicide risk assessment, including the plan, access to means, prior attempts, and protective factors',
        'Immediately call 911 to initiate emergency response given the disclosed plan',
        'Develop a safety plan with the client and have her promise not to act on the thoughts',
        'Schedule a follow-up appointment within 48 hours and instruct her to call the crisis line if she feels unsafe'
      ],
      scores: [2, 0, 0, -1],
      rationale: {
        0: 'A structured risk assessment is the foundation. You need to know lethality (means, plan specificity), prior attempts, current ideation intensity, and protective factors before deciding on disposition.',
        1: 'Calling 911 immediately bypasses clinical assessment that would inform whether emergency response, voluntary hospitalization, intensive outpatient, or outpatient safety planning is appropriate.',
        2: 'A safety plan and "no-suicide contract" without assessment is the right tool deployed too soon. Promises not to act do not constitute treatment.',
        3: 'A 48-hour follow-up with a crisis-line referral is a documented under-response. The client has an accessible plan; the situation requires more than self-directed crisis-line use.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'You complete a structured risk assessment. The client reports: daily ideation for two weeks, a specific plan (opioids), accessible means (roommate\'s medication), prior attempt at age 19, and feels hopeless. She does not have a current outpatient psychiatrist. She tells you she does not want to go to a hospital.',
      prompt: 'What is the next action you take?',
      options: [
        'Honor the client\'s preference, develop a detailed safety plan including removing means from her access, and schedule a session for tomorrow',
        'Initiate evaluation for an involuntary hold under Welfare and Institutions Code 5150 given the danger-to-self threshold with accessible means and refusal of voluntary care',
        'Contact the client\'s roommate to remove the opioids from the home',
        'Call the client\'s mother and ask her to come pick the client up from your office'
      ],
      scores: [-1, 2, 0, -1],
      rationale: {
        0: 'A safety plan and means-restriction are reasonable components for lower-risk presentations. With daily ideation, specific plan, accessible means, prior attempt, hopelessness, no psychiatrist, AND refusal of voluntary care — the threshold for higher level of care is met. Honoring her preference here under-responds to the risk profile.',
        1: '5150 requires danger-to-self due to mental health disorder. The presentation meets that threshold (active ideation + plan + means + prior attempt + hopelessness + refusal of voluntary care). The therapist initiates the evaluation, often by calling county PERT or 911 for transport for evaluation.',
        2: 'Contacting the roommate discloses confidential information without authorization. Even framed as a Tarasoff-type duty, the duty here runs to the client (5150 evaluation), not to a third party.',
        3: 'Contacting the mother similarly discloses without authorization, and asking her to "come pick up" the client treats the situation as a logistic problem when the threshold for clinical disposition has been reached.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'You call your county\'s PERT (Psychiatric Emergency Response Team) for evaluation. They arrive and, after their own assessment, agree to a voluntary admission for safety; the client agrees to go. The next day, the client\'s mother calls your office demanding to know what happened and why her daughter is hospitalized. The mother is not on the client\'s release of information.',
      prompt: 'How do you respond to the mother?',
      options: [
        'Inform the mother of the hospitalization and the reasons, since she is family and is concerned',
        'Confirm to the mother that her daughter is your client and provide general information about your role',
        'Decline to confirm or deny the therapeutic relationship and refer the mother to her daughter directly for any information',
        'Tell the mother you cannot speak about clinical matters but confirm that her daughter is safe'
      ],
      scores: [-1, 0, 2, 0],
      rationale: {
        0: 'Sharing information without an ROI is a confidentiality breach, regardless of family relationship. The client has not authorized disclosure.',
        1: 'Confirming the therapeutic relationship is itself a confidential disclosure. The standard is decline-to-confirm-or-deny when there is no ROI.',
        2: 'Without an ROI, you cannot confirm even that the person is your client. Referring the mother to her daughter directly respects confidentiality while not being unnecessarily curt.',
        3: '"Cannot speak about clinical matters but confirm she is safe" still confirms the therapeutic relationship and provides a clinical-status update — both are disclosures requiring authorization.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [0, 1, 2]
},

// ============ Vignette 2 — Child abuse disclosure during a parent's session ============
{
  id: 'VG-002',
  title: 'Child abuse disclosure during a parent session',
  domain: 6,
  tags: ['CANRA', 'mandated-reporting', 'child-abuse'],
  stages: [
    {
      text: 'You are providing individual therapy to a 32-year-old father for anxiety. In today\'s session, he becomes tearful and tells you that he "lost it" with his 6-year-old son yesterday — he slapped the child across the face hard enough to leave a mark. He says he has never done this before and is "horrified" with himself.',
      prompt: 'What is the FIRST action you take in this session?',
      options: [
        'Validate the client\'s remorse and use the moment to deepen the therapeutic alliance and explore the underlying dynamics',
        'Acknowledge the client\'s distress while also informing him that you are a mandated reporter under CANRA and that this disclosure will require a report',
        'Recommend that the client report himself to Child Protective Services to take responsibility',
        'Suggest the client and his son attend a session together to repair the relationship'
      ],
      scores: [-1, 2, 0, -1],
      rationale: {
        0: 'Treating the disclosure as a therapeutic deepening moment without addressing the mandated-reporting obligation fails the legal duty and the protective function. Validation alone is not sufficient.',
        1: 'Acknowledging the distress maintains the alliance while the client is also informed that the disclosure triggers the mandated-reporting obligation. Transparency about what comes next is part of the standard.',
        2: 'Encouraging the client to self-report does not satisfy your own mandated-reporting obligation, which is independent of the client\'s actions.',
        3: 'A repair session with the child without first addressing the safety concern and the reporting obligation puts the child in proximity to the parent who just disclosed harm, before assessment.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'The client asks you not to make a report. He explains that he is now in therapy specifically to prevent this from happening again, that the slap left only a temporary mark, and that filing a report will result in CPS involvement that could destabilize his family. He says he will quit therapy if you report.',
      prompt: 'How do you respond?',
      options: [
        'Agree to forgo the report on the condition that the client commits to twice-weekly therapy for the next three months',
        'Explain that CANRA reporting is not discretionary in your situation, that you respect his concerns, and that you will make the report as soon as practicable while continuing to support him',
        'Refer the client to another therapist who can determine whether a report is warranted, then close the case',
        'Wait until the end of the session, then make the report after he leaves, without telling him'
      ],
      scores: [-1, 2, -1, 0],
      rationale: {
        0: 'Negotiating away a mandated-reporting obligation in exchange for treatment compliance is not permissible under CANRA. You cannot agree not to report.',
        1: 'CANRA reporting is mandatory, not discretionary, once the threshold is met. Transparent communication about this — paired with respect for his concerns and continued support — is the standard.',
        2: 'Referring out to "another therapist who can determine whether a report is warranted" delegates a personal legal obligation that you have already incurred. The threshold for reporting was met when you heard the disclosure.',
        3: 'Reporting without informing him risks alliance and may be experienced as deception, even though the report itself is required. Most ethical guidance favors transparency about the report.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'You make the report by phone within the day and submit the written follow-up within 36 hours, as required by CANRA. Two weeks later, the client returns to therapy and tells you that CPS investigated, no removal occurred, the family is participating in parenting services, and the client wants to continue therapy with you. He says he understands now why you had to report.',
      prompt: 'How do you proceed with the work?',
      options: [
        'Decline to continue, since the rupture has been too significant for the therapeutic relationship to remain effective',
        'Continue treatment, address the rupture and repair within the therapy itself, and integrate the CPS involvement and parenting services as part of the broader treatment context',
        'Continue treatment but require the client to sign a release allowing you to coordinate with CPS as a condition',
        'Refer the client to a parenting specialist and discontinue your work'
      ],
      scores: [0, 2, 0, -1],
      rationale: {
        0: 'Declining to continue without further assessment may be defensible in some situations but here, with the client wanting to continue and the rupture having been processed via the CPS outcome, continuation with repair is the more clinically responsive option.',
        1: 'Continuing treatment, processing the rupture directly, and integrating the CPS context is the most clinically and ethically congruent response. The therapeutic relationship can be repaired and the broader context becomes part of the work.',
        2: 'Requiring a CPS-coordination release as a condition is an overreach; coordination may be useful but should be discussed, not imposed.',
        3: 'Categorically referring out and discontinuing forecloses repair work the client is explicitly requesting and treats the relationship as unrecoverable when the client has signaled it is not.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [1, 1, 1]
},

// ============ Vignette 3 — Tarasoff scenario with shifting threat ============
{
  id: 'VG-003',
  title: 'Tarasoff-type threat with shifting specifics',
  domain: 3,
  tags: ['Tarasoff', 'duty-to-protect', 'threat-assessment'],
  stages: [
    {
      text: 'A 38-year-old client who has been in therapy for 10 months tells you in session that his ex-girlfriend has been "asking for it" by dating his coworker. He says he "fantasizes" about confronting her at her apartment but quickly adds, "I would never actually do anything." He has owned firearms in the past but says he sold them last year.',
      prompt: 'What is the FIRST action you take?',
      options: [
        'Assess the specificity of the ideation, including identifiable target, plan, means access, and history of acting on similar fantasies',
        'Make a Tarasoff warning to the ex-girlfriend, since the threat has been communicated to you',
        'Document the disclosure as a passing fantasy and continue with the current treatment focus',
        'Recommend the client take a break from social media to reduce exposure to information about the ex'
      ],
      scores: [2, -1, -1, 0],
      rationale: {
        0: 'A Tarasoff duty is triggered by a serious threat against a reasonably identifiable victim. The current disclosure includes elements of concern (identified target, fantasy of confrontation) but also disconfirming elements (denial of intent, claim no firearms). Systematic threat assessment is the appropriate first step before deciding whether to act.',
        1: 'Making a Tarasoff warning on a vague fantasy ("would never actually do anything") without further assessment may be a premature breach of confidentiality. The disclosure as stated does not yet meet the "serious threat" threshold.',
        2: 'Documenting the disclosure as a passing fantasy without assessment under-responds to ideation that includes an identifiable target and references to means history.',
        3: 'A behavioral recommendation about social media addresses one contributing factor but bypasses the threat assessment.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'You conduct a more detailed assessment. The client tells you he has been driving past the ex\'s apartment "a few times a week," that he knows her work schedule, and that he has been thinking about confronting her "in a way she\'ll remember." He says he does not own firearms anymore but knows where his brother\'s are kept. He does not commit to safety.',
      prompt: 'What action do you take?',
      options: [
        'Continue with weekly therapy and assess for change over the next few sessions',
        'Initiate steps to discharge the Tarasoff duty: warn the ex-girlfriend and notify law enforcement, while also evaluating for involuntary hold criteria',
        'Tell the client he must stop driving past her apartment as a condition of continued treatment',
        'Refer the client to a forensic psychologist to determine whether the duty applies'
      ],
      scores: [-1, 2, 0, 0],
      rationale: {
        0: 'Continuing with passive monitoring while the threat profile has clearly escalated (stalking-like behavior, access to means via brother, no safety commitment) under-responds to the imminent harm threshold.',
        1: 'Under Cal. Civ. Code §43.92, the duty to protect is triggered by a serious threat against a reasonably identifiable victim. The discharge involves warning the victim AND notifying law enforcement. Evaluation for an involuntary hold is also appropriate given the constellation.',
        2: 'A condition-on-treatment approach treats the situation as a behavioral compliance issue rather than as the duty-to-protect situation it has now become.',
        3: 'Referring out for a determination delegates an obligation that has now arisen for you. The duty is yours to discharge once the threshold is met.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'You contact local law enforcement, who follow up with the ex-girlfriend. You also leave a message for the ex-girlfriend warning her of the threat. The next day, the client calls your office, furious, and says he is terminating therapy and considering filing a complaint with the BBS for breach of confidentiality.',
      prompt: 'How do you respond?',
      options: [
        'Apologize for the breach of trust and offer to reduce or waive the next several sessions\' fees',
        'Document the threat assessment process and the legal basis for the disclosure, respond to any board inquiry with the same documentation, and offer the client a final session for closure if he wishes',
        'Defend your actions and explain to the client that he should be grateful you intervened before something worse happened',
        'Refer the client to a different therapist immediately and decline any further contact'
      ],
      scores: [-1, 2, -1, 0],
      rationale: {
        0: 'Apologizing for the disclosure may be experienced as the therapist now agreeing the disclosure was wrong, which it was not. Fee waivers do not address the underlying ethical-legal situation and may compound confusion.',
        1: 'Cal. Civ. Code §43.92 provides immunity for the disclosure when made in discharge of the duty. The therapist documents the threat assessment, the legal basis, responds to any board inquiry on those terms, and offers a final session for closure — respectful, professional, and grounded.',
        2: 'A defensive "you should be grateful" stance escalates the rupture, may be experienced as dismissive of the client\'s autonomy, and is not therapeutically useful even when the disclosure was legally required.',
        3: 'A categorical referral and refusal of contact may constitute abandonment without proper termination process. Offering a closing session is more appropriate.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [0, 1, 1]
},

// ============ Vignette 4 — Couple therapy with a held individual secret ============
{
  id: 'VG-004',
  title: 'Secret in couple therapy',
  domain: 6,
  tags: ['couple-secrets', 'confidentiality', 'dual-role'],
  stages: [
    {
      text: 'You have been providing couple therapy to a married couple for four months. At the beginning of treatment, you and the couple agreed on a "no-secrets" policy — that information disclosed individually would be discussable in couple sessions if clinically relevant. Today the husband emails you between sessions, asking to share something "you should know" but only if you agree to keep it from his wife.',
      prompt: 'How do you respond to the husband\'s email?',
      options: [
        'Respond that you cannot agree to hold a secret from his wife and remind him of the no-secrets agreement, but offer to discuss what he wants to share if he is willing to do so within that frame',
        'Agree to hold the confidence if it is "really important" but reserve the right to use clinical judgment about whether it stays held',
        'Email him back with a question about what the topic is so you can decide whether to make an exception',
        'Schedule an emergency individual session with him to discuss in person'
      ],
      scores: [2, -1, 0, 0],
      rationale: {
        0: 'The no-secrets agreement is the structural protection of the couple work. Reaffirming it while remaining engaged with his concern is the principled response.',
        1: 'Conditional secret-holding undermines the no-secrets policy and traps you in the very position the policy is designed to prevent.',
        2: 'Asking for the topic in advance to decide whether to make an exception still positions you to make case-by-case exceptions, which erodes the policy.',
        3: 'An emergency individual session to hear a secret may be appropriate in some frames but here it commits to one-on-one engagement around content the policy specifically governs.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'The husband replies that he wants to disclose that he has been having an affair for six months. He says he plans to end it but does not want his wife to know "until the right time." He asks you to keep the affair confidential so he can decide when and how to tell her.',
      prompt: 'How do you respond?',
      options: [
        'Tell the husband you will not disclose the affair to his wife unilaterally but you also cannot hold it indefinitely as a secret in couple therapy; discuss with him a timeline for him to bring it into session',
        'Disclose the affair to the wife in the next couple session, since the policy authorizes you to use the information',
        'Refer the couple to another therapist who can begin work without knowing the secret',
        'Continue couple therapy and never raise the affair, since he has asked you not to'
      ],
      scores: [2, -1, 0, -1],
      rationale: {
        0: 'The clinical and ethical path: not unilateral disclosure (you are not the discloser of his behavior), not indefinite holding (the policy precludes it), but partnering with him to find a way to bring it into the work within a reasonable timeframe. The decision is his; the timeline is collaborative.',
        1: 'Unilateral disclosure to the wife bypasses the husband\'s autonomy and the collaborative frame even within a no-secrets policy. The therapist is not the discloser; the therapist is the facilitator of the disclosure.',
        2: 'Referring out passes the dilemma to the next therapist. The dilemma travels with the couple unless addressed.',
        3: 'Holding the secret indefinitely violates the no-secrets policy and traps the therapist in a position aligned with the husband against the wife.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'The husband agrees to bring the affair into the next couple session, within two weeks. In the next session he discloses to his wife. She is devastated and asks you, "Did you know?" The husband looks at you.',
      prompt: 'How do you respond to the wife\'s question?',
      options: [
        'Tell the wife you knew, because the policy requires honesty about what is known in the couple frame',
        'Tell the wife the policy and how disclosures work in couple therapy, and acknowledge that you knew briefly before this session — without further detail',
        'Tell the wife you cannot answer that question to protect the husband\'s confidentiality',
        'Defer to the husband to answer the wife\'s question'
      ],
      scores: [1, 2, -1, 1],
      rationale: {
        0: 'Acknowledging you knew is correct and honest, but doing so without contextualizing the policy may land as betrayal-by-the-therapist for the wife.',
        1: 'Acknowledging within the policy frame is both honest and contextualized. The wife hears that you knew briefly, why you knew, and how the policy is meant to protect the couple work — preserving alliance with both partners as much as possible.',
        2: '"Cannot answer that question to protect his confidentiality" reads as collusion to the wife and may be perceived as you having kept a long-running secret aligned with him against her.',
        3: 'Deferring entirely to the husband to answer puts him in the position of disclosing the timeline; this is defensible but may be less responsive to the wife\'s direct question.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [0, 0, 1]
},

// ============ Vignette 5 — BPD presentation with self-harm escalation ============
{
  id: 'VG-005',
  title: 'BPD self-harm escalation between sessions',
  domain: 3,
  tags: ['BPD', 'self-harm', 'safety-planning', 'DBT'],
  stages: [
    {
      text: 'A 28-year-old client with borderline personality features has been in DBT-informed therapy with you for eight months. She has made progress, has not self-harmed in two months, and has been using distress-tolerance skills. Today she texts you between sessions: "I cut tonight. I\'m sorry. Don\'t hate me." She sends a photo of superficial cuts on her arm.',
      prompt: 'How do you respond to the text?',
      options: [
        'Respond quickly with brief acknowledgment, a check on her current safety, and a plan to talk in your next regular session — without lengthy text-based processing',
        'Engage in extended text-based processing with her tonight to provide support during the crisis',
        'Do not respond until your next scheduled session, since responding outside session reinforces between-session contact',
        'Call her immediately to provide phone support and conduct a full risk assessment by phone'
      ],
      scores: [2, -1, -1, 0],
      rationale: {
        0: 'DBT framework supports brief between-session phone/text contact for crisis check-in (safety, redirection to skills, plan for next session) — not extended processing, which would reinforce crisis-as-contact. The brief acknowledgment + safety check + plan for session is the established protocol.',
        1: 'Extended text-based processing reinforces the contingency that crisis produces extended therapist availability — opposite of the DBT goal.',
        2: 'Non-response after a self-harm disclosure misses a check on current safety and the brief intervention DBT specifically supports. This is under-response.',
        3: 'A full phone risk assessment may be appropriate if the situation warrants escalation, but the disclosure as stated (superficial cuts, contact-seeking, "I\'m sorry") points to brief check-in rather than escalation to full assessment.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'You respond briefly: "Glad you reached out. Are you safe right now? Need you to put away anything you used and use a TIPP skill before bed. We\'ll talk Tuesday." She replies: "I\'m safe. Putting it away. I just feel like I\'m back at square one." She does not appear to be in immediate danger.',
      prompt: 'How do you proceed?',
      options: [
        'Reply with a brief reframe that one lapse does not erase eight months of work and confirm Tuesday\'s session, leaving the deeper exploration for then',
        'Reply with extensive validation and reframing to help her process the "square one" cognition tonight',
        'Schedule an emergency session for tomorrow given the destabilization',
        'Tell her you will increase her sessions to twice weekly going forward'
      ],
      scores: [2, -1, 0, 0],
      rationale: {
        0: 'A brief reframe ("one lapse does not erase eight months") + confirmation of next session is consistent with DBT crisis-coaching: brief, skill-anchored, holding the work for the session rather than expanding the between-session contact.',
        1: 'Extensive text-based reframing tonight is the extended processing the protocol specifically avoids.',
        2: 'Scheduling an emergency session in response to a self-harm event without ongoing escalation reinforces self-harm-as-contact contingency — what DBT explicitly tries to avoid.',
        3: 'Increasing session frequency in immediate response to the self-harm event reinforces the contingency. Frequency changes are better made in session based on overall treatment-plan considerations.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'Tuesday\'s session: the client wants to "figure out what went wrong" before the self-harm. She describes a fight with her partner the night before, intense shame, and the impulse to cut "before I could think about skills."',
      prompt: 'How do you structure the session?',
      options: [
        'Begin with a chain analysis of the self-harm episode (prompting event, vulnerability factors, links, consequences) and identify points where skills could have been deployed',
        'Spend the session validating her emotional pain about the fight with her partner without focusing on the self-harm event',
        'Recommend the client and her partner attend couple therapy as the underlying contributor',
        'Reframe the self-harm as a minor lapse and move to topics the client wants to bring up'
      ],
      scores: [2, 0, -1, -1],
      rationale: {
        0: 'Chain analysis is the DBT-standard intervention following a self-harm or life-threatening event — systematic identification of the chain from prompting event to behavior, with points of intervention identified. This is the structured response.',
        1: 'Validation of the partner-conflict pain without the chain analysis misses the structured DBT-protocol response and may reinforce the avoidance of looking at the self-harm event.',
        2: 'Recommending couple therapy in response to a self-harm event misallocates the intervention and offloads the individual DBT work.',
        3: 'Minimizing the self-harm as a "minor lapse" both invalidates the seriousness she has named and bypasses the standard DBT structured response.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [0, 0, 0]
},

// ============ Vignette 6 — Custody dispute with role conflict ============
{
  id: 'VG-006',
  title: 'Custody dispute and the forensic-role boundary',
  domain: 6,
  tags: ['custody', 'forensic-role', 'dual-role', 'scope-of-practice'],
  stages: [
    {
      text: 'You have been providing weekly therapy to a 38-year-old mother for nine months, primarily addressing anxiety and a complicated divorce. Today she tells you that her divorce is now contentious, custody is being contested, and her attorney has suggested asking you to write a letter "explaining that the children are safe with her" for the court.',
      prompt: 'How do you respond to your client?',
      options: [
        'Agree to write a letter describing her therapy progress and her parenting strengths, since you have been seeing her weekly',
        'Decline to write the letter, explain the boundary between treating clinician and forensic evaluator, and discuss what she can ask her attorney about for custody-related evaluation',
        'Refer the question to her attorney to determine whether such a letter would be helpful in the case',
        'Offer to attend a session with the children to evaluate the family dynamic for the letter'
      ],
      scores: [-1, 2, 0, -1],
      rationale: {
        0: 'A treating therapist writing what amounts to a custody recommendation for court conflates the treating-clinician and forensic-evaluator roles — a well-recognized dual-role error. The roles have different methods (treatment vs. evaluation), different relationships (alliance vs. neutrality), and different products (clinical notes vs. forensic reports).',
        1: 'Declining is correct. Explaining the role distinction respects both the client and the integrity of the court process. Suggesting she discuss obtaining a separate custody evaluation with her attorney redirects her to the appropriate resource without abandoning the therapeutic relationship.',
        2: 'Deferring entirely to the attorney avoids the conversation that needs to happen with the client about role boundaries, and the attorney is the one making the request you are now seeking input on.',
        3: 'Bringing the children into a session to evaluate them for a court letter compounds the role conflict — now you are doing forensic evaluation of children who are not your clients, on behalf of one parent in a contested matter.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'The client says she understands the distinction but is frustrated. Her attorney warned that without supporting documentation, the father\'s side may get the custody outcome they want. She asks whether you would at least be willing to provide a "factual summary" of her therapy attendance and presenting concerns.',
      prompt: 'How do you respond?',
      options: [
        'Agree to provide a factual summary covering dates of service and presenting concerns, with the client\'s authorization, with explicit framing that you are not making any custody recommendation',
        'Decline to provide any documentation since any therapy-related document risks misuse in the custody case',
        'Provide the summary but include a paragraph noting that the client has been engaged in treatment and "is making good progress"',
        'Tell the client that her best option is to obtain a separate custody evaluation from a qualified forensic evaluator'
      ],
      scores: [1, 0, -1, 2],
      rationale: {
        0: 'A factual treatment summary (dates, presenting concerns, what the work covered) is within scope when authorized by the client and when explicit framing avoids the forensic implication. This is a defensible middle path but carries some risk that the document is misused regardless of framing.',
        1: 'Categorically declining all documentation is overly restrictive — clients have a right to request information about their own care and may need it for legitimate reasons. The threshold question is what is and is not in scope.',
        2: 'Adding "making good progress" language slides toward the forensic role — once a treating clinician makes characterizations that could be construed as supporting one party\'s position, the role boundary is breached.',
        3: 'Redirecting the client to a separate forensic evaluator is the most protective and most ethically clean response. It preserves the treating role intact, gives the client a real path to address the custody concern, and avoids any document that could be misused.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'Three weeks later, you receive a subpoena from the father\'s attorney requesting all clinical records of the mother. Your client (the mother) objects to the disclosure. The subpoena is signed by the attorney, not by a judge.',
      prompt: 'How do you respond to the subpoena?',
      options: [
        'Comply by sending the records, since a subpoena is a legal document',
        'Notify the client, assert psychotherapist-patient privilege on her behalf, and consult counsel about the proper response',
        'Send only de-identified or summary documentation to balance privilege and apparent compliance',
        'Contact the requesting attorney to negotiate which records should be released'
      ],
      scores: [-1, 2, -1, 0],
      rationale: {
        0: 'An attorney-issued subpoena is not by itself a court order and does not override privilege. Compliance without privilege analysis breaches confidentiality.',
        1: 'Notifying the client, asserting privilege on her behalf, and consulting counsel about the proper response is the correct procedural path. The client (privilege-holder) has objected, and the matter must proceed through the court process if the requesting party wants to compel.',
        2: 'Sending de-identified or summary documentation is still disclosure of privileged information and does not address the underlying issue.',
        3: 'Negotiating with the requesting attorney without first asserting privilege concedes the position. Asserting privilege first, then engaging with appropriate process, is the order.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [1, 3, 1]
},

// ============ Vignette 7 — First-episode psychosis with reluctant family ============
{
  id: 'VG-007',
  title: 'First-episode psychosis with family resistance',
  domain: 3,
  tags: ['first-episode-psychosis', 'family-engagement', 'community-MH'],
  stages: [
    {
      text: 'A 22-year-old college student is brought to therapy by her parents who report that for the past four months she has become increasingly withdrawn, stopped attending classes, and recently told them she "hears the neighbor planting cameras in the walls" of her bedroom. The parents are deeply skeptical of mental health treatment, viewing it as a "Western imposition" inconsistent with their cultural and religious framework. They came at the urging of a younger sibling.',
      prompt: 'What is the FIRST action you take with this family?',
      options: [
        'Validate the parents\' framework, engage them as collaborators in understanding what is happening with their daughter, and frame the conversation in terms compatible with their values while assessing the daughter\'s clinical needs',
        'Inform the parents that this is a serious psychiatric emergency and that they must take her to the hospital immediately',
        'Conduct a private interview with the daughter to assess her safety and symptoms before engaging the parents',
        'Refer the family to a psychiatrist and decline to engage further until they accept psychiatric care'
      ],
      scores: [2, 0, 0, -1],
      rationale: {
        0: 'Engagement with families whose cultural/religious framework distrusts mental health treatment requires meeting them where they are. Validating, collaborating, and framing in compatible terms while still attending to clinical urgency is the engagement work that makes any subsequent treatment possible.',
        1: 'Immediately framing the situation as a "psychiatric emergency" alienates parents whose framework distrusts that framing and may close the door to needed engagement.',
        2: 'A private interview may be clinically appropriate but as the FIRST move it bypasses the family engagement that this situation specifically requires.',
        3: 'Conditioning further engagement on accepting psychiatric care effectively abandons the daughter when the family is reluctant — closing the only door available.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'After two sessions with the family, you have engaged enough to conduct an individual session with the daughter. She tells you she "hears the cameras" most days, sees "shadow people" in her peripheral vision, and has begun to believe her family is being "manipulated by the neighbors." She has not slept well in weeks. She is not suicidal but is fearful.',
      prompt: 'What is the next action you take?',
      options: [
        'Continue weekly individual therapy and address the symptoms with cognitive techniques',
        'Refer her urgently for psychiatric evaluation and possible coordinated specialty care for first-episode psychosis, while continuing family engagement to support the treatment pathway',
        'Initiate involuntary hold evaluation under W&I 5150 given the psychotic symptoms',
        'Recommend the family seek religious counseling as a first-line intervention given their preference'
      ],
      scores: [-1, 2, 0, -1],
      rationale: {
        0: 'CBT for psychosis is an established adjunct but does not substitute for psychiatric care for first-episode psychosis. Continuing individual therapy alone misses the indicated coordinated care.',
        1: 'First-episode psychosis with the symptom picture described requires urgent psychiatric evaluation and coordinated specialty care (CSC) models have evidence for improved outcomes. Continuing family engagement is essential to support the treatment pathway through a family system that distrusts MH care.',
        2: 'A 5150 hold may be indicated if criteria are met (danger to self/others or gravely disabled due to mental disorder); the stem describes psychotic symptoms but does not establish the danger or grave disability threshold. The threshold question is urgent psychiatric evaluation, which can determine appropriate level of care.',
        3: 'Religious counseling as the first-line intervention for first-episode psychosis defers needed psychiatric care and is not in the daughter\'s clinical interest.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'The family agrees to a psychiatric evaluation only because you have engaged with them respectfully. The psychiatrist recommends antipsychotic medication and an outpatient coordinated specialty care program. The mother tells you privately, "We will try this, but if it doesn\'t work in two weeks, we are stopping." The daughter agrees with whatever the family decides.',
      prompt: 'How do you respond to the mother?',
      options: [
        'Agree to the two-week trial as a way to maintain engagement',
        'Tell the mother that two weeks is not enough time to see medication effects and she must commit to at least three months',
        'Acknowledge her caution, share information about typical medication-response timelines, and offer to support the family in evaluating the response together at intervals — without making a unilateral commitment',
        'Inform the mother that the daughter\'s adult autonomy means the mother does not have the authority to stop treatment'
      ],
      scores: [0, 0, 2, -1],
      rationale: {
        0: 'Agreeing to a two-week trial accepts a timeframe that is clinically insufficient for evaluation of psychosis medication response and may lead to premature discontinuation.',
        1: 'Telling the mother she "must" commit overrides the autonomy that the engagement work has built; it may collapse the engagement just achieved.',
        2: 'Acknowledging her caution, sharing accurate information about typical response timelines, and offering collaborative evaluation respects her authority within the family while providing the clinical information she needs to make informed decisions. This is the engagement-preserving move.',
        3: 'While the daughter\'s adult autonomy is a real consideration, in this cultural context her stated alignment with the family means the family unit is functionally making decisions together. Asserting adult autonomy unilaterally is both clinically and culturally tone-deaf at this stage.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [0, 1, 2]
},

// ============ Vignette 8 — Complex therapist-initiated termination ============
{
  id: 'VG-008',
  title: 'Therapist-initiated termination with a high-risk client',
  domain: 4,
  tags: ['therapist-initiated-termination', 'high-risk-client', 'abandonment'],
  stages: [
    {
      text: 'You have been treating a 35-year-old client with severe depression, recurrent suicidal ideation, and a history of two prior attempts. You have been her therapist for 18 months. She has been stable for the past six months with no active ideation. You have just been diagnosed with a serious health condition that requires you to immediately reduce your caseload significantly. She is one of the clients you need to refer out.',
      prompt: 'How do you initiate this conversation?',
      options: [
        'Tell her in the next session that you are reducing your caseload and provide three referral names',
        'Provide written notice via email so she has time to process before the conversation',
        'Address it in session with care: explain the medical necessity at the level you choose to share, acknowledge what the termination may activate given her history, allow ample processing time, and explicitly plan a transition rather than a quick referral',
        'Have your office staff inform her and provide the referrals to you'
      ],
      scores: [0, -1, 2, -1],
      rationale: {
        0: 'Direct in-session disclosure is the appropriate medium, but providing three names without processing time is too transactional given her history.',
        1: 'Written/email notice for a high-risk long-term client is inappropriate — the relational impact requires in-person processing.',
        2: 'Therapist-initiated termination with a high-risk client requires careful handling: in-session disclosure with the level of medical detail you choose to share, explicit acknowledgment of what termination may activate (abandonment, suicide-risk activation), ample processing time, and a planned transition (not a quick referral). This is the abandonment-protective approach.',
        3: 'Delegating the disclosure to office staff removes the therapist from a clinically significant relational moment and is contraindicated.'
      },
      nextStageByChoice: { 0: 1, 1: 1, 2: 1, 3: 1 }
    },
    {
      text: 'After the disclosure, the client tells you that she feels "abandoned just like by my mother" and that "this is going to send her back to the dark place." She does not endorse current suicidal ideation but is visibly destabilized. She asks if she can keep seeing you "just once a month."',
      prompt: 'How do you respond?',
      options: [
        'Agree to monthly sessions to ease the transition',
        'Decline given your health needs but otherwise minimize further explanation',
        'Acknowledge the activation of abandonment dynamics, validate that the loss is real, conduct a thorough current-risk assessment, and develop a transition plan that includes increased near-term contact, identified safety planning, and a specific bridge to the next provider — while being clear about your own limits',
        'Recommend she immediately begin sessions with the new provider to ease your transition'
      ],
      scores: [-1, -1, 2, 0],
      rationale: {
        0: 'Agreeing to monthly sessions when you have just announced you must reduce caseload is internally inconsistent and may create more confusion than support.',
        1: 'Minimizing further explanation when the client has explicitly named the abandonment activation is therapeutically inadequate and abandonment-coded.',
        2: 'The clinically responsive move addresses the abandonment activation directly, validates the real loss, assesses current risk in light of the activation, develops a substantive transition plan (not a quick handoff), and is clear about your own limits without minimizing.',
        3: 'Pushing her to begin with the new provider immediately may feel like being rushed off your caseload at a moment when she needs support, even if logistically appropriate eventually.'
      },
      nextStageByChoice: { 0: 2, 1: 2, 2: 2, 3: 2 }
    },
    {
      text: 'You have provided three referrals and offered to do a "warm handoff" — a joint session with you and the new provider. She has chosen one referral but is reluctant to have a joint session, saying she needs "to do this on her own." Your last session is in three weeks.',
      prompt: 'How do you handle the remaining time?',
      options: [
        'Respect her decision about the joint session and use the remaining time for closure work',
        'Insist on the joint session given her risk profile',
        'Honor her decision about the joint-handoff while continuing risk monitoring, ensuring she has the new provider\'s contact information and intake appointment scheduled, and using the remaining time for both closure and bridge-building',
        'Schedule additional sessions in the final three weeks to compensate for her not accepting the joint handoff'
      ],
      scores: [1, -1, 2, 0],
      rationale: {
        0: 'Respecting her decision is right, but "using the remaining time for closure work" alone may underweight the risk-monitoring and bridge-building work that her profile requires.',
        1: 'Insisting on a joint session despite her stated preference overrides her autonomy and may rupture the work at a moment when alliance matters most.',
        2: 'Honoring her autonomy about the joint session, continuing risk monitoring, ensuring practical handoff (contact info, scheduled intake), and using the time for both closure AND bridge-building integrates respect for her with the clinical care her profile requires.',
        3: 'Scheduling additional sessions to compensate may extend in ways that contradict your stated reduction; the question is what to DO with the existing remaining time, not to add more.'
      },
      nextStageByChoice: { 0: null, 1: null, 2: null, 3: null }
    }
  ],
  optimalPath: [2, 2, 2]
}

  );
})(window.LMFT_VIGNETTES || (window.LMFT_VIGNETTES = []));
