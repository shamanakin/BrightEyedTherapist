/* Domain 3 — Managing Crisis Situations (11% of exam) */

(function (BANK) {
  BANK.push(
// ============ 3A. Managing Imminent Danger (target: 2 items) ============
{
  id: 'CR-3A-001',
  domain: 3, subsection: '3A',
  stem: 'A 45-year-old client tells the therapist in session that his estranged business partner "ruined his life" and that he has been thinking constantly about going to the partner\'s home tonight to "make him pay." The client owns multiple firearms, has identified a specific time and place, and refuses to commit to safety. He gives the therapist the partner\'s full name and home address. Which of the following actions should the therapist take FIRST?',
  options: [
    'Take reasonable steps to protect the intended victim, which include warning the partner and notifying law enforcement',
    'Initiate involuntary hospitalization of the client under Welfare and Institutions Code 5150',
    'Contact the client\'s emergency contact and ask them to remove firearms from the home',
    'Document the threat in detail and consult with a colleague before taking any action'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When a client communicates a serious threat of physical violence against a reasonably identifiable victim, California Civil Code §43.92 (the Tarasoff statute) requires the therapist to make reasonable efforts to protect the intended victim, which courts have interpreted to include both warning the victim and notifying law enforcement.',
    distractors: {
      1: 'A 5150 hold requires that the client be a danger to self or others as a result of a mental health disorder, and is appropriate when criteria are met — but the threshold question here is the duty to protect the identifiable third party, which is the FIRST obligation. Hospitalization may follow but does not discharge the protective duty.',
      2: 'Asking a third party to remove firearms does not satisfy the legal duty to protect the identified victim and relies on a third party who may not act. The duty runs to the victim and law enforcement.',
      3: 'Consultation and documentation are good practices, but delaying protective action while consulting in the face of a serious, imminent, specific threat fails the duty to protect.'
    }
  },
  difficulty: 3,
  tags: ['Tarasoff', 'duty-to-protect'],
  lawCitation: 'Cal. Civ. Code § 43.92; Tarasoff v. Regents (1976); Ewing v. Goldstein (2004)'
},
{
  id: 'CR-3A-002',
  domain: 3, subsection: '3A',
  stem: 'A 56-year-old client tells the therapist that his elderly mother, who lives with him, "fell down the stairs again last week" and shows him a photo on his phone of his mother with bruises on her arms and face. The client laughs and says, "She\'s just clumsy." The therapist is aware that the client has been increasingly stressed by his caregiving responsibilities. Which of the following actions should the therapist take?',
  options: [
    'File a report of suspected elder abuse with Adult Protective Services or law enforcement',
    'Confront the client about whether he caused the injuries and document his response',
    'Recommend respite care and family support to reduce the caregiver burden',
    'Discuss the situation with a clinical supervisor before taking further action'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'California law (Welfare and Institutions Code §15630) requires mandated reporters, including LMFTs, to report suspected physical abuse of an elder or dependent adult. "Suspected" is a low threshold — the therapist need not be certain. Visible injuries plus a dismissive caregiver explanation meets the threshold for a report.',
    distractors: {
      1: 'Confronting the client about causing injuries is not the mandated action and risks compromising the report or endangering the elder. The duty is to report, not to investigate.',
      2: 'Reducing caregiver burden may be clinically indicated, but it is not a substitute for the legally required report when abuse is suspected.',
      3: 'Consulting a supervisor before reporting is permissible only to clarify the reporting obligation, but it cannot substitute for or delay a mandated report when the threshold is met.'
    }
  },
  difficulty: 2,
  tags: ['elder-abuse', 'mandated-reporting'],
  lawCitation: 'Cal. Welf. & Inst. Code § 15630 (Elder and Dependent Adult Civil Protection Act)'
},

{
  id: 'CR-3A-003',
  domain: 3, subsection: '3A',
  stem: 'A 19-year-old client tells the therapist she has been thinking about overdosing on her grandmother\'s pain medication, which she has access to. She has thought about it daily for two weeks, has a specific plan, but says she "would never actually do it." She declines to remove the medication from her access and refuses voluntary hospitalization. Which of the following actions should the therapist take?',
  options: [
    'Initiate evaluation for an involuntary hold under Welfare and Institutions Code 5150 based on the danger to self due to a mental health disorder',
    'Develop a written safety plan and confirm a follow-up appointment within 48 hours',
    'Notify the client\'s grandmother to remove the pain medication from the home',
    'Recommend the client begin antidepressant medication by referring her to a psychiatrist'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Daily ideation for two weeks, a specific and accessible plan, and refusal to limit access to means or accept voluntary care meets the threshold for evaluation for an involuntary hold under W&I §5150 (danger to self as a result of a mental disorder). The client\'s claim that she would not act does not override the lethality of an accessible plan with intent.',
    distractors: {
      1: 'A safety plan and rapid follow-up are appropriate components of outpatient suicide-risk management when the client engages with means restriction and follow-up. Here, the client has refused both — the threshold for higher level of care has been reached.',
      2: 'Notifying the grandmother to remove the medication discloses confidential information without authorization, and even if a Tarasoff-type analysis were attempted, the duty here runs to the patient herself, addressed through 5150 evaluation, not via a third party.',
      3: 'Medication may eventually be part of treatment, but it does not address the imminent risk; the threshold question is level of care, not pharmacology.'
    }
  },
  difficulty: 3,
  tags: ['suicide-risk', 'W&I-5150'],
  lawCitation: 'Cal. Welf. & Inst. Code § 5150'
},

// ============ 3B. Managing Effects of Crisis Exposure (target: 3 items) ============
{
  id: 'CR-3B-001',
  domain: 3, subsection: '3B',
  stem: 'A 30-year-old client comes to her regular therapy session three days after a major earthquake damaged her apartment and displaced her from her home. She is staying with relatives, has difficulty sleeping, is hypervigilant to sounds, and reports intrusive images of the building shaking. She is otherwise managing tasks of daily living and has support. Which of the following actions should the therapist take?',
  options: [
    'Provide psychoeducation about acute stress reactions and focus on stabilization and connection to practical supports',
    'Initiate trauma-focused processing of the intrusive memories of the earthquake to prevent symptom consolidation',
    'Conduct a structured trauma history interview to identify any prior unresolved traumas that may now be activated',
    'Refer the client to a psychiatrist for an assessment of medication to manage the hyperarousal and intrusion symptoms'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Acute response to a recent disaster (within days to a few weeks) is best addressed with psychological first aid principles: stabilization, normalization of acute stress reactions, and connection to practical/social supports. Trauma-focused therapy is contraindicated this early and risks consolidating traumatic memory before the client has stabilized.',
    distractors: {
      1: 'Trauma-focused exposure-based therapy applied within days of an event can interfere with natural recovery and is generally not recommended in the acute phase.',
      2: 'A structured trauma history interview at three days post-event prioritizes assessment over stabilization and may overwhelm a client who is still in acute distress.',
      3: 'Reflexive psychiatric referral for medication at three days post-event medicalizes a normal acute stress response and bypasses the indicated psychological first aid approach.'
    }
  },
  difficulty: 3,
  tags: ['acute-stress', 'PFA', 'disaster']
},
{
  id: 'CR-3B-002',
  domain: 3, subsection: '3B',
  stem: 'A 44-year-old woman discloses in session that her husband has hit her on three occasions over the past year, most recently last night, leaving visible bruising. She states she is not ready to leave, has two young children, and asks the therapist not to tell anyone. She says she feels safer this week because he is traveling for work. Which of the following actions should the therapist take?',
  options: [
    'Conduct safety planning, assess danger to the children in the home, and review the limits of confidentiality',
    'File a report with law enforcement immediately given the visible injuries the client described from last night',
    'Honor the client\'s request for confidentiality to preserve alliance and continue addressing her depressive symptoms',
    'Inform the client that the therapist cannot continue treatment unless she agrees to leave the relationship'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Intimate partner violence in an adult competent client is generally not itself mandated reporting in California (unlike child or elder abuse). The clinical obligations are safety planning, assessment of danger to any children in the home (which may trigger CANRA), and transparent review of the limits of confidentiality so the client understands what is and is not confidential.',
    distractors: {
      1: 'IPV between competent adults is not categorically mandated reporting in California. (Medical providers have specific reporting duties under the Penal Code, but LMFTs do not have a categorical IPV reporting duty for competent adult clients absent other triggering circumstances such as injury by firearm.) Mandatory reporting would override client autonomy.',
      2: 'Continuing without addressing safety, the children, or the confidentiality limits abandons the protective function of therapy and may be negligent.',
      3: 'Conditioning therapy on the client leaving the relationship is coercive, undermines her autonomy and ability to plan safely, and is ethically inappropriate.'
    }
  },
  difficulty: 3,
  tags: ['IPV', 'safety-planning', 'CANRA-trigger']
},
{
  id: 'CR-3B-003',
  domain: 3, subsection: '3B',
  stem: 'A 37-year-old client comes to her first session three months after the unexpected death of her 6-year-old son in a car accident. She has not returned to work, sleeps poorly, finds it difficult to be around her surviving children, and feels "frozen." She cries throughout the session but is engaged and able to describe her experience. Which of the following actions should the therapist take?',
  options: [
    'Provide supportive presence, validate the grief response, and assess the client\'s safety, functioning, and support system',
    'Begin cognitive restructuring to challenge the client\'s avoidance of her surviving children and her withdrawal from work',
    'Refer the client immediately to a peer-led grief support group rather than continuing individual therapy at this stage',
    'Assess for prolonged grief disorder and inform the client of the diagnostic criteria and what to watch for'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'At three months post-loss of a child, intense grief and functional impairment are within the range of normal acute grief. The clinical task is to provide a supportive space, validate the experience, and assess safety/functioning/support — not to pathologize, restructure, or refer out prematurely.',
    distractors: {
      1: 'Cognitive restructuring of "avoidance" at three months following the sudden loss of a child mistakes normal grief for cognitive distortion and risks invalidating the client.',
      2: 'Reflexively referring to a grief group in the first session forecloses the individual work the client came in for and may be experienced as the therapist not wanting to sit with the grief.',
      3: 'Prolonged grief disorder requires symptoms lasting at least 12 months in adults; informing the client of diagnostic criteria three months in is premature and likely to be experienced as the therapist pathologizing her grief.'
    }
  },
  difficulty: 2,
  tags: ['grief', 'acute', 'child-loss']
},

// ===== Batch 2 additions =====

// --- 3A additions ---
{
  id: 'CR-3A-004',
  domain: 3, subsection: '3A',
  stem: 'A mother brings her 8-year-old daughter to therapy for "behavior problems." In the third session, the child draws a picture of a man and describes him touching her "in places that hurt." The mother\'s boyfriend has been living in the home for six months. Which of the following actions should the therapist take?',
  options: [
    'File a child abuse report with the appropriate child protection agency or law enforcement as soon as practicable',
    'Conduct a forensic interview with the child to determine whether abuse actually occurred',
    'Schedule a session with the mother alone to assess her capacity to protect the child',
    'Confront the boyfriend during a planned family session to determine his account'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'CANRA (Cal. Penal Code §§ 11164-11174.3) requires a mandated reporter who has reasonable suspicion of child abuse based on facts that, when viewed against professional training and experience, lead to such suspicion, to make a report as soon as practicable by phone and follow up in writing within 36 hours. A child\'s disclosure consistent with abuse meets the suspicion threshold.',
    distractors: {
      1: 'Forensic interviewing is the role of trained child forensic interviewers (often through Child Advocacy Centers); the LMFT\'s role is to make the report so the appropriate investigation can occur.',
      2: 'Assessing the mother\'s protective capacity may follow but does not substitute for the immediate reporting obligation, which is not contingent on parental engagement.',
      3: 'Confronting the alleged perpetrator may compromise the investigation, endanger the child, and is not within the LMFT\'s role under CANRA.'
    }
  },
  difficulty: 2,
  tags: ['CANRA', 'child-abuse'],
  lawCitation: 'Cal. Penal Code §§ 11164-11174.3 (CANRA); report as soon as practicable by phone, written follow-up within 36 hours'
},
{
  id: 'CR-3A-005',
  domain: 3, subsection: '3A',
  stem: 'A 50-year-old client tells the therapist that her elderly mother has dementia and lives with the client\'s adult brother. During a recent visit, the client noticed her mother was wearing the same clothes she had been in two weeks earlier, had visibly lost weight, and the home was cluttered with soiled items. The brother is the legally designated caregiver. Which of the following actions should the therapist take?',
  options: [
    'File a report of suspected dependent adult neglect with Adult Protective Services or law enforcement',
    'Recommend the client confront her brother about the caregiving concerns at the next family gathering',
    'Encourage the client to research alternative caregiving arrangements for her mother',
    'Validate the client\'s concerns and continue exploring the family dynamics around the mother\'s care'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'California\'s Elder and Dependent Adult Civil Protection Act (W&I §15630) requires mandated reporters to report suspected neglect of an elder or dependent adult. The signs described (poor hygiene, weight loss, unsanitary conditions) plus the dementia diagnosis (which makes the mother a dependent adult) meet the suspicion threshold.',
    distractors: {
      1: 'Recommending a confrontation positions the LMFT as advising on a family conflict rather than discharging the legal reporting obligation, which is not contingent on the client taking action.',
      2: 'Recommending alternative caregiving research is a clinically reasonable conversation but does not substitute for the mandated report.',
      3: 'Validating and exploring is therapeutically appropriate AFTER the report is made, not in lieu of it.'
    }
  },
  difficulty: 2,
  tags: ['elder-neglect', 'mandated-reporting'],
  lawCitation: 'Cal. Welf. & Inst. Code § 15630'
},

// --- 3B additions ---
{
  id: 'CR-3B-004',
  domain: 3, subsection: '3B',
  stem: 'A 28-year-old client who witnessed a fatal shooting at her workplace one week ago comes to therapy at her employer\'s recommendation. She reports vivid intrusive images, hypervigilance, sleep disturbance, and difficulty returning to the building. She tearfully says she "should be tougher" given that she was not physically harmed. Which of the following interventions should the therapist BEGIN with?',
  options: [
    'Normalize her acute stress response, provide psychoeducation about reactions to witnessing violence, and prioritize stabilization and connection to supports',
    'Initiate prolonged exposure to the intrusive memories of the shooting to begin trauma processing',
    'Refer the client for a psychiatric evaluation for medication to manage the hyperarousal and sleep disturbance',
    'Encourage the client to return to the workplace quickly to prevent avoidance from consolidating'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'One week post-trauma is the acute phase. Normalizing her acute stress response, addressing her self-judgmental framing ("should be tougher"), and stabilizing with practical and social supports is the indicated intervention. Trauma-focused processing is contraindicated this early.',
    distractors: {
      1: 'Exposure-based processing one week after a traumatic event can interfere with natural recovery and risks consolidating rather than resolving the traumatic memory.',
      2: 'Psychiatric referral for medication this early medicalizes acute stress and bypasses psychological first aid principles. Sleep medications and benzodiazepines after acute trauma may also impair processing.',
      3: 'Pushing a rapid return to the workplace ignores the client\'s readiness and the principle that pacing should be calibrated to the individual, not imposed.'
    }
  },
  difficulty: 2,
  tags: ['acute-stress', 'witness', 'PFA']
},
{
  id: 'CR-3B-005',
  domain: 3, subsection: '3B',
  stem: 'A 34-year-old undocumented immigrant client comes to therapy reporting panic attacks, persistent hypervigilance, and intrusive fears that she will be detained while at work or while picking up her children from school. The fear has intensified following recent immigration enforcement activity in her community. Which of the following interventions should the therapist BEGIN with?',
  options: [
    'Validate the realistic nature of the fear, develop concrete safety and family-preparedness planning, and address the symptoms within that context',
    'Provide cognitive restructuring to challenge the client\'s catastrophic thinking about deportation',
    'Recommend the client consult an immigration attorney before therapy can proceed effectively',
    'Refer the client to a psychiatrist for medication management of the panic attacks'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When fear maps onto a real, ongoing threat, the clinical task is to validate the realistic basis of the response, support concrete safety planning (family preparedness, knowing rights, documents in order), and address symptoms within that context. Treating the fear as cognitive distortion would invalidate the actual threat.',
    distractors: {
      1: 'Cognitive restructuring of fears about deportation when deportation is a real possibility risks gaslighting the client and pathologizing an adaptive response to a real threat.',
      2: 'Recommending an attorney may be useful but cannot be a precondition for therapy; the client\'s clinical needs can be addressed in parallel.',
      3: 'Reflexive medication referral medicalizes a contextually appropriate fear response without first providing the indicated psychological intervention.'
    }
  },
  difficulty: 3,
  tags: ['migration-trauma', 'realistic-threat']
},
{
  id: 'CR-3B-006',
  domain: 3, subsection: '3B',
  stem: 'A 67-year-old client lost her spouse to a long illness 14 months ago. She reports persistent intense yearning for her husband, difficulty accepting his death, intense emotional pain, marked feelings that life is meaningless, and significant role-functioning impairment. She is preoccupied with her husband to the exclusion of other relationships. Which of the following actions should the therapist take?',
  options: [
    'Assess for prolonged grief disorder given the duration, intensity, and functional impairment of her grief response',
    'Provide supportive grief work and assume continued natural resolution given the major nature of the loss',
    'Begin behavioral activation to address the social withdrawal and role-functioning impairment',
    'Refer the client to a peer-based widow/widower support group'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'Prolonged grief disorder (DSM-5-TR) requires symptoms (intense yearning, preoccupation, intense emotional pain, role impairment, etc.) persisting at least 12 months in adults after the death. The duration (14 months), intensity, and functional impairment described meet threshold criteria for assessment.',
    distractors: {
      1: 'Assuming continued natural resolution after 14 months of impairing symptoms misses a diagnosable disorder that may benefit from specific interventions.',
      2: 'Behavioral activation addresses one symptom but does not engage with the core grief disorder; the underlying grief work has not been done.',
      3: 'A peer-based group may complement individual work but is not a substitute for the indicated diagnostic and clinical intervention.'
    }
  },
  difficulty: 3,
  tags: ['prolonged-grief', 'DSM-5-TR']
},

// ===== Batch 3 additions =====

{
  id: 'CR-3A-006',
  domain: 3, subsection: '3A',
  stem: 'A 15-year-old client tells the therapist that she has been cutting her arms for the past three months and has begun to think about taking pills "to make it all stop." She has a specific plan involving her mother\'s medication, which is accessible in the bathroom cabinet. She does not want her parents to know about either the cutting or the thoughts. Which of the following actions should the therapist take?',
  options: [
    'Initiate steps for an involuntary hold evaluation under Welfare and Institutions Code 5585',
    'Develop a safety plan with the client and respect her request for confidentiality from her parents',
    'Inform the client that her parents must be notified and recruit them as partners in safety planning, while continuing to assess for the need for higher level of care',
    'Recommend that the client tell her parents herself within one week'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'A minor with active suicidal ideation, a specific accessible plan, and ongoing self-harm requires parental involvement for safety (means restriction in the home), regardless of the client\'s preference. The therapist informs the client, brings parents in for collaborative safety planning, and continues to assess whether the criteria for an involuntary hold (W&I §5585 for minors) are met. The parental involvement is itself the safety scaffold; an involuntary hold may or may not be necessary depending on ongoing assessment.',
    distractors: {
      0: 'Initiating a §5585 hold immediately may be appropriate if the criteria are met (danger to self due to mental disorder, no less restrictive option). For a minor with active plan and accessible means, the question of hold vs. parental safety scaffolding is a clinical judgment; choosing hold without first attempting collaborative safety planning may not match the least-restrictive principle if it can be done safely.',
      1: 'Honoring the confidentiality request when there is an active plan with accessible means fails the protective duty and lacks the most basic safety intervention (means restriction).',
      3: 'Leaving the client to inform her parents within a week leaves the means accessible and depends on the client to take an action she has just said she does not want to take. This delegates safety to the at-risk client.'
    }
  },
  difficulty: 3,
  tags: ['minor-suicide-risk', 'parental-notification'],
  lawCitation: 'Cal. Welf. & Inst. Code § 5585 (minor involuntary hold)'
},
{
  id: 'CR-3B-007',
  domain: 3, subsection: '3B',
  stem: 'A 23-year-old client comes to her first session 48 hours after a sexual assault by a stranger. She is tearful, has slept very little, reports intrusive memories of the assault, and feels "numb and disconnected from everything." She has not yet been seen by a medical provider or reported the assault. Which of the following actions should the therapist take?',
  options: [
    'Begin trauma-focused processing of the memory while the experience is still fresh and accessible',
    'Provide acute supportive presence, give information about medical care and forensic exam options, and discuss reporting choices without prescribing a path',
    'Recommend the client report the assault to law enforcement before further therapy can proceed effectively',
    'Conduct a structured PTSD diagnostic interview to establish baseline symptoms for tracking'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Acute post-assault response requires supportive presence, information about time-sensitive options (medical care, sexual assault forensic exam, reporting), and respect for the client\'s autonomy in deciding how to proceed. Trauma-focused processing is contraindicated within days of an event. Decisions about reporting belong to the survivor.',
    distractors: {
      0: 'Trauma-focused processing within days of trauma can interfere with natural recovery and is contraindicated this early. Stabilization comes first.',
      2: 'Conditioning therapy on reporting takes the survivor\'s autonomy away in the exact area where it is most important to restore.',
      3: 'Structured diagnostic interviewing 48 hours after assault prioritizes data collection over stabilization, may be retraumatizing, and is premature for PTSD (which requires symptoms past 1 month).'
    }
  },
  difficulty: 2,
  tags: ['acute-sexual-assault', 'autonomy']
},
{
  id: 'CR-3B-008',
  domain: 3, subsection: '3B',
  stem: 'A 9-year-old client has been brought to therapy by his parents after their family home was destroyed in a wildfire two weeks ago. The child reports difficulty sleeping, has begun bedwetting after being dry for years, asks repeatedly if "the fire will come back," and has become more clingy with his parents. Which of the following interventions should the therapist begin with?',
  options: [
    'Provide trauma-focused CBT immediately to prevent symptoms from becoming chronic',
    'Provide psychoeducation to parents about typical child reactions to disaster, age-appropriate ways to discuss the event, and support stabilization through routine and parental presence',
    'Recommend the child see a child psychiatrist for medication evaluation given the regression in toileting',
    'Refer the family to a community disaster support group as the primary intervention'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Acute post-disaster response in young children includes regression (bedwetting), sleep disturbance, hypervigilance, and increased attachment behavior. The indicated intervention is parent-focused psychoeducation about normal child reactions, age-appropriate discussion, and stabilization through routine and parental presence — the parents are the primary therapeutic agent in this acute phase.',
    distractors: {
      0: 'Trauma-focused CBT is appropriate for persistent symptoms after acute response has stabilized, not as the immediate intervention.',
      2: 'Medication evaluation for normal acute-phase regression in a 9-year-old medicalizes a typical response and bypasses the indicated parent-focused intervention.',
      3: 'A community support group can complement the work but does not substitute for the parent-focused stabilization that is the primary acute-phase intervention.'
    }
  },
  difficulty: 2,
  tags: ['child-disaster', 'acute-stabilization']
},

// ===== Batch 4: blueprint-closing additions =====

{
  id: 'CR-3A-007',
  domain: 3, subsection: '3A',
  stem: 'A 52-year-old client who has been in therapy for 10 months presents to a session with slurred speech, ataxic gait, and obvious intoxication. He reports drinking "most of a bottle of vodka" before the session and now wants to leave to drive home. He becomes irritable when asked about his car keys. Which of the following actions should the therapist take?',
  options: [
    'Take possession of the keys and refuse to return them until the client is sober',
    'Engage the client in the planned session content despite the intoxication',
    'Decline to conduct the session due to his condition, work to prevent him from driving by offering to call a ride or someone to pick him up, and contact emergency services if he attempts to drive',
    'Allow him to leave and trust him to make his own decision since he is an adult'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Conducting a session with an intoxicated client is not clinically appropriate. The therapist also has a clinical and ethical obligation to prevent foreseeable harm — driving intoxicated. The appropriate steps are to decline the session, offer alternatives to driving (ride share, a contact), and, if he attempts to drive, contact emergency services. Physical restraint or seizing of keys is generally not appropriate.',
    distractors: {
      0: 'Seizing the keys risks physical confrontation, exceeds the therapist\'s authority, and may itself be unlawful. The threshold for police involvement is precisely when the client cannot be safely deterred.',
      1: 'Conducting a clinical session with an intoxicated client lacks meaningful clinical value and continues a session inappropriate to his current state.',
      3: 'Allowing the client to drive intoxicated despite foreseeable harm is a clinical and ethical failure. Autonomy is not a defense for inaction when the harm to others is imminent.'
    }
  },
  difficulty: 3,
  tags: ['intoxication-in-session', 'duty-to-prevent-harm']
},
{
  id: 'CR-3B-009',
  domain: 3, subsection: '3B',
  stem: 'A 19-year-old college student comes to her first therapy session three weeks after fleeing her family\'s country of origin due to political persecution. She is unaccompanied, has temporary refugee status, and reports nightmares, hypervigilance, and feeling "disconnected from everything." She is functioning at a basic level — attending classes intermittently, eating, sleeping with difficulty. Which of the following interventions should the therapist BEGIN with?',
  options: [
    'Initiate trauma-focused processing of the events that led to her flight while the memories are still recent',
    'Conduct an in-depth interview about the political persecution to establish a complete trauma history for treatment planning',
    'Focus on stabilization: psychoeducation about common refugee responses, support for basic functioning (sleep, eating, social connection), and connecting her with refugee-serving resources',
    'Refer the client to a refugee-specialized trauma specialist before continuing further sessions'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Acute refugee response within the first weeks requires Phase-1 stabilization: normalizing the response, supporting basic functioning, and connecting with relevant practical resources. Trauma-focused processing in the acute phase is contraindicated, and a detailed trauma history can be re-traumatizing this early.',
    distractors: {
      0: 'Trauma processing within the first weeks of a refugee event is contraindicated by standard phase-based trauma treatment models.',
      1: 'A detailed in-depth trauma interview this early can re-traumatize the client and prioritize the therapist\'s history-taking over her stabilization.',
      3: 'Specialist referral may eventually be useful but reflexive referral abandons the immediate clinical needs the LMFT can address and may be experienced as the therapist not wanting to do the work.'
    }
  },
  difficulty: 2,
  tags: ['refugee', 'phase-based', 'stabilization']
},

// ===== Batch 5: Crisis depth =====

{
  id: 'CR-3A-008',
  domain: 3, subsection: '3A',
  stem: 'A 65-year-old client with major depression tells the therapist she has been "thinking about ending her suffering" for months and has stockpiled her own prescription medications. She lives alone and has no children. She declines hospitalization but agrees to "any other plan." Which of the following actions should the therapist take?',
  options: [
    'Develop a safety plan including means restriction (collaboratively removing the stockpiled medications), increased contact frequency, and clear thresholds for escalation, while continuing to assess whether involuntary hold criteria are met',
    'Initiate an involuntary hold immediately given the stockpiled means and chronic ideation',
    'Schedule weekly sessions and trust the client\'s commitment to "any other plan"',
    'Contact her primary care physician without authorization to coordinate care'
  ],
  correctIndex: 0,
  rationale: {
    correct: 'When the client is engaged and willing to participate in safety planning short of hospitalization, the appropriate response is structured outpatient safety: means restriction (collaboratively removing the stockpile), increased contact frequency, clear escalation criteria, and ongoing assessment. Means restriction is one of the most effective single interventions for suicide prevention.',
    distractors: {
      1: 'Initiating an involuntary hold when the client is engaged, willing to plan, and agreeing to means restriction may not be least-restrictive; clinical judgment supports the structured outpatient plan first.',
      2: 'Weekly sessions without means restriction, increased contact, or escalation criteria is under-responsive given chronic ideation and accessible means.',
      3: 'Contacting the PCP without authorization breaches confidentiality.'
    }
  },
  difficulty: 3,
  tags: ['suicide-prevention', 'means-restriction', 'older-adult']
},
{
  id: 'CR-3A-009',
  domain: 3, subsection: '3A',
  stem: 'A 26-year-old client tells the therapist she had a "weird thought" last week — that she should drive her car off a bridge while her mother was a passenger. She is horrified by the thought, has no plan, and has been hypervigilant about driving since. She is in therapy for OCD with previous intrusive harm-thoughts (without action). Which of the following actions should the therapist take?',
  options: [
    'Initiate a Tarasoff warning to her mother given the specificity of the violent ideation',
    'Initiate involuntary hold evaluation given the homicidal content',
    'Conceptualize the thought as an OCD intrusive thought consistent with her presentation, normalize the egodystonic nature, and continue OCD treatment using ERP principles',
    'Refer the client to a forensic psychologist for risk assessment'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Egodystonic intrusive harm-thoughts (often violent or sexual in content) are a recognized feature of OCD, distinct from genuine ideation with intent. The client\'s horror, lack of plan, hypervigilance about driving, and prior history of similar intrusive harm-thoughts without action all point to OCD intrusive thoughts. Treating these as if they were genuine homicidal threats is a well-documented diagnostic error that can be harmful to the client.',
    distractors: {
      0: 'A Tarasoff warning based on OCD intrusive harm-thoughts misuses the duty-to-protect framework and may harm both the client (severe alliance rupture, reinforcement of OCD intrusive thoughts) and the relationship with the family member.',
      1: 'Involuntary hold based on OCD intrusive thoughts misclassifies the presentation and can be iatrogenic.',
      3: 'A forensic risk assessment frames an OCD presentation as a forensic concern, missing the diagnosis.'
    }
  },
  difficulty: 3,
  tags: ['OCD', 'intrusive-thoughts', 'differential-from-threat']
},
{
  id: 'CR-3B-010',
  domain: 3, subsection: '3B',
  stem: 'A 22-year-old client of yours was a victim of a violent assault three weeks ago. She has hypervigilance, intrusive memories, sleep disturbance, and avoidance of the area where the assault occurred. She has been functioning at a basic level and is asking what the therapist thinks "this means." Which of the following actions should the therapist take?',
  options: [
    'Diagnose acute stress disorder and inform the client of the criteria she meets',
    'Diagnose PTSD and begin trauma-focused processing',
    'Explain the time-bounded distinction between acute stress reactions (within 1 month) and PTSD (after 1 month), discuss what she is experiencing in those terms, and continue stabilization-phase work',
    'Reassure her that her symptoms are likely to resolve and not worry about diagnostic labels'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'At 3 weeks post-trauma, the presentation is within the window for acute stress reactions (or ASD if criteria met) but is too early for PTSD diagnosis (which requires symptoms past 1 month). Discussing the time-bounded distinction educates the client, addresses her question without imposing a heavier diagnosis, and continues phase-appropriate stabilization work.',
    distractors: {
      0: 'A formal ASD diagnosis communicated to the client may not be the most useful framing at this stage; the conversation about the time-bounded distinction provides more practical clinical information.',
      1: 'PTSD cannot be diagnosed before 1 month, and trauma-focused processing at 3 weeks is contraindicated in most stabilization-phase models.',
      3: 'Reassuring without engaging her question avoids the discussion she has explicitly invited.'
    }
  },
  difficulty: 3,
  tags: ['ASD-vs-PTSD', 'acute-trauma', 'timing']
},
{
  id: 'CR-3B-011',
  domain: 3, subsection: '3B',
  stem: 'A 9-year-old client has been in play therapy for three months for grief following her grandmother\'s death. Today she comes in upset and tells the therapist that her father has not been "right" since the grandmother died — he sleeps all day, has stopped going to work, and "doesn\'t even look at me anymore." Which of the following actions should the therapist take?',
  options: [
    'Continue the planned play therapy session and address the father\'s functioning at a future parent meeting',
    'Validate the child\'s concern, gather more information about the father\'s functioning and any safety concerns, and consider arranging a parent meeting to assess his current condition',
    'Initiate a CPS report given the father\'s apparent inability to care for the child',
    'Recommend the family seek family therapy with another provider'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'The child\'s description of the father raises concern about his functioning and the child\'s emotional safety. The appropriate response is to validate the child, gather more information, and assess — both to support the child clinically and to determine whether the father\'s condition requires intervention. A parent meeting is a reasonable next step.',
    distractors: {
      0: 'Deferring this concern to a future parent meeting may miss safety issues and ignores the clinical material the child has brought.',
      2: 'A CPS report based on the child\'s description of paternal depressive symptoms may be premature; assessment is the appropriate first step (though if information surfaces suggesting neglect, a report follows).',
      3: 'Recommending family therapy elsewhere without first assessing what is happening offloads the conversation prematurely.'
    }
  },
  difficulty: 3,
  tags: ['child-of-grieving-parent', 'family-impact']
},

// ===== Batch 6: more Crisis depth =====

{
  id: 'CR-3A-010',
  domain: 3, subsection: '3A',
  stem: 'A client tells the therapist she has been having "passive thoughts" about death — wishing she would not wake up — for the past month, but without active intent or plan. Which of the following actions should the therapist take?',
  options: [
    'Treat the passive ideation as low risk and continue current treatment without modification',
    'Initiate involuntary hold evaluation given any death ideation',
    'Conduct a thorough suicide risk assessment that includes lethality factors (means access, prior attempts, hopelessness, etc.), establish ongoing monitoring, and integrate the disclosure into treatment planning',
    'Refer the client to a psychiatrist for medication evaluation given the ideation'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'Passive ideation requires assessment, not dismissal. The therapist conducts a thorough risk assessment, establishes ongoing monitoring, and integrates the disclosure into the treatment plan. Whether higher level of care is needed depends on the full risk picture.',
    distractors: {
      0: 'Treating passive ideation as inherently low-risk without assessment misses the risk factors that determine actual danger.',
      1: '5150 requires danger-to-self due to mental disorder; passive ideation without plan/intent typically does not meet that threshold.',
      3: 'Medication referral may be part of care but does not substitute for the suicide risk assessment.'
    }
  },
  difficulty: 2,
  tags: ['passive-ideation', 'risk-assessment']
},
{
  id: 'CR-3A-011',
  domain: 3, subsection: '3A',
  stem: 'A 25-year-old client tells the therapist she has been engaging in "non-suicidal self-injury" by cutting her thighs once or twice weekly for the past three months. She is clear it is not suicidal — she uses it to manage overwhelming emotions. She has not required medical care for any episode. Which of the following actions should the therapist take?',
  options: [
    'Treat the NSSI as suicidal behavior and initiate involuntary hold evaluation',
    'Assess the function of the NSSI, distinguish it from suicidal intent, develop a treatment plan that includes alternative emotion-regulation skills, and monitor for any escalation in lethality or frequency',
    'Recommend she stop the behavior immediately and require commitment to a no-self-harm contract',
    'Refer her to a residential treatment program given the ongoing self-harm'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'NSSI and suicidal self-injury differ in function, intent, and trajectory. Assessing function (emotion regulation), distinguishing from suicidal intent, building alternative skills (DBT distress tolerance), and monitoring for escalation is the appropriate clinical response — without conflating NSSI with suicidality.',
    distractors: {
      0: 'Conflating NSSI with suicidality misclassifies the behavior and may produce iatrogenic escalation (involuntary hold for non-suicidal behavior).',
      2: '"No-self-harm contracts" lack evidence and may rupture alliance without changing behavior.',
      3: 'Residential treatment is a significant intervention not warranted by the stem; less restrictive options match the presentation.'
    }
  },
  difficulty: 3,
  tags: ['NSSI', 'emotion-regulation', 'DBT']
},
{
  id: 'CR-3B-012',
  domain: 3, subsection: '3B',
  stem: 'A 40-year-old client comes to her first session two months after experiencing a workplace shooting in which a colleague was killed. She reports recurrent nightmares, intrusive memories, hypervigilance at work, and avoidance of the building where it occurred. She has been functioning at home but is on leave from work. Which of the following actions should the therapist take?',
  options: [
    'Initiate immediate trauma-focused processing of the shooting memory',
    'Recommend she return to work as soon as possible to prevent avoidance from consolidating',
    'Assess for PTSD given the symptom duration and impact, complete stabilization-phase work, and plan for trauma-focused treatment when stabilization is in place',
    'Refer her to a workplace-shooting survivors support group as the primary intervention'
  ],
  correctIndex: 2,
  rationale: {
    correct: 'At two months post-trauma with significant symptoms and functional impairment, PTSD criteria are likely met. The phase-based approach assesses, completes stabilization (safety, coping, support), then progresses to trauma-focused treatment. Returning to work or processing memories prematurely may destabilize.',
    distractors: {
      0: 'Immediate trauma processing without stabilization risks destabilization.',
      1: 'Pushing rapid return to work treats avoidance as the problem rather than as a stabilization-phase issue.',
      3: 'A support group may complement but is not a substitute for the indicated phased treatment.'
    }
  },
  difficulty: 2,
  tags: ['PTSD', 'workplace-violence', 'phase-based']
},
{
  id: 'CR-3B-013',
  domain: 3, subsection: '3B',
  stem: 'A 16-year-old client is in therapy following her mother\'s diagnosis with terminal cancer. The mother has 6-12 months to live. The client has stopped attending school, stopped seeing friends, and refuses to discuss the diagnosis with her mother. Which of the following interventions would BEST address the client\'s presentation?',
  options: [
    'Insist she discuss the diagnosis with her mother since "the window is closing"',
    'Validate the difficulty of anticipatory grief, support her at her own pace in re-engagement with school and friends, and explore what would help her be present with her mother in the time available',
    'Refer her to a teen-grief support group as the primary intervention',
    'Recommend she focus on school and friends to maintain normalcy during her mother\'s illness'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Anticipatory grief in adolescents is layered with developmental tasks, family role shifts, and avoidance as protection. Validating, supporting at her pace, and exploring what would help her be present is the integrative approach — without imposing urgency or normalcy that may not match her experience.',
    distractors: {
      0: 'Insisting on a specific conversation may force premature engagement and could rupture alliance.',
      2: 'A support group may complement but is not a substitute for the individual work.',
      3: '"Focus on school and friends to maintain normalcy" enacts avoidance as a treatment strategy.'
    }
  },
  difficulty: 3,
  tags: ['anticipatory-grief', 'adolescent', 'parental-illness']
},
{
  id: 'CR-3B-014',
  domain: 3, subsection: '3B',
  stem: 'A 28-year-old client comes to therapy three days after surviving a serious car accident in which she was driving and her passenger (a close friend) was killed. She reports nightmares, intrusive images, and intense guilt. She tells the therapist, "I don\'t deserve to be here." Which of the following actions should the therapist take?',
  options: [
    'Begin processing of the accident memory to prevent symptom consolidation',
    'Conduct a careful suicide risk assessment given the "don\'t deserve to be here" statement, while providing acute-phase stabilization and psychoeducation about survivor guilt',
    'Reassure her that the accident was not her fault to challenge the guilt',
    'Recommend immediate hospitalization given the survivor guilt'
  ],
  correctIndex: 1,
  rationale: {
    correct: 'Survivor guilt with "don\'t deserve to be here" language warrants careful suicide risk assessment, alongside acute-phase stabilization. The statement may be a non-suicidal expression of survivor guilt OR may carry suicidal weight — assessment determines which. Psychoeducation about survivor guilt normalizes the experience.',
    distractors: {
      0: 'Processing at 3 days post-trauma is contraindicated.',
      2: 'Reassurance about fault may dismiss the survivor-guilt experience and miss the suicide risk dimension.',
      3: 'Immediate hospitalization without assessment may not match the risk level.'
    }
  },
  difficulty: 3,
  tags: ['survivor-guilt', 'acute-trauma', 'risk-assessment']
}
  );
})(window.LMFT_BANK);
